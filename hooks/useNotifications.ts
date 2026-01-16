import { useState, useEffect } from "react";
import { showSuccess, showError } from "@/lib/toast";

export function useNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            checkSubscription();
        }
    }, []);

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const checkSubscription = async () => {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
    };

    const subscribeToPush = async () => {
        setIsLoading(true);
        try {
            // Check if permission is denied
            if (Notification.permission === 'denied') {
                showError("Notifications blocked. Please enable them in your browser settings.");
                setIsLoading(false);
                return;
            }

            // Request permission if not granted
            if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    showError("Notification permission denied. Please try again.");
                    setIsLoading(false);
                    return;
                }
            }

            const registration = await navigator.serviceWorker.ready;

            // Get VAPID key from server (or Env)
            const response = await fetch('/api/notifications/vapid-key');
            if (!response.ok) {
                throw new Error("Failed to fetch VAPID key from server");
            }
            
            const { publicKey } = await response.json();

            if (!publicKey) throw new Error("VAPID Key not found");

            const convertedVapidKey = urlBase64ToUint8Array(publicKey);

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            // Send subscription to server
            const subscribeResponse = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscription),
                credentials: 'include'
            });

            if (!subscribeResponse.ok) {
                throw new Error("Failed to save subscription to server");
            }

            setIsSubscribed(true);
            showSuccess("Notifications enabled! You'll stay updated.");
        } catch (error) {
            console.error("Failed to subscribe:", error);
            
            // Provide more specific error messages
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            if (errorMessage.includes("VAPID")) {
                showError("Server configuration error. Please contact support.");
            } else if (errorMessage.includes("service worker") || errorMessage.includes("ServiceWorker")) {
                showError("Service worker not ready. Please refresh the page and try again.");
            } else {
                showError("Failed to enable notifications. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };
    const unsubscribeFromPush = async () => {
        setIsLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await subscription.unsubscribe();

                // Call API to remove from DB (optional but good practice)
                await fetch('/api/notifications/unsubscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: subscription.endpoint })
                });

                setIsSubscribed(false);
                showSuccess("Notifications disabled.");
            }
        } catch (error) {
            console.error("Failed to unsubscribe:", error);
            showError("Failed to disable notifications.");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isSupported,
        isSubscribed,
        isLoading,
        subscribeToPush,
        unsubscribeFromPush
    };
}
