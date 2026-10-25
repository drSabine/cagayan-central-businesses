import { router } from '@inertiajs/react';
import { loadTownBoundaries } from '@/lib/map-data';
import { dashboard } from '@/routes/capitol';
import type { WorkspaceMap } from '@/types/workspace';

// Geography is public, cached client data. Selection does not visit the server.
let latestSelection = 0;
export async function navigateDashboard(
    town: string | null,
    level?: string,
    barangay?: string,
): Promise<void> {
    const selection = ++latestSelection;
    const census =
        town && level === 'barangays' ? await loadTownBoundaries(town) : null;
    if (selection !== latestSelection) return;
    router.push({
        url: dashboard({ query: { town: town ?? undefined, level, barangay } })
            .url,
        preserveScroll: true,
        preserveState: true,
        props: (props) => ({
            ...props,
            map: {
                ...(props.map as WorkspaceMap),
                barangays:
                    census?.features.map(({ properties: p }) => ({
                        code: p.psgc_code,
                        name: p.name,
                        population:
                            p.population == null
                                ? null
                                : {
                                      value: String(p.population),
                                      year: census.year,
                                      sourceUrl: census.source,
                                  },
                        shade: p.shade ?? null,
                    })) ?? [],
            },
        }),
    });
}
