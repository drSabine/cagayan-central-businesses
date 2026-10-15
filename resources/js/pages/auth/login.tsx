import { Form, Head, usePage } from '@inertiajs/react';
import { Landmark } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

const ProvinceMap = lazy(() => import('@/components/province-map'));

// Posts to its own URL, not a Wayfinder import, so the secret path never enters the bundle (decisions.md, D20).
export default function Login() {
    const { url, props } = usePage();

    return (
        <>
            <Head title="Sign in">
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <main className="grid min-h-screen bg-background lg:grid-cols-2">
                <div className="hidden flex-col justify-between gap-10 bg-brand p-10 text-brand-foreground lg:flex">
                    <p className="flex items-center gap-3 type-item">
                        <Landmark className="size-5" aria-hidden="true" />
                        {props.name}
                    </p>
                    <Suspense fallback={null}>
                        <ProvinceMap
                            shapes="province"
                            label="Map of the towns of Cagayan"
                            className="max-h-[70vh] w-full"
                        />
                    </Suspense>
                </div>
                <div className="flex items-center justify-center px-4 py-12">
                    <Card className="w-full max-w-sm">
                        <CardHeader>
                            <CardTitle className="type-title">
                                Sign in
                            </CardTitle>
                            <CardDescription className="lg:hidden">
                                {props.name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form
                                action={url}
                                method="post"
                                resetOnSuccess={['password']}
                                resetOnError={['password']}
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
                                            <FieldError>
                                                {errors.email}
                                            </FieldError>
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
                                            <FieldError>
                                                {errors.password}
                                            </FieldError>
                                        </Field>
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={processing}
                                        >
                                            {processing && <Spinner />}
                                            Sign in
                                        </Button>
                                    </FieldGroup>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    );
}
