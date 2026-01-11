

import { useState } from "react";
import { isDemoMode, addDemoIdea } from "@/lib/demo-storage";
import { trackEvent } from "@/lib/analytics";
import { showSuccess, showError, showInfo } from "@/lib/toast";
import { logger } from "@/lib/logger";

interface ConciergeActionProps {
    onIdeaAdded?: () => void;
    onGoTonight?: (idea: any) => void;
    onFavoriteUpdated?: () => void;
    onClose: () => void;
    setRecommendations: React.Dispatch<React.SetStateAction<any[]>>;
}

export function useConciergeActions({
    onIdeaAdded,
    onGoTonight,
    onFavoriteUpdated,
    onClose,
    setRecommendations
}: ConciergeActionProps) {
    const [isAddingToJar, setIsAddingToJar] = useState(false);

    const formatDetails = (rec: any) => {
        if (rec.details) return rec.details;
        let parts = [rec.description];
        if (rec.cinema_name) parts.push(`Cinema: ${rec.cinema_name}`);
        if (rec.showtimes) parts.push(`Showtimes: ${rec.showtimes}`);
        if (rec.address) parts.push(`Address: ${rec.address}`);
        if (rec.price) parts.push(`Price: ${rec.price}`);
        if (rec.website) parts.push(`${rec.showtimes ? 'Tickets' : 'Website'}: ${rec.website}`);
        if (rec.opening_hours) parts.push(`Hours: ${rec.opening_hours}`);
        if (rec.google_rating) parts.push(`Rating: ${rec.google_rating}`);
        return parts.filter(Boolean).join('\n\n');
    };

    const handleAddToJar = async (rec: any, category: string = "ACTIVITY", isPrivate: boolean = true) => {
        // FIX 1: Prevent duplicate clicks
        if (isAddingToJar) {
            logger.info('Already adding idea, please wait...');
            return;
        }

        setIsAddingToJar(true);

        try {
            // Check if we're in demo mode
            if (isDemoMode()) {
                try {
                    // Use demo storage
                    const demoIdea = {
                        description: rec.name,
                        details: formatDetails(rec),
                        indoor: true,
                        duration: "2.0",
                        activityLevel: "LOW",
                        cost: (rec.price && rec.price.length > 2) ? "$$$" : (rec.price && rec.price.length > 1) ? "$$" : "$",
                        timeOfDay: "EVENING",
                        category: category,
                        isPrivate: isPrivate
                    };

                    addDemoIdea(demoIdea);

                    // Mark as added in local state
                    setRecommendations(prev => prev.map(item =>
                        (item.name === rec.name) ? { ...item, isAdded: true } : item
                    ));

                    if (onIdeaAdded) onIdeaAdded();
                    showSuccess("✅ Added to your Jar! (Demo Mode)");
                    return;
                } catch (error) {
                    logger.error("Failed to add demo idea:", error);
                    alert("Failed to add to jar.");
                    return;
                }
            }

            // Regular authenticated mode
            const res = await fetch('/api/ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: rec.name,
                    details: formatDetails(rec),
                    indoor: true,
                    duration: "2.0",
                    activityLevel: "LOW",
                    cost: (rec.price && rec.price.length > 2) ? "$$$" : (rec.price && rec.price.length > 1) ? "$$" : "$",
                    timeOfDay: "EVENING",
                    category: category,
                    isPrivate: isPrivate
                }),
            });

            if (res.ok) {
                // FIX 4: Track successful idea addition
                trackEvent('idea_added_from_concierge', {
                    category: category,
                    is_private: isPrivate,
                    source: 'concierge_tool'
                });

                // Mark as added in local state to prevent confusion
                setRecommendations(prev => prev.map(item =>
                    (item.name === rec.name) ? { ...item, isAdded: true } : item
                ));

                if (onIdeaAdded) onIdeaAdded();
                showSuccess("✅ Added to jar!");
            } else {
                const err = await res.json();

                // Special handling for "No active jar" or "Jar not found" errors
                if (err.error && (err.error.includes('No active jar') || err.error.includes('No active jar found') || err.error.includes('Jar not found'))) {

                    // FIX 2: Check if user has existing jars first
                    try {
                        const jarsRes = await fetch('/api/jars/list');
                        if (jarsRes.ok) {
                            const { jars } = await jarsRes.json();

                            if (jars && jars.length > 0) {
                                // User has jars but none are active
                                const jarList = jars.map((j: any, idx: number) =>
                                    `${idx + 1}. ${j.name} (${j._count?.ideas || 0} ideas)`
                                ).join('\n');

                                const message = `You have ${jars.length} jar(s) but none are active:\n\n${jarList}\n\n` +
                                    `Choose:\n` +
                                    `• OK: Use "${jars[0].name}"\n` +
                                    `• Cancel: Create a new jar`;

                                const useExisting = window.confirm(message);

                                if (useExisting) {
                                    // Set first jar as active and retry
                                    const firstJar = jars[0];

                                    // Set as active using switch endpoint
                                    await fetch('/api/auth/switch-jar', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ jarId: firstJar.id })
                                    });

                                    // Retry adding idea
                                    const retryRes = await fetch('/api/ideas', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            description: rec.name,
                                            details: formatDetails(rec),
                                            indoor: true,
                                            duration: "2.0",
                                            activityLevel: "LOW",
                                            cost: (rec.price && rec.price.length > 2) ? "$$$" : (rec.price && rec.price.length > 1) ? "$$" : "$",
                                            timeOfDay: "EVENING",
                                            category: category,
                                            isPrivate: isPrivate
                                        }),
                                    });

                                    if (retryRes.ok) {
                                        trackEvent('idea_added_to_existing_jar', {
                                            jar_name: firstJar.name,
                                            category: category
                                        });
                                        alert(`✅ Added to "${firstJar.name}"!`);
                                        if (onIdeaAdded) onIdeaAdded();
                                        return;
                                    }
                                }
                                // Fall through to create new jar if user chose Cancel
                            }
                        }
                    } catch (jarsError: any) {
                        logger.warn('Failed to check existing jars:', { error: jarsError });
                        // Fall through to normal creation flow
                    }

                    // Proceed with jar creation flow
                    const userWantsToCreateJar = window.confirm(
                        "Create a new jar for this idea?\n\n" +
                        "We'll set it up automatically!"
                    );

                    if (userWantsToCreateJar) {
                        try {
                            // Show loading indicator
                            const loadingMsg = document.createElement('div');
                            loadingMsg.id = 'jar-creation-loading';
                            loadingMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.9);color:white;padding:20px 30px;border-radius:12px;z-index:10000;font-size:16px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.5);';
                            loadingMsg.innerHTML = '⏳ Creating jar...<br><span style="font-size:14px;opacity:0.8;margin-top:8px;display:block;">Please wait</span>';
                            document.body.appendChild(loadingMsg);

                            // Determine jar topic based on category
                            let jarTopic = "Activities";
                            let jarName = "My Ideas";

                            if (category === "MEAL") {
                                jarTopic = "Dining";
                                jarName = "Dining Ideas";
                            } else if (category === "DRINK") {
                                jarTopic = "Nightlife";
                                jarName = "Bar & Drinks";
                            } else if (category === "ACTIVITY" || category === "EVENT") {
                                jarTopic = "Activities";
                                jarName = "Activity Ideas";
                            }

                            // Create jar automatically
                            const createRes = await fetch('/api/jars', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    name: jarName,
                                    type: 'GENERIC',
                                    topic: jarTopic,
                                    selectionMode: 'RANDOM'
                                })
                            });

                            if (!createRes.ok) {
                                const errorData = await createRes.json();

                                // FIX 3: Better jar limit error handling
                                if (createRes.status === 403 && errorData.error && errorData.error.includes('Limit reached')) {
                                    document.getElementById('jar-creation-loading')?.remove();

                                    const upgradeNow = window.confirm(
                                        '🔒 Jar Limit Reached\n\n' +
                                        `You've hit your jar limit on the Free plan.\n\n` +
                                        `${errorData.error}\n\n` +
                                        `Upgrade to Pro for unlimited jars plus premium AI tools!\n\n` +
                                        `Click OK to see pricing, or Cancel to stay.`
                                    );

                                    if (upgradeNow) {
                                        window.location.href = '/dashboard?upgrade=pro';
                                    }

                                    // FIX 4: Track upgrade prompt
                                    trackEvent('jar_limit_upgrade_prompt', {
                                        source: 'concierge_auto_create',
                                        category: category,
                                        user_clicked_upgrade: upgradeNow
                                    });

                                    return;
                                }

                                // Other jar creation errors
                                logger.error('Jar creation failed:', errorData);
                                const errorMsg = errorData.details
                                    ? `${errorData.error}: ${errorData.details}${errorData.type ? ` (${errorData.type})` : ''}`
                                    : errorData.error || 'Failed to create jar';
                                throw new Error(errorMsg);
                            }

                            const newJar = await createRes.json();

                            // Now add the idea to the new jar
                            const addRes = await fetch('/api/ideas', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    description: rec.name,
                                    details: formatDetails(rec),
                                    indoor: true,
                                    duration: "2.0",
                                    activityLevel: "LOW",
                                    cost: (rec.price && rec.price.length > 2) ? "$$$" : (rec.price && rec.price.length > 1) ? "$$" : "$",
                                    timeOfDay: "EVENING",
                                    category: category,
                                    isPrivate: isPrivate
                                }),
                            });

                            if (addRes.ok) {
                                document.getElementById('jar-creation-loading')?.remove();

                                // FIX 4: Track successful auto-jar creation
                                trackEvent('jar_auto_created_success', {
                                    jar_name: jarName,
                                    jar_topic: jarTopic,
                                    category: category,
                                    idea_name: rec.name
                                });

                                alert(`✅ Created "${jarName}" jar and added your idea!\n\nReturning to dashboard...`);
                                if (onIdeaAdded) onIdeaAdded();
                                window.location.href = '/dashboard';
                            } else {
                                document.getElementById('jar-creation-loading')?.remove();
                                const addError = await addRes.json();
                                logger.error('Failed to add idea:', addError);
                                alert(`Jar created, but failed to add idea:\n${addError.error || 'Unknown error'}`);
                            }
                        } catch (error: any) {
                            document.getElementById('jar-creation-loading')?.remove();
                            logger.error('Failed to auto-create jar:', error);
                            alert(`Failed to create jar automatically:\n${error.message || error}\n\nPlease check console for details.`);
                            window.location.href = '/dashboard';
                        }
                    } else {
                        // FIX 4: Track when user declined jar creation
                        trackEvent('jar_auto_create_declined', {
                            category: category,
                            idea_name: rec.name
                        });
                    }
                    return;
                }

                // Other errors
                showError(`Failed to add: ${err.error || 'Server error'}`);
            }
        } catch (error) {
            logger.error("Failed to add to jar:", error);
            showError("Failed to add to jar.");
        } finally {
            // FIX 1: Always reset loading state
            setIsAddingToJar(false);
        }
    };

    const handleGoTonight = async (rec: any, category: string = "ACTIVITY", isPrivate: boolean = true) => {
        const ideaData = {
            description: rec.name,
            details: formatDetails(rec),
            indoor: true,
            duration: 2.0,
            activityLevel: "LOW",
            cost: (rec.price && rec.price.length > 2) ? "$$$" : (rec.price && rec.price.length > 1) ? "$$" : "$",
            timeOfDay: "EVENING",
            category: category,
            website: rec.website,
            address: rec.address,
            openingHours: rec.opening_hours,
            googleRating: rec.google_rating,
            isPrivate: isPrivate
        };

        try {
            const res = await fetch('/api/ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...ideaData,
                    selectedAt: new Date().toISOString()
                }),
            });

            let savedIdea = {};
            if (res.ok) {
                savedIdea = await res.json();
                if (onIdeaAdded) onIdeaAdded();
            }

            if (onGoTonight) {
                onGoTonight({
                    ...savedIdea,
                    ...ideaData,
                    website: rec.website,
                    address: rec.address,
                    openingHours: rec.opening_hours,
                    googleRating: rec.google_rating,
                    id: (savedIdea as any).id || 'temp-' + Date.now(),
                });
                // onClose(); // Handled by onGoTonight
            }

        } catch (error) {
            logger.error("Failed to save idea", error);
            if (onGoTonight) {
                onGoTonight({
                    ...ideaData,
                    website: rec.website,
                    address: rec.address,
                    openingHours: rec.opening_hours,
                    googleRating: rec.google_rating,
                    id: 'temp-' + Date.now(),
                });
                // onClose(); // Handled by onGoTonight
            }
        }
    };

    const handleFavorite = async (rec: any, type: "BAR" | "RESTAURANT" | "CLUB" | "HOTEL" | "MOVIE" | "WELLNESS" | "FITNESS" | "THEATRE" | "GAME" | "ACTIVITY" | "MEAL") => {
        try {
            if (rec.isFavorite) {
                const res = await fetch(`/api/favorites?name=${encodeURIComponent(rec.name)}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    setRecommendations(prev => prev.map(item =>
                        (item.name === rec.name || (type === 'MEAL' && item.meal === rec.name)) ? { ...item, isFavorite: false } : item
                    ));
                    if (onFavoriteUpdated) onFavoriteUpdated();
                } else {
                    showError("Failed to remove favorite.");
                }
            } else {
                const res = await fetch('/api/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: rec.name,
                        address: rec.address,
                        description: rec.description,
                        websiteUrl: rec.website,
                        googleRating: rec.google_rating,
                        type: type
                    }),
                });

                if (res.ok) {
                    setRecommendations(prev => prev.map(item =>
                        (item.name === rec.name || (type === 'MEAL' && item.meal === rec.name)) ? { ...item, isFavorite: true } : item
                    ));
                    if (onFavoriteUpdated) onFavoriteUpdated();
                } else {
                    showError("Failed to save favorite.");
                }
            }
        } catch (error) {
            logger.error('Error updating favorite', error);
            showError("Error updating favorite.");
        }
    };

    const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    return {
        handleAddToJar,
        handleGoTonight,
        handleFavorite,
        toggleSelection,
        isAddingToJar  // Expose loading state for UI feedback
    };
}
