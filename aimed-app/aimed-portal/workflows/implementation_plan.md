# Implementation Plan: Dashboard Analytics & History Filters

This plan focuses on implementing medical productivity analytics and enhanced history management.

## Proposed Changes

### [Core Logic]

#### [NEW] [analytics.ts](file:///Users/riadokic/Desktop/aimed-portal/aimed-app/src/lib/analytics.ts)
- `calculateTimeSaved(sections: ReportSection[]): number`
    - Counts words in all section content.
    - `manual_min = (words / 120) * 1.3`.
    - `ai_min = 1.0` (fixed processing + review time).
    - `savings = Math.max(0, manual_min - ai_min)`.

### [Dashboard UI]

#### [MODIFY] [page.tsx](file:///Users/riadokic/Desktop/aimed-portal/aimed-app/src/app/page.tsx)
- Re-calculate stats for "Danas", "Ovaj mjesec", and "Ukupno".
- Include total minutes saved in stats.
- Remove instruction sections ("Snimite glas", etc.).
- Add a visual graph (SVG/Framer Motion) representing time saved over the last 7 days.

### [History UI]

#### [MODIFY] [historija/page.tsx](file:///Users/riadokic/Desktop/aimed-portal/aimed-app/src/app/historija/page.tsx)
- Implementation of collapsible date groups (Danas, Jučer, Prošla sedmica, Ranije).
- Add filter controls for time periods (Danas, Ovaj mjesec, Svi).
- Consistent `DD.MM.YYYY.` formatting for all dates.

## Verification Plan

### Manual Verification
1.  **Dashboard**: Verify stats and graph correctly reflect history entries.
2.  **History**: Test period filters and verify date grouping logic.
3.  **UI**: Ensure Attio style (white space, typography, Inter font) is maintained.
