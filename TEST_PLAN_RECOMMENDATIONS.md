# Future Efficient Testing Recommendations
Based on the Independent Technical Review, the Code Review Report, and the current state of the automated test suite, here are the recommendations for future efficient testing.

## 1. Expand E2E Automation (Critical Paths)
The following areas from the Testing Checklist are currently manual and should be automated in Playwright to prevent regressions:

- **AI Concierge Tools**: Test the logic of generating ideas via specialized concierges (Dining, Movie, etc.) and ensuring "Add to Jar" preserves the structured `typeData`.
- **Template Onboarding**: Verify that new users can successfully populate their jar from templates without errors.
- **Voting System**: Automate a full voting cycle (Start Vote → Cast Vote → Wait for End → Reveal Winner).
- **Premium Upgrade Flow**: Test the UI transitions when a user becomes Pro (unlocking concierges, removing limits).

## 2. Address Edge-Case Regressions
The Code Review (Jan 9) identified several untested edge cases that led to bugs:

- **Context Switching**: Verify what happens when a user switches the active jar while a long-running process (like an AI search) is active.
- **Race Conditions**: Test `invalidateQueries` behavior during optimistic updates.
- **Hydration Sync**: Ensure modals open correctly even if the page is still hydrating (already partially addressed in `golden-path.spec.ts`).

## 3. Tooling & Infrastructure Improvements
- **Test Data Factories**: Create a utility to seed the database with specific states (e.g., a jar with 50 ideas, a jar with an active vote session) to avoid slow manual setup in E2E tests.
- **AI Response Mocks**: Standardize the `playwright route.fulfill` patterns to test how the UI handles various AI failures (timeouts, malformed JSON, empty results).
- **Visual Regression Testing**: Use `expect(page).toHaveScreenshot()` for critical UI components (Jar visualization, Date Reveal modal) to catch glassmorphism and animation glitches.

## 4. Continuous Integration (CI)
- **Run on Every PR**: Ensure Playwright tests run on every Pull Request.
- **Capture Traces**: Enable `trace: 'on-first-retry'` in `playwright.config.ts` to automatically capture videos and DOM snapshots for debugging.

## 5. Standardize Error Assertions
Avoid generic `.toBeVisible()` checks for error states. Instead, check for specific toast messages using the Sonner-specific selectors if possible, or at least regex matching on the text:

```typescript
await expect(page.locator('text=/only the jar owner/i')).toBeVisible();
```
