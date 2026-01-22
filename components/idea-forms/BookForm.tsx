import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookSchema } from "@/lib/validation/idea-schemas";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Book, Check } from "lucide-react";

type BookFormData = z.infer<typeof BookSchema>;

interface BookFormProps {
    initialData?: BookFormData;
    onChange: (data: BookFormData) => void;
}

export function BookForm({ initialData, onChange }: BookFormProps) {
    const { register, watch, setValue, formState: { errors } } = useForm<BookFormData>({
        resolver: zodResolver(BookSchema),
        defaultValues: initialData || {
            title: "",
            author: "",
            genre: [],
            format: "physical"
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

    const formats = [
        { id: "physical", label: "Physical" },
        { id: "ebook", label: "E-Book" },
        { id: "audiobook", label: "Audiobook" },
        { id: "any", label: "Any Format" },
    ];

    return (
        <div className="space-y-4 text-slate-800 dark:text-slate-200">
            {/* Title & Author */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Book Title</label>
                <Input
                    {...register("title")}
                    placeholder="e.g. The Hitchhiker's Guide to the Galaxy"
                    className="bg-white dark:bg-black/20"
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Author</label>
                <Input
                    {...register("author")}
                    placeholder="e.g. Douglas Adams"
                    className="bg-white dark:bg-black/20"
                />
                {errors.author && <p className="text-xs text-red-500">{errors.author.message}</p>}
            </div>

            {/* Format & Pages */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Preferred Format</label>
                <div className="flex bg-slate-100 dark:bg-black/20 p-1 rounded-lg">
                    {formats.map(f => (
                        <button
                            key={f.id}
                            type="button"
                            onClick={() => setValue("format", f.id as any)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${values.format === f.id
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Page Count</label>
                    <Input
                        type="number"
                        {...register("pageCount", { valueAsNumber: true })}
                        placeholder="224"
                        className="bg-white dark:bg-black/20"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Published Year</label>
                    <Input
                        type="number"
                        {...register("yearPublished", { valueAsNumber: true })}
                        placeholder="1979"
                        className="bg-white dark:bg-black/20"
                    />
                </div>
            </div>

            {/* Links */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Goodreads Link</label>
                <Input
                    {...register("goodreadsLink")}
                    placeholder="https://www.goodreads.com/book/show/..."
                    className="bg-white dark:bg-black/20"
                />
                {errors.goodreadsLink && <p className="text-xs text-red-500">{errors.goodreadsLink.message}</p>}
            </div>
        </div>
    );
}
