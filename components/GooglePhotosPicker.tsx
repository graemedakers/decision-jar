"use client";

import { Button } from "@/components/ui/Button";
import { Image as ImageIcon, Loader2, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { isCapacitor } from "@/lib/utils";
import { showError, showWarning, showInfo } from "@/lib/toast";

interface GooglePhotosPickerProps {
    onPhotoSelected: (url: string) => void;
    onLoading?: (isLoading: boolean) => void;
    isPro?: boolean;
}

// Declare types for window globals
declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

export function GooglePhotosPicker({ onPhotoSelected, onLoading, isPro }: GooglePhotosPickerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    // Environment variables
    const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    const IS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_PHOTOS === 'true';

    // Load Google API Script
    useEffect(() => {
        if (!IS_ENABLED || !CLIENT_ID || !API_KEY) return;

        const loadScript = () => {
            const script = document.createElement("script");
            script.src = "https://apis.google.com/js/api.js";
            script.async = true;
            script.onload = () => {
                window.gapi.load("client:picker", () => {
                    setIsScriptLoaded(true);
                });
            };
            document.body.appendChild(script);
        };

        if (!window.gapi) {
            loadScript();
        } else {
            window.gapi.load("client:picker", () => {
                setIsScriptLoaded(true);
            });
        }
    }, [CLIENT_ID, API_KEY]);

    const handlePick = async () => {
        if (!isPro) {
            showWarning("🔒 Google Photos integration is a Pro feature. Please upgrade to Pro to use it!");
            return;
        }

        if (!CLIENT_ID || !API_KEY) {
            showError("Please configure Google Photos API keys in your environment settings.");
            return;
        }

        if (!isScriptLoaded) {
            showInfo("⏳ Google Photos is loading, please try again in a moment.");
            return;
        }

        setIsLoading(true);
        onLoading?.(true);

        try {
            // Load GIS script if needed
            if (!window.google?.accounts?.oauth2) {
                loadGsiScript();
                return;
            }

            // Authenticate with Google
            const tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/photoslibrary.readonly',
                callback: (response: any) => {
                    if (response.access_token) {
                        createPicker(response.access_token);
                    } else {
                        setIsLoading(false);
                        onLoading?.(false);
                    }
                },
            });
            tokenClient.requestAccessToken();

        } catch (error) {
            console.error(error);
            setIsLoading(false);
            onLoading?.(false);
        }
    };

    const loadGsiScript = () => {
        if (document.getElementById('google-gsi-script')) {
            requestToken(); // Retry if it was already loading/loaded
            return;
        }
        const script = document.createElement("script");
        script.id = 'google-gsi-script';
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.onload = () => {
            requestToken();
        };
        document.body.appendChild(script);
    };

    const requestToken = () => {
        if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return;

        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/photoslibrary.readonly',
            callback: (response: any) => {
                if (response.access_token) {
                    createPicker(response.access_token);
                } else {
                    setIsLoading(false);
                    onLoading?.(false);
                }
            },
        });
        tokenClient.requestAccessToken();
    };

    const createPicker = (oauthToken: string) => {
        if (!window.google || !window.google.picker) {
            showError("Google Photos picker failed to load. Please refresh and try again.");
            setIsLoading(false);
            onLoading?.(false);
            return;
        }

        const picker = new window.google.picker.PickerBuilder()
            .addView(window.google.picker.ViewId.PHOTOS)
            .setOAuthToken(oauthToken)
            .setDeveloperKey(API_KEY!)
            .setCallback(pickerCallback)
            .build();
        picker.setVisible(true);
    };

    const pickerCallback = async (data: any) => {
        if (data.action === window.google.picker.Action.CANCEL) {
            setIsLoading(false);
            onLoading?.(false);
            return;
        }

        if (data.action === window.google.picker.Action.PICKED) {
            const doc = data.docs[0];
            let photoUrl = doc[window.google.picker.Document.URL] || doc.url;

            if (photoUrl) {
                // Optimization: Enforce max dimensions (e.g., 2048px) to reduce payload
                // Google Photos URLs typically support dynamic resizing via params
                if (photoUrl.includes('googleusercontent.com') && !photoUrl.includes('=')) {
                    photoUrl += '=w2048-h2048';
                }

                await uploadToCloudinary(photoUrl);
            } else {
                showError("Could not get photo URL from Google Photos");
                setIsLoading(false);
                onLoading?.(false);
            }
        }
    };

    const uploadToCloudinary = async (sourceUrl: string) => {
        try {
            const res = await fetch('/api/upload-cloudinary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: sourceUrl })
            });
            const data = await res.json();

            if (data.success) {
                onPhotoSelected(data.url);
            } else {
                showError("Failed to upload photo from Google: " + (data.error || "Unknown error"));
            }
        } catch (e) {
            console.error(e);
            showError("Error uploading photo. Please try again.");
        } finally {
            setIsLoading(false);
            onLoading?.(false);
        }
    };

    if (!IS_ENABLED) return null; // Hidden by feature flag
    if (isCapacitor()) return null; // Hide on native app, prefer native picker

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePick}
            className={`flex items-center gap-2 border-white/10 hover:bg-white/5 ${isPro ? 'text-slate-300' : 'text-slate-500 opacity-60'}`}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPro ? (
                <ImageIcon className="w-4 h-4" />
            ) : (
                <Lock className="w-3 h-3" />
            )}
            Google Photos
        </Button>
    );
}
