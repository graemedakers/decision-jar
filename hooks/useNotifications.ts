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
            const registration = await navigator.serviceWorker.ready;

            // Get VAPID key from server (or Env)
            const response = await fetch('/api/notifications/vapid-key');
            const { publicKey } = await response.json();

            if (!publicKey) throw new Error("VAPID Key not found");

            const convertedVapidKey = urlBase64ToUint8Array(publicKey);

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            // Send subscription to server
            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscription)
            });

            setIsSubscribed(true);
            showSuccess("Notifications enabled! You'll stay updated.");
        } catch (error) {
            console.error("Failed to subscribe:", error);
            showError("Failed to enable notifications. Please try again.");
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
