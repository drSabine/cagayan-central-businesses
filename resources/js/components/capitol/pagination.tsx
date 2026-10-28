import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import type { Pagination as PaginationData } from '@/types/workspace';

export function Pagination({ data }: { data: PaginationData }) {
    if (data.lastPage <= 1) return null;
    return (
        <nav
            aria-label="Pagination"
            className="flex items-center justify-end gap-2 border-t pt-2"
        >
            {data.previous ? (
                <Button variant="ghost" size="sm" asChild>
                    <Link href={data.previous} preserveScroll>
                        Previous
                    </Link>
                </Button>
            ) : (
                <Button variant="ghost" size="sm" disabled>
                    Previous
                </Button>
            )}
            <span className="type-meta">
                Page <span className="font-mono tabular-nums">{data.page}</span>{' '}
                of{' '}
                <span className="font-mono tabular-nums">{data.lastPage}</span>
            </span>
            {data.next ? (
                <Button variant="ghost" size="sm" asChild>
                    <Link href={data.next} preserveScroll>
                        Next
                    </Link>
                </Button>
            ) : (
                <Button variant="ghost" size="sm" disabled>
                    Next
                </Button>
            )}
        </nav>
    );
}
