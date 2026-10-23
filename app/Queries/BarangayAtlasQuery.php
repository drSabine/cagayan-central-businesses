<?php

namespace App\Queries;

use App\Data\BarangayProfile;
use App\Data\TownFigure;
use Illuminate\Support\Facades\DB;

/**
 * Tuguegarao City's barangays with their census population and M18 shade,
 * computed in SQL (metrics.md, "Town figures").
 */
final class BarangayAtlasQuery
{
    private const string TUGUEGARAO = '0201529000';

    /**
     * @return list<BarangayProfile>
     */
    public function get(): array
    {
        /** @var list<object{psgc_code: string, name: string, population: int|null, population_year: int|null, population_source: string|null, shade: int|null}> $rows */
        $rows = DB::select(<<<'SQL'
            select b.psgc_code, b.name, b.population, b.population_year, b.population_source,
                case when b.population is not null
                    then ntile(?) over (partition by b.population is null order by b.population) end as shade
            from barangays b
            join municipalities m on m.id = b.municipality_id
            where m.psgc_code = ?
            order by b.name
            SQL, [(int) config('cagayan.towns.shades'), self::TUGUEGARAO]);

        return array_map(fn (object $row) => new BarangayProfile(
            code: $row->psgc_code,
            name: $row->name,
            population: $row->population === null || $row->population_year === null
                ? null
                : new TownFigure((string) $row->population, (int) $row->population_year, $row->population_source),
            shade: $row->shade === null ? null : (int) $row->shade,
        ), $rows);
    }
}
