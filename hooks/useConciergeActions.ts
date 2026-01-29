
import { useState } from "react";
import { isDemoMode, addDemoIdea } from "@/lib/demo-storage";
import { trackEvent, trackIdeaAdded } from "@/lib/analytics";
import { showSuccess, showError } from "@/lib/toast";
import { logger } from "@/lib/logger";
import { findBestMatchingJar, getSuggestionMessage } from "@/lib/jar-topic-matcher";

// New Modular Hooks
import { determineCost, getIdeaTitle, formatDetails, normalizeRecipeData } from "./concierge/useConciergeUtils";
import { useConciergeAPI } from "./concierge/useConciergeAPI";

interface ConciergeActionProps {
    onIdeaAdded?: () => void;
    onGoTonight?: (idea: any) => void;
    onFavoriteUpdated?: () => void;
    onClose: () => void;
    setRecommendations: React.Dispatch<React.SetStateAction<any[]>>;
    availableJars?: { id: string; name: string; topic?: string }[];
    currentJarId?: string | null;
}

export function useConciergeActions({
    onIdeaAdded,
    onGoTonight,
    onFavoriteUpdated,
    onClose,
    setRecommendations,
    availableJars = [],
    currentJarId = null
}: ConciergeActionProps) {
    // Track which specific item is being added
    const [addingItemName, setAddingItemName] = useState<string | null>(null);

    // API Hook
    const { apiAddIdea, apiCreateJar, apiSwitchJar, apiListJars, apiToggleFavorite } = useConciergeAPI();

    const handleAddToJar = async (rec: any, category: string = "ACTIVITY", isPrivate: boolean = true) => {
        // Prevent duplicate clicks
        if (addingItemName === rec.name) {
            logger.info('Already adding this idea, please wait...');
            return;
        }

        setAddingItemName(rec.name);

        try {
            // 1. DEMO MODE HANDLING
            if (isDemoMode()) {
                try {
                    const demoIdea = {
                        description: getIdeaTitle(rec),
                        details: formatDetails(rec),
                        indoor: true,
                        duration: "2.0",
                        activityLevel: "LOW",
                        cost: determineCost(rec.price),
                        timeOfDay: "EVENING",
                        category: category,
                        isPrivate: isPrivate
                    };

                    addDemoIdea(demoIdea);

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

            // 2. JAR AUTO-SWITCHING LOGIC
            let targetJarId: string | null = null;
            let targetJarName: string | null = null;

            if (availableJars.length > 1 && currentJarId) {
                const match = findBestMatchingJar(category, availableJars, currentJarId);

                if (match) {
                    const shouldSwitch = window.confirm(getSuggestionMessage(match, category));

                    if (shouldSwitch) {
                        const switchResult = await apiSwitchJar(match.jar.id);
                        if (switchResult.success) {
                            targetJarId = match.jar.id;
                            targetJarName = match.jar.name;

                            trackEvent('jar_auto_switched', {
                                from_jar_id: currentJarId,
                                to_jar_id: targetJarId,
                                to_jar_name: targetJarName,
                                category: category,
                                reason: match.reason
                            });
                        }
                    }
                }
            }

            // 3. DATA NORMALIZATION (Extract Ingredients, etc.)
            const normalizedRec = normalizeRecipeData(rec);

            // 4. API CALL
            const res = await apiAddIdea({
                description: getIdeaTitle(normalizedRec),
                details: formatDetails(normalizedRec),
                indoor: true,
                duration: "2.0",
                activityLevel: "LOW",
                cost: determineCost(normalizedRec.price),
                timeOfDay: "EVENING",
                category: category,
                isPrivate: isPrivate,
                address: normalizedRec.address || null,
                ideaType: normalizedRec.ideaType || null,
                typeData: normalizedRec.typeData || normalizedRec.data || null,
                schemaVersion: "1.0"
            });

            if (res.success) {
                trackIdeaAdded('ai', `concierge_${category}`);

                setRecommendations(prev => prev.map(item =>
                    (item.name === rec.name) ? { ...item, isAdded: true } : item
                ));

                if (onIdeaAdded) onIdeaAdded();

                if (targetJarName) {
                    showSuccess(`✅ Added to "${targetJarName}"!`);
                } else {
                    showSuccess("✅ Added to jar!");
                }
            } else {
                // 5. ERROR HANDLING & AUTO-CREATE FLOW
                const err = res.error; // { error: string }

                // Check for "No active jar" errors
                if (err.error && (err.error.includes('No active jar') || err.error.includes('Jar not found'))) {

                    // A. Check for existing jars to switch to
                    const jarsRes = await apiListJars();
                    if (jarsRes.success && jarsRes.jars && jarsRes.jars.length > 0) {
                        const jars = jarsRes.jars;
                        const jarList = jars.map((j: any, idx: number) =>
                            `${idx + 1}. ${j.name} (${j._count?.ideas || 0} ideas)`
                        ).join('\n');

                        const message = `You have ${jars.length} jar(s) but none are active:\n\n${jarList}\n\n` +
                            `Choose:\n` +
                            `• OK: Use "${jars[0].name}"\n` +
                            `• Cancel: Create a new jar`;

                        const useExisting = window.confirm(message);

                        if (useExisting) {
                            await apiSwitchJar(jars[0].id);

                            // Retry Add
                            const retryRes = await apiAddIdea({
                                description: getIdeaTitle(rec),
                                details: formatDetails(rec),
                                indoor: true,
                                duration: "2.0",
                                activityLevel: "LOW",
                                cost: determineCost(rec.price),
                                timeOfDay: "EVENING",
                                category: category,
                                isPrivate: isPrivate
                            });

                            if (retryRes.success) {
                                trackEvent('idea_added_to_existing_jar', {
                                    jar_name: jars[0].name,
                                    category: category
                                });
                                alert(`✅ Added to "${jars[0].name}"!`);
                                if (onIdeaAdded) onIdeaAdded();
                                return;
                            }
                        }
                    }

                    // B. Auto-Create Flow
                    const userWantsToCreateJar = window.confirm(
                        "Create a new jar for this idea?\n\n" +
                        "We'll set it up automatically!"
                    );

                    if (userWantsToCreateJar) {
                        try {
                            const loadingMsg = document.createElement('div');
                            loadingMsg.id = 'jar-creation-loading';
                            loadingMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.9);color:white;padding:20px 30px;border-radius:12px;z-index:10000;font-size:16px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.5);';
                            loadingMsg.innerHTML = '⏳ Creating jar...<br><span style="font-size:14px;opacity:0.8;margin-top:8px;display:block;">Please wait</span>';
                            document.body.appendChild(loadingMsg);

                            // Determine Topic
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

                            // Create Jar
                            const createRes = await apiCreateJar({
                                name: jarName,
                                type: 'GENERIC',
                                topic: jarTopic,
                                selectionMode: 'RANDOM'
                            });

                            if (!createRes.success) {
                                document.getElementById('jar-creation-loading')?.remove();

                                // Jar Limit Handling
                                if (createRes.status === 403 && createRes.error.error && createRes.error.error.includes('Limit reached')) {

                                    const upgradeNow = window.confirm(
                                        '🔒 Jar Limit Reached\n\n' +
                                        `You've hit your jar limit on the Free plan.\n\n` +
                                        `${createRes.error.error}\n\n` +
                                        `Upgrade to Pro for unlimited jars plus premium AI tools!\n\n` +
                                        `Click OK to see pricing, or Cancel to stay.`
                                    );

                                    if (upgradeNow) {
                                        window.location.href = '/dashboard?upgrade=pro';
                                    }

                                    trackEvent('jar_limit_upgrade_prompt', {
                                        source: 'concierge_auto_create',
                                        category: category,
                                        user_clicked_upgrade: upgradeNow
                                    });
                                    return;
                                }

                                throw new Error(createRes.error.error || 'Failed to create jar');
                            }

                            // Add to new Jar
                            // Note: apiCreateJar likely auto-switches on backend or we rely on it being the "active" jar for the next call?
                            // The original code assumed explicit switching wasn't needed if the create API sets it as active?
                            // Actually, checking original code: it assumed `fetch` calls would work. The backend usually sets new jar as active if it's the first one.

                            const addRes = await apiAddIdea({
                                description: getIdeaTitle(rec),
                                details: formatDetails(rec),
                                indoor: true,
                                duration: "2.0",
                                activityLevel: "LOW",
                                cost: determineCost(rec.price),
                                timeOfDay: "EVENING",
                                category: category,
                                isPrivate: isPrivate,
                                ideaType: rec.ideaType || null,
                                typeData: rec.typeData || rec.data || null,
                                schemaVersion: "1.0"
                            });

                            document.getElementById('jar-creation-loading')?.remove();

                            if (addRes.success) {
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
                                alert(`Jar created, but failed to add idea:\n${addRes.error?.error || 'Unknown error'}`);
                            }

                        } catch (error: any) {
                            document.getElementById('jar-creation-loading')?.remove();
                            logger.error('Failed to auto-create jar:', error);
                            alert(`Failed to create jar automatically:\n${error.message || error}\n\nPlease check console for details.`);
                            window.location.href = '/dashboard';
                        }
                    } else {
                        trackEvent('jar_auto_create_declined', {
                            category: category,
                            idea_name: rec.name
                        });
                    }
                    return;
                }

                showError(`Failed to add: ${err.error || 'Server error'}`);
            }
        } catch (error) {
            logger.error("Failed to add to jar:", error);
            showError("Failed to add to jar.");
        } finally {
            setAddingItemName(null);
        }
    };

    const handleGoTonight = async (rec: any, category: string = "ACTIVITY", isPrivate: boolean = true) => {
        let itemToProcess = { ...rec };

        // --- Recipe Detection Logic (extracted from original) ---
        const isMealCategory = ['MEAL', 'FOOD', 'BREAKFAST', 'LUNCH', 'DINNER', 'DESSERT', 'BAKING'].includes(category);
        const textToScan = (itemToProcess.description + " " + (itemToProcess.details || "")).toLowerCase();

        const hasRecipeData = itemToProcess.typeData && (
            Array.isArray(itemToProcess.typeData.ingredients) ||
            (itemToProcess.typeData.instructions && itemToProcess.typeData.instructions.length > 20)
        );
        const hasRecipeKeywords = textToScan.match(/ingredients|prep time|cook time|serves \d/);

        if ((isMealCategory || hasRecipeKeywords || hasRecipeData) && itemToProcess.ideaType !== 'recipe') {
            itemToProcess.ideaType = 'recipe';
        }

        // Normalize
        if (itemToProcess.ideaType === 'recipe') {
            itemToProcess = normalizeRecipeData(itemToProcess);
        }

        // Prepare Data
        const ideaData = {
            description: getIdeaTitle(itemToProcess),
            details: formatDetails(itemToProcess),
            indoor: true,
            duration: "2.0", // API expects string "2.0"? Original code passed "2.0", but interface might expect number? 
            // Checked original: it passed "2.0". Wait, apiAddIdea interface I defined expects string for duration.
            activityLevel: "LOW",
            cost: determineCost(itemToProcess.price),
            timeOfDay: "EVENING",
            category: category,
            address: itemToProcess.address,
            isPrivate: isPrivate,
            ideaType: itemToProcess.ideaType || null,
            typeData: itemToProcess.typeData || itemToProcess.data || null,
            schemaVersion: "1.0",
            selectedAt: new Date().toISOString()
        };

        const res = await apiAddIdea(ideaData);

        if (res.success) {
            trackIdeaAdded('ai', `concierge_go_tonight_${category}`);
            if (onIdeaAdded) onIdeaAdded();
        } else {
            logger.error("Failed to save idea", res.error);
        }

        // Trigger generic "Go Tonight" handler (updates UI immediately even if save failed/pending?)
        if (onGoTonight) {
            onGoTonight({
                ...rec,
                ...ideaData,
                duration: 2.0, // Convert back to number for UI if needed? Or consistent?
                website: rec.website,
                openingHours: rec.opening_hours,
                googleRating: rec.google_rating,
                id: (res.success && res.data?.id) ? res.data.id : 'temp-' + Date.now(),
            });
        }
    };

    const handleFavorite = async (rec: any, type: string) => {
        const isFav = rec.isFavorite;
        const res = await apiToggleFavorite(rec, type, isFav);

        if (res.success) {
            setRecommendations(prev => prev.map(item =>
                (item.name === rec.name || (type === 'MEAL' && item.meal === rec.name))
                    ? { ...item, isFavorite: !isFav }
                    : item
            ));
            if (onFavoriteUpdated) onFavoriteUpdated();
        } else {
            showError(`Failed to ${isFav ? 'remove' : 'save'} favorite.`);
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
        addingItemName
    };
}
