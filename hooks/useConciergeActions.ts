
import { useState } from "react";
import { isDemoMode, addDemoIdea } from "@/lib/demo-storage";

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

    const handleAddToJar = async (rec: any, category: string = "ACTIVITY", isPrivate: boolean = true) => {
        // Check if we're in demo mode
        if (isDemoMode()) {
            try {
                // Use demo storage
                const demoIdea = {
                    description: rec.name,
                    details: rec.details || `${rec.description}\n\nAddress: ${rec.address || 'N/A'}\nPrice: ${rec.price || 'N/A'}\nWebsite: ${rec.website || 'N/A'}`,
                    indoor: true,
                    duration: "2.0",
                    activityLevel: "LOW",
                    cost: (rec.price && rec.price.length > 2) ? "$$$" : (rec.price && rec.price.length > 1) ? "$$" : "$",
                    timeOfDay: "EVENING",
                    category: category,
                    isPrivate: isPrivate
                };

                addDemoIdea(demoIdea);
                if (onIdeaAdded) onIdeaAdded();
                alert("✅ Added to your Jar!\n\n(Demo Mode: This idea will appear in your jar and can be spun!)");
                return;
            } catch (error) {
                console.error(error);
                alert("Failed to add to jar.");
                return;
            }
        }

        // Regular authenticated mode
        try {
            const res = await fetch('/api/ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: rec.name,
                    details: rec.details || `${rec.description}\n\nAddress: ${rec.address || 'N/A'}\nPrice: ${rec.price || 'N/A'}\nWebsite: ${rec.website || 'N/A'}`,
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
                if (onIdeaAdded) onIdeaAdded();
                alert("Added to jar!");
            } else {
                const err = await res.json();

                // Special handling for "No active jar" error
                if (err.error && (err.error.includes('No active jar') || err.error.includes('No active jar found'))) {
                    const userWantsToCreateJar = window.confirm(
                        "You don't have a jar yet!\n\n" +
                        "Create a jar to save this idea?\n\n" +
                        "We'll create one for you automatically!"
                    );

                    if (userWantsToCreateJar) {
                        try {
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
                            const createRes = await fetch('/api/jar', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    name: jarName,
                                    type: 'PERSONAL', // Personal jar type
                                    topic: jarTopic,
                                    selectionMode: 'RANDOM'
                                })
                            });

                            if (!createRes.ok) {
                                const errorData = await createRes.json();
                                console.error('Jar creation failed:', errorData);
                                throw new Error(errorData.error || 'Failed to create jar');
                            }

                            const newJar = await createRes.json();

                            // Now add the idea to the new jar
                            const addRes = await fetch('/api/ideas', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    description: rec.name,
                                    details: rec.details || `${rec.description}\n\nAddress: ${rec.address || 'N/A'}\nPrice: ${rec.price || 'N/A'}\nWebsite: ${rec.website || 'N/A'}`,
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
                                alert(`✅ Created "${jarName}" jar and added your idea!\n\nReturning to dashboard...`);
                                if (onIdeaAdded) onIdeaAdded();
                                // Refresh page to show new jar
                                window.location.href = '/dashboard';
                            } else {
                                const addError = await addRes.json();
                                console.error('Failed to add idea:', addError);
                                alert(`Jar created, but failed to add idea:\n${addError.error || 'Unknown error'}`);
                            }
                        } catch (error: any) {
                            console.error('Failed to auto-create jar:', error);
                            alert(`Failed to create jar automatically:\n${error.message || error}\n\nPlease check console for details.`);
                            window.location.href = '/dashboard';
                        }
                    }
                    return;
                }

                // Other errors
                alert(`Failed to add: ${err.error || 'Server error'}`);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to add to jar.");
        }
    };

    const handleGoTonight = async (rec: any, category: string = "ACTIVITY", isPrivate: boolean = true) => {
        const ideaData = {
            description: rec.name,
            details: `${rec.description}\n\nAddress: ${rec.address || 'N/A'}\nPrice: ${rec.price || 'N/A'}\nWebsite: ${rec.website || 'N/A'}\nHours: ${rec.opening_hours || 'N/A'}\nRating: ${rec.google_rating || 'N/A'}`,
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
                onClose();
            }

        } catch (error) {
            console.error("Failed to save idea", error);
            if (onGoTonight) {
                onGoTonight({
                    ...ideaData,
                    website: rec.website,
                    address: rec.address,
                    openingHours: rec.opening_hours,
                    googleRating: rec.google_rating,
                    id: 'temp-' + Date.now(),
                });
                onClose();
            }
        }
    };

    const handleFavorite = async (rec: any, type: "BAR" | "RESTAURANT" | "CLUB" | "HOTEL" | "MOVIE" | "WELLNESS" | "FITNESS" | "THEATRE" | "GAME" | "ACTIVITY") => {
        try {
            if (rec.isFavorite) {
                const res = await fetch(`/api/favorites?name=${encodeURIComponent(rec.name)}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    setRecommendations(prev => prev.map(item =>
                        item.name === rec.name ? { ...item, isFavorite: false } : item
                    ));
                    if (onFavoriteUpdated) onFavoriteUpdated();
                } else {
                    alert("Failed to remove favorite.");
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
                        item.name === rec.name ? { ...item, isFavorite: true } : item
                    ));
                    if (onFavoriteUpdated) onFavoriteUpdated();
                } else {
                    alert("Failed to save favorite.");
                }
            }
        } catch (error) {
            console.error(error);
            alert("Error updating favorite.");
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
        toggleSelection
    };
}
