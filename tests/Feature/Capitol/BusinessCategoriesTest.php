<?php

use App\Enums\UserRole;
use App\Models\BusinessType;
use App\Models\FocusTag;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->farm = BusinessType::factory()->create(['code' => 'crop-farm', 'name' => 'Rice and corn farm', 'psic_section' => 'A', 'psic_section_name' => 'Agriculture, forestry and fishing']);
    $this->tag = FocusTag::factory()->create(['code' => 'agriculture', 'name' => 'Agriculture']);
});

it('lists Business Types with their industry and Focus Tags for admins', function () {
    $this->farm->focusTags()->attach($this->tag);

    $this->actingAs(User::factory()->create())->get(route('capitol.categories.index'))
        ->assertInertia(fn (Assert $page) => $page->component('capitol/business-categories')
            ->where('categories.types.0.industry', 'Agriculture, forestry and fishing')
            ->where('categories.types.0.tags', ['agriculture'])
            ->where('categories.tags.0.label', 'Agriculture'));
});

it('keeps staff out of Business Categories', function () {
    $staff = User::factory()->create(['role' => UserRole::Staff]);

    $this->actingAs($staff)->get(route('capitol.categories.index'))->assertForbidden();
    $this->actingAs($staff)->post(route('capitol.categories.tags.store'), ['name' => 'Fishery'])->assertForbidden();
    $this->actingAs($staff)->put(route('capitol.categories.types.tags.update', 'crop-farm'), ['tags' => []])->assertForbidden();

    expect(FocusTag::query()->count())->toBe(1);
});

it('adds a Focus Tag and logs it', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin)->post(route('capitol.categories.tags.store'), ['name' => 'Fishery'])
        ->assertRedirect(route('capitol.categories.index'));

    expect(FocusTag::query()->where('code', 'fishery')->value('name'))->toBe('Fishery')
        ->and(DB::table('activity_logs')->where('event', 'focus_tag_created')->where('actor_id', $admin->id)->count())->toBe(1);
});

it('refuses a Focus Tag that repeats an existing one or has no letters', function (string $name) {
    $this->actingAs(User::factory()->create())->post(route('capitol.categories.tags.store'), ['name' => $name])
        ->assertSessionHasErrors('name');

    expect(FocusTag::query()->count())->toBe(1);
})->with(['same name' => 'Agriculture', 'same code' => 'agriculture!', 'punctuation only' => '???', 'markup' => '<b>Tag</b>']);

it('replaces the Focus Tags of a Business Type', function () {
    $fishery = FocusTag::factory()->create(['code' => 'fishery', 'name' => 'Fishery']);
    $this->farm->focusTags()->attach($this->tag);

    $this->actingAs(User::factory()->create())->put(route('capitol.categories.types.tags.update', 'crop-farm'), ['tags' => ['fishery']])
        ->assertRedirect(route('capitol.categories.index'));

    expect($this->farm->focusTags()->pluck('code')->all())->toBe(['fishery'])
        ->and(DB::table('activity_logs')->where('event', 'business_type_tags_updated')->count())->toBe(1)
        ->and($fishery->businessTypes()->count())->toBe(1);
});

it('rejects an unknown Focus Tag code', function () {
    $this->actingAs(User::factory()->create())->put(route('capitol.categories.types.tags.update', 'crop-farm'), ['tags' => ['mining']])
        ->assertSessionHasErrors('tags.0');
});
