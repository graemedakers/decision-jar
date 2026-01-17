/**
 * WizardFrame Type Definitions
 * 
 * These types power the universal AI Planner wizard engine.
 * New planners can be created by defining a WizardConfig object
 * without writing custom React components.
 */

import { LucideIcon } from 'lucide-react';

// ============================================
// WIZARD FIELD TYPES
// ============================================

export type WizardFieldType =
    | 'text'
    | 'number'
    | 'select'
    | 'multi-select'
    | 'toggle'
    | 'location'
    | 'slider'
    | 'button-group';

export interface WizardFieldBase {
    id: string;
    label: string;
    type: WizardFieldType;
    defaultValue: any;
    placeholder?: string;
    helpText?: string;
    required?: boolean;
    hidden?: boolean | ((formData: Record<string, any>) => boolean);
}

export interface WizardSelectField extends WizardFieldBase {
    type: 'select' | 'multi-select' | 'button-group';
    options: Array<{
        value: string;
        label: string;
        icon?: LucideIcon;
    }>;
}

export interface WizardNumberField extends WizardFieldBase {
    type: 'number' | 'slider';
    min?: number;
    max?: number;
    step?: number;
}

export interface WizardTextField extends WizardFieldBase {
    type: 'text' | 'location';
    maxLength?: number;
}

export interface WizardToggleField extends WizardFieldBase {
    type: 'toggle';
    onLabel?: string;
    offLabel?: string;
}

export type WizardField =
    | WizardSelectField
    | WizardNumberField
    | WizardTextField
    | WizardToggleField;

// ============================================
// WIZARD RESULT TYPES
// ============================================

export interface WizardResultItem {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    metadata?: Record<string, string | number>;
    tags?: string[];
    actions?: WizardResultAction[];
    raw?: any; // Original API response for custom mapping
}

export interface WizardResultAction {
    id: string;
    label: string;
    icon?: LucideIcon;
    variant?: 'primary' | 'secondary' | 'ghost';
    handler?: string; // 'add-to-jar' | 'favorite' | 'regenerate' | 'share'
}

// ============================================
// WIZARD STATE MACHINE
// ============================================

export type WizardStep = 'INPUT' | 'GENERATING' | 'REVIEWING' | 'SUCCESS' | 'ERROR';

export interface WizardState {
    step: WizardStep;
    formData: Record<string, any>;
    results: WizardResultItem[];
    error?: string;
    addedItems: Set<string>;
}

// ============================================
// WIZARD CONFIGURATION
// ============================================

export interface WizardConfig {
    // Identity
    id: string;
    title: string;
    subtitle?: string;
    icon: LucideIcon;
    iconColor?: string; // Tailwind color class like 'text-green-500'
    headerGradient?: string; // 'from-green-50 to-emerald-50'

    // API
    apiRoute: string;

    // Form
    fields: WizardField[];

    // Loading UX
    loadingTitle?: string;
    loadingPhrases: string[];
    estimatedSeconds?: number;

    // Results
    resultLayout: 'list' | 'grid' | 'timeline';
    resultTitle?: string | ((count: number) => string);

    // Mapping AI response to WizardResultItem[]
    parseResults: (apiResponse: any) => WizardResultItem[];

    // Mapping a result item to the Idea schema for persistence
    mapToIdea: (item: WizardResultItem, formData: Record<string, any>) => {
        description: string;
        details?: string;
        category?: string;
        cost?: string;
        isPrivate?: boolean;
        [key: string]: any;
    };

    // Category for jar (used in handleAddToJar)
    ideaCategory: string;

    // Feature flags
    allowRegenerate?: boolean;
    allowFavorite?: boolean;
    allowShare?: boolean;
    showPrivacyToggle?: boolean;
}

// ============================================
// WIZARD CALLBACKS
// ============================================

export interface WizardCallbacks {
    onClose: () => void;
    onIdeaAdded?: () => void;
    onFavoriteUpdated?: () => void;
}

// ============================================
// WIZARD PROPS
// ============================================

export interface WizardFrameProps {
    isOpen: boolean;
    config: WizardConfig;
    userLocation?: string;
    isPremium?: boolean;
    callbacks: WizardCallbacks;
}
