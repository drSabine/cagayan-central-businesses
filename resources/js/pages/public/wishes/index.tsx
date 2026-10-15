import { Form, Head, router, usePage } from '@inertiajs/react';
import { lazy, Suspense, useState } from 'react';
import { DefinitionList } from '@/components/definition-list';
import { FigureRow } from '@/components/figure-row';
import { PageHeader } from '@/components/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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

const ProvinceMap = lazy(() => import('@/components/province-map'));

type Props = {
    page: WishPage;
};

export default function SuggestionsIndex({ page }: Props) {
    const params = new URLSearchParams(usePage().url.split('?')[1] ?? '');
    const [editing, setEditing] = useState(false);
    const [town, setTown] = useState(
        params.get('town') ?? page.defaultTown ?? '',
    );
    const [type, setType] = useState(params.get('type') ?? '');
    // Kept from the first render. Partial reloads for the count issue a fresh
    // token, which would make a quick submit look like a bot.
    const [formToken] = useState(page.formToken);

    // The count follows the chosen town and type, and the choice lives in the URL.
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

    const wish = page.myWish;
    // During the cooldown the visitor sees their suggestion, not a form they cannot send.
    const showForm = editing || page.nextWishAt === null;
    const formAction = editing && wish ? update.form(wish.id) : store.form();

    return (
        <>
            <Head title="Suggestions" />

            <PageHeader
                title="Suggest a business for your town"
                subtitle="No account, name, or contact is collected."
            />

            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
                <div className="flex flex-col gap-6">
                    {wish && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Your suggestion</CardTitle>
                                <CardDescription>
                                    {wish.typeName} in {wish.townName}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DefinitionList
                                    items={[
                                        {
                                            term: 'Next new suggestion',
                                            description: page.nextWishAt
                                                ? formatDateTime(
                                                      page.nextWishAt,
                                                  )
                                                : 'You can send one now',
                                        },
                                        {
                                            term: 'Edits left',
                                            description: wish.nextEditAt
                                                ? `None until ${formatDateTime(wish.nextEditAt)}`
                                                : `${wish.editsLeft} of ${page.editsPerWindow} in ${page.editWindowDays} days`,
                                        },
                                    ]}
                                />
                            </CardContent>
                            {!editing && wish.editsLeft > 0 && (
                                <CardFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setEditing(true);
                                            choose({
                                                town: wish.townCode,
                                                type: wish.typeCode,
                                            });
                                        }}
                                    >
                                        Edit suggestion
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    )}

                    {showForm && (
                        <Card>
                            {editing && (
                                <CardHeader>
                                    <CardTitle>Edit your suggestion</CardTitle>
                                </CardHeader>
                            )}
                            <CardContent>
                                <Form
                                    key={editing ? 'edit' : 'new'}
                                    {...formAction}
                                    options={{ preserveScroll: true }}
                                    onSuccess={() => setEditing(false)}
                                >
                                    {({ processing, errors }) => {
                                        const problem =
                                            errors.wish ??
                                            errors.form_token ??
                                            errors.website;

                                        return (
                                            <FieldGroup className="gap-6">
                                                <Field
                                                    data-invalid={!!errors.town}
                                                >
                                                    <FieldLabel htmlFor="town">
                                                        Town
                                                    </FieldLabel>
                                                    <OptionSelect
                                                        id="town"
                                                        placeholder="Choose a town"
                                                        options={page.towns}
                                                        value={town}
                                                        invalid={!!errors.town}
                                                        onChange={(value) =>
                                                            choose({
                                                                town: value,
                                                                type,
                                                            })
                                                        }
                                                    />
                                                    <FieldError>
                                                        {errors.town}
                                                    </FieldError>
                                                </Field>

                                                <Field
                                                    data-invalid={!!errors.type}
                                                >
                                                    <FieldLabel htmlFor="type">
                                                        Business type
                                                    </FieldLabel>
                                                    <OptionSelect
                                                        id="type"
                                                        placeholder="Choose a business type"
                                                        options={page.types}
                                                        value={type}
                                                        invalid={!!errors.type}
                                                        onChange={(value) =>
                                                            choose({
                                                                town,
                                                                type: value,
                                                            })
                                                        }
                                                    />
                                                    <FieldError>
                                                        {errors.type}
                                                    </FieldError>
                                                </Field>

                                                <Field
                                                    data-invalid={
                                                        !!errors.reason
                                                    }
                                                >
                                                    <FieldLabel htmlFor="reason">
                                                        Reason (optional)
                                                    </FieldLabel>
                                                    <Textarea
                                                        id="reason"
                                                        name="reason"
                                                        rows={3}
                                                        maxLength={
                                                            page.reasonMax
                                                        }
                                                        defaultValue={
                                                            editing
                                                                ? (wish?.reason ??
                                                                  '')
                                                                : ''
                                                        }
                                                        placeholder="The nearest one is across the river."
                                                        aria-invalid={
                                                            !!errors.reason
                                                        }
                                                    />
                                                    <FieldDescription>
                                                        Only Capitol staff read
                                                        this. No names, phone
                                                        numbers, or links.
                                                    </FieldDescription>
                                                    <FieldError>
                                                        {errors.reason}
                                                    </FieldError>
                                                </Field>

                                                <input
                                                    type="hidden"
                                                    name="form_token"
                                                    value={formToken}
                                                />
                                                {/* Hidden from people and screen readers, so only bots fill it in. */}
                                                <div
                                                    aria-hidden="true"
                                                    className="sr-only"
                                                >
                                                    <label htmlFor="website">
                                                        Website
                                                    </label>
                                                    <input
                                                        id="website"
                                                        name="website"
                                                        tabIndex={-1}
                                                        autoComplete="off"
                                                    />
                                                </div>

                                                {problem && (
                                                    <Alert variant="destructive">
                                                        <AlertDescription>
                                                            {problem}
                                                        </AlertDescription>
                                                    </Alert>
                                                )}

                                                <div className="flex flex-wrap gap-3">
                                                    <Button
                                                        type="submit"
                                                        disabled={processing}
                                                    >
                                                        {processing && (
                                                            <Spinner />
                                                        )}
                                                        {editing
                                                            ? 'Save changes'
                                                            : 'Send suggestion'}
                                                    </Button>
                                                    {editing && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() =>
                                                                setEditing(
                                                                    false,
                                                                )
                                                            }
                                                        >
                                                            Cancel
                                                        </Button>
                                                    )}
                                                </div>
                                            </FieldGroup>
                                        );
                                    }}
                                </Form>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="flex flex-col gap-6 lg:sticky lg:top-24">
                    <div className="hidden h-80 text-primary lg:block">
                        <Suspense fallback={null}>
                            <ProvinceMap
                                shapes="province"
                                label="Map of the towns of Cagayan with the chosen town filled"
                                highlight={town ? [town] : []}
                                onSelect={
                                    showForm
                                        ? (code) => choose({ town: code, type })
                                        : undefined
                                }
                                className="size-full"
                            />
                        </Suspense>
                    </div>

                    {(page.tally || showForm) && (
                        <section
                            aria-labelledby="count-heading"
                            className="flex flex-col gap-4"
                        >
                            <h2 id="count-heading" className="type-heading">
                                Suggestions so far
                            </h2>
                            {page.tally ? (
                                <>
                                    <FigureRow
                                        figures={[
                                            {
                                                value: formatCount(
                                                    page.tally.wishCount,
                                                ),
                                                label: 'Suggestions',
                                            },
                                            {
                                                value:
                                                    page.tally
                                                        .registeredCount ===
                                                    null
                                                        ? 'Not available'
                                                        : formatCount(
                                                              page.tally
                                                                  .registeredCount,
                                                          ),
                                                label: 'Registered now',
                                            },
                                        ]}
                                    />
                                    <p className="type-meta">
                                        {page.tally.typeName} in{' '}
                                        {page.tally.townName}. Interest from
                                        people who chose to answer, not measured
                                        demand
                                    </p>
                                </>
                            ) : (
                                <p className="type-meta">
                                    Choose a town and business type to see the
                                    count.
                                </p>
                            )}
                        </section>
                    )}
                </div>
            </div>
        </>
    );
}

type OptionSelectProps = {
    id: string;
    placeholder: string;
    options: SelectOption[];
    value: string;
    invalid: boolean;
    onChange: (value: string) => void;
};

function OptionSelect({
    id,
    placeholder,
    options,
    value,
    invalid,
    onChange,
}: OptionSelectProps) {
    return (
        <Select name={id} value={value} onValueChange={onChange}>
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
