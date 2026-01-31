"use client";

export function ManageJarsSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Managing Your Squad Jars</h3>
            <p className="text-slate-600 dark:text-slate-300">
                You can belong to multiple Jars at once! We call this **Squad Mode**. Each jar is a separate workspace for different groups or contexts.
            </p>
            <div className="space-y-4 mt-4">
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-1">Jar Management Modal</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                        <li><strong>Switching:</strong> Instantly jump between your Jars.</li>
                        <li><strong>Manage Members:</strong> (Admins only) Manage who has access and who can moderate.</li>
                        <li><strong>Renaming:</strong> (Admins only) Give your jar a fresh identity with the pencil icon.</li>
                        <li><strong>Leaving:</strong> Non-owners can leave a jar to declutter their dashboard.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
