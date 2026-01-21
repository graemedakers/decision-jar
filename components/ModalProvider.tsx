"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ModalType =
    | 'PREMIUM'
    | 'ADD_IDEA'
    | 'CREATE_JAR'
    | 'JOIN_JAR'
    | 'SETTINGS'
    | 'FILTERS'
    | 'SPIN_FILTERS'
    | 'SURPRISE_ME'
    | 'QUICK_TOOLS'
    | 'WEEKEND_PLANNER'
    | 'DATE_NIGHT_PLANNER'
    | 'DINNER_PARTY_CHEF'
    | 'MENU_PLANNER'
    | 'BAR_CRAWL_PLANNER'
    | 'ADMIN_CONTROLS'
    | 'TEMPLATE_BROWSER'
    | 'COMMUNITY_ADMIN'
    | 'REVIEW_APP'
    | 'HELP'
    | 'FAVORITES'
    | 'RATE_DATE'
    | 'DELETE_CONFIRM'
    | 'DATE_REVEAL'
    | 'CONCIERGE'
    | 'PREMIUM_WELCOME_TIP'
    | 'LEVEL_UP'
    | 'JAR_QUICKSTART'
    | 'JAR_MEMBERS'
    | 'MOVE_IDEA'
    | 'TOOLS'
    | 'ADD_MEMORY'
    | 'TRIAL_EXPIRED'
    | 'GIFT_JAR'
    | 'GIFT_MANAGER'
    | 'MY_GIFTS'
    | 'BULK_IDEA_PREVIEW'
    | null;

interface ModalInstance {
    type: ModalType;
    props: any;
}

interface ModalContextType {
    modalStack: ModalInstance[];
    activeModal: ModalType; // Top of the stack
    modalProps: any; // Props for the top of the stack
    openModal: (type: ModalType, props?: any) => void;
    closeModal: () => void;
    closeAllModals: () => void;
    isModalOpen: (type: ModalType) => boolean;
    getModalProps: (type: ModalType) => any;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modalStack, setModalStack] = useState<ModalInstance[]>([]);

    const openModal = useCallback((type: ModalType, props: any = {}) => {
        setModalStack(prev => {
            // Prevent duplicate modals of the same type in the stack if it's already there?
            // For now, let's just push. If it's already at the top, ignore.
            if (prev.length > 0 && prev[prev.length - 1].type === type) return prev;
            return [...prev, { type, props }];
        });
    }, []);

    const closeModal = useCallback(() => {
        setModalStack(prev => prev.slice(0, -1));
    }, []);

    const closeAllModals = useCallback(() => {
        setModalStack([]);
    }, []);

    const isModalOpen = useCallback((type: ModalType) => {
        return modalStack.some(m => m.type === type);
    }, [modalStack]);

    const getModalProps = useCallback((type: ModalType) => {
        return modalStack.find(m => m.type === type)?.props || {};
    }, [modalStack]);

    const activeModal = modalStack.length > 0 ? modalStack[modalStack.length - 1].type : null;
    const modalProps = modalStack.length > 0 ? modalStack[modalStack.length - 1].props : {};

    return (
        <ModalContext.Provider value={{
            modalStack,
            activeModal,
            modalProps,
            openModal,
            closeModal,
            closeAllModals,
            isModalOpen,
            getModalProps
        }}>
            {children}
        </ModalContext.Provider>
    );
}

export function useModalSystem() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModalSystem must be used within a ModalProvider');
    }
    return context;
}
