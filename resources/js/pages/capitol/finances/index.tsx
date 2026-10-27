import { Head, Link, router } from '@inertiajs/react';
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
import { formatCount } from '@/lib/format';
import { index, show } from '@/routes/capitol/finances';
import type { FinanceReviewList } from '@/types/finance';

const STATUS_OPTIONS = [{ value: 'pending', label: 'Pending Review' }];

export default function Finances({ list }: { list: FinanceReviewList }) {
    const choose = (field: string, value: string) => {
        const filters = {
            ...list.filters,
            [field]: value === 'all' ? undefined : value,
        };
        router.get(
            index({ query: filters }).url,
            {},
            { preserveState: true, preserveScroll: true },
        );
    };
    const filters = [
        { key: 'town', label: 'Town or City', options: list.towns },
        { key: 'year', label: 'Report Year', options: list.years },
        { key: 'status', label: 'Status', options: STATUS_OPTIONS },
    ] as const;

    return (
        <>
            <Head title="Government Finances" />
            <header>
                <h1 className="type-heading">Government Finances</h1>
            </header>
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
                                value={list.filters[key] ?? 'all'}
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
                                <TableHead>Town or City</TableHead>
                                <TableHead>Report Year</TableHead>
                                <TableHead className="text-right">
                                    Pending Review
                                </TableHead>
                                <TableHead className="text-right">
                                    Verified
                                </TableHead>
                                <TableHead className="text-right">
                                    Rejected
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {list.rows.length ? (
                                list.rows.map((row) => (
                                    <TableRow key={row.townCode + row.year}>
                                        <TableCell>
                                            <Link
                                                href={show({
                                                    town: row.townCode,
                                                    year: row.year,
                                                })}
                                                className="underline underline-offset-4"
                                            >
                                                {row.town}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="font-mono tabular-nums">
                                            {row.year}
                                        </TableCell>
                                        <TableCell className="text-right font-mono tabular-nums">
                                            {formatCount(row.pending)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono tabular-nums">
                                            {formatCount(row.verified)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono tabular-nums">
                                            {formatCount(row.rejected)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No finance reports match these filters.
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
                        <span className="font-mono tabular-nums">
                            {list.page}
                        </span>
                    </span>
                    <div className="flex gap-2">
                        {list.previous && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={list.previous}>Previous</Link>
                            </Button>
                        )}
                        {list.next && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={list.next}>Next</Link>
                            </Button>
                        )}
                    </div>
                </nav>
            </section>
        </>
    );
}
