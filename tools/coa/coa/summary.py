import re
from dataclasses import dataclass
from decimal import Decimal
from pathlib import Path

import pdfplumber

from .lines import Alias, Line, match
from .numbers import AMOUNT, DASH, PERCENT, TOKEN, parse_amount

START = re.compile(r"financial highlights|highlights of financial|financial information", re.I)
END = re.compile(
    r"operational highlights|independent auditor|auditor.s report|summary of (?:significant|audit|total)"
    r"|fund transfers|transferred funds|status of implementation",
    re.I,
)
HEADER_YEARS = re.compile(r"\b(20\d\d)\b[^\d]{1,40}\b(20\d\d)\b")
ROW = re.compile(
    rf"^(?P<label>.*?)\s*(?P<amounts>(?:(?:{AMOUNT}|{DASH})\s*){{2,4}})(?:\s*{PERCENT.pattern})*\s*$"
)
CORE = ("position.assets", "position.liabilities", "position.equity", "performance.revenue", "performance.expenses")
LABEL_LINES = 4


@dataclass(frozen=True)
class Figure:
    code: str
    fiscal_year: int
    value: Decimal
    variant: str | None
    source_label: str
    page: int


@dataclass(frozen=True)
class Issue:
    severity: str
    kind: str
    code: str
    message: str
    page: int | None = None


@dataclass
class Result:
    figures: list[Figure]
    issues: list[Issue]
    changes: dict[str, Decimal]


def read_lines(path: Path) -> list[tuple[int, str]]:
    with pdfplumber.open(path) as pdf:
        return [
            (number, text.strip())
            for number, page in enumerate(pdf.pages, start=1)
            for text in (page.extract_text() or "").split("\n")
            if text.strip()
        ]


def parse_summary(path: Path, report_year: int, lines: dict[str, Line], aliases: list[Alias]) -> Result:
    text = read_lines(path)
    issues: list[Issue] = []
    start = next((index for index, (_, line) in enumerate(text) if START.search(line)), None)
    if start is None:
        return Result([], [Issue("error", "no_highlights_section", "", "No financial highlights heading found")], {})

    years: tuple[int, int] | None = None
    found: dict[str, tuple[list[Decimal | None], str | None, str, int]] = {}
    buffer: list[str] = []
    ended = False

    region = text[start + 1 :]
    for index, (page, line) in enumerate(region):
        if not ended and END.search(line) and found:
            ended = True
        if ended and all(code in found for code in CORE):
            break
        if years is None and not found and (header := HEADER_YEARS.search(line)):
            years = (int(header.group(1)), int(header.group(2)))
            buffer = []
            continue
        row = ROW.match(line)
        if not row:
            buffer = (buffer + [line])[-LABEL_LINES:]
            continue
        amounts = [parse_amount(token) for token in TOKEN.findall(row.group("amounts"))]
        following = []
        for _, after in region[index + 1 : index + 1 + LABEL_LINES]:
            if ROW.match(after):
                break
            following.append(after)
        hit = label_match(row.group("label"), buffer, following, lines, aliases)
        buffer = []
        if hit is None:
            continue
        code, variant, label = hit
        if ended and code not in CORE:
            continue
        if ended:
            issues.append(Issue("warning", "found_after_section_end", code, "Row read after the next section heading", page))
        if code in found:
            if found[code][0][:2] != amounts[:2]:
                issues.append(Issue("error", "conflicting_values", code, f"Second row '{label}' disagrees with the first", page))
            continue
        found[code] = (amounts, variant, label, page)

    if years is None or years[0] == years[1]:
        kind = "header_years_missing" if years is None else "header_years_repeated"
        issues.append(Issue("warning", kind, "", "Column years unreadable; assumed current year then prior year"))
        years = (report_year, report_year - 1)
    if sorted(years) != [report_year - 1, report_year]:
        issues.append(Issue("error", "header_year_mismatch", "", f"Columns are {years[0]} and {years[1]}, report year is {report_year}"))

    figures: list[Figure] = []
    changes: dict[str, Decimal] = {}
    for code, (amounts, variant, label, page) in found.items():
        for year, value in zip(years, amounts[:2]):
            if value is not None:
                figures.append(Figure(code, year, value, variant, label, page))
        if len(amounts) > 2 and amounts[2] is not None:
            changes[code] = amounts[2]
    for code in CORE:
        if code not in found:
            issues.append(Issue("warning", "line_not_found", code, f"{lines[code].label} not found"))
    return Result(figures, issues, changes)


def label_match(same_line: str, buffer: list[str], following: list[str], lines: dict[str, Line], aliases: list[Alias]):
    """Try the row's label with wrapped lines above it, longest first, then with the line below.

    Some tables center the numbers in a two-line cell, so the label reads "Government", numbers, "Equity".
    """
    candidates = [" ".join(buffer[index:] + [same_line]).strip() for index in range(len(buffer))]
    candidates.append(same_line.strip())
    if following:
        candidates += [f"{candidate} {following[0]}" for candidate in candidates[-2:]]
    for candidate in candidates:
        if candidate and (hit := match(candidate, aliases, "executive_summary", lines)):
            # A qualifier left open, "(Includes Subsidy from", continues below the numbers.
            for count in range(1, len(following) + 1):
                if candidate.count("(") <= candidate.count(")"):
                    break
                longer = " ".join([candidate, *following[:count]])
                if longer.count("(") <= longer.count(")") and (completed := match(longer, aliases, "executive_summary", lines)):
                    return completed[0], completed[1], longer
            return hit[0], hit[1], candidate
    return None
