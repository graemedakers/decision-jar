import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActivitySchema } from "@/lib/validation/idea-schemas";
import { z } from "zod";
import { Footprints, MapPin, Globe, Clock, CheckSquare } from "lucide-react";

type ActivityFormData = z.infer<typeof ActivitySchema>;

interface ActivityFormProps {
    initialData?: ActivityFormData;
    onChange: (data: ActivityFormData) => void;
}

export function ActivityForm({ initialData, onChange }: ActivityFormProps) {
    const { register, watch, formState: { errors } } = useForm<ActivityFormData>({
        resolver: zodResolver(ActivitySchema),
        defaultValues: {
            activityType: initialData?.activityType || "",
            bookingRequired: initialData?.bookingRequired === true, // Explicit boolean check
            location: initialData?.location || { address: "", name: "" },
            officialWebsite: initialData?.officialWebsite || ""
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

    return (
        <div className="space-y-4 text-slate-800 dark:text-slate-200">
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Activity Type</label>
                <div className="relative">
                    <Footprints className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        {...register("activityType")}
                        className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="e.g. Hiking, Bowling, Museum"
                    />
                </div>
                {errors.activityType && <p className="text-xs text-red-500">{errors.activityType.message}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Website</label>
                <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        {...register("officialWebsite")}
                        className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="Official URL"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Address</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        {...register("location.address")}
                        className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="Street Address"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-white dark:bg-black/20 rounded-lg border border-slate-300 dark:border-white/10">
                <input
                    type="checkbox"
                    id="bookingRequired"
                    {...register("bookingRequired")}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label htmlFor="bookingRequired" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                    Booking Required?
                </label>
            </div>
        </div>
    );
}
