import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { store } from '@/routes/capitol/finances/figures';
import type { FinanceReport } from '@/types/finance';

const OTHER_SOURCE = 'other';

export function FinanceEntryForm({ report }: { report: FinanceReport }) {
    const reports = report.documents.filter((document) => document.available);
    const form = useForm({
        line_code: report.lines[0]?.value ?? '',
        fiscal_year: String(report.year),
        basis: 'actual',
        value: '',
        document_kind: reports[0]?.kind ?? OTHER_SOURCE,
        source_url: '',
        note: '',
    });
    const errors = Object.entries(form.errors);
    const otherSource = form.data.document_kind === OTHER_SOURCE;

    return (
        <form
            className="flex max-w-measure flex-col gap-4 rounded-sm border bg-card p-4"
            onSubmit={(event) => {
                event.preventDefault();
                form.transform((data) => ({
                    ...data,
                    document_kind: otherSource ? null : data.document_kind,
                    source_url: otherSource ? data.source_url : null,
                }));
                form.post(
                    store({ town: report.town.value, year: report.year }).url,
                    {
                        preserveScroll: true,
                        onSuccess: () => form.reset('value', 'note'),
                    },
                );
            }}
        >
            <h2 className="type-item">Enter a Figure</h2>
            {errors.length > 0 && (
                <div
                    role="alert"
                    className="rounded-sm border border-destructive p-3 type-body"
                >
                    <p>Check the following fields.</p>
                    <ul className="mt-2 list-inside list-disc">
                        {errors.map(([key, error]) => (
                            <li key={key}>
                                <a href={'#' + key} className="underline">
                                    {error}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!form.errors.line_code}>
                    <FieldLabel id="line_code-label">Line</FieldLabel>
                    <Select
                        value={form.data.line_code}
                        onValueChange={(value) =>
                            form.setData('line_code', value)
                        }
                    >
                        <SelectTrigger
                            id="line_code"
                            aria-labelledby="line_code-label"
                            className="w-full"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {report.lines.map((line) => (
                                <SelectItem key={line.value} value={line.value}>
                                    {line.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FieldError>{form.errors.line_code}</FieldError>
                </Field>
                <Field data-invalid={!!form.errors.basis}>
                    <FieldLabel id="basis-label">Basis</FieldLabel>
                    <Select
                        value={form.data.basis}
                        onValueChange={(value) => form.setData('basis', value)}
                    >
                        <SelectTrigger
                            id="basis"
                            aria-labelledby="basis-label"
                            className="w-full"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="actual">Actual</SelectItem>
                            <SelectItem value="budget_final">
                                Final Budget
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <FieldError>{form.errors.basis}</FieldError>
                </Field>
                <Field data-invalid={!!form.errors.fiscal_year}>
                    <FieldLabel htmlFor="fiscal_year">Fiscal Year</FieldLabel>
                    <Input
                        id="fiscal_year"
                        type="number"
                        inputMode="numeric"
                        min={report.limits.firstYear}
                        max={report.limits.lastYear}
                        step={1}
                        required
                        value={form.data.fiscal_year}
                        aria-invalid={!!form.errors.fiscal_year}
                        onChange={(event) =>
                            form.setData('fiscal_year', event.target.value)
                        }
                    />
                    <FieldError>{form.errors.fiscal_year}</FieldError>
                </Field>
                <Field data-invalid={!!form.errors.value}>
                    <FieldLabel htmlFor="value">Amount in Pesos</FieldLabel>
                    <Input
                        id="value"
                        inputMode="decimal"
                        className="font-mono tabular-nums"
                        required
                        value={form.data.value}
                        aria-invalid={!!form.errors.value}
                        onChange={(event) =>
                            form.setData('value', event.target.value)
                        }
                    />
                    <FieldError>{form.errors.value}</FieldError>
                </Field>
                <Field data-invalid={!!form.errors.document_kind}>
                    <FieldLabel id="document_kind-label">
                        Report Read
                    </FieldLabel>
                    <Select
                        value={form.data.document_kind}
                        onValueChange={(value) =>
                            form.setData('document_kind', value)
                        }
                    >
                        <SelectTrigger
                            id="document_kind"
                            aria-labelledby="document_kind-label"
                            className="w-full"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {reports.map((document) => (
                                <SelectItem
                                    key={document.kind}
                                    value={document.kind}
                                >
                                    {document.label} {report.year}
                                </SelectItem>
                            ))}
                            <SelectItem value={OTHER_SOURCE}>
                                Another COA Report
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <FieldError>{form.errors.document_kind}</FieldError>
                </Field>
                {otherSource && (
                    <Field data-invalid={!!form.errors.source_url}>
                        <FieldLabel htmlFor="source_url">COA Link</FieldLabel>
                        <Input
                            id="source_url"
                            type="url"
                            required
                            value={form.data.source_url}
                            aria-invalid={!!form.errors.source_url}
                            onChange={(event) =>
                                form.setData('source_url', event.target.value)
                            }
                        />
                        <FieldError>{form.errors.source_url}</FieldError>
                    </Field>
                )}
            </div>
            <Field data-invalid={!!form.errors.note}>
                <FieldLabel htmlFor="note">Note</FieldLabel>
                <Textarea
                    id="note"
                    required
                    maxLength={report.limits.noteMax}
                    value={form.data.note}
                    aria-invalid={!!form.errors.note}
                    onChange={(event) =>
                        form.setData('note', event.target.value)
                    }
                />
                <FieldError>{form.errors.note}</FieldError>
            </Field>
            <Button type="submit" disabled={form.processing} className="w-fit">
                {form.processing && <Spinner />}Save Figure
            </Button>
        </form>
    );
}
