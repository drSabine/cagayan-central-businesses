from decimal import Decimal
from pathlib import Path

import pytest

from coa.checks import document_checks, restatement_checks
from coa.lines import load
from coa.summary import parse_summary

ROOT = Path(__file__).resolve().parents[3]
SUMMARIES = ROOT / "data" / "towns" / "executive-summaries"
LINES, ALIASES = load(ROOT / "data" / "towns" / "finances" / "lines.csv")


def parse(year: int, folder: str):
    path = next((SUMMARIES / str(year) / folder).glob("*.pdf"))
    return parse_summary(path, year, LINES, ALIASES)


def values(result) -> dict[tuple[str, int], Decimal]:
    return {(figure.code, figure.fiscal_year): figure.value for figure in result.figures}


# Expected values were read from each PDF's highlights table by hand, not from parser output.
LAYOUTS = {
    (2024, "Tuguegarao-City"): {
        ("position.assets", 2024): "4909278026.68", ("position.assets", 2023): "4755696722.35",
        ("position.liabilities", 2024): "1323381986.04", ("position.equity", 2024): "3585896040.64",
        ("performance.revenue", 2024): "1465722146.22", ("performance.revenue", 2023): "1328465373.08",
        ("performance.expenses", 2024): "1184642113.21", ("performance.net_income", 2023): "166669261.71",
        ("budget.appropriations_current", 2024): "1568978181.74", ("budget.obligations_current", 2023): "1170902599.47",
    },
    (2020, "Abulug"): {
        ("position.assets", 2020): "445737992.91", ("position.assets", 2019): "396488332.90",
        ("position.equity", 2019): "291128530.01", ("performance.revenue", 2020): "145949953.21",
        ("performance.expenses", 2019): "114319571.04", ("budget.appropriations_current", 2020): "153094380.00",
        ("budget.obligations_current", 2019): "117990546.25",
    },
    (2020, "Sto.-Nino"): {
        ("position.equity", 2020): "349107340.82", ("performance.revenue", 2020): "189806177.11",
        ("performance.revenue", 2019): "169257233.93", ("performance.expenses", 2020): "127319290.69",
        ("budget.appropriations_current", 2019): "169304878.99", ("budget.obligations_current", 2020): "149630370.66",
    },
    (2021, "Baggao"): {
        ("position.assets", 2021): "982072784.49", ("position.equity", 2020): "693704494.90",
        ("performance.revenue", 2021): "417659631.01", ("performance.expenses", 2020): "317013611.97",
    },
    (2023, "Rizal"): {
        ("position.assets", 2022): "299901040.54", ("position.equity", 2023): "187737473.46",
        ("performance.revenue", 2023): "136842656.46", ("performance.net_income", 2022): "23625441.70",
    },
    (2025, "Gattaran"): {
        ("position.assets", 2025): "1068248800.80", ("position.equity", 2024): "797743340.12",
        ("performance.revenue", 2025): "482695413.29", ("performance.net_income", 2024): "-6542951.65",
    },
    (2020, "Claveria"): {("position.equity", 2020): "308108347.93", ("position.equity", 2019): "219370031.29"},
    (2023, "Alcala"): {("position.equity", 2023): "501143393.29", ("performance.revenue", 2022): "246348606.41"},
    (2022, "Solana"): {("performance.expenses", 2022): "337236533.78", ("performance.expenses", 2021): "269208843.10"},
    (2025, "Amulung"): {("position.assets", 2025): "1061476967.29", ("position.assets", 2024): "820695165.21"},
    (2020, "Iguig"): {("performance.revenue", 2020): "139648447.21", ("performance.revenue", 2019): "115227409.44"},
    (2020, "Sta.-Praxedes"): {("position.assets", 2019): "116822544.28", ("performance.expenses", 2020): "58188869.14"},
}

# Checked to the cent against each town's audited workbook (data/towns/verified-finances-2024.md).
VERIFIED_2024 = {
    "Abulug": ("196960688.39", "179307711.01"),
    "Alcala": ("224744176.27", "201010574.32"),
    "Allacapan": ("232465478.52", "229812731.98"),
    "Tuguegarao-City": ("1465722146.22", "1184642113.21"),
}


@pytest.mark.parametrize(("report", "expected"), LAYOUTS.items(), ids=[f"{year}-{town}" for year, town in LAYOUTS])
def test_reads_each_layout(report, expected):
    found = values(parse(*report))

    assert {key: found.get(key) for key in expected} == {key: Decimal(value) for key, value in expected.items()}


@pytest.mark.parametrize("town", VERIFIED_2024)
def test_reproduces_verified_2024_figures(town):
    found = values(parse(2024, town))

    assert (str(found[("performance.revenue", 2024)]), str(found[("performance.expenses", 2024)])) == VERIFIED_2024[town]


def test_marks_definition_variants():
    variants = {figure.code: figure.variant for figure in parse(2020, "Sto.-Nino").figures}

    assert variants["performance.revenue"] == "includes_subsidy_from_other_funds"
    assert variants["performance.expenses"] == "includes_subsidy_to_other_funds"
    assert {figure.variant for figure in parse(2020, "Abulug").figures if figure.code == "budget.appropriations_current"} == {"unspecified_period"}


def test_repeated_header_year_falls_back_to_report_and_prior_year():
    result = parse(2020, "Sta.-Praxedes")

    assert {figure.fiscal_year for figure in result.figures} == {2019, 2020}
    assert "header_years_repeated" in {issue.kind for issue in result.issues}


def test_balance_and_net_income_hold_for_a_clean_report():
    result = parse(2024, "Tuguegarao-City")

    assert [issue for issue in document_checks(result.figures, result.changes, 2024) if issue.severity == "error"] == []


def test_flags_source_net_income_that_does_not_add_up():
    result = parse(2025, "Rizal")

    assert "net_income_mismatch" in {issue.kind for issue in document_checks(result.figures, result.changes, 2025)}


def test_reversed_change_column_is_only_informational():
    result = parse(2021, "Abulug")
    issues = document_checks(result.figures, result.changes, 2021)

    assert {issue.kind for issue in issues} == {"change_sign_reversed"}
    assert {issue.severity for issue in issues} == {"info"}


def test_flags_swapped_columns_against_the_previous_report():
    reports = {2023: parse(2023, "Gattaran").figures, 2024: parse(2024, "Gattaran").figures}

    swapped = {issue.code for year, issue in restatement_checks(reports) if issue.kind == "repeats_previous_year"}

    assert {"position.assets", "performance.revenue", "performance.expenses"} <= swapped
