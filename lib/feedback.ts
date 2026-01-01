export class SoundEffects {
    private static audioContext: AudioContext | null = null;
    private static isMuted: boolean = false;

    private static getContext(): AudioContext {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        return this.audioContext;
    }

    static playTick() {
        if (this.isMuted) return;
        try {
            const ctx = this.getContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            // High pitched short tick
            osc.frequency.value = 800;
            osc.type = 'sine';

            // Envelope for short, sharp sound
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } catch (e) {
            console.error("Audio play failed", e);
        }
    }

    static playFanfare() {
        if (this.isMuted) return;
        try {
            const ctx = this.getContext();
            const now = ctx.currentTime;

            // Simple major triad arpeggio
            [440, 554.37, 659.25, 880].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.frequency.value = freq;
                osc.type = 'triangle';

                const startTime = now + (i * 0.1);
                gain.gain.setValueAtTime(0.1, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.5);
            });
        } catch (e) {
            console.error("Audio play failed", e);
        }
    }
}

export const triggerHaptic = (pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
};
