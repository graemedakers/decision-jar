"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GameSchema } from '@/lib/validation/idea-schemas';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface GameFormProps {
    initialData?: any;
    onChange: (data: any) => void;
}

export function GameForm({ initialData, onChange }: GameFormProps) {
    const { register, watch, setValue } = useForm({
        resolver: zodResolver(GameSchema),
        defaultValues: initialData || {
            gameType: 'video_game',
            platform: [],
            genre: [],
            minPlayers: 1,
            coop: false
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
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Game Type</Label>
                    <select
                        {...register('gameType')}
                        className="glass-input w-full h-10 text-sm px-3"
                    >
                        <option value="video_game">Video Game</option>
                        <option value="board_game">Board Game</option>
                        <option value="card_game">Card Game</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Min Players</Label>
                    <Input
                        type="number"
                        {...register('minPlayers', { valueAsNumber: true })}
                        className="glass-input h-10 text-sm"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform / Tabletop System</Label>
                <Input
                    placeholder="e.g. PS5, PC, Nintendo Switch, D&D 5e"
                    className="glass-input h-10 text-sm"
                    onBlur={(e) => {
                        const val = e.target.value.trim();
                        if (val) setValue('platform', [val]);
                    }}
                    defaultValue={formData.platform?.[0] || ''}
                />
            </div>

            <div className="flex items-center gap-2 pt-2">
                <input
                    type="checkbox"
                    id="coop"
                    {...register('coop')}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary bg-white dark:bg-black/20"
                />
                <Label htmlFor="coop" className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer">Cooperative Play</Label>
            </div>
        </div>
    );
}
