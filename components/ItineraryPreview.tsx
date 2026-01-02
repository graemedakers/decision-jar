import { Clock, ExternalLink, MapPin, Wine, Utensils, Ticket } from "lucide-react";
import React from 'react';

interface ItineraryItem {
    activity_type?: string;
    time: string;
    venue_name: string;
    description: string;
    address: string;
    cost_estimate: string;
    booking_link?: string;
}

interface Itinerary {
    neighborhood: string;
    schedule: ItineraryItem[];
}

interface ItineraryPreviewProps {
    itinerary: Itinerary;
}

export function ItineraryPreview({ itinerary }: ItineraryPreviewProps) {
    if (!itinerary || !itinerary.schedule) return null;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
                <div className="flex justify-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {itinerary.neighborhood}
                    </span>
                </div>
            </div>

            <div className="relative border-l-2 border-slate-300 dark:border-slate-700 ml-4 space-y-8 pl-8 py-2 text-left">
                {itinerary.schedule.map((item, idx) => {
                    const activityType = item.activity_type || "";
                    let Icon = Clock;
                    if (activityType.toLowerCase().includes("drink")) Icon = Wine;
                    if (activityType.toLowerCase().includes("dinner") || activityType.toLowerCase().includes("food")) Icon = Utensils;
                    if (activityType.toLowerCase().includes("event") || activityType.toLowerCase().includes("show")) Icon = Ticket;

                    return (
                        <div key={idx} className="relative">
                            <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-pink-500 flex items-center justify-center z-10">
                                <div className="w-2 h-2 rounded-full bg-pink-500" />
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors pdf-item">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-300 mb-1 border border-pink-200 dark:border-pink-500/20">
                                            {item.time}
                                        </span>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                            {item.venue_name}
                                        </h4>
                                    </div>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-sm mb-3 leading-relaxed">{item.description}</p>
                                <div className="flex flex-col sm:flex-row gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {item.address} (est. {item.cost_estimate})
                                    </span>
                                </div>
                                {item.booking_link && (
                                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
                                        <a href={item.booking_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-pink-600 dark:text-pink-300 hover:text-pink-700 dark:hover:text-pink-200 hover:underline">
                                            Visit Website <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {(itinerary.schedule.length >= 2) && (
                <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(itinerary.schedule[0].venue_name + " " + itinerary.schedule[0].address)}&destination=${encodeURIComponent(itinerary.schedule[itinerary.schedule.length - 1].venue_name + " " + itinerary.schedule[itinerary.schedule.length - 1].address)}&waypoints=${itinerary.schedule.slice(1, -1).map(s => encodeURIComponent(s.venue_name + " " + s.address)).join('|')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 border border-blue-200 dark:border-blue-500/20 rounded-xl text-center font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <MapPin className="w-4 h-4" /> View Full Route Map
                </a>
            )}
        </div>
    );
}
