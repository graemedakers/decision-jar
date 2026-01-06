"use client";

import { useState, useEffect } from "react";
import { Image } from "lucide-react";

export default function ImageTestPage() {
    const [userData, setUserData] = useState<any>(null);
    const [imageError, setImageError] = useState(false);

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

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Image className="w-8 h-8 text-violet-600" />
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Image Test - Community Jar
                        </h1>
                    </div>

                    {userData && (
                        <div className="space-y-6">
                            {/* Current Jar Info */}
                            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                <h2 className="font-bold text-slate-900 dark:text-white mb-2">Current Jar Data:</h2>
                                <div className="text-sm text-slate-700 dark:text-slate-300 space-y-1 font-mono">
                                    <p><strong>Jar Name:</strong> {userData.jarName || "N/A"}</p>
                                    <p><strong>Is Community Jar:</strong> {userData.isCommunityJar ? "✅ YES" : "❌ NO"}</p>
                                    <p><strong>Image URL:</strong> {userData.jarImageUrl || "❌ NOT SET"}</p>
                                </div>
                            </div>

                            {/* Image Preview */}
                            {userData.jarImageUrl ? (
                                <div className="space-y-3">
                                    <h2 className="font-bold text-slate-900 dark:text-white">Image Preview:</h2>
                                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                                        {imageError ? (
                                            <div className="flex items-center justify-center h-64 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4">
                                                <div className="text-center">
                                                    <p className="font-bold mb-2">❌ Image Failed to Load</p>
                                                    <p className="text-sm">URL: {userData.jarImageUrl}</p>
                                                    <p className="text-xs mt-2">Check if the URL is correct and accessible</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <img
                                                src={userData.jarImageUrl}
                                                alt="Jar Cover"
                                                className="w-full h-64 object-cover"
                                                onError={() => setImageError(true)}
                                            />
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl text-yellow-800 dark:text-yellow-200">
                                    <p className="font-bold mb-2">⚠️ No Image URL Set</p>
                                    <p className="text-sm">Go to Admin Dashboard → Settings → Cover Image URL to set an image.</p>
                                </div>
                            )}

                            {/* Available Image URLs */}
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-blue-900 dark:text-blue-200">
                                <h3 className="font-bold mb-3">📦 Available Images in Your Project:</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="space-y-1">
                                        <p className="font-bold">Bug Report Jar:</p>
                                        <code className="block bg-white dark:bg-slate-800 p-2 rounded select-all">/bug-jar-cover.png</code>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold">Feature Requests Jar:</p>
                                        <code className="block bg-white dark:bg-slate-800 p-2 rounded select-all">/feature-requests-cover.png</code>
                                    </div>
                                </div>
                                <p className="text-xs mt-3 opacity-80">
                                    ℹ️ These URLs will work after deployment to production. For local testing, you can use full URLs to external images.
                                </p>
                            </div>

                            {/* Test Local Images */}
                            <div className="space-y-3">
                                <h2 className="font-bold text-slate-900 dark:text-white">Test Local Images:</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-bold mb-2">Bug Jar:</p>
                                        <img
                                            src="/bug-jar-cover.png"
                                            alt="Bug Jar"
                                            className="w-full h-48 object-cover rounded-xl border border-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold mb-2">Feature Requests:</p>
                                        <img
                                            src="/feature-requests-cover.png"
                                            alt="Feature Requests"
                                            className="w-full h-48 object-cover rounded-xl border border-slate-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
