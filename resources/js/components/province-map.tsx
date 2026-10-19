import townsSource from '../../../data/boundaries/cagayan-municipalities.geojson?raw';
import barangaysSource from '../../../data/boundaries/tuguegarao-barangays.geojson?raw';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type Ring = [number, number][];

type Feature = {
    properties: { psgc_code: string; name: string };
    geometry:
        | { type: 'Polygon'; coordinates: Ring[] }
        | { type: 'MultiPolygon'; coordinates: Ring[][] };
};

const WIDTH = 400;

// Longitude is squeezed by the cosine of the middle latitude so the shapes keep their proportions.
function draw(source: string) {
    const features = (JSON.parse(source) as { features: Feature[] }).features;
    const polygons = ({ geometry }: Feature): Ring[][] =>
        geometry.type === 'Polygon'
            ? [geometry.coordinates]
            : geometry.coordinates;

    const points = features.flatMap((f) => polygons(f).flatMap((p) => p[0]));
    const lngs = points.map(([lng]) => lng);
    const lats = points.map(([, lat]) => lat);
    const [west, north] = [Math.min(...lngs), Math.max(...lats)];
    const south = Math.min(...lats);
    const squeeze = Math.cos((((south + north) / 2) * Math.PI) / 180);
    const scale = WIDTH / ((Math.max(...lngs) - west) * squeeze);
    const ring = (r: Ring) =>
        `M${r.map(([lng, lat]) => `${((lng - west) * squeeze * scale).toFixed(1)} ${((north - lat) * scale).toFixed(1)}`).join('L')}Z`;

    return {
        height: Math.round((north - south) * scale),
        shapes: features.map((f) => ({
            code: f.properties.psgc_code,
            name: f.properties.name,
            path: polygons(f).flat().map(ring).join(''),
        })),
    };
}

const maps = {
    province: draw(townsSource),
    tuguegarao: draw(barangaysSource),
};

export type ProvinceMapProps = {
    shapes: keyof typeof maps;
    label: string;
    // Filled in brass: the connected towns, or the town a visitor chose.
    highlight?: string[];
    onSelect?: (code: string) => void;
    className?: string;
};

// Drawn from data/boundaries. Pages use LazyProvinceMap (frontend.md, "The map").
// Colors follow the parent's text color. Never the only way to pick a place.
export default function ProvinceMap({
    shapes,
    label,
    highlight = [],
    onSelect,
    className,
}: ProvinceMapProps) {
    const { height, shapes: list } = maps[shapes];

    return (
        <svg
            viewBox={`-2 -2 ${WIDTH + 4} ${height + 4}`}
            role="img"
            aria-label={label}
            className={className}
        >
            {list.map((shape, index) => (
                <Tooltip key={shape.code}>
                    <TooltipTrigger asChild>
                        <path
                            d={shape.path}
                            fillRule="evenodd"
                            onClick={() => onSelect?.(shape.code)}
                            style={{
                                animationDelay: `${(index * 900) / list.length}ms`,
                            }}
                            className={cn(
                                'stroke-current/40 stroke-1 transition-colors outline-none [vector-effect:non-scaling-stroke] motion-safe:animate-fade',
                                highlight.includes(shape.code)
                                    ? 'fill-highlight stroke-highlight'
                                    : 'fill-current/10 hover:fill-current/30',
                                onSelect && 'cursor-pointer',
                            )}
                        />
                    </TooltipTrigger>
                    <TooltipContent>{shape.name}</TooltipContent>
                </Tooltip>
            ))}
        </svg>
    );
}
