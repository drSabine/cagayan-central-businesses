import { Form, Head, usePage } from '@inertiajs/react';
import { Landmark, LogIn } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

/*
 * The admin login. Nothing public links here (decisions.md, D20). The form posts
 * to the URL it was served from instead of a Wayfinder import, so the secret
 * path never appears in the JavaScript bundle (frontend.md, "Links and auth").
 */
export default function Login() {
    const { url, props } = usePage();

    return (
        <>
            <Head title="Log in">
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
                <div className="flex w-full max-w-md flex-col gap-6">
                    <div className="flex items-center gap-2 type-item">
                        <Landmark className="size-5" aria-hidden="true" />
                        {props.name}
                    </div>
                    <PageHeader
                        label="Capitol"
                        title="Administrator log in"
                        subtitle="For Provincial Government of Cagayan staff."
                    />
                    <Form
                        action={url}
                        method="post"
                        resetOnSuccess={['password']}
                        resetOnError={['password']}
                        className="border bg-card p-5"
                    >
                        {({ processing, errors }) => (
                            <FieldGroup className="gap-6">
                                <Field data-invalid={!!errors.email}>
                                    <FieldLabel htmlFor="email">
                                        Email address
                                    </FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        autoComplete="username"
                                        aria-invalid={!!errors.email}
                                    />
                                    <FieldError>{errors.email}</FieldError>
                                </Field>
                                <Field data-invalid={!!errors.password}>
                                    <FieldLabel htmlFor="password">
                                        Password
                                    </FieldLabel>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        required
                                        autoComplete="current-password"
                                        aria-invalid={!!errors.password}
                                    />
                                    <FieldError>{errors.password}</FieldError>
                                </Field>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <Spinner />
                                    ) : (
                                        <LogIn aria-hidden="true" />
                                    )}
                                    Log in
                                </Button>
                            </FieldGroup>
                        )}
                    </Form>
                </div>
            </main>
        </>
    );
}
