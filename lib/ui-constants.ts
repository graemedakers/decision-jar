/**
 * UI Constants - Single source of truth for all UI text strings
 * 
 * Benefits:
 * - Change text in one place
 * - Ensures consistency across the app
 * - Makes i18n/translation easier
 * - Type-safe with autocomplete
 */

// ============================================================================
// ACTION BUTTON LABELS
// ============================================================================

export const ACTION_LABELS = {
  // Primary action - selecting an idea to do
  DO_THIS: "I'll do this!",

  // Jar actions
  ADD_TO_JAR: "Add to Jar",
  JAR: "Jar",

  // Sharing
  SHARE: "Share",

  // View actions
  VIEW_DETAILS: "View Details",
  VIEW_MAP: "View Map",
  VIEW_ON_MAP: "View on Map",
  VISIT_WEBSITE: "Visit Website",
  VIEW_WEB: "View Web",
  VIEW_MENU: "View Menu",
  VIEW_ITINERARY: "View Itinerary",

  // Loading/State labels
  ADDING: "Adding...",
  ADDED: "Added",
  SAVING: "Saving...",
  SAVED: "Saved",
  LOADING: "Loading...",
  DELETING: "Deleting...",

  // Navigation
  CANCEL: "Cancel",
  CLOSE: "Close",
  BACK: "Back",
  NEXT: "Next",
  DONE: "Done",
  CONTINUE: "Continue",

  // CRUD operations
  DELETE: "Delete",
  REMOVE: "Remove",
  EDIT: "Edit",
  SAVE: "Save",
  CREATE: "Create",
  UPDATE: "Update",

  // Confirmation
  CONFIRM: "Confirm",
  YES: "Yes",
  NO: "No",
  OK: "OK",
} as const;

// ============================================================================
// MODAL TITLES
// ============================================================================

export const MODAL_TITLES = {
  ADD_IDEA: "Add New Idea",
  EDIT_IDEA: "Edit Idea",
  AI_CONCIERGE: "AI Concierge",
  TEMPLATE_BROWSER: "Browse Templates",
  JAR_SETTINGS: "Jar Settings",
  PREMIUM: "Upgrade to Premium",
} as const;

// ============================================================================
// MESSAGES
// ============================================================================

export const MESSAGES = {
  SUCCESS: {
    IDEA_ADDED: "Idea added to your jar!",
    IDEA_SAVED: "Changes saved successfully!",
    IDEA_DELETED: "Idea deleted successfully!",
  },
  ERROR: {
    GENERIC: "Something went wrong. Please try again.",
    NETWORK: "Network error. Check your connection.",
    UNAUTHORIZED: "You don't have permission to do that.",
  },
} as const;

// ============================================================================
// TYPE EXPORTS (for TypeScript autocomplete)
// ============================================================================

export type ActionLabel = typeof ACTION_LABELS[keyof typeof ACTION_LABELS];
export type ModalTitle = typeof MODAL_TITLES[keyof typeof MODAL_TITLES];
