import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SimpleSchema } from "@/lib/validation/idea-schemas";
import { z } from "zod";
import { Quote, Feather, Palette } from "lucide-react";

type SimpleFormData = z.infer<typeof SimpleSchema>;

interface SimpleFormProps {
    initialData?: SimpleFormData;
    onChange: (data: SimpleFormData) => void;
}

export function SimpleForm({ initialData, onChange }: SimpleFormProps) {
    const defaults: Partial<SimpleFormData> = {
        text: initialData?.text || "",
        author: initialData?.author || "",
        theme: initialData?.theme || "neutral",
        backgroundColor: initialData?.backgroundColor || ""
    };

    const { register, watch, formState: { errors } } = useForm<SimpleFormData>({
        resolver: zodResolver(SimpleSchema),
        defaultValues: defaults as any,
        mode: "onChange"
    } as any);

    const values = watch();
    const prevDataRef = React.useRef(JSON.stringify(values));

    useEffect(() => {
        const currentDataStr = JSON.stringify(values);
        if (currentDataStr !== prevDataRef.current) {
            prevDataRef.current = currentDataStr;
            onChange(values);
        }
    }, [values, onChange]);

    return (
        <div className="space-y-4 text-slate-800 dark:text-slate-200">
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Content</label>
                <div className="relative">
                    <Quote className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <textarea
                        {...register("text")}
                        rows={4}
                        className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                        placeholder="Enter quote, joke, or affirmation..."
                    />
                </div>
                {errors.text && <p className="text-xs text-red-500">{errors.text.message}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Author / Source (Optional)</label>
                <div className="relative">
                    <Feather className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        {...register("author")}
                        className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="e.g. Oscar Wilde"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Theme</label>
                <div className="relative">
                    <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        {...register("theme")}
                        className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                        <option value="neutral">Neutral</option>
                        <option value="motivational">Motivational</option>
                        <option value="humor">Humor</option>
                        <option value="romantic">Romantic</option>
                        <option value="wisdom">Wisdom</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
