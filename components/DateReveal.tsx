import { getItinerary, getCateringPlan, getApiUrl, generateCalendarLinks } from "@/lib/utils";
import { ItineraryPreview } from "./ItineraryPreview";
import { CateringPreview } from "./CateringPreview";
import { ItineraryMarkdownRenderer } from "./ItineraryMarkdownRenderer";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Sparkles, Loader2, MapPin, ExternalLink, Star, Utensils, Check, Popcorn, Download } from "lucide-react";
import { Button } from "./ui/Button";
import { useState, useRef } from "react";
import { Confetti } from "./Confetti";
import { exportToPdf } from "@/lib/pdf-export";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import { Idea } from "@/lib/types";

interface Recommendation {
    title: string;
    description: string;
    url?: string;
}

interface DateRevealProps {
    idea: Idea | null;
    onClose: () => void;
    userLocation?: string;
    onFindDining?: (location: string) => void;
    isViewOnly?: boolean;
}

export function DateReveal({ idea, onClose, userLocation, onFindDining, isViewOnly }: DateRevealProps) {
    const isMobile = useMediaQuery("(max-width: 768px)");

    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [showAI, setShowAI] = useState(false);

    // PDF Export State
    const contentRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPdf = async () => {
        if (!contentRef.current || !idea) return;
        setIsExporting(true);
        try {
            await exportToPdf(contentRef.current, idea.description || 'plan');
        } catch (error) {
            console.error("PDF Export failed", error);
            alert("Failed to export PDF");
        } finally {
            setIsExporting(false);
        }
    };

    const handleGetAI = async () => {
        if (!idea) return;
        setIsLoadingAI(true);
        setShowAI(true);
        try {
            const res = await fetch(getApiUrl('/api/ai-recommendations'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: idea.description,
                    details: idea.details,
                    location: userLocation
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setRecommendations(data.recommendations || []);
            }
        } catch (error) {
            console.error("Failed to get AI recommendations", error);
        } finally {
            setIsLoadingAI(false);
        }
    };


    // Date Selection Logic
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);
    const [isUpdatingDate, setIsUpdatingDate] = useState(false);
    const [showCalendarOptions, setShowCalendarOptions] = useState(false);

    const handleConfirmDate = async () => {
        if (!idea) return;
        setIsUpdatingDate(true);
        try {
            const res = await fetch(getApiUrl(`/api/ideas/${idea.id}/date`), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: selectedDateStr }) // Expects YYYY-MM-DD
            });

            if (res.ok) {
                setShowDatePicker(false);
                // Success!
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(`Failed to update date: ${errorData.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error updating date. Please check your connection.");
        } finally {
            setIsUpdatingDate(false);
        }
    };

    const itinerary = idea ? getItinerary(idea.details) : null;
    const cateringPlan = idea ? getCateringPlan(idea.details) : null;

    // Reset state when modal closes or idea changes
    if (!idea && (recommendations.length > 0 || showAI)) {
        setRecommendations([]);
        setShowAI(false);
        setIsLoadingAI(false);
    }

    // Animation Variants
    const desktopVariants = {
        hidden: { scale: 0.8, y: 50, opacity: 0 },
        visible: { scale: 1, y: 0, opacity: 1 },
        exit: { scale: 0.8, y: 50, opacity: 0 }
    };

    const mobileVariants = {
        hidden: { y: "100%", opacity: 0 },
        visible: { y: 0, opacity: 1 },
        exit: { y: "100%", opacity: 0 }
    };

    return (
        <AnimatePresence>
            {idea && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`fixed inset-0 z-50 flex ${isMobile ? 'items-end' : 'items-center justify-center'} p-0 md:p-4 bg-black/60 backdrop-blur-sm`}
                    onClick={onClose} // Click backdrop to close
                >
                    {!isViewOnly && <Confetti />}
                    <motion.div
                        variants={isMobile ? mobileVariants : desktopVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()} // Prevent close on card click
                        className={`glass-card w-full relative overflow-hidden flex flex-col bg-white dark:bg-slate-900 
                            ${isMobile
                                ? 'rounded-t-[2rem] rounded-b-none max-h-[85vh] h-auto pb-safe'
                                : 'max-w-lg max-h-[90vh] rounded-2xl'
                            }`}
                    >
                        {/* Mobile Drag Handle */}
                        {isMobile && (
                            <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                            </div>
                        )}

                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 blur-[50px] rounded-full -z-10" />

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors z-10"
                            aria-label="Close modal"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center space-y-6 pt-8 px-6 pb-6 overflow-y-auto custom-scrollbar">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 shrink-0"
                            >
                                <Calendar className="w-10 h-10 text-white" />
                            </motion.div>

                            <div>
                                <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">
                                    {isViewOnly ? "Idea Details" : "It's Decided!"}
                                </h2>
                                <h3 className="text-3xl font-black text-slate-800 dark:text-white leading-tight break-words">
                                    {idea.description}
                                </h3>
                            </div>

                            {/* Dining Details Section */}
                            {(idea.website || idea.address || idea.openingHours) && (
                                <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-4 space-y-3 text-left">
                                    {idea.details && (
                                        <div className="mb-4 pb-4 border-b border-slate-200 dark:border-white/10">
                                            <p className="text-slate-600 dark:text-slate-200 leading-relaxed text-sm break-words">
                                                {idea.details.split('\n').filter(line =>
                                                    !line.trim().startsWith('Address:') &&
                                                    !line.trim().startsWith('Website:') &&
                                                    !line.trim().startsWith('Hours:') &&
                                                    !line.trim().startsWith('Rating:') &&
                                                    !line.trim().startsWith('Price:')
                                                ).join('\n').trim()}
                                            </p>
                                        </div>
                                    )}
                                    {idea.address && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-white dark:bg-white/10 rounded-full shrink-0 shadow-sm dark:shadow-none">
                                                {idea.address === 'Streaming'
                                                    ? <Popcorn className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                                                    : <MapPin className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                                                }
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">
                                                    {idea.address === 'Streaming' || idea.address === 'Cinema' ? 'Watch On' : 'Address'}
                                                </p>
                                                <p className="text-sm text-slate-800 dark:text-white break-words">{idea.address}</p>
                                                {idea.address !== 'Streaming' && (
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(idea.description + " " + idea.address)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-secondary hover:underline mt-1 inline-block"
                                                    >
                                                        View on Google Maps
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {idea.openingHours && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-white dark:bg-white/10 rounded-full shrink-0 shadow-sm dark:shadow-none">
                                                <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">
                                                    {idea.address === 'Streaming' || idea.address?.toLowerCase().includes('cinema') ? 'Runtime' : 'Opening Hours'}
                                                </p>
                                                <p className="text-sm text-slate-800 dark:text-white">{idea.openingHours}</p>
                                            </div>
                                        </div>
                                    )}

                                    {idea.googleRating && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-white dark:bg-white/10 rounded-full shrink-0 shadow-sm dark:shadow-none">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Google Rating</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-slate-800 dark:text-white font-bold">{idea.googleRating} / 5</p>
                                                    <a
                                                        href={`https://www.google.com/search?q=${encodeURIComponent(idea.description + " " + (idea.address || "") + " reviews")}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-400 hover:underline"
                                                    >
                                                        Read Reviews
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {idea.website && (
                                        <Button
                                            onClick={() => window.open(idea.website, '_blank')}
                                            className="w-full mt-2 bg-white text-slate-900 hover:bg-slate-100 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white border border-slate-200 dark:border-transparent shadow-sm dark:shadow-none"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            {idea.address === 'Streaming' ? `Watch on ${idea.cost !== '$' && idea.cost !== 'Free' ? 'Streaming' : 'Service'}` :
                                                idea.address === 'Cinema' ? 'Get Tickets' : 'Make Reservation / Visit Website'}
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Only show categories and AI if it's NOT a dining concierge result (i.e. no address/website) */}
                            {!(idea.website || idea.address || idea.openingHours) && (
                                <>
                                    {itinerary ? (
                                        <div className="space-y-2">
                                            <div className="flex justify-end">
                                                <Button
                                                    onClick={handleExportPdf}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-xs text-slate-500 hover:text-pink-600 h-8"
                                                    disabled={isExporting}
                                                >
                                                    {isExporting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Download className="w-3 h-3 mr-1" />}
                                                    Export Itinerary PDF
                                                </Button>
                                            </div>
                                            <div ref={contentRef} className="bg-white dark:bg-slate-900 p-2 rounded-xl">
                                                <ItineraryPreview itinerary={itinerary} />
                                            </div>
                                        </div>
                                    ) : cateringPlan ? (
                                        <div className="space-y-2">
                                            <div className="flex justify-end">
                                                <Button
                                                    onClick={handleExportPdf}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-xs text-slate-500 hover:text-orange-600 h-8"
                                                    disabled={isExporting}
                                                >
                                                    {isExporting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Download className="w-3 h-3 mr-1" />}
                                                    Export Menu PDF
                                                </Button>
                                            </div>
                                            <div ref={contentRef} className="bg-white dark:bg-slate-900 p-2 rounded-xl">
                                                <CateringPreview plan={cateringPlan} />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Idea Details */}
                                            <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-6 border border-slate-200 dark:border-white/10 text-left">
                                                <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4 text-secondary" />
                                                    The Plan
                                                </h4>
                                                <div className="text-slate-700 dark:text-slate-200 leading-relaxed break-words">
                                                    {idea.details && (idea.details.includes('###') || idea.details.includes('**')) ? (
                                                        <ItineraryMarkdownRenderer
                                                            markdown={idea.details}
                                                            variant={idea.details.includes('### Day') ? 'accordion' : 'sections'}
                                                            theme={{ sectionHeaderColor: 'text-secondary' }}
                                                        />
                                                    ) : (
                                                        <p className="whitespace-pre-wrap">
                                                            {idea.details ? (
                                                                idea.details.split(/(https?:\/\/[^\s]+)/g).map((part, i) => (
                                                                    part.match(/https?:\/\/[^\s]+/) ? (
                                                                        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline break-all inline-block">
                                                                            {part}
                                                                        </a>
                                                                    ) : part
                                                                ))
                                                            ) : "No specific details provided. Be spontaneous!"}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                                                        {Number(idea.duration || 0) * 60} mins
                                                    </span>
                                                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                                                        {idea.cost}
                                                    </span>
                                                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                                                        {idea.indoor ? 'Indoor' : 'Outdoor'}
                                                    </span>
                                                </div>

                                                {onFindDining && idea.address && (
                                                    <Button
                                                        onClick={() => {
                                                            // Use description (Name) and address for specific location
                                                            const query = `${idea.description}, ${idea.address}`;
                                                            onFindDining(query);
                                                        }}
                                                        variant="ghost"
                                                        className="w-full mt-4 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-orange-600 dark:text-orange-300 hover:text-orange-700 dark:hover:text-orange-200"
                                                    >
                                                        <Utensils className="w-4 h-4 mr-2" />
                                                        Find food nearby
                                                    </Button>
                                                )}
                                            </div>

                                            {/* AI Recommendations Section - Only show if no link in details (implies generic idea) */}
                                            {!idea.details?.match(/https?:\/\/[^\s]+/) && (
                                                <div className="space-y-4">
                                                    {!showAI ? (
                                                        <Button
                                                            onClick={handleGetAI}
                                                            variant="ghost"
                                                            className="w-full border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300"
                                                        >
                                                            <Sparkles className="w-4 h-4 mr-2 text-yellow-500 dark:text-yellow-400" />
                                                            Find Specific Places & Tickets
                                                        </Button>
                                                    ) : (
                                                        <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 text-left space-y-3 animate-in fade-in slide-in-from-bottom-4 border border-slate-200 dark:border-white/10">
                                                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                <MapPin className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                                                                Suggested Places
                                                            </h4>

                                                            {isLoadingAI ? (
                                                                <div className="flex items-center justify-center py-4 text-slate-400 gap-2">
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                    <span className="text-sm">Scouting locations...</span>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    {recommendations.map((rec: any, i) => (
                                                                        <div key={i} className="bg-white dark:bg-black/20 p-3 rounded-lg border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-black/30 transition-colors shadow-sm dark:shadow-none">
                                                                            <div className="flex justify-between items-start gap-2">
                                                                                <div>
                                                                                    <h5 className="font-medium text-slate-900 dark:text-white text-sm">{rec.title}</h5>
                                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{rec.description}</p>
                                                                                </div>
                                                                                <div className="flex flex-col gap-1">
                                                                                    {rec.url && (
                                                                                        <a
                                                                                            href={rec.url}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className="shrink-0 p-2 bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 rounded-full text-secondary transition-colors"
                                                                                            title="View Info / Tickets"
                                                                                            aria-label="View Info / Tickets"
                                                                                        >
                                                                                            <ExternalLink className="w-3 h-3" />
                                                                                        </a>
                                                                                    )}
                                                                                    {onFindDining && (
                                                                                        <button
                                                                                            onClick={() => onFindDining(rec.title)}
                                                                                            className="shrink-0 p-2 bg-orange-500/10 hover:bg-orange-500/20 rounded-full text-orange-400 transition-colors"
                                                                                            title="Find Food Nearby"
                                                                                            aria-label="Find Food Nearby"
                                                                                        >
                                                                                            <Utensils className="w-3 h-3" />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    {recommendations.length === 0 && (
                                                                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">No specific places found. Try a Google search!</p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                            <div className="flex flex-col gap-3 pt-2">
                                {idea.canEdit && (
                                    <>
                                        {!showDatePicker ? (
                                            <Button
                                                onClick={() => setShowDatePicker(true)}
                                                variant="outline"
                                                className="w-full border-slate-200 dark:border-white/20 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10"
                                            >
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Set Date for Memory
                                            </Button>
                                        ) : (
                                            <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                                <label htmlFor="date-picker" className="text-sm font-medium text-slate-700 dark:text-slate-300 block">When will you do this?</label>
                                                <input
                                                    id="date-picker"
                                                    type="date"
                                                    value={selectedDateStr}
                                                    onChange={(e) => setSelectedDateStr(e.target.value)}
                                                    className="w-full bg-white dark:bg-black/40 border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-secondary transition-colors"
                                                    aria-label="Select Date"
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => handleConfirmDate()}
                                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white dark:bg-green-500/20 dark:text-green-200 dark:hover:bg-green-500/30"
                                                        disabled={isUpdatingDate}
                                                    >
                                                        {isUpdatingDate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                                        Confirm Date
                                                    </Button>
                                                    <Button
                                                        onClick={() => setShowDatePicker(false)}
                                                        variant="ghost"
                                                        className="px-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Add to Calendar */}
                                <div className="relative">
                                    <Button
                                        onClick={() => setShowCalendarOptions(!showCalendarOptions)}
                                        variant="outline"
                                        className="w-full border-slate-200 dark:border-white/20 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10"
                                    >
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Add to Calendar
                                    </Button>
                                    {showCalendarOptions && (
                                        <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 flex flex-col gap-1 z-20 animate-in fade-in slide-in-from-bottom-2">
                                            {(() => {
                                                const links = generateCalendarLinks({
                                                    title: idea.description,
                                                    description: idea.details || "",
                                                    location: idea.address || userLocation || "",
                                                    startTime: idea.selectedAt ? new Date(idea.selectedAt) : new Date(),
                                                    endTime: idea.selectedAt ? new Date(new Date(idea.selectedAt).getTime() + (Number(idea.duration || 1) * 60 * 60 * 1000)) : undefined
                                                });
                                                return (
                                                    <>
                                                        <a href={links.google} target="_blank" rel="noopener noreferrer" className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Google Calendar</a>
                                                        <a href={links.outlook} target="_blank" rel="noopener noreferrer" className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Outlook</a>
                                                        <a href={links.apple} download="event.ics" className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Apple / iCal</a>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>


                                <Button onClick={onClose} variant="secondary" className="w-full shadow-lg shadow-secondary/20">
                                    Close & Enjoy!
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )
            }
        </AnimatePresence >
    );
}
