<?php

namespace App\Queries;

use App\Data\AnalyticsCatalog;
use App\Data\EconomicMetric;
use App\Data\EconomicObservation;
use App\Data\FinancialHistory;
use App\Data\SelectOption;
use App\Enums\FinanceAvailability;
use App\Models\FinanceDocument;
use App\Models\FinanceLine;
use App\Models\Municipality;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use stdClass;

/**
 * Signed-off finance series (stats_finance_year, M19 to M27) and business trends for the analytics pages.
 * Only towns with at least one signed-off figure appear; every other town is not available.
 */
final class AnalyticsCatalogQuery
{
    /** The Sum of Reporting Towns uses the province code, but it is never the provincial government's accounts (M27). */
    public const string ALL_TOWNS = '0201500000';

    /** Which COA document a missing line would have come from, to tell "not published" from "not reported". */
    private const array SOURCE_KINDS = [
        'executive_summary' => 'executive_summary',
        'fs_workbook' => 'fs_workbook',
        'fs_scbaa' => 'fs_workbook',
        'annex_c1' => 'annex_workbook',
    ];

    public function __construct(private BusinessTrendsQuery $businesses) {}

    public function get(bool $public): AnalyticsCatalog
    {
        $years = range((int) config('cagayan.performance.first_year'), (int) config('cagayan.performance.last_year'));
        $groups = config('cagayan.finances.groups');
        $lines = FinanceLine::query()->where('displayed', true)->whereIn('group', array_keys($groups))
            ->orderBy('sort')->get(['code', 'label', 'group', 'unit', 'source'])->groupBy('group');
        $towns = Municipality::query()->orderBy('name')->get(['id', 'psgc_code', 'name']);
        $stats = DB::table('stats_finance_year')->whereBetween('fiscal_year', [$years[0], end($years)])->get()
            ->groupBy(fn (stdClass $row): int => (int) ($row->municipality_id ?? 0));
        $unpublished = FinanceDocument::query()->where('availability', FinanceAvailability::NotPublished)
            ->get(['municipality_id', 'fiscal_year', 'kind'])
            ->mapWithKeys(fn (FinanceDocument $document) => ["{$document->municipality_id} {$document->fiscal_year} {$document->kind->value}" => true])
            ->all();

        $finances = [];
        // Union, not spread: spreading would renumber the municipality ids that key the stats.
        foreach ([0 => self::ALL_TOWNS] + $towns->pluck('psgc_code', 'id')->all() as $id => $code) {
            if ($stats->has($id)) {
                $finances[$code] = $lines->map(fn (Collection $group) => $this->history($group, $stats[$id], $years, $id, $unpublished))->all();
            }
        }

        return new AnalyticsCatalog(
            towns: [new SelectOption(self::ALL_TOWNS, 'Sum of Reporting Towns'),
                ...$towns->map(fn (Municipality $town) => new SelectOption($town->psgc_code, $town->name))->all()],
            measures: array_map(fn (string $key) => new SelectOption($key, $groups[$key]['label']), array_keys($lines->all())),
            periods: ['all' => $years[0], 'recent' => (int) config('cagayan.performance.recent_first_year')],
            lastYear: end($years),
            finances: $finances,
            businesses: $this->businesses->get($public),
        );
    }

    /**
     * @param  Collection<int, FinanceLine>  $lines
     * @param  Collection<int, stdClass>  $stats
     * @param  list<int>  $years
     * @param  array<string, true>  $unpublished
     */
    private function history(Collection $lines, Collection $stats, array $years, int $townId, array $unpublished): FinancialHistory
    {
        $byKey = $stats->keyBy(fn (stdClass $row) => "{$row->metric} {$row->fiscal_year}");
        $rows = array_map(fn (int $year) => ['year' => $year, 'observations' => $lines->mapWithKeys(function (FinanceLine $line) use ($byKey, $year, $townId, $unpublished) {
            $row = $byKey->get("{$line->code} {$year}");
            if ($row === null) {
                $kind = self::SOURCE_KINDS[$line->source] ?? null;
                $reason = $townId !== 0 && $kind !== null && isset($unpublished["{$townId} {$year} {$kind}"]) ? 'not_published' : 'not_reported';

                return [$line->code => new EconomicObservation('unavailable', null, false, null, null, null, $reason)];
            }

            return [$line->code => new EconomicObservation(
                state: 'shown',
                value: (string) $row->value,
                comparable: (bool) $row->comparable,
                change: $row->change === null ? null : (string) $row->change,
                percentageChange: $row->percent_change === null ? null : (float) $row->percent_change,
                comparisonYear: $row->comparable ? $year - 1 : null,
                coverage: $row->reporting_towns === null ? null
                    : ['reporting' => (int) $row->reporting_towns, 'total' => (int) $row->total_towns, 'matched' => (int) $row->matched_towns],
                censusYear: $row->census_year === null ? null : (int) $row->census_year,
            )];
        })->all()], $years);

        $values = $stats->whereIn('metric', $lines->pluck('code'))->pluck('value');

        return new FinancialHistory(
            metrics: array_values($lines->map(fn (FinanceLine $line) => new EconomicMetric($line->code, $line->label, $line->unit, $line->source))->all()),
            rows: $rows,
            axisMaximum: (string) ($values->max() ?? '0'),
            source: ['mode' => 'verified', 'label' => 'COA Annual Audit Reports', 'sourceUrl' => (string) config('cagayan.finances.coa_url'), 'verifiedOn' => null],
        );
    }
}
