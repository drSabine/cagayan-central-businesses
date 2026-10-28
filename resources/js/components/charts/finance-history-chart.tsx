import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { RESULT_METRIC, ResultFigure } from '@/components/charts/trend-mark';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { formatMetricTick, observationLabel } from '@/lib/performance-format';
import type { FinancialHistory } from '@/types/economic-performance';

const DASHES = [undefined, '6 4', '2 3', '10 3 2 3', '1 4'];

export default function FinanceHistoryChart({
    history,
}: {
    history: FinancialHistory;
}) {
    const metrics = history.metrics.slice(0, DASHES.length);
    const unit = metrics[0]?.unit ?? 'php';
    // Series are keyed by position: metric ids contain dots, which are not valid in CSS custom property names.
    const config = Object.fromEntries(
        metrics.map((metric, index) => [
            `series${index}`,
            { label: metric.label, color: `var(--chart-${index + 1})` },
        ]),
    );
    const data = history.rows.map((row) => ({
        year: row.year,
        ...Object.fromEntries(
            metrics.map((metric, index) => {
                const point = row.observations[metric.id];
                return [
                    `series${index}`,
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
                aria-label={`${metrics.map((metric) => metric.label).join(' and ')} by year. Exact values are listed in the table.`}
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
                    <YAxis
                        domain={[
                            (lowest: number) => Math.min(0, lowest),
                            Math.max(Number(history.axisMaximum), 0),
                        ]}
                        width={58}
                        tickFormatter={(value: number) =>
                            formatMetricTick(value, unit)
                        }
                        tickLine={false}
                        axisLine={false}
                    />
                    <ChartTooltip
                        content={({ active, label }) => {
                            const row = history.rows.find(
                                (item) => item.year === Number(label),
                            );
                            return active && row ? (
                                <div className="grid max-w-96 gap-2 rounded-sm border bg-popover p-2 text-popover-foreground shadow-md">
                                    <p className="type-label">{row.year}</p>
                                    {metrics.map((metric, index) => {
                                        const point =
                                            row.observations[metric.id];
                                        return (
                                            <div
                                                key={metric.id}
                                                className="border-t pt-1"
                                            >
                                                <div className="flex items-baseline justify-between gap-3 type-data">
                                                    <span className="flex items-center gap-1 font-sans">
                                                        <svg
                                                            width="12"
                                                            height="8"
                                                            aria-hidden="true"
                                                        >
                                                            <line
                                                                x1="0"
                                                                y1="4"
                                                                x2="12"
                                                                y2="4"
                                                                stroke={`var(--chart-${index + 1})`}
                                                                strokeWidth="2"
                                                                strokeDasharray={
                                                                    DASHES[
                                                                        index
                                                                    ]
                                                                }
                                                            />
                                                        </svg>
                                                        {metric.label}
                                                    </span>
                                                    <span className="font-mono tabular-nums">
                                                        {metric.id ===
                                                        RESULT_METRIC ? (
                                                            <ResultFigure
                                                                point={point}
                                                            >
                                                                {observationLabel(
                                                                    point,
                                                                    metric.unit,
                                                                )}
                                                            </ResultFigure>
                                                        ) : (
                                                            observationLabel(
                                                                point,
                                                                metric.unit,
                                                            )
                                                        )}
                                                    </span>
                                                </div>
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
                            dataKey={`series${index}`}
                            name={metric.label}
                            type="linear"
                            stroke={`var(--color-series${index})`}
                            strokeWidth={2}
                            strokeDasharray={DASHES[index]}
                            dot={{
                                r: 4,
                                fill: 'var(--card)',
                                strokeDasharray: '0',
                            }}
                            activeDot={{ r: 6 }}
                            connectNulls={false}
                            isAnimationActive={false}
                        />
                    ))}
                </LineChart>
            </ChartContainer>
            {metrics.length > 1 && (
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
                                    strokeDasharray={DASHES[index]}
                                />
                            </svg>
                            {metric.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
