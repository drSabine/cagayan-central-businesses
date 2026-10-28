"""Command line: python -m coa extract. Run through `composer data:finances:extract`."""

import argparse
import csv
import hashlib
from decimal import Decimal
from collections import Counter, defaultdict
from pathlib import Path

from . import EXTRACTOR_VERSION
from .archives import add_workbooks
from .checks import document_checks, restatement_checks
from .lines import load
from .summary import Issue, parse_summary
from .workbook import read_annex, read_fs

ROOT = Path(__file__).resolve().parents[3]
TOWNS = ROOT / "data" / "towns"
SUMMARIES = TOWNS / "executive-summaries"
WORKBOOKS = TOWNS / "financial-statements"
OUTPUT = TOWNS / "finances"

EXTRACTED_COLUMNS = [
    "psgc_code", "town", "reported_in_year", "document_kind", "fiscal_year", "line_code", "basis", "value",
    "definition_variant", "source_label", "location", "document_sha256", "extractor_version",
]
ISSUE_COLUMNS = ["psgc_code", "town", "reported_in_year", "severity", "kind", "line_code", "message", "location"]
DOCUMENT_COLUMNS = ["psgc_code", "town", "fiscal_year", "kind", "availability", "file", "source_url", "sha256", "checked_on"]


def main() -> None:
    parser = argparse.ArgumentParser(prog="coa")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("extract", help="Read every Executive Summary and workbook into data/towns/finances/")
    adding = commands.add_parser("add-workbooks", help="Copy statement workbooks out of downloaded Annual Audit Report ZIPs")
    adding.add_argument("listing", type=Path, help="CSV with archive,source_url,retrieved_on")
    arguments = parser.parse_args()
    if arguments.command == "add-workbooks":
        for message in add_workbooks(arguments.listing.resolve(), SUMMARIES, WORKBOOKS):
            print(message)
        return
    extract()


def extract() -> None:
    lines, aliases = load(OUTPUT / "lines.csv")
    sources = read_csv(SUMMARIES / "sources.csv")
    extracted: dict[int, list[dict]] = defaultdict(list)
    issues: dict[int, list[dict]] = defaultdict(list)
    by_town: dict[str, dict[int, list]] = defaultdict(dict)

    for source in sorted(sources, key=lambda row: (int(row["year"]), row["town"])):
        year, path = int(source["year"]), SUMMARIES / source["file"]
        document_issues: list[Issue] = []
        if hashlib.sha256(path.read_bytes()).hexdigest() != source["sha256"]:
            document_issues.append(Issue("error", "checksum_mismatch", "", "File differs from sources.csv"))
        result = parse_summary(path, year, lines, aliases)
        document_issues += result.issues + document_checks(result.figures, result.changes, year)
        by_town[source["psgc_code"]][year] = result.figures
        for figure in stored(result.figures, lines):
            extracted[year].append({
                "psgc_code": source["psgc_code"], "town": source["town"], "reported_in_year": year,
                "document_kind": "executive_summary", "fiscal_year": figure.fiscal_year, "line_code": figure.code, "basis": "actual",
                "value": f"{figure.value:.2f}", "definition_variant": figure.variant or "",
                "source_label": figure.source_label, "location": f"page {figure.page}",
                "document_sha256": source["sha256"], "extractor_version": EXTRACTOR_VERSION,
            })
        issues[year] += [issue_row(source, year, issue) for issue in document_issues]

    for code, reports in by_town.items():
        source = next(row for row in sources if row["psgc_code"] == code)
        for year, issue in restatement_checks(reports):
            issues[year].append(issue_row(source, year, issue))

    workbooks = read_csv(WORKBOOKS / "sources.csv")
    extract_workbooks(workbooks, lines, aliases, extracted, issues)

    (OUTPUT / "extracted").mkdir(parents=True, exist_ok=True)
    (OUTPUT / "issues").mkdir(parents=True, exist_ok=True)
    for year in sorted(extracted.keys() | issues.keys()):
        write_csv(OUTPUT / "extracted" / f"{year}.csv", EXTRACTED_COLUMNS, extracted[year])
        write_csv(OUTPUT / "issues" / f"{year}.csv", ISSUE_COLUMNS, sorted(issues[year], key=lambda row: (row["town"], row["severity"], row["kind"], row["line_code"])))
    write_csv(OUTPUT / "documents.csv", DOCUMENT_COLUMNS, documents(sources) + workbook_documents(workbooks))
    report(extracted, issues, len(sources))


def extract_workbooks(workbooks: list[dict], lines, aliases, extracted: dict[int, list[dict]], issues: dict[int, list[dict]]) -> None:
    """Breakdowns from the statement workbooks, checked against the same town's Executive Summary totals."""
    summary = {
        (row["psgc_code"], int(row["fiscal_year"]), row["line_code"]): Decimal(row["value"])
        for year_rows in extracted.values() for row in year_rows
        if row["document_kind"] == "executive_summary" and row["reported_in_year"] == int(row["fiscal_year"])
    }
    readers = {"fs_workbook": read_fs, "annex_workbook": read_annex}
    by_town: dict[tuple[str, str], dict[int, list]] = defaultdict(dict)
    for source in sorted(workbooks, key=lambda row: (int(row["year"]), row["town"], row["kind"])):
        year, path = int(source["year"]), WORKBOOKS / source["file"]
        result = readers[source["kind"]](path, year, lines, aliases)
        if hashlib.sha256(path.read_bytes()).hexdigest() != source["sha256"]:
            result.issues.append(Issue("error", "checksum_mismatch", "", f"{source['file']} differs from sources.csv"))
        if source["kind"] == "fs_workbook":
            result.issues += summary_checks(result.figures, summary, source["psgc_code"], year)
        by_town[(source["psgc_code"], source["kind"])][year] = result.figures
        for figure in stored(result.figures, lines):
            extracted[year].append({
                "psgc_code": source["psgc_code"], "town": source["town"], "reported_in_year": year,
                "document_kind": source["kind"], "fiscal_year": figure.fiscal_year, "line_code": figure.code,
                "basis": figure.basis, "value": f"{figure.value:.2f}", "definition_variant": figure.variant or "",
                "source_label": figure.source_label, "location": figure.location,
                "document_sha256": source["sha256"], "extractor_version": EXTRACTOR_VERSION,
            })
        issues[year] += [issue_row(source, year, issue) for issue in result.issues]
    for (code, _), reports in by_town.items():
        source = next(row for row in workbooks if row["psgc_code"] == code)
        for year, issue in restatement_checks(reports):
            issues[year].append(issue_row(source, year, issue))


def stored(figures, lines) -> list:
    """Lines in the "checks" group are read for the arithmetic and section boundaries, never written."""
    return [figure for figure in figures if lines[figure.code].group != "checks"]


def summary_checks(figures, summary: dict, psgc: str, year: int) -> list[Issue]:
    """Revenue sources should add up to the summary's revenue, and expense types to its expenses."""
    found = []
    for total, prefix in (("performance.revenue", "revenue."), ("performance.expenses", "expense.")):
        parts = [figure.value for figure in figures if figure.fiscal_year == year and figure.basis == "actual" and figure.code.startswith(prefix)]
        stated = summary.get((psgc, year, total))
        if parts and stated is not None and abs(sum(parts) - stated) > Decimal("1.00"):
            found.append(Issue("warning", "differs_from_summary", total, f"{year}: workbook lines add up to {sum(parts)}, the Executive Summary states {stated}"))
    return found


def workbook_documents(workbooks: list[dict]) -> list[dict]:
    rows = [{
        "psgc_code": row["psgc_code"], "town": row["town"], "fiscal_year": row["year"], "kind": row["kind"],
        "availability": "available", "file": f"financial-statements/{row['file']}", "source_url": row["source_url"],
        "sha256": row["sha256"], "checked_on": row["retrieved_on"],
    } for row in workbooks]
    for row in read_csv(WORKBOOKS / "not-published.csv"):
        for kind in ("fs_workbook", "annex_workbook"):
            rows.append({
                "psgc_code": row["psgc_code"], "town": row["town"], "fiscal_year": row["year"], "kind": kind,
                "availability": "not_published", "file": "", "source_url": "", "sha256": "", "checked_on": row["checked_on"],
            })
    return sorted(rows, key=lambda row: (int(row["fiscal_year"]), row["kind"], row["town"]))


def documents(sources: list[dict]) -> list[dict]:
    """Every town and year in the collected range, including years COA has not published."""
    towns = {row["psgc_code"]: row["town"] for row in sources}
    years = sorted({int(row["year"]) for row in sources})
    held = {(row["psgc_code"], int(row["year"])): row for row in sources}
    checked = {int(row["year"]): max(r["retrieved_on"] for r in sources if r["year"] == row["year"]) for row in sources}
    rows = []
    for year in years:
        for code, town in sorted(towns.items(), key=lambda item: item[1]):
            source = held.get((code, year))
            rows.append({
                "psgc_code": code, "town": town, "fiscal_year": year, "kind": "executive_summary",
                "availability": "available" if source else "not_published",
                "file": f"executive-summaries/{source['file']}" if source else "",
                "source_url": source["source_url"] if source else "",
                "sha256": source["sha256"] if source else "",
                "checked_on": source["retrieved_on"] if source else checked[year],
            })
    return rows


def issue_row(source: dict, year: int, issue: Issue) -> dict:
    return {
        "psgc_code": source["psgc_code"], "town": source["town"], "reported_in_year": year,
        "severity": issue.severity, "kind": issue.kind, "line_code": issue.code, "message": issue.message,
        "location": f"page {issue.page}" if issue.page else "",
    }


def report(extracted: dict[int, list[dict]], issues: dict[int, list[dict]], documents_read: int) -> None:
    rows = [row for year_rows in extracted.values() for row in year_rows]
    current = {(row["psgc_code"], row["reported_in_year"], row["line_code"]) for row in rows if row["fiscal_year"] == row["reported_in_year"]}
    print(f"Documents read: {documents_read}")
    print(f"Figures extracted: {len(rows)}")
    for code in ("performance.revenue", "performance.expenses", "budget.appropriations_current", "budget.obligations_current"):
        print(f"  {code}: {sum(1 for key in current if key[2] == code)} of {documents_read} reports")
    severities = Counter(row["severity"] for year_rows in issues.values() for row in year_rows)
    kinds = Counter((row["severity"], row["kind"]) for year_rows in issues.values() for row in year_rows)
    print(f"Issues: {dict(severities)}")
    for (severity, kind), count in sorted(kinds.items()):
        print(f"  {severity} {kind}: {count}")


def read_csv(path: Path) -> list[dict]:
    with path.open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def write_csv(path: Path, columns: list[str], rows: list[dict]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


if __name__ == "__main__":
    main()
