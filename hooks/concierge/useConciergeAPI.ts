
import { trackEvent, trackIdeaAdded } from "@/lib/analytics";
import { logger } from "@/lib/logger";

interface AddIdeaParams {
    description: string;
    details: string;
    indoor: boolean;
    duration: string;
    activityLevel: string;
    cost: string;
    timeOfDay: string;
    category: string;
    isPrivate: boolean;
    address?: string | null;
    ideaType?: string | null;
    typeData?: any;
    schemaVersion?: string;
    selectedAt?: string; // Optional for "Go Tonight"
}

interface CreateJarParams {
    name: string;
    type: string;
    topic: string;
    selectionMode: string;
}

export const useConciergeAPI = () => {

    const apiAddIdea = async (params: AddIdeaParams) => {
        try {
            const res = await fetch('/api/ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });

            if (res.ok) {
                const data = await res.json();
                return { success: true, data };
            } else {
                const error = await res.json();
                return { success: false, error };
            }
        } catch (err: any) {
            logger.error("Failed to add idea", err);
            return { success: false, error: { error: err.message || 'Network error' } };
        }
    };

    const apiCreateJar = async (params: CreateJarParams) => {
        try {
            const res = await fetch('/api/jars', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            });

            if (res.ok) {
                const data = await res.json();
                return { success: true, data };
            } else {
                const error = await res.json();
                return { success: false, error, status: res.status };
            }
        } catch (err: any) {
            logger.error("Failed to create jar", err);
            return { success: false, error: { error: err.message || 'Network error' } };
        }
    };

    const apiSwitchJar = async (jarId: string) => {
        try {
            await fetch('/api/auth/switch-jar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jarId })
            });
            return { success: true };
        } catch (err) {
            logger.error("Failed to switch jar", err);
            return { success: false };
        }
    };

    const apiListJars = async () => {
        try {
            const res = await fetch('/api/jars/list');
            if (res.ok) {
                const data = await res.json();
                return { success: true, jars: data.jars };
            }
            return { success: false, error: 'Failed to list jars' };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    };

    const apiToggleFavorite = async (rec: any, type: string, isFavorite: boolean) => {
        try {
            if (isFavorite) {
                // DELETE
                const res = await fetch(`/api/favorites?name=${encodeURIComponent(rec.name)}`, {
                    method: 'DELETE',
                });
                return { success: res.ok, action: 'removed' };
            } else {
                // ADD
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
                return { success: res.ok, action: 'added' };
            }
        } catch (error) {
            logger.error('Error updating favorite', error);
            return { success: false, error };
        }
    };

    return {
        apiAddIdea,
        apiCreateJar,
        apiSwitchJar,
        apiListJars,
        apiToggleFavorite
    };
};
