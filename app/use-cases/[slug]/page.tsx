import { USE_CASES } from "@/lib/use-cases";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, UserPlus, PlusCircle, Dices } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Metadata } from "next";

export function generateStaticParams() {
    return USE_CASES.map((uc) => ({
        slug: uc.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const useCase = USE_CASES.find((uc) => uc.slug === slug);

    if (!useCase) {
        return {
            title: "Use Case Not Found",
        };
    }

    return {
        title: `${useCase.title} Decision Jar - How it Works`,
        description: useCase.description,
        openGraph: {
            title: `How to create a ${useCase.title} Decision Jar`,
            description: useCase.description,
            type: 'article',
        }
    };
}

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const useCase = USE_CASES.find((uc) => uc.slug === slug);

    if (!useCase) {
        notFound();
    }

    const { icon: Icon, color, title, description, steps, cta } = useCase;

    const schema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": `How to use a ${title} Decision Jar`,
        "description": description,
        "step": [
            {
                "@type": "HowToStep",
                "name": steps.create.title,
                "text": steps.create.description,
                "position": 1
            },
            {
                "@type": "HowToStep",
                "name": steps.invite.title,
                "text": steps.invite.description,
                "position": 2
            },
            {
                "@type": "HowToStep",
                "name": steps.add.title,
                "text": steps.add.description,
                "position": 3
            },
            {
                "@type": "HowToStep",
                "name": steps.choose.title,
                "text": steps.choose.description,
                "position": 4
            }
        ]
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": process.env.NEXT_PUBLIC_APP_URL || 'https://spinthejar.com'
        }, {
            "@type": "ListItem",
            "position": 2,
            "name": "Use Cases",
            "item": `${process.env.NEXT_PUBLIC_APP_URL || 'https://spinthejar.com'}/use-cases`
        }, {
            "@type": "ListItem",
            "position": 3,
            "name": title
        }]
    };

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
                    <Link href="/use-cases" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Examples
                    </Link>
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative pt-16 pb-24 px-4 overflow-hidden">
                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <div className={`w-20 h-20 mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center mb-8 ${color}`}>
                        <Icon className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">{title}</h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-10 max-w-2xl mx-auto">
                        {description}
                    </p>
                    <Link href={`/signup?jarType=${useCase.jarType}&ref=usecase_${slug}`}>
                        <Button size="lg" className="rounded-full px-8 py-6 text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                            {cta}
                        </Button>
                    </Link>
                </div>

                {/* Decorative Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl -z-10" />
            </section>

            {/* Steps Section */}
            <section className="max-w-4xl mx-auto px-4">
                <div className="grid gap-12 relative">
                    {/* Connecting Line */}
                    <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-1 bg-slate-200 dark:bg-slate-800 -translate-x-1/2 hidden md:block" />

                    {/* Step 1: Create */}
                    <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start group">
                        <div className="md:w-1/2 md:text-right md:pr-12 order-2 md:order-1">
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{steps.create.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {steps.create.description}
                            </p>
                        </div>
                        <div className="absolute left-[20px] md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center z-10 group-hover:border-primary transition-colors order-1 md:order-2">
                            <Sparkles className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                        </div>
                        <div className="md:w-1/2 md:pl-12 order-3 md:order-3 md:block hidden" />
                    </div>

                    {/* Step 2: Invite */}
                    <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start group">
                        <div className="md:w-1/2 md:text-right md:pr-12 order-2 md:order-1 md:block hidden" />
                        <div className="absolute left-[20px] md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center z-10 group-hover:border-primary transition-colors order-1 md:order-2">
                            <UserPlus className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                        </div>
                        <div className="md:w-1/2 md:pl-12 order-2 md:order-3">
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{steps.invite.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {steps.invite.description}
                            </p>
                        </div>
                    </div>

                    {/* Step 3: Add */}
                    <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start group">
                        <div className="md:w-1/2 md:text-right md:pr-12 order-2 md:order-1">
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{steps.add.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {steps.add.description}
                            </p>
                        </div>
                        <div className="absolute left-[20px] md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center z-10 group-hover:border-primary transition-colors order-1 md:order-2">
                            <PlusCircle className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                        </div>
                        <div className="md:w-1/2 md:pl-12 order-3 md:order-3 md:block hidden" />
                    </div>

                    {/* Step 4: Choose */}
                    <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start group">
                        <div className="md:w-1/2 md:text-right md:pr-12 order-2 md:order-1 md:block hidden" />
                        <div className="absolute left-[20px] md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center z-10 group-hover:border-primary transition-colors order-1 md:order-2">
                            <Dices className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                        </div>
                        <div className="md:w-1/2 md:pl-12 order-2 md:order-3">
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{steps.choose.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {steps.choose.description}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="mt-24 px-4 text-center">
                <div className="bg-slate-900 dark:bg-white/5 rounded-3xl p-12 max-w-4xl mx-auto relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black text-white mb-6">Ready to try it yourself?</h2>
                        <Link href={`/signup?jarType=${useCase.jarType}&ref=usecase_${slug}`}>
                            <Button size="lg" variant="secondary" className="rounded-full px-8 py-6 text-lg font-bold">
                                {cta}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
