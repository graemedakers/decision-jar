# Future Tasks

## 1. Wizard Component (Optimization)
- **Problem**: Planners (`MenuPlanner`, `BarCrawlPlanner`, `WeekendPlanner`) use duplicated logic for multi-step "Wizard" flows (Input -> AI Generation -> Results -> Save).
- **Goal**: Create a reusable `<WizardModal>` component or a `useWizard` hook that abstracts:
    - Step management (Input vs Loading vs Result)
    - AI API calling state
    - Caching/Restoring results
    - "Add to Jar" common logic
- **Benefit**: Reduces code duplication and makes creating new AI tools significantly faster.
- **Estimated Effort**: Medium (Refactoring existing complex components).

## 2. CalendarModal Refactor
- Check if `CalendarModal` can be simplified or if it overlaps with `DateNightPlanner`.
