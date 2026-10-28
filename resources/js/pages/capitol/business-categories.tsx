import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { WorkspaceFilters } from '@/components/capitol/workspace-filters';
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
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { index } from '@/routes/capitol/categories';
import { store as storeTag } from '@/routes/capitol/categories/tags';
import { update as updateTags } from '@/routes/capitol/categories/types/tags';
import type {
    BusinessCategories,
    BusinessCategoryRow,
} from '@/types/workspace';

function TagForm({
    type,
    categories,
    onSaved,
}: {
    type: BusinessCategoryRow;
    categories: BusinessCategories;
    onSaved: () => void;
}) {
    const form = useForm({ tags: type.tags });
    return (
        <form
            className="flex flex-col gap-4 px-4"
            onSubmit={(event) => {
                event.preventDefault();
                form.put(updateTags(type.code).url, {
                    preserveScroll: true,
                    onSuccess: onSaved,
                });
            }}
        >
            <fieldset className="flex flex-col gap-3">
                <legend className="type-label">Focus Tags</legend>
                {categories.tags.map((tag) => (
                    <label
                        key={tag.value}
                        className="flex items-center gap-2 type-body"
                    >
                        <input
                            type="checkbox"
                            className="size-4 accent-primary"
                            checked={form.data.tags.includes(tag.value)}
                            onChange={(event) =>
                                form.setData(
                                    'tags',
                                    event.target.checked
                                        ? [...form.data.tags, tag.value]
                                        : form.data.tags.filter(
                                              (code) => code !== tag.value,
                                          ),
                                )
                            }
                        />
                        {tag.label}
                    </label>
                ))}
            </fieldset>
            <FieldError>{form.errors.tags}</FieldError>
            <Button type="submit" disabled={form.processing} className="w-fit">
                {form.processing && <Spinner />}Save Focus Tags
            </Button>
        </form>
    );
}

function NewTagForm({
    maxLength,
    onSaved,
}: {
    maxLength: number;
    onSaved: () => void;
}) {
    const form = useForm({ name: '' });
    return (
        <form
            className="flex flex-col gap-4 px-4"
            onSubmit={(event) => {
                event.preventDefault();
                form.post(storeTag().url, {
                    preserveScroll: true,
                    onSuccess: onSaved,
                });
            }}
        >
            <Field data-invalid={!!form.errors.name}>
                <FieldLabel htmlFor="focus-tag-name" required>
                    Name
                </FieldLabel>
                <Input
                    id="focus-tag-name"
                    required
                    maxLength={maxLength}
                    value={form.data.name}
                    aria-invalid={!!form.errors.name}
                    onChange={(event) =>
                        form.setData('name', event.target.value)
                    }
                />
                <FieldError>{form.errors.name}</FieldError>
            </Field>
            <Button type="submit" disabled={form.processing} className="w-fit">
                {form.processing && <Spinner />}Add Focus Tag
            </Button>
        </form>
    );
}

export default function BusinessCategoriesPage({
    categories,
}: {
    categories: BusinessCategories;
}) {
    const [editing, setEditing] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const names = Object.fromEntries(
        categories.tags.map((tag) => [tag.value, tag.label]),
    );
    const rows = categories.tag
        ? categories.types.filter((type) =>
              type.tags.includes(categories.tag as string),
          )
        : categories.types;
    const editingType = categories.types.find((type) => type.code === editing);

    // Every Business Type is loaded, so the tag filter only updates local history.
    const chooseTag = (value: string) => {
        const tag = value === 'all' ? null : value;
        if (tag === categories.tag) return;
        router.push({
            url: index({ query: tag ? { tag } : {} }).url,
            preserveState: true,
            preserveScroll: true,
            props: (props) => ({
                ...props,
                categories: { ...categories, tag },
            }),
        });
    };

    return (
        <>
            <Head title="Business Categories" />
            <header>
                <h1 className="type-heading">Business Categories</h1>
            </header>
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
                <div className="min-w-0 overflow-x-auto rounded-sm border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Business Type</TableHead>
                                <TableHead>Industry</TableHead>
                                <TableHead>Focus Tags</TableHead>
                                <TableHead className="w-28">
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length ? (
                                rows.map((type) => (
                                    <TableRow key={type.code}>
                                        <TableCell>{type.name}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {type.industry}
                                        </TableCell>
                                        <TableCell>
                                            {type.tags
                                                .map((code) => names[code])
                                                .join(', ')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                aria-label={`Edit Focus Tags for ${type.name}`}
                                                onClick={() =>
                                                    setEditing(type.code)
                                                }
                                            >
                                                Edit Tags
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No Business Types have this Focus Tag.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <WorkspaceFilters>
                    <label id="focus-tag-label" className="type-label">
                        Focus Tag
                    </label>
                    <Select
                        value={categories.tag ?? 'all'}
                        onValueChange={chooseTag}
                    >
                        <SelectTrigger
                            aria-labelledby="focus-tag-label"
                            className="w-full"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {categories.tags.map((tag) => (
                                <SelectItem key={tag.value} value={tag.value}>
                                    {tag.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Sheet open={adding} onOpenChange={setAdding}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="w-full">
                                Add a Focus Tag
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
                            <SheetHeader>
                                <SheetTitle>Add a Focus Tag</SheetTitle>
                            </SheetHeader>
                            <NewTagForm
                                maxLength={categories.tagNameMax}
                                onSaved={() => setAdding(false)}
                            />
                        </SheetContent>
                    </Sheet>
                </WorkspaceFilters>
            </div>
            <Sheet
                open={editingType !== undefined}
                onOpenChange={(open) => !open && setEditing(null)}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>{editingType?.name}</SheetTitle>
                    </SheetHeader>
                    {editingType && (
                        <TagForm
                            key={editingType.code}
                            type={editingType}
                            categories={categories}
                            onSaved={() => setEditing(null)}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}
