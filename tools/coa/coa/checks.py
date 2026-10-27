from decimal import Decimal

from .summary import Figure, Issue

TOLERANCE = Decimal("1.00")


def document_checks(figures: list[Figure], changes: dict[str, Decimal], report_year: int) -> list[Issue]:
    """Arithmetic the summary must satisfy on its own; a failure blocks quick sign-off."""
    value = {(figure.code, figure.fiscal_year): figure.value for figure in figures}
    issues: list[Issue] = []
    for year in sorted({figure.fiscal_year for figure in figures}):
        identity(issues, value, year, "balance", "position.assets", ["position.liabilities", "position.equity"])
        net = [value.get(("performance.revenue", year)), value.get(("performance.expenses", year)), value.get(("performance.net_income", year))]
        if None not in net and abs(net[0] - net[1] - net[2]) > TOLERANCE:
            issues.append(Issue("error", "net_income_mismatch", "performance.net_income", f"{year}: revenue minus expenses is {net[0] - net[1]}, stated {net[2]}"))
    for code, stated in changes.items():
        current, prior = value.get((code, report_year)), value.get((code, report_year - 1))
        if current is None or prior is None or abs(current - prior - stated) <= TOLERANCE:
            continue
        # Some reports print prior minus current; the stored values are unaffected.
        if abs(current - prior + stated) <= TOLERANCE:
            issues.append(Issue("info", "change_sign_reversed", code, f"Report states the change as prior minus current ({stated})"))
        else:
            issues.append(Issue("warning", "change_mismatch", code, f"current minus prior is {current - prior}, stated {stated}"))
    return issues


def identity(issues: list[Issue], value: dict, year: int, kind: str, total: str, parts: list[str]) -> None:
    amounts = [value.get((code, year)) for code in [total, *parts]]
    if None in amounts:
        return
    difference = amounts[0] - sum(amounts[1:])
    if abs(difference) > TOLERANCE:
        issues.append(Issue("error", f"{kind}_mismatch", total, f"{year}: {total} differs from {' + '.join(parts)} by {difference}"))


def restatement_checks(by_report: dict[int, list[Figure]]) -> list[tuple[int, Issue]]:
    """Compare each report's prior-year column with the previous report's current column."""
    issues: list[tuple[int, Issue]] = []
    for report_year, figures in by_report.items():
        earlier = {figure.code: figure for figure in by_report.get(report_year - 1, []) if figure.fiscal_year == report_year - 1}
        for figure in figures:
            # A current-year figure equal to last year's own figure usually means swapped column headers.
            # Sector budgets such as Aid to Barangays are often the same fixed amount every year.
            repeats = figure.fiscal_year == report_year and figure.code in earlier and earlier[figure.code].value == figure.value
            if repeats and figure.value != 0 and not figure.code.startswith("sector."):
                issues.append((report_year, Issue(
                    "error", "repeats_previous_year", figure.code, f"{report_year} equals the {report_year - 1} report's own {report_year - 1} figure; columns may be swapped", getattr(figure, "page", None)
                )))
            elif figure.fiscal_year == report_year - 1 and figure.code in earlier and earlier[figure.code].value != figure.value:
                issues.append((report_year, Issue(
                    "info", "restated", figure.code, f"{figure.fiscal_year} was {earlier[figure.code].value} in the {report_year - 1} report", getattr(figure, "page", None)
                )))
    return issues
