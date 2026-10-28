<?php

namespace App\Queries;

use App\Data\BusinessDirectory;
use App\Data\BusinessDirectoryRow;
use App\Data\Pagination;
use App\Data\SelectOption;
use App\Enums\BusinessStatus;
use App\Models\BusinessType;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use stdClass;

/** Registered business names under their type, category and industry. Public-class fields only. */
final class BusinessDirectoryQuery
{
    private const int PAGE_SIZE = 25;

    /** @param array{q: ?string, category: ?string, type: ?string, industry: ?string, status: ?string, sort: string, dir: string} $filters */
    public function get(array $filters): BusinessDirectory
    {
        // Business records are simulated until a real registry is loaded, so nothing is read unless the label can show too (P13, D37).
        $enabled = (bool) config('cagayan.simulated');
        $results = $enabled ? $this->page($filters) : new LengthAwarePaginator([], 0, self::PAGE_SIZE);

        return new BusinessDirectory(
            rows: array_values(array_map(fn (stdClass $row) => new BusinessDirectoryRow(
                $row->business_name, $row->type_name, $row->category, $row->industry, $row->barangay,
                (int) $row->year_established, $row->status,
            ), $results->items())),
            pagination: Pagination::from($results),
            categories: array_values(DB::table('business_categories')->orderBy('sort_order')->orderBy('name')->get(['code', 'name', 'color'])
                ->map(fn (stdClass $category) => ['code' => $category->code, 'name' => $category->name, 'color' => (int) $category->color])->all()),
            types: array_values(BusinessType::query()->orderBy('name')->get(['code', 'name'])
                ->map(fn (BusinessType $type) => new SelectOption($type->code, $type->name))->all()),
            industries: array_values(BusinessType::query()->distinct()->orderBy('psic_section')->get(['psic_section', 'psic_section_name'])
                ->map(fn (BusinessType $type) => new SelectOption($type->psic_section, $type->psic_section_name))->all()),
            statuses: array_map(fn (BusinessStatus $status) => new SelectOption($status->value, str($status->value)->replace('_', ' ')->title()->toString()), BusinessStatus::cases()),
            filters: $filters,
            enabled: $enabled,
        );
    }

    /**
     * @param  array{q: ?string, category: ?string, type: ?string, industry: ?string, status: ?string, sort: string, dir: string}  $filters
     * @return LengthAwarePaginator<int, stdClass>
     */
    private function page(array $filters): LengthAwarePaginator
    {
        $direction = $filters['dir'] === 'desc' ? 'desc' : 'asc';
        $query = DB::table('businesses as b')
            ->join('business_types as t', 't.id', '=', 'b.business_type_id')
            ->join('business_categories as c', 'c.id', '=', 't.business_category_id')
            ->join('barangays as g', 'g.id', '=', 'b.barangay_id')
            // The latest year's status, from the unique (business_id, year) index.
            ->leftJoinLateral(
                DB::table('business_years as y')->whereColumn('y.business_id', 'b.id')->orderByDesc('y.year')->limit(1)->select('y.status'),
                'latest',
            )
            ->when($filters['q'], fn ($q, string $term) => $q->whereRaw('lower(b.business_name) like ?', ['%'.mb_strtolower(addcslashes($term, '%_\\')).'%']))
            ->when($filters['category'], fn ($q, string $code) => $q->where('c.code', $code))
            ->when($filters['type'], fn ($q, string $code) => $q->where('t.code', $code))
            ->when($filters['industry'], fn ($q, string $section) => $q->where('t.psic_section', $section))
            ->when($filters['status'], fn ($q, string $status) => $q->where('latest.status', $status))
            ->select('b.business_name', 't.name as type_name', 'c.code as category', 't.psic_section_name as industry', 'g.name as barangay', 'b.year_established', 'latest.status');

        match ($filters['sort']) {
            'type' => $query->orderBy('t.name', $direction),
            'established' => $query->orderBy('b.year_established', $direction),
            default => $query->orderByRaw("lower(b.business_name) {$direction}"),
        };

        return $query->orderBy('b.id')->paginate(self::PAGE_SIZE)->withQueryString();
    }
}
