import assert from 'node:assert/strict';
import { test } from 'node:test';
import { router } from '@inertiajs/react';
import {
    latestYear,
    periodHistory,
    selectedFinance,
    selectedYear,
    selectedBusiness,
    pushFilters,
    measureCovers,
    withCoveredMeasure,
} from '../../resources/js/lib/analytics.ts';

const point = (value = '10', overrides = {}) => ({
    state: 'shown',
    value,
    comparable: false,
    change: null,
    percentageChange: null,
    comparisonYear: null,
    ...overrides,
});
const history = (rows) => ({
    metrics: [{ id: 'amount', label: 'Amount', unit: 'php', basis: 'actual' }],
    rows: rows.map(([year, observation]) => ({
        year,
        observations: { amount: observation },
    })),
    axisMaximum: '10',
    note: null,
});
const series = history([
    [2019, point()],
    [2020, point()],
    [2021, point()],
    [2022, point()],
    [2023, point()],
    [2024, point(null, { state: 'unavailable' })],
    [2025, point()],
    [2026, point(null, { state: 'unavailable' })],
]);
const filters = {
    town: 'town',
    measure: 'totals',
    period: '3y',
    presentation: 'summary',
    year: null,
    dimension: 'industry',
    group: null,
};
const catalog = {
    periods: { all: 2019, recent: 2023 },
    finances: { town: { totals: series } },
};

await test('relative periods use the latest shown year and retain missing calendar years', () => {
    assert.equal(latestYear(series), 2025);
    for (const [period, years] of [
        ['2y', [2024, 2025]],
        ['3y', [2023, 2024, 2025]],
        ['5y', [2021, 2022, 2023, 2024, 2025]],
        ['all', [2019, 2020, 2021, 2022, 2023, 2024, 2025]],
        ['recent', [2023, 2024, 2025]],
    ]) {
        assert.deepEqual(
            periodHistory(series, catalog, period).rows.map((row) => row.year),
            years,
        );
    }
    assert.equal(
        periodHistory(series, catalog, '2y').rows[0].observations.amount.state,
        'unavailable',
    );
    assert.equal(selectedFinance(catalog, filters), series);
    assert.equal(
        selectedFinance(catalog, { ...filters, town: 'missing' }),
        null,
    );
});

await test('bands count as shown and fully unavailable histories do not invent a reference year', () => {
    assert.equal(
        latestYear(history([[2025, point(null, { band: 'Under threshold' })]])),
        2025,
    );
    const empty = history([[2024, point(null, { state: 'unavailable' })]]);
    assert.equal(latestYear(empty), null);
    assert.deepEqual(periodHistory(empty, catalog, '3y'), empty);
});

await test('business counts, banded sales and shares use the same business period even when finance ends earlier', () => {
    const counts = history([
        [2023, point()],
        [2024, point()],
        [2025, point()],
        [2026, point()],
    ]);
    const sales = history([
        [2023, point(null, { band: 'Band' })],
        [2024, point(null, { state: 'hidden' })],
        [2025, point(null, { band: 'Band' })],
        [2026, point(null, { band: 'Band' })],
    ]);
    const businessCatalog = {
        ...catalog,
        businesses: {
            townCode: 'town',
            groups: { industry: [{ value: 'industry:A' }], category: [] },
            datasets: { 'industry:A': { counts, sales, share: counts } },
        },
    };
    const selected = selectedBusiness(businessCatalog, {
        ...filters,
        period: '2y',
        presentation: 'trends',
    });
    for (const item of Object.values(selected.dataset))
        assert.deepEqual(
            item.rows.map((row) => row.year),
            [2025, 2026],
        );
    assert.equal(
        selected.dataset.sales.rows[0].observations.amount.value,
        null,
    );
    assert.deepEqual(
        selectedFinance(catalog, {
            ...filters,
            presentation: 'trends',
            period: '2y',
        }).rows.map((row) => row.year),
        [2025],
    );
    assert.equal(
        selectedBusiness(businessCatalog, { ...filters, town: 'other' }),
        null,
    );
});

await test('local history retains explicit year and resets only an incompatible group', (t) => {
    let pushed;
    t.mock.method(router, 'push', (next) => {
        pushed = next;
    });
    const current = { ...filters, year: 2024, group: 'industry:A' };
    pushFilters(
        current,
        { presentation: 'trends', dimension: 'category' },
        (query) => '?' + new URLSearchParams(query),
        (props, next) => ({ ...props, filters: next }),
    );
    const params = new URLSearchParams(pushed.url);
    assert.equal(params.get('presentation'), 'trends');
    assert.equal(params.get('year'), '2024');
    assert.equal(params.has('group'), false);
    assert.equal(pushed.props({ other: 'kept' }).other, 'kept');
    assert.equal(pushed.props({}).filters.presentation, 'trends');
    assert.equal(pushed.preserveScroll, true);
    const calls = router.push.mock.callCount();
    pushFilters(
        current,
        {},
        () => '',
        () => ({}),
    );
    assert.equal(router.push.mock.callCount(), calls);
});

await test('formatting retains combined notes and distinguishes percentage points without inventing comparisons', async () => {
    const { registerHooks } = await import('node:module');
    const hooks = registerHooks({
        resolve(specifier, context, nextResolve) {
            if (specifier === '@/lib/format')
                return nextResolve(
                    new URL('../../resources/js/lib/format.ts', import.meta.url)
                        .href,
                    context,
                );
            return nextResolve(specifier, context);
        },
    });
    const { changeLabel, percentageLabel, observationNote, citationLinks } =
        await import('../../resources/js/lib/performance-format.ts');
    const change = point('15', {
        comparable: true,
        change: '5',
        percentageChange: 50,
        comparisonYear: 2024,
    });
    assert.equal(changeLabel(change, 'percent'), '+5 points');
    assert.equal(percentageLabel(change), '+50.0%');
    assert.equal(
        changeLabel({ ...change, comparable: false }, 'php'),
        'Not available',
    );
    assert.equal(
        percentageLabel({ ...change, percentageChange: null }),
        'Not available',
    );
    assert.equal(
        changeLabel({ ...change, state: 'hidden' }, 'php'),
        'Hidden to protect individual businesses',
    );
    assert.equal(
        observationNote({
            ...change,
            censusYear: 2024,
            restatedIn: 2025,
            coverage: { reporting: 13, total: 29, matched: 12 },
        }),
        '13 of 29 towns. Change over 12 reporting both years. Using the 2024 census. Restated in the 2025 report',
    );
    assert.equal(
        observationNote(
            point(null, { state: 'unavailable', reason: 'not_collected' }),
        ),
        'The COA workbook for this year has not been added yet',
    );
    const source = (overrides) => ({
        kind: 'executive_summary',
        label: 'Executive Summary',
        town: 'Town',
        fiscalYear: 2024,
        reportYear: 2025,
        page: 2,
        location: 'page 2',
        url: '/finance-sources/a',
        ...overrides,
    });
    const sources = {
        a: source({}),
        b: source({ url: '/finance-sources/b' }),
        c: source({ url: '/finance-sources/a' }),
        w: source({
            kind: 'fs_workbook',
            label: 'Financial Statements',
            page: null,
            location: 'SCBAA!A12',
            url: '/finance-sources/w',
        }),
        w2: source({
            kind: 'fs_workbook',
            label: 'Financial Statements',
            page: null,
            location: 'SCBAA!A13',
            url: '/finance-sources/w',
        }),
        none: source({ kind: null, url: null }),
    };
    // One link per distinct citation, however many figures share it; a workbook links once per report; an entered figure has none.
    assert.deepEqual(
        citationLinks(sources, ['a', 'b', 'c', 'w', 'w2', 'none']),
        [
            {
                href: '/finance-sources/a#page=2',
                text: 'Executive Summary 2025 p. 2',
            },
            { href: '/finance-sources/w', text: 'Financial Statements 2025' },
        ],
    );
    hooks.deregister();
});

await test('a measure that a town lacks falls back to Government Totals', () => {
    const measures = [
        { value: 'totals', label: 'Government Totals', towns: null },
        { value: 'budget', label: 'Budget Execution', towns: ['tuguegarao'] },
    ];
    const data = { ...catalog, measures };
    assert.equal(measureCovers(measures[1], 'tuguegarao'), true);
    assert.equal(measureCovers(measures[1], 'abulug'), false);
    assert.equal(measureCovers(measures[0], 'abulug'), true);
    const budget = { ...filters, town: 'tuguegarao', measure: 'budget' };
    assert.deepEqual(withCoveredMeasure(data, budget, { year: 2024 }), {
        year: 2024,
    });
    assert.deepEqual(withCoveredMeasure(data, budget, { town: 'abulug' }), {
        town: 'abulug',
        measure: 'totals',
    });
});

await test('an unavailable category keeps a meaningful year and explicit years are never replaced', () => {
    const missing = history([
        [2024, point(null, { state: 'unavailable' })],
        [2025, point(null, { state: 'unavailable' })],
    ]);
    const data = {
        ...catalog,
        finances: { town: { totals: series, detail: missing } },
    };
    assert.equal(selectedYear(data, { ...filters, measure: 'detail' }), 2025);
    assert.equal(
        selectedYear(data, { ...filters, measure: 'detail', year: 2024 }),
        2024,
    );
    assert.equal(selectedYear(data, { ...filters, town: 'missing' }), null);
});

await test('finance coverage trims uncollected outer years and expands with newly published years', () => {
    const detail = history([
        [2019, point(null, { state: 'unavailable' })],
        [2023, point('0')],
        [2024, point(null, { state: 'unavailable' })],
        [2025, point('-10')],
        [2026, point(null, { state: 'unavailable' })],
    ]);
    const data = { ...catalog, finances: { town: { totals: detail } } };
    const selection = { ...filters, presentation: 'trends', period: 'all' };
    assert.deepEqual(
        selectedFinance(data, selection).rows.map((row) => row.year),
        [2023, 2024, 2025],
    );
    detail.rows[4].observations.amount = point('20');
    assert.deepEqual(
        selectedFinance(data, selection).rows.map((row) => row.year),
        [2023, 2024, 2025, 2026],
    );
    detail.rows.forEach((row) => {
        row.observations.amount = point(null, { state: 'unavailable' });
    });
    assert.deepEqual(selectedFinance(data, selection).rows, []);
});

await test('chart segments preserve signed amounts without bridging gaps or incompatible definitions', async () => {
    const { financeChartSeries, focusedFinance } =
        await import('../../resources/js/lib/finance-chart.ts');
    const detail = history([
        [2020, point('0')],
        [2021, point('-20', { comparable: true })],
        [2022, point(null, { state: 'unavailable' })],
        [2023, point('10')],
        [2024, point('15')],
        [2025, point('18', { comparable: true })],
    ]);
    assert.deepEqual(
        financeChartSeries(detail).map((segment) => segment.values),
        [
            [0, -20, null, null, null, null],
            [null, null, null, 10, null, null],
            [null, null, null, null, 15, 18],
        ],
    );
    assert.equal(focusedFinance(detail, 'unknown').id, 'amount');
    assert.equal(
        financeChartSeries(history([[2025, point('12')]]))[0].values[0],
        12,
    );
    assert.deepEqual(
        financeChartSeries(history([[2025, point('12', { state: 'hidden' })]])),
        [],
    );
});

await test('finance metric and range selections use local history and skip repeated choices', (t) => {
    const calls = [];
    t.mock.method(router, 'push', (next) => calls.push(next));
    const current = {
        ...filters,
        presentation: 'trends',
        metric: null,
        period: 'all',
    };
    const url = (query) => '?' + new URLSearchParams(query);
    const props = (existing, next) => ({ ...existing, filters: next });
    pushFilters(current, { metric: 'revenue.tax', period: '5y' }, url, props);
    const next = calls[0].props({}).filters;
    assert.equal(next.metric, 'revenue.tax');
    assert.equal(next.period, '5y');
    assert.equal(
        new URLSearchParams(calls[0].url).get('metric'),
        'revenue.tax',
    );
    pushFilters(next, { metric: 'revenue.tax', period: '5y' }, url, props);
    assert.equal(calls.length, 1);
    pushFilters(next, { measure: 'budget' }, url, props);
    assert.equal(calls[1].props({}).filters.metric, null);
});
