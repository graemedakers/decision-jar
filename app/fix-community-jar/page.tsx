"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Shield, RefreshCw } from "lucide-react";

export default function FixCommunityJarPage() {
    const [userData, setUserData] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUserData(data.user);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleFixCommunityJar = async () => {
        if (!userData?.activeJarId) {
            setMessage("❌ No active jar found");
            return;
        }

        setIsUpdating(true);
        setMessage("");

        try {
            const res = await fetch(`/api/jars/${userData.activeJarId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isCommunityJar: true })
            });

            if (res.ok) {
                setMessage("✅ Successfully marked jar as community jar! Refresh the dashboard to see the admin button.");
                await fetchUserData(); // Refresh user data
            } else {
                const data = await res.json();
                setMessage(`❌ Error: ${data.error || 'Failed to update'}`);
            }
        } catch (e) {
            setMessage(`❌ Error: ${e}`);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-8 h-8 text-violet-600" />
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Fix Community Jar
                        </h1>
                    </div>

                    {userData && (
                        <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <h2 className="font-bold text-slate-900 dark:text-white mb-2">Current Active Jar:</h2>
                            <p className="text-slate-700 dark:text-slate-300">{userData.jarName || "Unnamed Jar"}</p>
                            <p className="text-sm text-slate-500 mt-1">
                                isCommunityJar: <span className={userData.isCommunityJar ? "text-green-600" : "text-red-600"}>
                                    {userData.isCommunityJar ? "✅ TRUE" : "❌ FALSE"}
                                </span>
                            </p>
                            <p className="text-sm text-slate-500">
                                isCreator/Admin: <span className={userData.isCreator ? "text-green-600" : "text-red-600"}>
                                    {userData.isCreator ? "✅ TRUE" : "❌ FALSE"}
                                </span>
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <p className="text-slate-600 dark:text-slate-400">
                            If you're an admin of a community jar but don't see the "Manage Community" button on the dashboard,
                            this tool will mark your current active jar as a community jar.
                        </p>

                        <Button
                            onClick={handleFixCommunityJar}
                            disabled={isUpdating || userData?.isCommunityJar}
                            className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white font-bold flex items-center justify-center gap-2"
                        >
                            {isUpdating ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Updating...
                                </>
                            ) : userData?.isCommunityJar ? (
                                <>
                                    ✅ Already a Community Jar
                                </>
                            ) : (
                                <>
                                    <Shield className="w-5 h-5" />
                                    Mark as Community Jar
                                </>
                            )}
                        </Button>

                        {message && (
                            <div className={`p-4 rounded-xl ${message.includes('✅') ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'}`}>
                                {message}
                            </div>
                        )}

                        <div className="pt-6 border-t border-slate-200 dark:border-white/10">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">What this does:</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                <li>Sets the <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">isCommunityJar</code> flag to true</li>
                                <li>Enables the "Manage Community" button on the dashboard</li>
                                <li>Shows the community header with stats</li>
                                <li>Changes button text to "Suggest Idea" for members</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
