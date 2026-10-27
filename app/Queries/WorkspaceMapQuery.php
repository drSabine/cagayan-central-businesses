<?php

namespace App\Queries;

use App\Data\BarangayProfile;
use App\Data\TownFigure;
use App\Data\WorkspaceMap;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

final class WorkspaceMapQuery
{
    public function __construct(private TownAtlasQuery $atlas) {}

    public function get(?string $town, bool $drill): WorkspaceMap
    {
        $census = $town && $drill ? $this->census($town) : null;
        $barangays = array_map(fn (array $f) => new BarangayProfile(
            $f['properties']['psgc_code'],
            $f['properties']['name'],
            TownFigure::fromNullable($f['properties']['population'], $census['year'], $census['source']),
            $f['properties']['shade'],
        ), $census['features'] ?? []);

        return new WorkspaceMap($this->atlas->get(), $barangays);
    }

    /** @return array{year: int, source: string, features: list<array{properties: array{psgc_code: string, name: string, population: int|null, shade: int|null}}>} | null */
    public function census(string $town): ?array
    {
        $path = base_path('data/barangays/maps/'.$town.'.json');

        /** @var array{year: int, source: string, features: list<array{properties: array{psgc_code: string, name: string, population: int|null, shade: int|null}}>} | null */
        return is_file($path)
            ? Cache::rememberForever('workspace.census.'.$town.'.'.filemtime($path), fn () => json_decode(File::get($path), true, flags: JSON_THROW_ON_ERROR))
            : null;
    }
}
