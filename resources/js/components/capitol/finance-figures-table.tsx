import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { formatExactPesos } from '@/lib/performance-format';
import { store as review } from '@/routes/capitol/finances/reviews';
import type { FinanceFigureRow, FinanceReport } from '@/types/finance';

const STATUS: Record<FinanceFigureRow['status'], string> = {
    pending: 'Pending Review',
    verified: 'Verified',
    rejected: 'Rejected',
    superseded: 'Superseded',
};

const BASIS: Record<FinanceFigureRow['basis'], string> = {
    actual: 'Actual',
    budget_final: 'Final Budget',
};

export function FinanceFiguresTable({ report }: { report: FinanceReport }) {
    const [selected, setSelected] = useState<string[]>([]);
    const form = useForm({
        decision: 'verified',
        figures: [] as string[],
        note: '',
    });
    const reviewable = report.figures.filter(
        (figure) => figure.status === 'pending' && !figure.enteredByYou,
    );
    const toggle = (id: string, on: boolean) =>
        setSelected((ids) =>
            on ? [...ids, id] : ids.filter((value) => value !== id),
        );
    const submit = (decision: 'verified' | 'rejected') => {
        form.transform((data) => ({ ...data, decision, figures: selected }));
        form.post(review({ town: report.town.value, year: report.year }).url, {
            preserveScroll: true,
            onSuccess: () => {
                setSelected([]);
                form.reset('note');
            },
        });
    };

    if (!report.figures.length) {
        return (
            <p className="rounded-sm border bg-card p-4 type-body text-muted-foreground">
                No figures for this report yet.
            </p>
        );
    }

    return (
        <section className="flex min-w-0 flex-col gap-4">
            <div className="overflow-x-auto rounded-sm border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {report.canReview && (
                                <TableHead className="w-10">
                                    <input
                                        type="checkbox"
                                        aria-label="Select every figure you can sign off"
                                        className="size-4 accent-primary"
                                        disabled={!reviewable.length}
                                        checked={
                                            reviewable.length > 0 &&
                                            selected.length ===
                                                reviewable.length
                                        }
                                        onChange={(event) =>
                                            setSelected(
                                                event.target.checked
                                                    ? reviewable.map(
                                                          (figure) => figure.id,
                                                      )
                                                    : [],
                                            )
                                        }
                                    />
                                </TableHead>
                            )}
                            <TableHead>Line</TableHead>
                            <TableHead>Fiscal Year</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {report.figures.map((figure) => (
                            <TableRow key={figure.id}>
                                {report.canReview && (
                                    <TableCell>
                                        {reviewable.includes(figure) && (
                                            <input
                                                type="checkbox"
                                                aria-label={`Select ${figure.label} ${figure.fiscalYear}`}
                                                className="size-4 accent-primary"
                                                checked={selected.includes(
                                                    figure.id,
                                                )}
                                                onChange={(event) =>
                                                    toggle(
                                                        figure.id,
                                                        event.target.checked,
                                                    )
                                                }
                                            />
                                        )}
                                    </TableCell>
                                )}
                                <TableCell>
                                    <span className="type-body">
                                        {figure.label}
                                    </span>
                                    {figure.basis !== 'actual' && (
                                        <span className="block type-meta">
                                            {BASIS[figure.basis]}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="font-mono tabular-nums">
                                    {figure.fiscalYear}
                                </TableCell>
                                <TableCell className="text-right font-mono tabular-nums">
                                    {formatExactPesos(figure.value)}
                                </TableCell>
                                <TableCell>
                                    <span className="type-body">
                                        {figure.source}
                                    </span>
                                    {figure.location && (
                                        <span className="block font-mono type-meta">
                                            {figure.location}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            figure.status === 'pending'
                                                ? 'outline'
                                                : figure.status === 'rejected'
                                                  ? 'destructive'
                                                  : 'secondary'
                                        }
                                    >
                                        {STATUS[figure.status]}
                                    </Badge>
                                    {figure.enteredByYou &&
                                        figure.status === 'pending' && (
                                            <span className="block type-meta">
                                                Entered by you
                                            </span>
                                        )}
                                    {figure.note && (
                                        <span className="block type-meta">
                                            {figure.note}
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {report.canReview && reviewable.length > 0 && (
                <div className="flex flex-col gap-3 rounded-sm border bg-card p-4">
                    <Field data-invalid={!!form.errors.note}>
                        <FieldLabel htmlFor="review-note">
                            Reason for Rejecting
                        </FieldLabel>
                        <Textarea
                            id="review-note"
                            value={form.data.note}
                            maxLength={report.limits.noteMax}
                            aria-invalid={!!form.errors.note}
                            aria-describedby="review-note-error"
                            onChange={(event) =>
                                form.setData('note', event.target.value)
                            }
                        />
                        <FieldError id="review-note-error">
                            {form.errors.note ?? form.errors.figures}
                        </FieldError>
                    </Field>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            disabled={!selected.length || form.processing}
                            onClick={() => submit('verified')}
                        >
                            {form.processing && <Spinner />}Sign Off Selected
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={!selected.length || form.processing}
                            onClick={() => submit('rejected')}
                        >
                            Reject Selected
                        </Button>
                        <span className="type-meta">
                            <span className="font-mono tabular-nums">
                                {selected.length}
                            </span>{' '}
                            selected
                        </span>
                    </div>
                </div>
            )}
        </section>
    );
}
