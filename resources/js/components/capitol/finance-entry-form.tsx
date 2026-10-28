import { useForm } from '@inertiajs/react';
import { FieldHelp } from '@/components/capitol/field-help';
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
import { store } from '@/routes/capitol/finances/figures';
import type { FinanceReport } from '@/types/finance';

const OTHER_SOURCE = 'other';

export function FinanceEntryForm({
    report,
    fiscalYear,
    onSaved,
}: {
    report: FinanceReport;
    fiscalYear: number;
    onSaved: () => void;
}) {
    const reports = report.documents.filter((document) => document.available);
    const form = useForm({
        fiscal_year: String(fiscalYear),
        line_code: '',
        basis: 'actual',
        value: '',
        document_kind: reports[0]?.kind ?? OTHER_SOURCE,
        source_url: '',
    });
    const otherSource = form.data.document_kind === OTHER_SOURCE;
    const errors = Object.entries(form.errors);
    const fields = [
        {
            key: 'fiscal_year',
            label: 'Fiscal Year',
            help: 'The year this amount describes. It may be earlier than the report year.',
        },
        {
            key: 'line_code',
            label: 'Item',
            help: 'Choose the financial measure that matches the figure in the source report.',
        },
        {
            key: 'basis',
            label: 'Basis',
            help: 'Actual is the reported result. Final Budget is the approved budget and is available for development spending.',
        },
        {
            key: 'value',
            label: 'Amount in PHP (₱)',
            help: 'Enter the exact amount in Philippine pesos without commas, using up to two decimal places.',
        },
        {
            key: 'document_kind',
            label: 'Source Report',
            help: 'Select the COA document containing this figure. Choose Another COA Report to provide an official COA link.',
        },
        ...(otherSource
            ? [
                  {
                      key: 'source_url',
                      label: 'COA Link',
                      help: 'Use an HTTPS link on coa.gov.ph or one of its subdomains to the report containing this figure.',
                  },
              ]
            : []),
    ] as const;
    const options = {
        line_code: report.lines,
        basis: [
            { value: 'actual', label: 'Actual' },
            ...(report.lines
                .find((line) => line.value === form.data.line_code)
                ?.bases.includes('budget_final')
                ? [{ value: 'budget_final', label: 'Final Budget' }]
                : []),
        ],
        document_kind: [
            ...reports.map((document) => ({
                value: document.kind,
                label: `${document.label} ${report.year}`,
            })),
            { value: OTHER_SOURCE, label: 'Another COA Report' },
        ],
    };
    return (
        <form
            className="flex flex-col gap-4 px-4 pb-4"
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
                        onSuccess: () => {
                            form.reset('value');
                            onSaved();
                        },
                    },
                );
            }}
        >
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
            {fields.map(({ key, label, help }) => {
                const field = key as keyof typeof form.data;
                const choices =
                    key in options
                        ? options[key as keyof typeof options]
                        : null;
                return (
                    <Field key={key} data-invalid={!!form.errors[field]}>
                        <div className="flex items-center justify-between gap-2">
                            <FieldLabel
                                required
                                htmlFor={key}
                                id={key + '-label'}
                            >
                                {label}
                            </FieldLabel>
                            <FieldHelp label={label}>{help}</FieldHelp>
                        </div>
                        {choices ? (
                            <Select
                                required
                                value={form.data[field]}
                                onValueChange={(value) => {
                                    if (field === 'line_code')
                                        form.setData({
                                            ...form.data,
                                            line_code: value,
                                            basis: report.lines
                                                .find(
                                                    (line) =>
                                                        line.value === value,
                                                )
                                                ?.bases.includes(
                                                    form.data.basis as
                                                        | 'actual'
                                                        | 'budget_final',
                                                )
                                                ? form.data.basis
                                                : 'actual',
                                        });
                                    else form.setData(field, value);
                                }}
                            >
                                <SelectTrigger
                                    id={key}
                                    aria-labelledby={key + '-label'}
                                    aria-invalid={!!form.errors[field]}
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Choose" />
                                </SelectTrigger>
                                <SelectContent>
                                    {choices.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input
                                className={
                                    key === 'value' || key === 'fiscal_year'
                                        ? 'font-mono tabular-nums'
                                        : undefined
                                }
                                id={key}
                                required
                                type={
                                    key === 'fiscal_year'
                                        ? 'number'
                                        : key === 'source_url'
                                          ? 'url'
                                          : 'text'
                                }
                                inputMode={
                                    key === 'fiscal_year'
                                        ? 'numeric'
                                        : key === 'value'
                                          ? 'decimal'
                                          : 'url'
                                }
                                min={
                                    key === 'fiscal_year'
                                        ? report.limits.firstYear
                                        : undefined
                                }
                                max={
                                    key === 'fiscal_year'
                                        ? report.limits.lastYear
                                        : undefined
                                }
                                step={key === 'fiscal_year' ? 1 : undefined}
                                maxLength={
                                    key === 'value'
                                        ? report.limits.valueMax.length
                                        : key === 'source_url'
                                          ? report.limits.sourceUrlMax
                                          : undefined
                                }
                                pattern={
                                    key === 'value'
                                        ? '[0-9]+([.][0-9]{1,2})?'
                                        : undefined
                                }
                                value={form.data[field]}
                                aria-invalid={!!form.errors[field]}
                                onChange={(event) =>
                                    form.setData(field, event.target.value)
                                }
                            />
                        )}
                        <FieldError>{form.errors[field]}</FieldError>
                    </Field>
                );
            })}
            <Button type="submit" disabled={form.processing} className="w-fit">
                {form.processing && <Spinner />}Save Figure
            </Button>
        </form>
    );
}
