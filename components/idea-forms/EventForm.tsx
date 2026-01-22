"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EventSchema } from '@/lib/validation/idea-schemas';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface EventFormProps {
    initialData?: any;
    onChange: (data: any) => void;
}

export function EventForm({ initialData, onChange }: EventFormProps) {
    const { register, watch, formState: { errors } } = useForm({
        resolver: zodResolver(EventSchema),
        defaultValues: initialData || {
            eventName: '',
            eventType: 'other',
            venue: { name: '', address: '' },
            ticketUrl: ''
        }
    });

    const formData = watch();
    const prevDataRef = React.useRef(JSON.stringify(formData));

    React.useEffect(() => {
        const currentDataStr = JSON.stringify(formData);
        if (currentDataStr !== prevDataRef.current) {
            prevDataRef.current = currentDataStr;
            onChange(formData);
        }
    }, [formData, onChange]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Event Name</Label>
                    <Input
                        {...register('eventName')}
                        placeholder="e.g. Wicked on Broadway"
                        className="glass-input h-10 text-sm"
                    />
                    {errors.eventName && <p className="text-[10px] text-red-500">{errors.eventName.message as string}</p>}
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Event Type</Label>
                    <select
                        {...register('eventType')}
                        className="glass-input w-full h-10 text-sm px-3"
                    >
                        <option value="theatre">Theatre</option>
                        <option value="sports">Sports</option>
                        <option value="concert">Concert</option>
                        <option value="comedy">Comedy</option>
                        <option value="festival">Festival</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Venue Name</Label>
                    <Input
                        {...register('venue.name')}
                        placeholder="e.g. Gershwin Theatre"
                        className="glass-input h-10 text-sm"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Ticket URL</Label>
                    <Input
                        {...register('ticketUrl')}
                        placeholder="https://..."
                        className="glass-input h-10 text-sm"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Date & Time (Optional)</Label>
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        type="date"
                        {...register('date')}
                        className="glass-input h-10 text-sm"
                    />
                    <Input
                        type="time"
                        {...register('startTime')}
                        className="glass-input h-10 text-sm"
                    />
                </div>
            </div>
        </div>
    );
}
