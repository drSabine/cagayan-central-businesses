<?php

namespace App\Queries;

use App\Data\CommunityWishSnapshot;
use App\Data\EconomicPerformance;
use App\Models\Municipality;
use Illuminate\Filesystem\Filesystem;

final class EconomicPerformanceQuery
{
    public function __construct(private Filesystem $files, private AnalyticsCatalogQuery $catalog) {}

    /** @param array{town: string, period: string, measure: string, dimension: string, group: string|null, wishView: string} $filters */
    public function get(array $filters): EconomicPerformance
    {
        $demoTown = (string) config('cagayan.performance.demo_town');
        $town = Municipality::query()->where('psgc_code', $demoTown)->first(['psgc_code', 'name']);
        $demo = $town !== null ? $this->files->getRequire(base_path('data/economic-performance/demo.php')) : null;

        return new EconomicPerformance(
            catalog: $this->catalog->get(public: true),
            filters: $filters,
            wishes: $demo !== null ? [$demoTown => $this->wishes($demo['wishes'], $demoTown, $town->name)] : [],
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
