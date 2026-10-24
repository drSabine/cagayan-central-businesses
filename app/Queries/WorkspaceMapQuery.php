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
        $barangays = [];
        if ($town && $drill) {
            $path = base_path('data/barangays/maps/'.$town.'.json');
            if (is_file($path)) {
                /** @var array{year: int, source: string, features: list<array{properties: array{psgc_code: string, name: string, population: int|null, shade: int|null}}>} $census */
                $census = Cache::rememberForever('workspace.census.'.$town.'.'.filemtime($path), fn () => json_decode(File::get($path), true, flags: JSON_THROW_ON_ERROR));
                foreach ($census['features'] as $feature) {
                    $p = $feature['properties'];
                    $barangays[] = new BarangayProfile($p['psgc_code'], $p['name'],
                        $p['population'] === null ? null : new TownFigure((string) $p['population'], $census['year'], $census['source']), $p['shade']);
                }
            }
        }

        return new WorkspaceMap($this->atlas->get(), $barangays);
    }
}
