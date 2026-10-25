import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import {
    changeLabel,
    formatPesoTick,
    observationLabel,
    percentageLabel,
} from '@/lib/performance-format';
import type { FinancialHistory } from '@/types/economic-performance';

export default function FinanceHistoryChart({
    history,
}: {
    history: FinancialHistory;
}) {
    const metrics = history.metrics.slice(0, 2);
    const config = Object.fromEntries(
        metrics.map((metric, index) => [
            metric.id,
            { label: metric.label, color: `var(--chart-${index + 1})` },
        ]),
    );
    const data = history.rows.map((row) => ({
        year: row.year,
        ...Object.fromEntries(
            metrics.map((metric) => {
                const point = row.observations[metric.id];
                return [
                    metric.id,
                    point?.state === 'shown' && point.value !== null
                        ? Number(point.value)
                        : null,
                ];
            }),
        ),
    }));

    return (
        <div className="flex flex-col gap-2">
            <ChartContainer
                config={config}
                className="aspect-auto h-64 w-full font-mono tabular-nums sm:h-72"
                role="group"
                aria-label="Government finances by year. Both vertical axes use the same peso scale. Exact values and annual changes are available for each year."
            >
                <LineChart
                    data={data}
                    margin={{ top: 12, right: 4, bottom: 20, left: 4 }}
                    accessibilityLayer
                >
                    <CartesianGrid
                        stroke="var(--muted-foreground)"
                        strokeOpacity={0.6}
                        strokeWidth={1}
                    />
                    <XAxis
                        dataKey="year"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        label={{
                            value: 'Year',
                            position: 'insideBottom',
                            offset: -16,
                            fill: 'var(--muted-foreground)',
                        }}
                    />
                    {metrics.map((metric, index) => (
                        <YAxis
                            key={metric.id}
                            yAxisId={metric.id}
                            orientation={index === 0 ? 'left' : 'right'}
                            domain={[0, Number(history.axisMaximum)]}
                            width={58}
                            tickFormatter={formatPesoTick}
                            tickLine={false}
                            axisLine={false}
                        />
                    ))}
                    <ChartTooltip
                        content={({ active, label }) => {
                            const row = history.rows.find(
                                (item) => item.year === Number(label),
                            );
                            return active && row ? (
                                <div className="grid max-w-72 gap-3 rounded-sm border bg-popover p-3 text-popover-foreground shadow-md">
                                    <p className="type-label">{row.year}</p>
                                    {metrics.map((metric) => {
                                        const point =
                                            row.observations[metric.id];
                                        return (
                                            <div
                                                key={metric.id}
                                                className="grid gap-1"
                                            >
                                                <p className="type-body">
                                                    {metric.label}
                                                </p>
                                                <p className="font-mono type-body tabular-nums">
                                                    {observationLabel(point)}
                                                </p>
                                                <p className="type-meta">
                                                    Change
                                                    {point?.comparisonYear
                                                        ? ` from ${point.comparisonYear}`
                                                        : ''}
                                                </p>
                                                <p className="font-mono type-body tabular-nums">
                                                    {changeLabel(point)} (
                                                    {percentageLabel(point)})
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : null;
                        }}
                    />
                    {metrics.map((metric, index) => (
                        <Line
                            key={metric.id}
                            yAxisId={metric.id}
                            dataKey={metric.id}
                            name={metric.label}
                            type="linear"
                            stroke={`var(--color-${metric.id})`}
                            strokeWidth={2}
                            strokeDasharray={index === 1 ? '6 4' : undefined}
                            dot={{ r: 4, fill: 'var(--card)' }}
                            activeDot={{ r: 6 }}
                            connectNulls={false}
                            isAnimationActive={false}
                        />
                    ))}
                </LineChart>
            </ChartContainer>
            <ul
                aria-label="Legend"
                className="flex flex-wrap justify-center gap-x-4 gap-y-1"
            >
                {metrics.map((metric, index) => (
                    <li
                        key={metric.id}
                        className="flex items-center gap-2 type-meta"
                    >
                        <svg width="24" height="8" aria-hidden="true">
                            <line
                                x1="0"
                                y1="4"
                                x2="24"
                                y2="4"
                                stroke={`var(--chart-${index + 1})`}
                                strokeWidth="2"
                                strokeDasharray={
                                    index === 1 ? '6 4' : undefined
                                }
                            />
                        </svg>
                        {metric.label} ({index === 0 ? 'Left' : 'Right'} Axis)
                    </li>
                ))}
            </ul>
        </div>
    );
}
