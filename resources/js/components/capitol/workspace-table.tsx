import { Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCount, formatDateTime } from '@/lib/format';
import { index as wishes } from '@/routes/capitol/wishes';
import { index as logs } from '@/routes/capitol/logs';
import type { WorkspaceTable as Data } from '@/types/workspace';

export function WorkspaceTable({
    data,
    kind,
}: {
    data: Data;
    kind: 'wishes' | 'logs';
}) {
    const choose = (field: string, value: string) => {
        const filters = {
            ...data.filters,
            [field]: value === 'all' ? undefined : value,
        };
        router.get(
            (kind === 'wishes' ? wishes : logs)({ query: filters }).url,
            {},
            { preserveState: true, preserveScroll: true },
        );
    };
    const columns =
        kind === 'wishes'
            ? ['Town or City', 'Business Type', 'Wishes']
            : ['Event', 'Account', 'Date and Time'];
    const filters =
        kind === 'wishes'
            ? [
                  { key: 'town', label: 'Town or City', options: data.towns },
                  {
                      key: 'category',
                      label: 'Business Type',
                      options: data.categories,
                  },
              ]
            : [{ key: 'event', label: 'Event', options: data.categories }];

    return (
        <section className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-wrap items-end gap-3">
                {filters.map(({ key, label, options }) => (
                    <div
                        key={key}
                        className="flex w-full flex-col gap-2 sm:w-60"
                    >
                        <label id={key + '-label'} className="type-label">
                            {label}
                        </label>
                        <Select
                            value={data.filters[key] ?? 'all'}
                            onValueChange={(value) => choose(key, value)}
                        >
                            <SelectTrigger
                                aria-labelledby={key + '-label'}
                                className="w-full"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {options.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ))}
            </div>
            <div className="overflow-hidden rounded-sm border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column, i) => (
                                <TableHead
                                    key={column}
                                    className={
                                        kind === 'wishes' && i === 2
                                            ? 'text-right'
                                            : ''
                                    }
                                >
                                    {column}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.rows.length ? (
                            data.rows.map((row, i) => (
                                <TableRow key={String(row.id ?? i)}>
                                    {kind === 'wishes' ? (
                                        <>
                                            <TableCell>{row.town}</TableCell>
                                            <TableCell>
                                                {row.category}
                                            </TableCell>
                                            <TableCell className="text-right font-mono tabular-nums">
                                                {formatCount(Number(row.count))}
                                            </TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell>{row.event}</TableCell>
                                            <TableCell>{row.actor}</TableCell>
                                            <TableCell className="font-mono tabular-nums">
                                                {formatDateTime(
                                                    String(row.occurredAt),
                                                )}
                                            </TableCell>
                                        </>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className="py-8 text-center text-muted-foreground"
                                >
                                    {kind === 'wishes'
                                        ? 'No community wishes match these filters.'
                                        : 'No activity events match these filters.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <nav
                aria-label="Pagination"
                className="flex items-center justify-between gap-3"
            >
                <span className="type-meta">
                    Page{' '}
                    <span className="font-mono tabular-nums">{data.page}</span>
                </span>
                <div className="flex gap-2">
                    {data.previous && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={data.previous}>Previous</Link>
                        </Button>
                    )}
                    {data.next && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={data.next}>Next</Link>
                        </Button>
                    )}
                </div>
            </nav>
        </section>
    );
}
