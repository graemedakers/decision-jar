# Task: Context-Aware Categories

## Status: Completed

## Changes Implemented:
1.  **Category Definitions (`lib/categories.ts`)**: Created a centralized mapping of Jar Topics (Food, Movies, Activities, etc.) to specific Categories (Restaurant, Cinema, Hiking, etc.).
2.  **Add Idea Modal**: Updated to dynamically render category buttons based on the user's current jar topic.
3.  **Spin Filters**: Updated to filter by the specific categories relevant to the jar.
4.  **Dashboard Integration**: Logic added to determine the active jar's topic and pass it to the modals.
5.  **Documentation**: Updated `USER_MANUAL.md` to explain the new Topic feature.

## Notes:
- Existing jars will default to "General" topic (Activity, Meal, Event).
- New jars can select a validated topic during creation (implemented in previous session).
- Custom categories are supported in the database as strings, ensuring flexibility.
