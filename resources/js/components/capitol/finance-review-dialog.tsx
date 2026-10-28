import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { store as review } from '@/routes/capitol/finances/reviews';
import type { FinanceReport } from '@/types/finance';

export function FinanceReviewDialog({
    report,
    fiscalYear,
    decision,
    ids,
    onClose,
    onReturnFocus,
    onComplete,
}: {
    report: FinanceReport;
    fiscalYear: number;
    decision: 'verified' | 'rejected';
    ids: string[];
    onClose: () => void;
    onReturnFocus: () => void;
    onComplete: () => void;
}) {
    const form = useForm({ decision, figures: ids, note: '' });
    const reject = decision === 'rejected';
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !form.processing) onClose();
            }}
        >
            <DialogContent
                onCloseAutoFocus={(event) => {
                    event.preventDefault();
                    onReturnFocus();
                }}
            >
                <DialogHeader>
                    <DialogTitle>
                        {reject ? 'Reject Figures' : 'Sign Off Figures'}
                    </DialogTitle>
                    <DialogDescription>
                        {ids.length} selected for {report.town.label}, fiscal
                        year {fiscalYear}.
                    </DialogDescription>
                </DialogHeader>
                <form
                    className="flex flex-col gap-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post(
                            review({
                                town: report.town.value,
                                year: report.year,
                            }).url,
                            { preserveScroll: true, onSuccess: onComplete },
                        );
                    }}
                >
                    <Field data-invalid={!!form.errors.note}>
                        <FieldLabel htmlFor="review-note" required={reject}>
                            {reject ? 'Reason for Rejection' : 'Review Note'}
                        </FieldLabel>
                        <Textarea
                            id="review-note"
                            required={reject}
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
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={form.processing}
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant={reject ? 'destructive' : 'default'}
                            disabled={form.processing}
                        >
                            {form.processing && <Spinner />}
                            {reject ? 'Reject Selected' : 'Sign Off Selected'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
