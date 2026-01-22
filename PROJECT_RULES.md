# Project Rules & Principles

## 1. AI for Intelligence, Frontend for Display
**Core Principle**: Any task involving interpretation, extraction, or data structuring must be delegated to the AI. The Frontend's sole responsibility is to display provided data in a polished format.

### Guidelines:
- **Strict JSON Schemas**: All AI prompts (Concierge, Generators) must return strict, well-defined JSON.
- **No Scrapers**: Avoid writing complex regex or string-splitting logic in the frontend to "scrape" data out of markdown blocks.
- **Data Cleanliness**: AI is responsible for ensuring titles and descriptions are clean (e.g., no markdown headers or meta-text inside data fields).
- **Presentation Logic**: React components should handle the styling, iconography, and layout based on raw data fields provided by the AI.

## 2. Component Design
- **Standardized Detail Views**: Use specific detail components (`RecipeDetails`, `MovieDetails`) that map 1:1 with AI schemas.
- **Compact vs. Expanded**: Components should handle these two states gracefully to fit both card previews and full-screen modals.
