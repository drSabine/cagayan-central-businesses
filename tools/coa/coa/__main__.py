"""Command line: python -m coa extract. Run through `composer data:finances:extract`."""

import argparse
import csv
import hashlib
from collections import Counter, defaultdict
from pathlib import Path

from . import EXTRACTOR_VERSION
from .checks import document_checks, restatement_checks
from .lines import load
from .summary import CORE, Issue, parse_summary

ROOT = Path(__file__).resolve().parents[3]
TOWNS = ROOT / "data" / "towns"
SUMMARIES = TOWNS / "executive-summaries"
OUTPUT = TOWNS / "finances"

EXTRACTED_COLUMNS = [
    "psgc_code", "town", "reported_in_year", "fiscal_year", "line_code", "basis", "value",
    "definition_variant", "source_label", "location", "document_sha256", "extractor_version",
]
ISSUE_COLUMNS = ["psgc_code", "town", "reported_in_year", "severity", "kind", "line_code", "message", "location"]
DOCUMENT_COLUMNS = ["psgc_code", "town", "fiscal_year", "kind", "availability", "file", "source_url", "sha256", "checked_on"]


def main() -> None:
    parser = argparse.ArgumentParser(prog="coa")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("extract", help="Read every Executive Summary into data/towns/finances/")
    parser.parse_args()
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
        for figure in result.figures:
            extracted[year].append({
                "psgc_code": source["psgc_code"], "town": source["town"], "reported_in_year": year,
                "fiscal_year": figure.fiscal_year, "line_code": figure.code, "basis": "actual",
                "value": f"{figure.value:.2f}", "definition_variant": figure.variant or "",
                "source_label": figure.source_label, "location": f"page {figure.page}",
                "document_sha256": source["sha256"], "extractor_version": EXTRACTOR_VERSION,
            })
        issues[year] += [issue_row(source, year, issue) for issue in document_issues]

    for code, reports in by_town.items():
        source = next(row for row in sources if row["psgc_code"] == code)
        for year, issue in restatement_checks(reports):
            issues[year].append(issue_row(source, year, issue))

    (OUTPUT / "extracted").mkdir(parents=True, exist_ok=True)
    (OUTPUT / "issues").mkdir(parents=True, exist_ok=True)
    for year in sorted(extracted.keys() | issues.keys()):
        write_csv(OUTPUT / "extracted" / f"{year}.csv", EXTRACTED_COLUMNS, extracted[year])
        write_csv(OUTPUT / "issues" / f"{year}.csv", ISSUE_COLUMNS, sorted(issues[year], key=lambda row: (row["town"], row["severity"], row["kind"], row["line_code"])))
    write_csv(OUTPUT / "documents.csv", DOCUMENT_COLUMNS, documents(sources))
    report(extracted, issues, len(sources))


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
    for code in CORE + ("performance.net_income", "budget.appropriations_current", "budget.obligations_current"):
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
