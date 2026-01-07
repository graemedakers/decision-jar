
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Calendar } from "lucide-react";
import { generateCalendarLinks } from "@/lib/utils";
import { Idea } from "@/lib/types"; // Assuming Idea type is here or compatible

interface CalendarButtonProps {
    idea: any; // Using any for flexibility with database types vs frontend types
    mini?: boolean;
}

export function CalendarButton({ idea, mini = true }: CalendarButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const links = generateCalendarLinks({
        title: idea.description,
        description: idea.details || idea.notes || "",
        location: idea.address || idea.location || "",
        startTime: idea.selectedAt ? new Date(idea.selectedAt) : (idea.selectedDate ? new Date(idea.selectedDate) : new Date()),
        endTime: undefined // Default to 1 hour
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    if (mini) {
        return (
            <div className="relative" ref={containerRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                    title="Add to Calendar"
                >
                    <Calendar className="w-5 h-5" />
                </button>

                {isOpen && (
                    <div className="absolute bottom-full mb-2 right-0 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <CalendarOptions links={links} />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative w-full" ref={containerRef}>
            <Button
                onClick={() => setIsOpen(!isOpen)}
                variant="outline"
                className="w-full border-slate-200 dark:border-white/20 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10"
            >
                <Calendar className="w-4 h-4 mr-2" />
                Add to Calendar
            </Button>

            {isOpen && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-20 animate-in fade-in slide-in-from-bottom-2">
                    <CalendarOptions links={links} />
                </div>
            )}
        </div>
    );
}

function CalendarOptions({ links }: { links: { google: string; outlook: string; apple: string } }) {
    return (
        <div className="flex flex-col gap-0.5">
            <a
                href={links.google}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium flex items-center gap-2"
            >
                Google Calendar
            </a>
            <a
                href={links.outlook}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium flex items-center gap-2"
            >
                Outlook
            </a>
            <a
                href={links.apple}
                download="decision-jar-event.ics"
                className="block w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium flex items-center gap-2"
            >
                Apple / iCal
            </a>
        </div>
    );
}
