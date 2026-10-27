import type { LucideIcon } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export function ChartViewSwitcher<T extends string>({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: T;
    options: readonly { value: T; label: string; icon: LucideIcon }[];
    onChange: (value: T) => void;
}) {
    return (
        <ToggleGroup
            type="single"
            variant="outline"
            value={value}
            aria-label={label}
            onValueChange={(next) => {
                const option = options.find((item) => item.value === next);
                if (option && next !== value) onChange(option.value);
            }}
        >
            {options.map((option) => (
                <Tooltip key={option.value}>
                    <TooltipTrigger asChild>
                        <ToggleGroupItem
                            value={option.value}
                            aria-label={`${label} ${option.label}`}
                            className="size-10 min-w-10 data-[state=on]:bg-accent data-[state=on]:text-foreground"
                        >
                            <option.icon
                                className="size-4"
                                aria-hidden="true"
                            />
                        </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>{option.label}</TooltipContent>
                </Tooltip>
            ))}
        </ToggleGroup>
    );
}
