-- stats_finance_year: signed-off government finance series (metrics.md M19 to M27).
-- Only verified figures enter. A missing figure stays missing; nothing is imputed or carried forward.
delete from stats_finance_year;

insert into stats_finance_year (
    municipality_id, fiscal_year, metric, value, definition_variant,
    change, percent_change, comparable, census_year, restated_in, reporting_towns, total_towns, matched_towns
)
with verified as (
    select f.municipality_id, f.fiscal_year, f.line_code as metric, f.basis, f.value, f.definition_variant as variant,
        -- M26: a later report restated the year when it replaced a different earlier figure.
        case when exists (
            select 1 from finance_figures s
            where s.municipality_id = f.municipality_id and s.fiscal_year = f.fiscal_year and s.line_code = f.line_code
                and s.basis = f.basis and s.status = 'superseded' and s.value <> f.value
        ) then d.fiscal_year end as restated_in
    from finance_figures f
    join finance_lines l on l.code = f.line_code
    left join finance_documents d on d.id = f.finance_document_id
    where f.status = 'verified' and l.displayed and l.source <> 'derived'
),
actual as (
    select municipality_id, fiscal_year, metric, value, variant, restated_in from verified where basis = 'actual'
),
pivot as (
    select municipality_id, fiscal_year,
        max(value) filter (where metric = 'performance.revenue') as revenue,
        max(value) filter (where metric = 'performance.expenses') as expenses,
        max(value) filter (where metric = 'revenue.tax') as tax,
        max(value) filter (where metric = 'revenue.national_share') as national,
        max(value) filter (where metric = 'revenue.service_business') as fees,
        coalesce(bool_or(metric = 'revenue.tax' and variant = 'may_include_national_share'), false) as tax_includes_national,
        max(value) filter (where metric = 'budget.appropriations_current') as appropriations,
        max(value) filter (where metric = 'budget.obligations_current') as obligations,
        max(value) filter (where metric = 'sector.development_fund') as development,
        max(value) filter (where metric = 'sector.economic_services') as economic
    from actual
    group by municipality_id, fiscal_year
),
budgets as (
    select municipality_id, fiscal_year,
        max(value) filter (where metric = 'sector.development_fund') as development,
        max(value) filter (where metric = 'sector.economic_services') as economic
    from verified
    where basis = 'budget_final'
    group by municipality_id, fiscal_year
),
census as (
    -- M25: the latest verified census at or before the fiscal year; years before the first census use the first one.
    select p.municipality_id, p.fiscal_year, c.year as census_year, c.value as population
    from pivot p
    join lateral (
        select t.year, t.value
        from town_facts t
        where t.municipality_id = p.municipality_id and t.measure = 'population' and t.checked_on is not null
        order by (t.year <= p.fiscal_year) desc, case when t.year <= p.fiscal_year then -t.year else t.year end
        limit 1
    ) c on true
),
derived as (
    select municipality_id, fiscal_year, 'performance.surplus' as metric, revenue - expenses as value,
        null::varchar as variant, null::smallint as census_year
    from pivot where revenue is not null and expenses is not null
    union all
    select municipality_id, fiscal_year, 'revenue.remaining', revenue - tax - national - fees, null, null
    from pivot where revenue is not null and tax is not null and national is not null and fees is not null
    union all
    -- M21: not available when Local Taxes may include the national share.
    select municipality_id, fiscal_year, 'revenue.local_share', round((tax + fees) / revenue * 100, 2), null, null
    from pivot where revenue > 0 and tax is not null and fees is not null and not tax_includes_national
    union all
    select municipality_id, fiscal_year, 'budget.utilization', round(obligations / appropriations * 100, 2), null, null
    from pivot where appropriations > 0 and obligations is not null
    union all
    select p.municipality_id, p.fiscal_year, 'sector.development_fund.utilization', round(p.development / b.development * 100, 2), null, null
    from pivot p join budgets b using (municipality_id, fiscal_year) where b.development > 0 and p.development is not null
    union all
    select p.municipality_id, p.fiscal_year, 'sector.economic_services.utilization', round(p.economic / b.economic * 100, 2), null, null
    from pivot p join budgets b using (municipality_id, fiscal_year) where b.economic > 0 and p.economic is not null
    union all
    select p.municipality_id, p.fiscal_year, 'per_capita.revenue', round(p.revenue / c.population, 2), null, c.census_year::smallint
    from pivot p join census c using (municipality_id, fiscal_year) where p.revenue is not null and c.population > 0
    union all
    select p.municipality_id, p.fiscal_year, 'per_capita.expenses', round(p.expenses / c.population, 2), null, c.census_year::smallint
    from pivot p join census c using (municipality_id, fiscal_year) where p.expenses is not null and c.population > 0
),
series as (
    select municipality_id, fiscal_year, metric, value, variant, null::smallint as census_year, restated_in::smallint from actual
    union all
    select municipality_id, fiscal_year, metric, value, variant, census_year, null from derived
),
ordered as (
    select s.*,
        lag(value) over w as prior_value,
        lag(fiscal_year) over w as prior_year,
        lag(variant) over w as prior_variant
    from series s
    window w as (partition by municipality_id, metric order by fiscal_year)
),
towns as (
    -- M26: change only between consecutive years with the same definition variant; no percent from a zero base.
    select municipality_id, fiscal_year, metric, value, variant, census_year, restated_in, prior_value,
        coalesce(prior_year = fiscal_year - 1 and variant is not distinct from prior_variant, false) as comparable
    from ordered
),
sums as (
    -- M27: Sum of Reporting Towns for peso totals, with change over the towns present in both years.
    select t.fiscal_year, t.metric,
        sum(t.value) as value,
        sum(t.value - t.prior_value) filter (where t.comparable) as change,
        sum(t.prior_value) filter (where t.comparable) as prior_total,
        count(*) as reporting_towns,
        count(*) filter (where t.comparable) as matched_towns
    from towns t
    join finance_lines l on l.code = t.metric
    where l.unit = 'php' and l."group" <> 'per_capita'
    group by t.fiscal_year, t.metric
)
select municipality_id, fiscal_year, metric, value, variant,
    case when comparable then value - prior_value end,
    -- M26: over the size of the prior value, so a deficit that deepens reads as a fall.
    case when comparable and prior_value <> 0 then round((value - prior_value) / abs(prior_value) * 100, 1) end,
    comparable, census_year, restated_in, null, null, null
from towns
union all
select null, fiscal_year, metric, value, null,
    change,
    case when prior_total <> 0 then round(change / abs(prior_total) * 100, 1) end,
    matched_towns > 0, null, null, reporting_towns, (select count(*) from municipalities), matched_towns
from sums;
