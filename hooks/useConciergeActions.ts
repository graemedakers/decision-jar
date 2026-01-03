
import { useState } from "react";

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
