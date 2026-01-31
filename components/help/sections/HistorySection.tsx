"use client";

export function HistorySection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Managing the Vault</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Rate & Snap:</strong> Give your completed items a star rating and upload up to 3 photos to capture the moment.</li>
                <li><strong>Add Past Items:</strong> Have a record from before you got the app? Click "Add Manual Entry" to log past items with photos and details.</li>
                <li><strong>Repeat:</strong> Click the Copy icon to put an idea back in the jar.</li>
                <li><strong>Delete:</strong> Click the Trash icon to remove it.</li>
                <li><strong>Deletion Log:</strong> Check Settings &gt; View Deletion History to see an audit log of removed items.</li>
            </ul>
        </div>
    );
}
