"use client";
import React from "react";
import { ExternalLink, MapPin, Star, Clock, Calendar, Car, Utensils, Bike } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { trackRideShareClicked } from "@/lib/analytics";

// Categories that are inherently digital/online and shouldn't show map
const DIGITAL_CATEGORIES = ['BOOK', 'GAME', 'STREAMING', 'ONLINE', 'DIGITAL', 'VIRTUAL', 'SCI_FI', 'FICTION', 'NON_FICTION'];

// Keywords that indicate an item is digital/online
const DIGITAL_KEYWORDS = [
    'streaming', 'online', 'digital', 'virtual', 'app', 'mobile', 'web',
    'netflix', 'disney+', 'amazon prime', 'hbo', 'hulu', 'spotify',
    'audible', 'kindle', 'ebook', 'podcast', 'youtube', 'twitch',
    'playstation', 'xbox', 'nintendo', 'steam', 'epic games', 'pc game'
];

function isDigitalItem(name: string, address?: string, description?: string, category?: string): boolean {
    if (category && DIGITAL_CATEGORIES.includes(category.toUpperCase())) return true;
    const text = `${name || ''} ${address || ''} ${description || ''}`.toLowerCase();
    return DIGITAL_KEYWORDS.some(k => text.includes(k));
}

interface StandardizedIdeaHeaderProps {
    name: string;
    description?: string;
    address?: string;
    price?: string;
    rating?: string | number;
    website?: string;
    menuUrl?: string;
    category?: string;
    showtimes?: string;
    showDates?: string;
    cinemaName?: string;
    compact?: boolean;
}

// Categories that imply food/dining where delivery might be relevant
const DINING_CATEGORIES = [
    'DINING', 'MEAL', 'RESTAURANT', 'FAST_FOOD', 'CASUAL', 'FINE_DINING',
    'BRUNCH', 'BREAKFAST', 'LUNCH', 'DINNER', 'FOOD', 'PIZZA', 'BURGER',
    'SUSHI', 'ASIAN', 'MEXICAN', 'ITALIAN', 'DESSERT', 'BAKERY', 'CAFE'
];

function isDiningItem(category?: string): boolean {
    if (!category) return false;
    const cat = category.toUpperCase();
    return DINING_CATEGORIES.includes(cat) || DINING_CATEGORIES.some(c => cat.includes(c));
}

export function StandardizedIdeaHeader({
    name,
    description,
    address,
    price,
    rating,
    website,
    menuUrl,
    category,
    showtimes,
    showDates,
    cinemaName,
    compact = false
}: StandardizedIdeaHeaderProps) {
    const isDigital = isDigitalItem(name, address, description, category);
    const isDining = isDiningItem(category);

    return (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between items-start gap-2">
                <h4 className={`font-black text-slate-900 dark:text-white leading-tight break-words ${compact ? 'text-lg' : 'text-2xl sm:text-3xl'}`}>
                    {name}
                </h4>
                {price && price !== 'N/A' && price !== 'n/a' && (
                    website ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(website, '_blank');
                            }}
                            className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded text-slate-600 dark:text-slate-300 transition-colors cursor-pointer active:scale-95 max-w-[45%] text-right leading-tight"
                            title="Check price/tickets"
                        >
                            {price} <ExternalLink className="w-2.5 h-2.5 inline ml-1 opacity-50 shrink-0" />
                        </button>
                    ) : (
                        <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-white/10 rounded text-slate-600 dark:text-slate-300 max-w-[45%] text-right leading-tight">
                            {price}
                        </span>
                    )
                )}
            </div>

            {description && (
                <p className={`text-slate-600 dark:text-slate-300 mt-1 leading-relaxed ${compact ? 'text-sm' : 'text-base sm:text-lg italic'}`}>
                    {description}
                </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-400">
                {address && !isDigital && (
                    <button
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((cinemaName || name) + " " + address)}`, '_blank')}
                        className="flex items-center gap-1 hover:text-secondary transition-colors group"
                    >
                        <MapPin className="w-3 h-3 group-hover:scale-110 transition-transform" />
                        <span className="hover:underline">{cinemaName ? `${cinemaName} - ${address}` : address}</span>
                    </button>
                )}
                {address && isDigital && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (website) {
                                window.open(website, '_blank');
                            } else {
                                // Fallback: Search for the game/app online
                                const query = `Play ${name} online`;
                                window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                            }
                        }}
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
                    >
                        <ExternalLink className="w-3 h-3" /> {address}
                    </button>
                )}
                {showtimes && (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <Clock className="w-3 h-3" /> {showtimes}
                    </span>
                )}
                {showDates && (
                    <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                        <Calendar className="w-3 h-3" /> {showDates}
                    </span>
                )}
                {rating && (
                    <span className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-3 h-3 fill-current" /> {rating}
                    </span>
                )}
            </div>

            {rating && (
                <button
                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(name + " " + (address || "") + " reviews")}`, '_blank')}
                    className="text-[10px] text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 underline mt-1 text-left w-fit"
                >
                    Read Google Reviews
                </button>
            )}

            {/* Quick Action Links */}
            {((!isDigital && address) || website || menuUrl || name) && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-white/5 overflow-x-auto pb-1 no-scrollbar">
                    {!isDigital && address && (
                        <>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs text-slate-600 dark:text-slate-300 h-7 px-2 whitespace-nowrap font-medium"
                                type="button"
                                onClick={() => {
                                    const query = cinemaName ? `${cinemaName} ${address}` : `${name} ${address}`;
                                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
                                }}
                            >
                                <ExternalLink className="w-3 h-3 mr-1" /> Map
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs text-slate-600 dark:text-slate-300 h-7 px-2 whitespace-nowrap font-medium"
                                type="button"
                                onClick={() => {
                                    const destination = address || name;
                                    trackRideShareClicked('uber', destination, category || 'RESTAURANT');
                                    window.open(`https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${encodeURIComponent(destination)}`, '_blank');
                                }}
                                title="Get Uber ride"
                            >
                                <Car className="w-3 h-3 mr-1" /> Uber
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs text-slate-600 dark:text-slate-300 h-7 px-2 whitespace-nowrap font-medium"
                                type="button"
                                onClick={() => {
                                    const destination = address || name;
                                    trackRideShareClicked('lyft', destination, category || 'RESTAURANT');
                                    window.open(`https://lyft.com/ride?destination[address]=${encodeURIComponent(destination)}`, '_blank');
                                }}
                                title="Get Lyft ride"
                            >
                                <Car className="w-3 h-3 mr-1" /> Lyft
                            </Button>
                        </>
                    )}

                    {isDining && address && !isDigital && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-orange-600 dark:text-orange-400 h-7 px-2 whitespace-nowrap font-bold hover:bg-orange-50 dark:hover:bg-orange-500/10"
                            type="button"
                            onClick={() => {
                                // Standard Google Search is the most reliable "middleman".
                                // "I'm Feeling Lucky" triggers annoying redirect warnings.
                                // Direct UberEats internal search often fails on specific addresses.
                                // A standard Google search for "Uber Eats [Name] [Address]" almost always
                                // puts the correct direct store link at the very top.
                                const query = `Uber Eats ${name} ${address}`;
                                window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                            }}
                            title="Find on Uber Eats"
                        >
                            <Bike className="w-3 h-3 mr-1" /> Order
                        </Button>
                    )}

                    {(menuUrl || (address && (category?.toUpperCase() === 'DINING' || category?.toUpperCase() === 'BAR' || category?.toUpperCase() === 'MEAL' || category?.toUpperCase() === 'DRINK'))) && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-emerald-600 dark:text-emerald-400 h-7 px-2 whitespace-nowrap font-bold hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                            type="button"
                            onClick={() => {
                                if (menuUrl) {
                                    window.open(menuUrl, '_blank');
                                } else {
                                    // Fallback search
                                    const query = `${name} ${address} menu`;
                                    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                                }
                            }}
                        >
                            <Utensils className="w-3 h-3 mr-1" /> Menu
                        </Button>
                    )}
                    {website && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-slate-600 dark:text-slate-300 h-7 px-2 whitespace-nowrap font-medium"
                            type="button"
                            onClick={() => window.open(website, '_blank')}
                        >
                            <ExternalLink className="w-3 h-3 mr-1" /> {showtimes ? 'Tickets' : 'Web'}
                        </Button>
                    )}
                    {!website && !showtimes && name && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-slate-600 dark:text-slate-300 h-7 px-2 whitespace-nowrap font-medium"
                            type="button"
                            onClick={() => {
                                let query = name + " " + (address || "");
                                // Smart Context for Escape Rooms (Explicit category or detected from content)
                                if (category === 'ESCAPE_ROOM' || ((category === 'ACTIVITY' || !category) && (description?.toLowerCase().includes('puzzle') || description?.toLowerCase().includes('escape') || description?.toLowerCase().includes('mystery')) && !name.toLowerCase().includes('escape'))) {
                                    query += " Escape Room";
                                }
                                window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                            }}
                        >
                            <ExternalLink className="w-3 h-3 mr-1" /> Search
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
