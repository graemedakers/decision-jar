"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TravelSchema } from '@/lib/validation/idea-schemas';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface TravelFormProps {
    initialData?: any;
    onChange: (data: any) => void;
}

export function TravelForm({ initialData, onChange }: TravelFormProps) {
    const { register, watch } = useForm({
        resolver: zodResolver(TravelSchema),
        defaultValues: initialData || {
            travelType: 'hotel',
            destination: { name: '', address: '' },
            amenities: [],
            accommodationName: ''
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
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Destination</Label>
                    <Input
                        {...register('destination.name')}
                        placeholder="e.g. Catskills, NY"
                        className="glass-input h-10 text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Type</Label>
                    <select
                        {...register('travelType')}
                        className="glass-input w-full h-10 text-sm px-3"
                    >
                        <option value="hotel">Hotel</option>
                        <option value="resort">Resort</option>
                        <option value="camping">Camping</option>
                        <option value="road_trip">Road Trip</option>
                        <option value="flight">Flight/International</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Accommodation Name (Optional)</Label>
                <Input
                    {...register('accommodationName')}
                    placeholder="e.g. The Graham & Co"
                    className="glass-input h-10 text-sm"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Check-in (Optional)</Label>
                    <Input
                        type="date"
                        {...register('checkIn')}
                        className="glass-input h-10 text-sm"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Check-out (Optional)</Label>
                    <Input
                        type="date"
                        {...register('checkOut')}
                        className="glass-input h-10 text-sm"
                    />
                </div>
            </div>
        </div>
    );
}
