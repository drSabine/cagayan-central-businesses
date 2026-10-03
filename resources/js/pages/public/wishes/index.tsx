import { Form, Head, router, usePage } from '@inertiajs/react';
import { CircleAlert, Clock, HandHeart, Pencil, Store } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { FigureCell, RuledCell, RuledGrid } from '@/components/ruled-grid';
import { SectionHeading } from '@/components/section-heading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { formatCount, formatDateTime } from '@/lib/format';
import { index, store, update } from '@/routes/public/wishes';
import type { SelectOption, WishPage } from '@/types/data';

type Props = {
    page: WishPage;
};

export default function WishesIndex({ page }: Props) {
    const [editing, setEditing] = useState(false);
    const params = new URLSearchParams(usePage().url.split('?')[1] ?? '');
    const [town, setTown] = useState(
        params.get('town') ?? page.defaultTown ?? '',
    );
    const [type, setType] = useState(params.get('type') ?? '');

    // The tally follows the chosen town and type, and the choice lives in the URL.
    const choose = (next: { town: string; type: string }) => {
        setTown(next.town);
        setType(next.type);

        if (next.town && next.type) {
            router.get(index(), next, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['page'],
            });
        }
    };

    const startEditing = () => {
        if (!page.myWish) {
            return;
        }

        setEditing(true);
        choose({ town: page.myWish.townCode, type: page.myWish.typeCode });
    };

    const coolingDown = !editing && page.nextWishAt !== null;
    const formAction =
        editing && page.myWish ? update.form(page.myWish.id) : store.form();

    return (
        <>
            <Head title="Wishes" />

            <PageHeader
                label="Citizen wishes"
                title="Wish for a business"
                subtitle="Tell the Capitol what kind of business your town is missing. No name, contact, or account is collected."
            />

            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <section
                    aria-labelledby="wish-form"
                    className="flex flex-col gap-4"
                >
                    <SectionHeading
                        id="wish-form"
                        label={editing ? 'Edit your wish' : 'Your wish'}
                        description={`One new wish every ${page.cooldownDays} days. Up to ${page.editsPerWindow} edits every ${page.editWindowDays} days.`}
                    />
                    <Form
                        key={editing ? 'edit' : 'new'}
                        {...formAction}
                        options={{ preserveScroll: true }}
                        onSuccess={() => setEditing(false)}
                        className="border bg-card p-5"
                    >
                        {({ processing, errors }) => (
                            <FieldGroup className="gap-6">
                                <Field data-invalid={!!errors.town}>
                                    <FieldLabel htmlFor="town">Town</FieldLabel>
                                    <OptionSelect
                                        id="town"
                                        name="town"
                                        placeholder="Pick a town"
                                        options={page.towns}
                                        value={town}
                                        invalid={!!errors.town}
                                        onChange={(value) =>
                                            choose({ town: value, type })
                                        }
                                    />
                                    <FieldError>{errors.town}</FieldError>
                                </Field>

                                <Field data-invalid={!!errors.type}>
                                    <FieldLabel htmlFor="type">
                                        Business type
                                    </FieldLabel>
                                    <OptionSelect
                                        id="type"
                                        name="type"
                                        placeholder="Pick a business type"
                                        options={page.types}
                                        value={type}
                                        invalid={!!errors.type}
                                        onChange={(value) =>
                                            choose({ town, type: value })
                                        }
                                    />
                                    <FieldError>{errors.type}</FieldError>
                                </Field>

                                <Field data-invalid={!!errors.reason}>
                                    <FieldLabel htmlFor="reason">
                                        Reason (optional)
                                    </FieldLabel>
                                    <Textarea
                                        id="reason"
                                        name="reason"
                                        rows={3}
                                        maxLength={page.reasonMax}
                                        defaultValue={
                                            editing
                                                ? (page.myWish?.reason ?? '')
                                                : ''
                                        }
                                        placeholder="The nearest one is across the river."
                                        aria-invalid={!!errors.reason}
                                    />
                                    <FieldDescription>
                                        Only the Capitol reads reasons. Do not
                                        write names or phone numbers.
                                    </FieldDescription>
                                    <FieldError>{errors.reason}</FieldError>
                                </Field>

                                {/* Hidden from people and screen readers, so only bots fill it in. */}
                                <div aria-hidden="true" className="sr-only">
                                    <label htmlFor="website">Website</label>
                                    <input
                                        id="website"
                                        name="website"
                                        tabIndex={-1}
                                        autoComplete="off"
                                    />
                                </div>

                                {(errors.wish || errors.website) && (
                                    <Alert variant="destructive">
                                        <CircleAlert aria-hidden="true" />
                                        <AlertDescription>
                                            {errors.wish ?? errors.website}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {coolingDown && page.nextWishAt && (
                                    <p className="flex items-center gap-2 type-meta">
                                        <Clock
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                        You can add another wish on{' '}
                                        {formatDateTime(page.nextWishAt)}.
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        type="submit"
                                        disabled={processing || coolingDown}
                                    >
                                        {processing ? (
                                            <Spinner />
                                        ) : (
                                            <HandHeart aria-hidden="true" />
                                        )}
                                        {editing
                                            ? 'Save changes'
                                            : 'Submit wish'}
                                    </Button>
                                    {editing && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setEditing(false)}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </FieldGroup>
                        )}
                    </Form>
                </section>

                <div className="flex flex-col gap-8">
                    {page.myWish && (
                        <section
                            aria-labelledby="my-wish"
                            className="flex flex-col gap-4"
                        >
                            <SectionHeading
                                id="my-wish"
                                label="Your latest wish"
                                description="Saved on this device only."
                            />
                            <RuledGrid columns={1}>
                                <RuledCell>
                                    <p className="type-meta">
                                        {page.myWish.townName}
                                    </p>
                                    <p className="type-panel-title">
                                        {page.myWish.typeName}
                                    </p>
                                    <p className="type-meta">
                                        {page.myWish.nextEditAt
                                            ? `No edits left. You can edit again on ${formatDateTime(page.myWish.nextEditAt)}.`
                                            : `${page.myWish.editsLeft} of ${page.editsPerWindow} edits left this week`}
                                    </p>
                                    {!editing && page.myWish.editsLeft > 0 && (
                                        <Button
                                            variant="outline"
                                            className="w-fit"
                                            onClick={startEditing}
                                        >
                                            <Pencil aria-hidden="true" />
                                            Edit wish
                                        </Button>
                                    )}
                                </RuledCell>
                            </RuledGrid>
                        </section>
                    )}

                    <section
                        aria-labelledby="tally"
                        className="flex flex-col gap-4"
                    >
                        <SectionHeading
                            id="tally"
                            label="Wishes so far"
                            description="Interest from people who chose to answer, not measured demand"
                        />
                        {page.tally ? (
                            <RuledGrid columns={2}>
                                <FigureCell
                                    icon={HandHeart}
                                    figure={formatCount(page.tally.wishCount)}
                                    label={`Wishes for ${page.tally.typeName}`}
                                    caption={page.tally.townName}
                                />
                                <FigureCell
                                    icon={Store}
                                    figure={
                                        page.tally.registeredCount === null ? (
                                            <span className="type-panel-title text-muted-foreground">
                                                Not available
                                            </span>
                                        ) : (
                                            formatCount(
                                                page.tally.registeredCount,
                                            )
                                        )
                                    }
                                    label="Registered there now"
                                    caption="Registered businesses only"
                                />
                            </RuledGrid>
                        ) : (
                            <RuledGrid columns={1}>
                                <RuledCell>
                                    <p className="type-meta">
                                        Pick a town and a business type to see
                                        how many others wished for it.
                                    </p>
                                </RuledCell>
                            </RuledGrid>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}

type OptionSelectProps = {
    id: string;
    name: string;
    placeholder: string;
    options: SelectOption[];
    value: string;
    invalid: boolean;
    onChange: (value: string) => void;
};

function OptionSelect({
    id,
    name,
    placeholder,
    options,
    value,
    invalid,
    onChange,
}: OptionSelectProps) {
    return (
        <Select name={name} value={value} onValueChange={onChange}>
            <SelectTrigger id={id} className="w-full" aria-invalid={invalid}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
