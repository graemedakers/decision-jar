import { useState, useEffect, useRef } from 'react';

interface VoiceInputOptions {
    onTranscript: (text: string) => void;
    onError?: (error: Error) => void;
    continuous?: boolean;
    language?: string;
}

export function useVoiceInput({
    onTranscript,
    onError,
    continuous = false,
    language = 'en-US'
}: VoiceInputOptions) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsSupported(
                'webkitSpeechRecognition' in window ||
                'SpeechRecognition' in window
            );
        }
    }, []);

    const startListening = () => {
        if (!isSupported) return;

        // Stop any existing instance
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }

        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = continuous;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onstart = () => setIsListening(true);

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    // Handle interim results if needed, mostly we just want the final chunk or current partial
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                onTranscript(finalTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            // Ignore 'no-speech' errors as they just mean silence
            if (event.error !== 'no-speech') {
                console.error("Speech recognition error", event.error);
                onError?.(new Error(event.error));
            }
            setIsListening(false);
        };

        try {
            recognition.start();
        } catch (e) {
            console.error("Failed to start recognition", e);
            setIsListening(false);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    return {
        isListening,
        isSupported,
        startListening,
        stopListening
    };
}
