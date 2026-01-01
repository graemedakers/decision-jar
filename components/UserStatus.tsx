"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function UserStatus() {
    const [user, setUser] = useState<{ name: string } | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        // Re-check auth status on mount and when path changes (in case of logout/login)
        fetch('/api/auth/me')
            .then(res => {
                if (res.ok) return res.json();
                return null;
            })
            .then(data => {
                if (data?.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            })
            .catch(() => setUser(null));
    }, [pathname]);

    if (!user) return null;

    return (
        <div className="hidden md:flex fixed bottom-4 right-20 z-50 items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full shadow-lg text-xs text-slate-300 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="font-medium">Logged in as <span className="text-white">{user.name}</span></span>
        </div>
    );
}
