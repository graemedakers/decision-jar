import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "./ui/Button";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { NotificationPreferences } from "./NotificationPreferences";

export function NotificationToggle() {
    const { isSupported, isSubscribed, isLoading, subscribeToPush, unsubscribeFromPush } = useNotifications();

    if (!isSupported) {
        return (
            <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-white/5 rounded-lg text-sm text-slate-500">
                <BellOff className="w-5 h-5 opacity-50 flex-shrink-0" />
                <span className="flex-1">Notifications not supported on this device.</span>
            </div>
        );
    }

    if (isSubscribed) {
        return (
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-lg text-sm text-green-700 dark:text-green-400">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full flex-shrink-0">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="font-bold block">Notifications Active</span>
                            <span className="text-xs opacity-80">You'll receive updates.</span>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={unsubscribeFromPush}
                        disabled={isLoading}
                        className="w-full sm:w-auto sm:flex-shrink-0 whitespace-nowrap text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Disable"}
                    </Button>
                </div>
                <NotificationPreferences isSubscribed={isSubscribed} />
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg">
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full text-primary flex-shrink-0">
                    <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <span className="font-bold text-sm block text-slate-700 dark:text-slate-200">Enable Notifications</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Get updates about ideas & votes.</span>
                </div>
            </div>
            <Button
                size="sm"
                onClick={subscribeToPush}
                disabled={isLoading}
                variant="outline"
                className="w-full sm:w-auto sm:flex-shrink-0 whitespace-nowrap"
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enable"}
            </Button>
        </div>
    );
}
