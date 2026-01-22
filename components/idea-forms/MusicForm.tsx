import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MusicSchema } from "@/lib/validation/idea-schemas";
import { z } from "zod";
import { Music, User, Globe, Calendar, MapPin } from "lucide-react";

type MusicFormData = z.infer<typeof MusicSchema>;

interface MusicFormProps {
    initialData?: MusicFormData;
    onChange: (data: MusicFormData) => void;
}

export function MusicForm({ initialData, onChange }: MusicFormProps) {
    const { register, watch, formState: { errors } } = useForm<MusicFormData>({
        resolver: zodResolver(MusicSchema),
        defaultValues: {
            artist: initialData?.artist || "",
            title: initialData?.title || "",
            type: initialData?.type || "album",
            genre: initialData?.genre || [],
            listenLink: initialData?.listenLink || "",
            venue: initialData?.venue || { address: "", name: "" }
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
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Artist</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            {...register("artist")}
                            className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                            placeholder="Band or Singer"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Title</label>
                    <input
                        {...register("title")}
                        className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="Album or Concert Name"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Type</label>
                    <select
                        {...register("type")}
                        className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                        <option value="album">Album</option>
                        <option value="concert">Concert</option>
                        <option value="playlist">Playlist</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Listen Link</label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            {...register("listenLink")}
                            className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                            placeholder="Spotify / URL"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Venue / Location</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        {...register("venue.address")}
                        className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="Event Address (Optional)"
                    />
                </div>
            </div>
        </div>
    );
}
