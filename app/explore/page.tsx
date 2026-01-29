"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { PremiumModal } from "@/components/PremiumModal";
import { useRouter } from "next/navigation";





import { getApiUrl } from "@/lib/utils";
import { DashboardModals } from "@/components/DashboardModals";
import { useModalSystem } from "@/components/ModalProvider";
import { getJarLabels } from "@/lib/labels";
import { SmartToolsGrid } from "@/components/SmartToolsGrid";

export default function ExplorePage() {
    const [isPremium, setIsPremium] = useState(false);
    const [jarTopic, setJarTopic] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<string | null>(null);
    const [userData, setUserData] = useState<any>(null);

    // Modals
    const { openModal } = useModalSystem();
    const router = useRouter();

    const fetchUser = async () => {
        try {
            const res = await fetch(getApiUrl('/api/auth/me'));
            if (res.ok) {
                const data = await res.json();
                if (data?.user) {
                    const userIsPremium = !!data.user.isPremium;
                    setIsPremium(userIsPremium);
                    localStorage.setItem('datejar_is_premium', userIsPremium.toString());
                    if (data.user.location) {
                        setUserLocation(data.user.location);
                        localStorage.setItem('datejar_user_location', data.user.location);
                    }
                    if (data.user.jarTopic) setJarTopic(data.user.jarTopic);
                    setUserData(data.user);
                }
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

    useEffect(() => {
        // Optimistically load premium status and location from cache
        try {
            const cachedPremium = localStorage.getItem('datejar_is_premium');
            if (cachedPremium) {
                setIsPremium(cachedPremium === 'true');
            }
            const cachedLocation = localStorage.getItem('datejar_user_location');
            if (cachedLocation) {
                setUserLocation(cachedLocation);
            }
        } catch (e) {
            // Ignore cache errors
        }

        fetchUser();
    }, []);

    const labels = getJarLabels(jarTopic || undefined);
    const activityPlannerTitle = labels.plannerTitle;

    return (
        <main className="page-with-nav min-h-screen pt-4 pb-24 px-4 md:px-8 relative w-full max-w-2xl mx-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Explore</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Discover ideas to fill your jar or do right now.</p>

            <SmartToolsGrid
                isPremium={isPremium}
                jarTopic={jarTopic || 'General'}
                activityPlannerTitle={activityPlannerTitle}
            />

            {/* Modals via DashboardModals */}
            <DashboardModals
                isPremium={isPremium}
                userData={userData}
                ideas={[]}
                userLocation={userLocation}
                setUserLocation={setUserLocation}
                combinedLocation={userLocation || ""}
                jarTopic={jarTopic || "General"}
                level={userData?.level || 1}
                favoritesCount={0}
                hasPaid={userData?.hasPaid || false}
                coupleCreatedAt={userData?.coupleCreatedAt || ""}
                isTrialEligible={userData?.isTrialEligible !== false}
                availableJars={userData?.memberships?.map((m: any) => ({
                    id: m.jar.id,
                    name: m.jar.name || 'Unnamed Jar',
                    topic: m.jar.topic,
                })) || []}
                handleContentUpdate={fetchUser}
                fetchFavorites={() => { }}
                fetchIdeas={() => { }}
                refreshUser={fetchUser}
                handleSpinJar={() => { }}
                showConfetti={false}
                setShowConfetti={() => { }}
            />
        </main>
    );
}

