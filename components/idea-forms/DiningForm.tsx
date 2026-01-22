import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DiningSchema } from "@/lib/validation/idea-schemas";
import { z } from "zod";
import { Utensils, DollarSign, Star, MapPin, Globe } from "lucide-react";

type DiningFormData = z.infer<typeof DiningSchema>;

interface DiningFormProps {
    initialData?: DiningFormData;
    onChange: (data: DiningFormData) => void;
}

export function DiningForm({ initialData, onChange }: DiningFormProps) {
    const { register, watch, formState: { errors } } = useForm<DiningFormData>({
        resolver: zodResolver(DiningSchema),
        defaultValues: {
            establishmentName: initialData?.establishmentName || "",
            cuisine: initialData?.cuisine || "",
            priceRange: initialData?.priceRange || "$$",
            rating: initialData?.rating,
            website: initialData?.website || "",
            location: initialData?.location || { address: "", name: "" },
            reservationRequired: !!initialData?.reservationRequired
        },
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
            {/* General Info */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Establishment Name</label>
                <div className="relative">
                    <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        {...register("establishmentName")}
                        className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="e.g. D.O.C Espresso"
                    />
                </div>
                {errors.establishmentName && <p className="text-xs text-red-500">{errors.establishmentName.message}</p>}
            </div>

            <div className="flex items-center gap-2 p-3 bg-white dark:bg-black/20 rounded-lg border border-slate-300 dark:border-white/10">
                <input
                    type="checkbox"
                    id="reservationRequired"
                    {...register("reservationRequired")}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label htmlFor="reservationRequired" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                    Reservation Required?
                </label>
            </div>
            {errors.reservationRequired && <p className="text-xs text-red-500">{errors.reservationRequired.message}</p>}


            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cuisine</label>
                    <input
                        {...register("cuisine")}
                        className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="e.g. Italian"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Price Range</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            {...register("priceRange")}
                            className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
                        >
                            <option value="$">$ (Low)</option>
                            <option value="$$">$$ (Medium)</option>
                            <option value="$$$">$$$ (High)</option>
                            <option value="$$$$">$$$$ (Luxury)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Rating (1-5)</label>
                    <div className="relative">
                        <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="5"
                            {...register("rating", { valueAsNumber: true })}
                            className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                            placeholder="4.5"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Website</label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            {...register("website")}
                            className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                            placeholder="https://..."
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Address</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        {...register("location.address")}
                        className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="123 Main St, City"
                    />
                </div>
            </div>
        </div>
    );
}
