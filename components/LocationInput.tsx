"use client";

import { usePlacesWidget } from "react-google-autocomplete";
import { Input } from "@/components/ui/Input";
import { MapPin, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface LocationInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    className?: string;
    isStandardizing?: boolean;
    disabled?: boolean;
    updateProfileLocation?: boolean;
}

/**
 * A beautiful, glass-morphism themed location input with Google Places Autocomplete.
 * Handles standardization internally to eliminate the need for server-side Nominatim calls.
 */
export function LocationInput({
    value,
    onChange,
    onBlur,
    placeholder = "Enter location...",
    className,
    isStandardizing: externalIsStandardizing,
    disabled,
    updateProfileLocation: shouldUpdate = false
}: LocationInputProps) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    const [isInternalStandardizing, setIsInternalStandardizing] = useState(false);
    const isStandardizing = externalIsStandardizing || isInternalStandardizing;

    // Track the last value that was finalized/standardized to avoid redundant work
    const lastStandardizedValue = useRef<string>("");

    const updateProfileLocation = async (location: string) => {
        if (!shouldUpdate) return;
        try {
            await fetch('/api/user/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ defaultLocation: location })
            });
            console.log("Updated persistent location to:", location);
        } catch (error) {
            console.error("Failed to update profile location", error);
        }
    };

    const { ref: materialRef } = usePlacesWidget({
        apiKey: apiKey,
        onPlaceSelected: (place) => {
            const formatted = place.formatted_address || place.name;
            if (formatted) {
                lastStandardizedValue.current = formatted;
                onChange(formatted);
                if (shouldUpdate) {
                    updateProfileLocation(formatted);
                }
                // Trigger parent's onBlur once we have the standardized value
                if (onBlur) {
                    // Small delay to ensure state is synchronized
                    setTimeout(onBlur, 100);
                }
            }
        },
        options: {
            types: ["geocode", "establishment"],
        },
    });

    const handleStandardize = async () => {
        // If the value is empty or already standardized, just call the parent's onBlur
        if (!value.trim() || value === lastStandardizedValue.current) {
            if (onBlur) onBlur();
            return;
        }

        // Check if Google SDK is loaded and geocoder is available
        const google = (window as any).google;
        if (typeof window !== 'undefined' && google?.maps?.Geocoder) {
            setIsInternalStandardizing(true);
            try {
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ address: value }, (results: any, status: any) => {
                    setIsInternalStandardizing(false);
                    if (status === 'OK' && results && results[0]) {
                        const formatted = results[0].formatted_address;
                        lastStandardizedValue.current = formatted;
                        onChange(formatted);
                        if (shouldUpdate) {
                            updateProfileLocation(formatted);
                        }
                        if (onBlur) setTimeout(onBlur, 100);
                    } else if (status === 'REQUEST_DENIED' || status === 'OVER_QUERY_LIMIT') {
                        console.error(`Google Geocoding API Error: ${status}. Ensure Geocoding API is enabled in Google Cloud Console.`);
                        if (onBlur) onBlur();
                    } else {
                        // Fallback for other statuses
                        if (onBlur) onBlur();
                    }
                });
            } catch (e) {
                console.error("Client-side standardization failed", e);
                setIsInternalStandardizing(false);
                if (onBlur) onBlur();
            }
        } else {
            // No geocoder available, just proceed
            if (onBlur) onBlur();
        }
    };

    return (
        <div className="relative group">
            <Input
                ref={apiKey ? (materialRef as any) : undefined}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={handleStandardize}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    "w-full !pl-10 !pr-10 py-2 transition-all",
                    isStandardizing && "opacity-70",
                    className
                )}
                autoComplete="off"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <MapPin className={cn(
                    "w-4 h-4 transition-colors",
                    isStandardizing ? "text-primary animate-pulse" : "text-slate-400 group-focus-within:text-primary"
                )} />
            </div>
            {isStandardizing && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
            )}
        </div>
    );
}
