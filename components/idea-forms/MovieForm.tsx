import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MovieSchema } from "@/lib/validation/idea-schemas";
import { z } from "zod";
import { Input } from "@/components/ui/Input";

type MovieFormData = z.infer<typeof MovieSchema>;

interface MovieFormProps {
    initialData?: MovieFormData;
    onChange: (data: MovieFormData) => void;
}

export function MovieForm({ initialData, onChange }: MovieFormProps) {
    const { register, watch, setValue, formState: { errors } } = useForm<MovieFormData>({
        resolver: zodResolver(MovieSchema),
        defaultValues: initialData || {
            title: "",
            watchMode: "streaming",
            streamingPlatform: [],
            theaters: [],
            genre: []
        },
        mode: "onChange"
    });

    const values = watch();
    const prevDataRef = React.useRef(JSON.stringify(values));

    useEffect(() => {
        const currentDataStr = JSON.stringify(values);
        if (currentDataStr !== prevDataRef.current) {
            prevDataRef.current = currentDataStr;
            onChange(values);
        }
    }, [values, onChange]);

    const streamingPlatforms = ["Netflix", "Disney+", "Hulu", "Prime Video", "HBO Max", "Apple TV+", "Peacock", "Paramount+"];
    const watchModes = [
        { id: "streaming", label: "Streaming" },
        { id: "cinema", label: "Cinema" },
        { id: "either", label: "Either" }
    ];

    const togglePlatform = (platform: string) => {
        const current = values.streamingPlatform || [];
        const updated = current.includes(platform)
            ? current.filter(p => p !== platform)
            : [...current, platform];
        setValue("streamingPlatform", updated);
    };

    return (
        <div className="space-y-4 text-slate-800 dark:text-slate-200">
            {/* Title & Director */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Movie Title</label>
                <Input
                    {...register("title")}
                    placeholder="e.g. Inception"
                    className="bg-white dark:bg-black/20"
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Director</label>
                    <Input
                        {...register("director")}
                        placeholder="e.g. Christopher Nolan"
                        className="bg-white dark:bg-black/20"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Year</label>
                    <Input
                        type="number"
                        {...register("year", { valueAsNumber: true })}
                        placeholder="2010"
                        className="bg-white dark:bg-black/20"
                    />
                </div>
            </div>

            {/* Runtime & Watch Mode */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Runtime (mins)</label>
                    <Input
                        type="number"
                        {...register("runtime", { valueAsNumber: true })}
                        placeholder="148"
                        className="bg-white dark:bg-black/20"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Watch Mode</label>
                    <select
                        {...register("watchMode")}
                        className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none h-10"
                    >
                        {watchModes.map(mode => (
                            <option key={mode.id} value={mode.id}>{mode.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Streaming Platforms (Conditional) */}
            {(values.watchMode === 'streaming' || values.watchMode === 'either') && (
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Available On</label>
                    <div className="flex flex-wrap gap-2">
                        {streamingPlatforms.map(platform => (
                            <button
                                key={platform}
                                type="button"
                                onClick={() => togglePlatform(platform)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${(values.streamingPlatform || []).includes(platform)
                                    ? "bg-blue-500 text-white border-blue-500"
                                    : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-blue-300"
                                    }`}
                            >
                                {platform}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Links */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">IMDb Link</label>
                <Input
                    {...register("imdbLink")}
                    placeholder="https://www.imdb.com/title/..."
                    className="bg-white dark:bg-black/20"
                />
                {errors.imdbLink && <p className="text-xs text-red-500">{errors.imdbLink.message}</p>}
            </div>
        </div>
    );
}
