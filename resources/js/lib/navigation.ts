import type { RouteDefinition } from '@/wayfinder';

// A section is current on its own page and on any page below it, ignoring the query string.
export function isCurrentSection(
    pageUrl: string,
    href: RouteDefinition<'get'>,
): boolean {
    const page = pageUrl.split('?')[0];
    const section = href.url.split('?')[0];

    return section === '/'
        ? page === '/'
        : page === section || page.startsWith(`${section}/`);
}
