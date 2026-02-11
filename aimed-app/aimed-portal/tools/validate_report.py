"""
Validate a report_text response from the AIMED webhook.

Checks:
- All expected sections are present
- No empty sections
- Warnings (NAPOMENA) are detected and listed
- Text encoding is correct (Bosnian diacritics)

Usage:
  python tools/validate_report.py <report_file.txt>
  echo "REPORT TEXT" | python tools/validate_report.py

Can also be imported and used programmatically:
  from validate_report import validate_report
  result = validate_report(report_text)
"""

import sys
from dataclasses import dataclass, field

EXPECTED_SECTIONS = [
    "DATUM PREGLEDA",
    "PODACI O PACIJENTU",
    "ANAMNEZA",
    "STATUS",
    "DIJAGNOZA",
    "TERAPIJA",
    "PREPORUKE / KONTROLA",
]

BOSNIAN_CHARS = set("čćšžđČĆŠŽĐ")


@dataclass
class ValidationResult:
    is_valid: bool = True
    sections_found: list[str] = field(default_factory=list)
    sections_missing: list[str] = field(default_factory=list)
    empty_sections: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    has_diacritics: bool = False
    issues: list[str] = field(default_factory=list)


def validate_report(text: str) -> ValidationResult:
    result = ValidationResult()

    if not text or not text.strip():
        result.is_valid = False
        result.issues.append("Report text is empty")
        return result

    lines = text.strip().split("\n")

    # Parse sections
    current_section = None
    section_content: dict[str, str] = {}

    for line in lines:
        trimmed = line.strip()
        if not trimmed:
            continue

        if trimmed.startswith("[NAPOMENA"):
            result.warnings.append(trimmed)
            continue

        if trimmed == trimmed.toUpperCase() if hasattr(trimmed, 'toUpperCase') else trimmed == trimmed.upper() and len(trimmed) > 2 and not trimmed.startswith("["):
            current_section = trimmed
            section_content[current_section] = ""
        elif current_section:
            section_content[current_section] += trimmed + "\n"

    result.sections_found = list(section_content.keys())

    # Check for expected sections
    for section in EXPECTED_SECTIONS:
        if section not in section_content:
            result.sections_missing.append(section)

    # Check for empty sections
    for section, content in section_content.items():
        if not content.strip():
            result.empty_sections.append(section)

    # Check diacritics
    result.has_diacritics = any(c in BOSNIAN_CHARS for c in text)

    # Determine validity
    if len(result.sections_found) < 3:
        result.is_valid = False
        result.issues.append(f"Only {len(result.sections_found)} sections found (minimum 3)")

    if result.empty_sections:
        result.issues.append(f"Empty sections: {', '.join(result.empty_sections)}")

    if not result.has_diacritics:
        result.issues.append("No Bosnian diacritics found — possible encoding issue")

    return result


def print_report(result: ValidationResult):
    status = "PASS" if result.is_valid else "FAIL"
    print(f"Validation: {status}")
    print(f"Sections found ({len(result.sections_found)}): {', '.join(result.sections_found)}")

    if result.sections_missing:
        print(f"Sections missing ({len(result.sections_missing)}): {', '.join(result.sections_missing)}")

    if result.empty_sections:
        print(f"Empty sections: {', '.join(result.empty_sections)}")

    if result.warnings:
        print(f"Warnings ({len(result.warnings)}):")
        for w in result.warnings:
            print(f"  {w}")

    print(f"Bosnian diacritics: {'Yes' if result.has_diacritics else 'No'}")

    if result.issues:
        print(f"Issues:")
        for issue in result.issues:
            print(f"  - {issue}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            text = f.read()
    elif not sys.stdin.isatty():
        text = sys.stdin.read()
    else:
        print(__doc__)
        sys.exit(1)

    result = validate_report(text)
    print_report(result)
    sys.exit(0 if result.is_valid else 1)
