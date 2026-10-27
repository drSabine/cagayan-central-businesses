import { Head, Link } from '@inertiajs/react';
import { FinanceEntryForm } from '@/components/capitol/finance-entry-form';
import { FinanceFiguresTable } from '@/components/capitol/finance-figures-table';
import { Badge } from '@/components/ui/badge';
import { index } from '@/routes/capitol/finances';
import type { FinanceReport } from '@/types/finance';

export default function FinanceReportPage({
    report,
}: {
    report: FinanceReport;
}) {
    const title = `${report.town.label} ${report.year}`;

    return (
        <>
            <Head title={title} />
            <header className="flex flex-col gap-2">
                <Link
                    href={index()}
                    className="w-fit type-meta underline underline-offset-4"
                >
                    Government Finances
                </Link>
                <h1 className="type-heading">{title}</h1>
            </header>

            <section
                aria-labelledby="documents-heading"
                className="flex flex-col gap-2"
            >
                <h2 id="documents-heading" className="type-item">
                    COA Reports
                </h2>
                {report.documents.length ? (
                    <ul className="flex flex-wrap gap-x-6 gap-y-2 type-body">
                        {report.documents.map((document) => (
                            <li key={document.kind}>
                                {document.available && document.sourceUrl ? (
                                    <a
                                        href={document.sourceUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="underline underline-offset-4"
                                    >
                                        {document.label}
                                    </a>
                                ) : (
                                    <span className="text-muted-foreground">
                                        {document.label} not published
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="type-body text-muted-foreground">
                        No COA report on file for this year.
                    </p>
                )}
            </section>

            {report.issues.length > 0 && (
                <section
                    aria-labelledby="checks-heading"
                    className="flex flex-col gap-2"
                >
                    <h2 id="checks-heading" className="type-item">
                        Checks
                    </h2>
                    <ul className="flex flex-col gap-2 rounded-sm border bg-card p-4">
                        {report.issues.map((issue, i) => (
                            <li
                                key={i}
                                className="flex flex-wrap items-start gap-2 type-body"
                            >
                                <Badge
                                    variant={
                                        issue.severity === 'error'
                                            ? 'destructive'
                                            : 'outline'
                                    }
                                >
                                    {issue.severity === 'error'
                                        ? 'Error'
                                        : 'Warning'}
                                </Badge>
                                <span className="min-w-0 flex-1 break-words">
                                    {issue.message}
                                    {issue.location && (
                                        <span className="ml-2 font-mono type-meta">
                                            {issue.location}
                                        </span>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <section
                aria-labelledby="figures-heading"
                className="flex flex-col gap-2"
            >
                <h2 id="figures-heading" className="type-item">
                    Figures
                </h2>
                <FinanceFiguresTable report={report} />
            </section>

            <FinanceEntryForm report={report} />
        </>
    );
}
