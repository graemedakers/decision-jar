import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Calendar, MapPin, DollarSign, Clock, Activity, Star, Quote, X, Utensils, Ticket, Moon, Popcorn, ExternalLink, Loader2, Download } from "lucide-react";
import { getItinerary, getCateringPlan, generateCalendarLinks } from "@/lib/utils";
import { ItineraryPreview } from "./ItineraryPreview";
import { CateringPreview } from "./CateringPreview";
import { exportToPdf } from "@/lib/pdf-export";
import { Button } from "./ui/Button";
import { showError } from "@/lib/toast";
import { getJarLabels } from "@/lib/labels";

interface ViewMemoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    idea: any;
    topic?: string;
}

export function ViewMemoryModal({ isOpen, onClose, idea, topic }: ViewMemoryModalProps) {
    const labels = getJarLabels(topic);
    const [ratings, setRatings] = useState<any[]>([]);
    const [showCalendarOptions, setShowCalendarOptions] = useState(false);

    // PDF Export
    const contentRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPdf = async () => {
        if (!contentRef.current || !idea) return;
        setIsExporting(true);
        try {
            await exportToPdf(contentRef.current, idea.description || 'plan');
        } catch (error) {
            console.error("PDF Export failed", error);
            showError("Failed to export PDF");
        } finally {
            setIsExporting(false);
        }
    };

    useEffect(() => {
        if (idea && isOpen) {
            fetch(`/api/ideas/${idea.id}/rate`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setRatings(data);
                })
                .catch(err => console.error(err));
        }
    }, [idea, isOpen]);

    if (!idea) return null;

    const formattedDate = idea.selectedAt
        ? new Date(idea.selectedAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : "Unknown Date";

    const itinerary = getItinerary(idea.details);
    const cateringPlan = getCateringPlan(idea.details);

    const formatTextWithLinks = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);

        const getFriendlyLinkText = (url: string): string => {
            try {
                const urlObj = new URL(url);
                const hostname = urlObj.hostname.replace('www.', '');

                // Common site patterns
                if (hostname.includes('amazon')) return '🛒 View on Amazon';
                if (hostname.includes('google.com/search')) return '🔍 Search on Google';
                if (hostname.includes('google.com/maps')) return '📍 View on Maps';
                if (hostname.includes('imdb')) return '🎬 View on IMDB';
                if (hostname.includes('youtube')) return '▶️ Watch on YouTube';
                if (hostname.includes('spotify')) return '🎵 Listen on Spotify';
                if (hostname.includes('goodreads')) return '📚 View on Goodreads';
                if (hostname.includes('booking.com')) return '🏨 View on Booking.com';
                if (hostname.includes('tripadvisor')) return '✈️ View on TripAdvisor';
                if (hostname.includes('yelp')) return '⭐ View on Yelp';

                // Generic domain-based label
                const domain = hostname.split('.')[0];
                return `🔗 ${domain.charAt(0).toUpperCase() + domain.slice(1)}`;
            } catch {
                return '🔗 View Link';
            }
        };

        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={i}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {getFriendlyLinkText(part)}
                    </a>
                );
            }
            return part;
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-0">
                <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-6 relative">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full p-2 bg-black/20 hover:bg-black/40 text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-2xl bg-white/20 backdrop-blur-md shadow-lg
                            ${idea.category === 'MEAL' ? 'text-orange-100' :
                                idea.category === 'EVENT' ? 'text-purple-100' :
                                    idea.category === 'PLANNED_DATE' ? 'text-pink-100' :
                                        'text-blue-100'
                            }`}
                        >
                            {idea.category === 'MEAL' && <Utensils className="w-8 h-8" />}
                            {idea.category === 'EVENT' && <Calendar className="w-8 h-8" />}
                            {idea.category === 'PLANNED_DATE' && <Moon className="w-8 h-8" />}
                            {(!idea.category || idea.category === 'ACTIVITY') && <Activity className="w-8 h-8" />}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white mb-1 leading-snug">{idea.description}</h2>
                            <div className="flex items-center gap-2 text-white/80 text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>{formattedDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {idea.photoUrls && idea.photoUrls.length > 0 ? (
                    <div className="w-full bg-black/50 border-b border-white/10 overflow-x-auto flex snap-x snap-mandatory">
                        <div className="flex h-80">
                            {idea.photoUrls.map((url: string, i: number) => (
                                <div key={i} className="min-w-[80%] md:min-w-[60%] h-full shrink-0 snap-center relative border-r border-white/10 bg-black first:pl-0">
                                    <img
                                        src={url}
                                        alt={`Memory ${i}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : idea.photoUrl ? (
                    // Fallback for old data
                    <div className="w-full h-64 md:h-80 relative bg-black border-b border-white/10">
                        <img src={idea.photoUrl} alt="Memory" className="w-full h-full object-cover" />
                    </div>
                ) : null}

                <div className="p-6 space-y-6 w-full">
                    {/* Dining Details Section - Consistent with DateReveal */}
                    {(idea.website || idea.address || idea.openingHours) && (
                        <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-4 space-y-3 text-left">
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
                                        <p className="text-sm text-slate-800 dark:text-white">{idea.address}</p>
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
                                            {idea.address === 'Streaming' || idea.address === 'Cinema' ? 'Runtime' : 'Opening Hours'}
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


                    {/* Ratings Section */}
                    {ratings.length > 0 ? (
                        <div className="space-y-3">
                            <h4 className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{labels.ratingsLabel}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {ratings.map((rating: any, index: number) => (
                                    <div key={index} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm dark:shadow-none">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-bold text-slate-900 dark:text-white text-sm">{rating.user?.name || labels.memberLabel}</div>
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <span className="font-bold">{rating.value}</span>
                                                <Star className="w-4 h-4 fill-yellow-500" />
                                            </div>
                                        </div>
                                        {rating.comment && (
                                            <div className="relative pl-3 border-l-2 border-slate-600">
                                                <p className="text-slate-700 dark:text-slate-300 text-xs italic">"{rating.comment}"</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : idea.rating ? (
                        <div className="flex items-center gap-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl p-4">
                            <div className="text-yellow-500">
                                <Star className="w-8 h-8 fill-yellow-500" />
                            </div>
                            <div>
                                <div className="text-sm text-yellow-600 dark:text-yellow-500 font-bold uppercase tracking-wider mb-0.5">Rating</div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">{idea.rating}/5</div>
                            </div>
                            {idea.ratingComment && (
                                <div className="flex-1 border-l border-yellow-500/20 pl-4 ml-2">
                                    <Quote className="w-4 h-4 text-yellow-500/50 mb-1" />
                                    <p className="text-slate-600 dark:text-slate-300 text-sm italic">"{idea.ratingComment}"</p>
                                </div>
                            )}
                        </div>
                    ) : null}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-slate-800/50 rounded-lg p-3 text-center border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                            <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400 mx-auto mb-1" />
                            <div className="text-xs text-slate-500 uppercase font-bold">Duration</div>
                            <div className="text-slate-900 dark:text-white font-medium">{idea.duration} hours</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800/50 rounded-lg p-3 text-center border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                            <DollarSign className="w-4 h-4 text-green-500 dark:text-green-400 mx-auto mb-1" />
                            <div className="text-xs text-slate-500 uppercase font-bold">Cost</div>
                            <div className="text-slate-900 dark:text-white font-medium">{idea.cost}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800/50 rounded-lg p-3 text-center border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                            <Activity className="w-4 h-4 text-red-500 dark:text-red-400 mx-auto mb-1" />
                            <div className="text-xs text-slate-500 uppercase font-bold">Activity</div>
                            <div className="text-slate-900 dark:text-white font-medium capitalize">{idea.activityLevel?.toLowerCase()}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800/50 rounded-lg p-3 text-center border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                            <MapPin className="w-4 h-4 text-purple-500 dark:text-purple-400 mx-auto mb-1" />
                            <div className="text-xs text-slate-500 uppercase font-bold">Setting</div>
                            <div className="text-slate-900 dark:text-white font-medium">{idea.indoor ? 'Indoor' : 'Outdoor'}</div>
                        </div>
                    </div>

                    {/* Details / Notes */}
                    {(idea.details || idea.notes) && (
                        <div className="space-y-4">
                            {idea.notes && (
                                <div>
                                    <h4 className="text-sm text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">Notes</h4>
                                    <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 leading-relaxed whitespace-pre-wrap shadow-sm dark:shadow-none">
                                        {idea.notes}
                                    </p>
                                </div>
                            )}

                            {idea.details && (
                                <div>
                                    <h4 className="text-sm text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">Itinerary / Details</h4>
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
                                            <div ref={contentRef} className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
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
                                            <div ref={contentRef} className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                                                <CateringPreview plan={cateringPlan} />
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 leading-relaxed whitespace-pre-wrap shadow-sm dark:shadow-none">
                                            {formatTextWithLinks(idea.details)}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Add to Calendar Action */}
                    <div className="relative pt-4 border-t border-slate-200 dark:border-slate-700">
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
                                        location: idea.address || "",
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
