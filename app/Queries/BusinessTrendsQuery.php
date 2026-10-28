<?php

namespace App\Queries;

use App\Data\BusinessTrends;
use App\Data\EconomicMetric;
use App\Data\EconomicObservation;
use App\Data\FinancialHistory;
use App\Data\GuardedFigure;
use App\Data\SelectOption;
use App\Models\Municipality;
use App\Services\Privacy\PrivacyGuard;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use stdClass;

/**
 * M28 to M31 for the connected town, summed from stats_area_year in SQL. Sales pass through the privacy guard
 * per year across each breakdown (P4); the public variant receives bands only and no sales share (P7). Focus Tags overlap
 * industries, so their sales are bands for every audience: an exact tag figure minus an industry could expose a hidden group.
 */
final class BusinessTrendsQuery
{
    private const array COUNTS = [
        'active' => 'Active Businesses',
        'new' => 'New Registrations',
        'closed' => 'Closed Businesses',
    ];

    public function __construct(private PrivacyGuard $guard) {}

    public function get(bool $public): ?BusinessTrends
    {
        $town = Municipality::query()->where('psgc_code', config('cagayan.performance.demo_town'))->first(['id', 'psgc_code', 'name']);
        $cells = $town === null ? collect() : $this->cells($town->id);
        if ($town === null || $cells->isEmpty()) {
            return null;
        }

        $industries = [];
        $tags = [];
        $datasets = [];
        $guarded = $this->guardSales($cells);
        $years = range((int) $cells->min('year'), (int) $cells->max('year'));
        foreach ($cells->groupBy(fn (stdClass $cell) => "{$cell->dimension}:{$cell->code}") as $key => $series) {
            $first = $series->first();
            $option = new SelectOption((string) $key, (string) $first->label);
            if ($first->dimension === 'tag') {
                $tags[] = $option;
            } else {
                $industries[] = $option;
            }
            $banded = $public || $first->dimension === 'tag';
            $datasets[$key] = [
                'counts' => $this->withGaps($this->counts($series), $years),
                'sales' => $this->withGaps($this->sales($series, $guarded, $banded), $years),
                'share' => $this->withGaps($this->share($series, $guarded, $banded), $years),
            ];
        }

        return new BusinessTrends($town->psgc_code, $town->name, ['industry' => $industries, 'tag' => $tags], $datasets);
    }

    /** @return Collection<int, stdClass> */
    private function cells(int $townId): Collection
    {
        return collect(DB::select(<<<'SQL'
            with cells as (
                select 'industry' as dimension, t.psic_section as code, t.psic_section_name as label, s.year,
                    sum(s.active_count) as active, sum(s.new_count) as new, sum(s.closed_count) as closed,
                    sum(s.declared_sales_total) as sales, max(s.declared_sales_max_single) as max_single
                from stats_area_year s
                join barangays g on g.id = s.barangay_id
                join business_types t on t.id = s.business_type_id
                where g.municipality_id = ?
                group by t.psic_section, t.psic_section_name, s.year
                union all
                select 'tag', f.code, f.name, s.year,
                    sum(s.active_count), sum(s.new_count), sum(s.closed_count),
                    sum(s.declared_sales_total), max(s.declared_sales_max_single)
                from stats_area_year s
                join barangays g on g.id = s.barangay_id
                join business_type_focus_tag p on p.business_type_id = s.business_type_id
                join focus_tags f on f.id = p.focus_tag_id
                where g.municipality_id = ?
                group by f.code, f.name, s.year
            )
            select *,
                lag(year) over w as prior_year,
                active - lag(active) over w as active_change,
                round((active - lag(active) over w) * 100.0 / nullif(lag(active) over w, 0), 1) as active_percent,
                new - lag(new) over w as new_change,
                round((new - lag(new) over w) * 100.0 / nullif(lag(new) over w, 0), 1) as new_percent,
                closed - lag(closed) over w as closed_change,
                round((closed - lag(closed) over w) * 100.0 / nullif(lag(closed) over w, 0), 1) as closed_percent,
                sales - lag(sales) over w as sales_change,
                round((sales - lag(sales) over w) * 100.0 / nullif(lag(sales) over w, 0), 1) as sales_percent,
                -- Industries partition the town (one industry per type, D36); tags overlap, so town totals come from industries.
                sum(active) filter (where dimension = 'industry') over y as town_active,
                sum(sales) filter (where dimension = 'industry') over y as town_sales,
                max(max_single) filter (where dimension = 'industry') over y as town_max_single,
                round(active * 100.0 / nullif(sum(active) filter (where dimension = 'industry') over y, 0), 1) as count_share,
                round(sales * 100.0 / nullif(sum(sales) filter (where dimension = 'industry') over y, 0), 1) as sales_share
            from cells
            window w as (partition by dimension, code order by year), y as (partition by year)
            order by dimension, label, year
            SQL, [$townId, $townId]));
    }

    /**
     * @param  Collection<int, stdClass>  $cells
     * @return array<string, GuardedFigure> keyed "dimension:code:year"
     */
    private function guardSales(Collection $cells): array
    {
        $guarded = [];
        foreach ($cells->groupBy(fn (stdClass $cell) => "{$cell->dimension}:{$cell->year}") as $breakdown) {
            $figures = $this->guard->breakdown($breakdown->mapWithKeys(fn (stdClass $cell) => [
                "{$cell->dimension}:{$cell->code}:{$cell->year}" => ['total' => (string) $cell->sales, 'count' => (int) $cell->active, 'maxSingle' => (string) $cell->max_single],
            ])->all());
            $guarded = [...$guarded, ...$figures];
        }

        return $guarded;
    }

    /** @param  Collection<int, stdClass>  $series */
    private function counts(Collection $series): FinancialHistory
    {
        $rows = array_values($series->map(fn (stdClass $cell) => ['year' => (int) $cell->year, 'observations' => array_map(function (string $metric) use ($cell) {
            $comparable = $cell->prior_year !== null && (int) $cell->prior_year === (int) $cell->year - 1;
            $percent = $cell->{"{$metric}_percent"};

            return new EconomicObservation('shown', (string) $cell->{$metric}, $comparable,
                $comparable ? (string) $cell->{"{$metric}_change"} : null,
                $comparable && $percent !== null ? (float) $percent : null,
                $comparable ? (int) $cell->year - 1 : null);
        }, array_combine(array_keys(self::COUNTS), array_keys(self::COUNTS)))])->all());

        return new FinancialHistory(
            metrics: array_map(fn (string $id, string $label) => new EconomicMetric($id, $label, 'count', 'Registered businesses only'), array_keys(self::COUNTS), self::COUNTS),
            rows: $rows,
            axisMaximum: (string) $series->max('active'),
            source: ['mode' => 'simulated', 'label' => 'Registered businesses only', 'sourceUrl' => null, 'verifiedOn' => null],
        );
    }

    /**
     * @param  Collection<int, stdClass>  $series
     * @param  array<string, GuardedFigure>  $guarded
     */
    private function sales(Collection $series, array $guarded, bool $public): FinancialHistory
    {
        $rows = [];
        $previous = null;
        foreach ($series as $cell) {
            $figure = $guarded["{$cell->dimension}:{$cell->code}:{$cell->year}"];
            $comparable = $previous !== null && $cell->prior_year !== null && (int) $cell->prior_year === (int) $cell->year - 1
                && $this->guard->derived($figure, $previous) === null;
            $shown = $public ? $this->guard->band($figure) : $figure;
            $rows[] = ['year' => (int) $cell->year, 'observations' => ['sales' => new EconomicObservation(
                state: $figure->state,
                value: $shown->value,
                // P7: the public sees bands, so no numeric change either.
                comparable: $comparable && ! $public,
                change: $comparable && ! $public ? (string) $cell->sales_change : null,
                percentageChange: $comparable && ! $public && $cell->sales_percent !== null ? (float) $cell->sales_percent : null,
                comparisonYear: $comparable && ! $public ? (int) $cell->year - 1 : null,
                reason: $figure->reason,
                band: $shown->band,
            )]];
            $previous = $figure;
        }

        $max = collect($rows)->map(fn (array $row) => $row['observations']['sales']->value)->filter()->max();

        return new FinancialHistory(
            metrics: [new EconomicMetric('sales', 'Declared Sales', 'php', 'Declared business activity, not the income of residents or of the barangay government')],
            rows: $rows,
            axisMaximum: (string) ($max ?? '0'),
            source: ['mode' => 'simulated', 'label' => 'Declared business activity, not the income of residents or of the barangay government', 'sourceUrl' => null, 'verifiedOn' => null],
        );
    }

    /**
     * M30. The sales share is hidden when the group's or the town's sales are hidden (P6), and never public (P7).
     *
     * @param  Collection<int, stdClass>  $series
     * @param  array<string, GuardedFigure>  $guarded
     */
    private function share(Collection $series, array $guarded, bool $public): FinancialHistory
    {
        $metrics = [new EconomicMetric('count_share', 'Share of Active Businesses', 'percent', 'Registered businesses only')];
        if (! $public) {
            $metrics[] = new EconomicMetric('sales_share', 'Share of Declared Sales', 'percent', 'Declared business activity, not the income of residents or of the barangay government');
        }

        $rows = array_values($series->map(function (stdClass $cell) use ($guarded, $public) {
            $observations = ['count_share' => new EconomicObservation('shown', (string) $cell->count_share, false, null, null, null)];
            if (! $public) {
                $town = $this->guard->figure((string) $cell->town_sales, (int) $cell->town_active, (string) $cell->town_max_single);
                $hidden = $this->guard->derived($guarded["{$cell->dimension}:{$cell->code}:{$cell->year}"], $town);
                $observations['sales_share'] = $hidden === null
                    ? new EconomicObservation('shown', (string) $cell->sales_share, false, null, null, null)
                    : new EconomicObservation('hidden', null, false, null, null, null, $hidden->reason);
            }

            return ['year' => (int) $cell->year, 'observations' => $observations];
        })->all());

        return new FinancialHistory(
            metrics: $metrics,
            rows: $rows,
            axisMaximum: '100',
            source: ['mode' => 'simulated', 'label' => 'Registered businesses only', 'sourceUrl' => null, 'verifiedOn' => null],
        );
    }

    /**
     * A year with no records for the group is a gap: Not available, never zero and never bridged (M26).
     *
     * @param  list<int>  $years
     */
    private function withGaps(FinancialHistory $history, array $years): FinancialHistory
    {
        $byYear = array_column($history->rows, null, 'year');
        $missing = array_fill_keys(array_map(fn (EconomicMetric $metric) => $metric->id, $history->metrics), new EconomicObservation('unavailable', null, false, null, null, null));

        return new FinancialHistory(
            metrics: $history->metrics,
            rows: array_map(fn (int $year) => $byYear[$year] ?? ['year' => $year, 'observations' => $missing], $years),
            axisMaximum: $history->axisMaximum,
            source: $history->source,
        );
    }
}
