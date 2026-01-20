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
    | null;

interface ModalContextType {
    activeModal: ModalType;
    modalProps: any;
    openModal: (type: ModalType, props?: any) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [modalProps, setModalProps] = useState<any>({});

    const openModal = useCallback((type: ModalType, props: any = {}) => {
        setModalProps(props);
        setActiveModal(type);
    }, []);

    const closeModal = useCallback(() => {
        setActiveModal(null);
        setModalProps({});
    }, []);

    return (
        <ModalContext.Provider value={{ activeModal, modalProps, openModal, closeModal }}>
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
