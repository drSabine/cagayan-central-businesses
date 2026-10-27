<?php

use App\Enums\FinanceFigureStatus;
use App\Enums\UserRole;
use App\Models\ActivityLog;
use App\Models\FinanceDocument;
use App\Models\FinanceFigure;
use App\Models\Municipality;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->town = Municipality::factory()->create(['psgc_code' => '0201501000', 'name' => 'Abulug']);
    $this->other = Municipality::factory()->create(['psgc_code' => '0201502000', 'name' => 'Alcala']);
    $this->figure = FinanceFigure::factory()->for($this->town)->line('performance.revenue', 2024, '196960688.39')->create();
});

function staffFor(Municipality ...$towns): User
{
    $user = User::factory()->create(['role' => UserRole::Staff]);
    $user->assignedTowns()->attach(collect($towns)->pluck('id'));

    return $user;
}

function manualEntry(array $overrides = []): array
{
    return [...[
        'line_code' => 'performance.revenue', 'fiscal_year' => 2024, 'basis' => 'actual',
        'value' => '196960688.40', 'document_kind' => 'executive_summary', 'note' => 'Corrected from page 2',
    ], ...$overrides];
}

it('hides finance review from guests', function () {
    $this->get(route('capitol.finances.index'))->assertNotFound();
});

it('lists every town for an admin and only assigned towns for staff', function () {
    FinanceFigure::factory()->for($this->other)->line('performance.revenue', 2024, '1.00')->create();

    $this->actingAs(User::factory()->create())->get(route('capitol.finances.index'))
        ->assertInertia(fn (Assert $page) => $page->component('capitol/finances/index')->has('list.rows', 2));

    $this->actingAs(staffFor($this->town))->get(route('capitol.finances.index'))
        ->assertInertia(fn (Assert $page) => $page->has('list.rows', 1)->where('list.rows.0.town', 'Abulug')->where('list.rows.0.pending', 1));
});

it('keeps staff out of towns they are not assigned to', function () {
    $staff = staffFor($this->other);

    $this->actingAs($staff)->get(route('capitol.finances.show', ['town' => '0201501000', 'year' => 2024]))->assertForbidden();
    $this->actingAs($staff)->post(route('capitol.finances.figures.store', ['town' => '0201501000', 'year' => 2024]), manualEntry())->assertForbidden();

    expect(FinanceFigure::query()->count())->toBe(1);
});

it('shows a report with its figures, documents, and who may review', function () {
    $this->actingAs(User::factory()->create())->get(route('capitol.finances.show', ['town' => '0201501000', 'year' => 2024]))
        ->assertInertia(fn (Assert $page) => $page->component('capitol/finances/show')
            ->where('report.canReview', true)
            ->where('report.figures.0.value', '196960688.39')
            ->where('report.figures.0.status', 'pending')
            ->where('report.figures.0.source', 'Executive Summary')
            ->where('report.documents.0.label', 'Executive Summary')
            ->missing('report.figures.0.enteredBy'));
});

it('lets assigned staff enter a figure that waits as pending', function () {
    $staff = staffFor($this->town);

    $this->actingAs($staff)->post(route('capitol.finances.figures.store', ['town' => '0201501000', 'year' => 2024]), manualEntry())
        ->assertRedirect(route('capitol.finances.show', ['town' => '0201501000', 'year' => 2024]));

    $entry = FinanceFigure::query()->where('entry_method', 'manual')->sole();
    expect($entry->status)->toBe(FinanceFigureStatus::Pending)
        ->and($entry->entered_by)->toBe($staff->id)
        ->and($entry->value)->toBe('196960688.40')
        ->and($entry->finance_document_id)->toBe($this->figure->finance_document_id)
        ->and(ActivityLog::EVENTS)->toHaveKey('finance_figure_entered')
        ->and(DB::table('activity_logs')->where('event', 'finance_figure_entered')->where('actor_id', $staff->id)->count())->toBe(1);
});

it('rejects an entry without a report or link, or with a malformed amount', function (array $overrides, string $field) {
    $this->actingAs(User::factory()->create())
        ->post(route('capitol.finances.figures.store', ['town' => '0201501000', 'year' => 2024]), manualEntry($overrides))
        ->assertSessionHasErrors($field);

    expect(FinanceFigure::query()->count())->toBe(1);
})->with([
    'no source' => [['document_kind' => null, 'source_url' => null], 'source_url'],
    'report not on file' => [['document_kind' => 'annex_workbook'], 'document_kind'],
    'commas in the amount' => [['value' => '196,960,688.40'], 'value'],
    'a line that is not displayed' => [['line_code' => 'position.assets'], 'line_code'],
    'markup in the note' => [['note' => '<b>fixed</b>'], 'note'],
]);

it('lets an admin sign off pending figures and logs it', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin)->post(route('capitol.finances.reviews.store', ['town' => '0201501000', 'year' => 2024]), [
        'decision' => 'verified', 'figures' => [$this->figure->public_id],
    ])->assertRedirect();

    expect($this->figure->refresh()->status)->toBe(FinanceFigureStatus::Verified)
        ->and($this->figure->reviewed_by)->toBe($admin->id)
        ->and(DB::table('activity_logs')->where('event', 'finance_figures_signed_off')->count())->toBe(1);
});

it('never lets a reviewer sign off a figure they entered', function () {
    $admin = User::factory()->create();
    $this->actingAs($admin)->post(route('capitol.finances.figures.store', ['town' => '0201501000', 'year' => 2024]), manualEntry());
    $entry = FinanceFigure::query()->where('entry_method', 'manual')->sole();

    $this->actingAs($admin)->post(route('capitol.finances.reviews.store', ['town' => '0201501000', 'year' => 2024]), [
        'decision' => 'verified', 'figures' => [$entry->public_id],
    ])->assertRedirect();

    expect($entry->refresh()->status)->toBe(FinanceFigureStatus::Pending);
});

it('requires a reason to reject', function () {
    $route = route('capitol.finances.reviews.store', ['town' => '0201501000', 'year' => 2024]);
    $admin = User::factory()->create();

    $this->actingAs($admin)->post($route, ['decision' => 'rejected', 'figures' => [$this->figure->public_id]])->assertSessionHasErrors('note');
    $this->actingAs($admin)->post($route, ['decision' => 'rejected', 'figures' => [$this->figure->public_id], 'note' => 'Columns swapped'])->assertRedirect();

    expect($this->figure->refresh()->status)->toBe(FinanceFigureStatus::Rejected);
});

it('does not let staff review', function () {
    $this->actingAs(staffFor($this->town))->post(route('capitol.finances.reviews.store', ['town' => '0201501000', 'year' => 2024]), [
        'decision' => 'verified', 'figures' => [$this->figure->public_id],
    ])->assertForbidden();

    expect($this->figure->refresh()->status)->toBe(FinanceFigureStatus::Pending);
});

it('only reviews figures that belong to the town and report in the address', function () {
    $elsewhere = FinanceFigure::factory()->for($this->other)->line('performance.revenue', 2024, '5.00')->create();

    $this->actingAs(User::factory()->create())->post(route('capitol.finances.reviews.store', ['town' => '0201501000', 'year' => 2024]), [
        'decision' => 'verified', 'figures' => [$elsewhere->public_id],
    ]);

    expect($elsewhere->refresh()->status)->toBe(FinanceFigureStatus::Pending)
        ->and(FinanceDocument::query()->count())->toBe(2);
});
