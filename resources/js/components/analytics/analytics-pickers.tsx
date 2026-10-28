import { Field, FieldLabel } from '@/components/ui/field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { selectedBusiness } from '@/lib/analytics';
import type {
    AnalyticsCatalog,
    AnalyticsFilters,
} from '@/types/economic-performance';

type Option = { value: string; label: string };
type PickerField = 'town' | 'measure' | 'period' | 'dimension' | 'group';

const DIMENSIONS: Option[] = [
    { value: 'industry', label: 'Industry' },
    { value: 'tag', label: 'Focus Tag' },
];

function Picker({
    id,
    label,
    value,
    options,
    onChange,
}: {
    id: string;
    label: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
}) {
    return (
        <Field className="min-w-0 gap-1">
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger id={id} className="min-h-10 w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </Field>
    );
}

/** The analytics selections, shared by the public Economy page and the Capitol Analytics page. */
export function AnalyticsPickers({
    catalog,
    filters,
    fields,
    onChange,
    idPrefix,
}: {
    catalog: AnalyticsCatalog;
    filters: AnalyticsFilters;
    fields: PickerField[];
    onChange: (patch: Partial<AnalyticsFilters>) => void;
    idPrefix: string;
}) {
    const business = selectedBusiness(catalog, filters);
    const pickers: Record<PickerField, () => React.ReactNode> = {
        town: () => (
            <Picker
                id={`${idPrefix}-town`}
                label="Town"
                value={filters.town}
                options={catalog.towns}
                onChange={(town) => onChange({ town })}
            />
        ),
        measure: () => (
            <Picker
                id={`${idPrefix}-measure`}
                label="Measure"
                value={filters.measure}
                options={catalog.measures}
                onChange={(measure) => onChange({ measure })}
            />
        ),
        period: () => (
            <Picker
                id={`${idPrefix}-period`}
                label="Period"
                value={filters.period}
                options={[
                    {
                        value: 'all',
                        label: `${catalog.periods.all} to ${catalog.lastYear}`,
                    },
                    {
                        value: 'recent',
                        label: `${catalog.periods.recent} to ${catalog.lastYear}`,
                    },
                ]}
                onChange={(period) =>
                    onChange({ period: period as AnalyticsFilters['period'] })
                }
            />
        ),
        dimension: () =>
            business && (
                <Picker
                    id={`${idPrefix}-dimension`}
                    label="Group By"
                    value={filters.dimension}
                    options={DIMENSIONS}
                    onChange={(dimension) =>
                        onChange({
                            dimension:
                                dimension as AnalyticsFilters['dimension'],
                        })
                    }
                />
            ),
        group: () =>
            business && (
                <Picker
                    id={`${idPrefix}-group`}
                    label={
                        filters.dimension === 'tag' ? 'Focus Tag' : 'Industry'
                    }
                    value={business.key}
                    options={business.groups}
                    onChange={(group) => onChange({ group })}
                />
            ),
    };
    return (
        <>
            {fields.map((field) => {
                const picker = pickers[field]();
                return picker ? <div key={field}>{picker}</div> : null;
            })}
        </>
    );
}
