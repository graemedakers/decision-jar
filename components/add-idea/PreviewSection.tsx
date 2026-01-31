import { UnifiedIdeaCard } from "../UnifiedIdeaCard";
import { ItineraryMarkdownRenderer } from "../ItineraryMarkdownRenderer";
import { ShoppingListPreview } from "../ShoppingListPreview";

interface PreviewSectionProps {
    contentRef: React.RefObject<HTMLDivElement | null>;
    shoppingRef: React.RefObject<HTMLDivElement | null>;
    formData: any;
    handleSubmitWithTracking: (e: React.FormEvent) => Promise<void>;
    effectiveType: string | undefined;
    typeData: any;
    hasStructuredData: boolean;
    cateringPlan: any;
}

export function PreviewSection({
    contentRef,
    shoppingRef,
    formData,
    handleSubmitWithTracking,
    effectiveType,
    typeData,
    hasStructuredData,
    cateringPlan
}: PreviewSectionProps) {
    return (
        <div className="space-y-4">
            <div ref={contentRef} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-white/5">
                <form id="add-idea-form" onSubmit={handleSubmitWithTracking}>
                    <UnifiedIdeaCard
                        idea={formData}
                        effectiveType={effectiveType}
                        typeData={typeData}
                    />
                </form>

                {/* Additional Markdown content if present and not handled by card */}
                {formData.details && (formData.details.includes('###') || formData.details.includes('**')) && !hasStructuredData && (
                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                        <ItineraryMarkdownRenderer
                            markdown={formData.details}
                            variant={formData.details?.includes('### Day') ? 'accordion' : 'sections'}
                            theme={{ sectionHeaderColor: 'text-secondary' }}
                        />
                    </div>
                )}
            </div>

            {/* Hidden component for shopping list PDF export */}
            {(cateringPlan || formData.details?.includes('Shopping List')) && (
                <div className="absolute left-[-9999px] top-0 pointer-events-none overflow-hidden h-0">
                    <div ref={shoppingRef} className="w-[794px] bg-white text-slate-900 p-8">
                        <ShoppingListPreview plan={cateringPlan} title={formData.description} markdown={formData.details} />
                    </div>
                </div>
            )}
        </div>
    );
}
