<?php

namespace App\Queries;

use App\Data\CommunityWishSnapshot;
use App\Data\EconomicMetric;
use App\Data\EconomicObservation;
use App\Data\EconomicPerformance;
use App\Data\FinancialHistory;
use App\Data\SelectOption;
use App\Models\Municipality;
use Illuminate\Filesystem\Filesystem;

final class EconomicPerformanceQuery
{
    public function __construct(private Filesystem $files) {}

    /** @param array{town: string, period: string, wishView: string} $filters */
    public function get(array $filters): EconomicPerformance
    {
        $towns = Municipality::query()->orderBy('name')->get(['psgc_code', 'name']);
        $demoTown = (string) config('cagayan.performance.demo_town');
        $town = $towns->firstWhere('psgc_code', $demoTown);
        $available = $town !== null;
        $demo = $available ? $this->files->getRequire(base_path('data/economic-performance/demo.php')) : null;

        return new EconomicPerformance(
            towns: array_values($towns->map(fn (Municipality $town) => new SelectOption($town->psgc_code, $town->name))->all()),
            filters: $filters,
            periods: [
                'all' => (int) config('cagayan.performance.first_year'),
                'recent' => (int) config('cagayan.performance.recent_first_year'),
            ],
            datasets: $demo !== null ? [$demoTown => [
                'finances' => $this->finances($demo['finances']),
                'wishes' => $this->wishes($demo['wishes'], $demoTown, $town->name),
            ]] : [],
        );
    }

    /** @param array{metrics: list<array{id: string, label: string, unit: string, basis: string}>, rows: list<array{year: int, observations: array<string, array{state: string, value: ?string, comparable: bool, change: ?string, percentageChange: ?float, comparisonYear: ?int}>}>, axisMaximum: string, source: array{mode: string, label: string, sourceUrl: ?string, verifiedOn: ?string}} $data */
    private function finances(array $data): FinancialHistory
    {
        $byYear = array_column($data['rows'], 'observations', 'year');
        $first = (int) config('cagayan.performance.first_year');
        $rows = [];
        foreach (range($first, (int) config('cagayan.performance.last_year')) as $year) {
            $points = [];
            foreach ($data['metrics'] as $metric) {
                $point = $byYear[$year][$metric['id']] ?? null;
                $previous = $byYear[$year - 1][$metric['id']] ?? null;
                $shown = $point !== null && $point['state'] === 'shown' && $point['value'] !== null;
                $comparable = $shown && $point['comparable'] && $point['comparisonYear'] === $year - 1
                    && $previous !== null && $previous['state'] === 'shown' && $previous['value'] !== null;
                $nonzeroBase = $comparable && ! preg_match('/^-?0+(?:\.0+)?$/D', $previous['value']);
                $points[$metric['id']] = new EconomicObservation(
                    state: $point['state'] ?? 'unavailable',
                    value: $shown ? $point['value'] : null,
                    comparable: $comparable,
                    change: $comparable ? $point['change'] : null,
                    percentageChange: $nonzeroBase ? $point['percentageChange'] : null,
                    comparisonYear: $comparable ? $point['comparisonYear'] : null,
                );
            }
            $rows[] = ['year' => $year, 'observations' => $points];
        }

        return new FinancialHistory(
            metrics: array_map(fn (array $metric) => new EconomicMetric(...$metric), $data['metrics']),
            rows: $rows,
            axisMaximum: $data['axisMaximum'],
            source: $data['source'],
        );
    }

    /** @param array{asOf: string, period: string, source: string, types: list<array{id: string, label: string, count: int}>, specific: list<array{id: string, label: string, count: int}>} $data */
    private function wishes(array $data, string $townCode, string $townName): CommunityWishSnapshot
    {
        $items = [];
        foreach (['types', 'specific'] as $group) {
            foreach ($data[$group] as $item) {
                $items[] = ['id' => $group.':'.$item['id'], 'label' => $item['label'], 'count' => $item['count']];
            }
        }
        usort($items, fn (array $a, array $b) => ($b['count'] <=> $a['count']) ?: strcmp($a['label'], $b['label']) ?: strcmp($a['id'], $b['id']));

        return new CommunityWishSnapshot($townCode, $townName, $data['asOf'], $data['period'], $data['source'], $items, (int) config('cagayan.performance.cloud_limit'));
    }
}
