"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    rotation: number;
    scale: number;
    velocity: { x: number; y: number };
}

const colors = ["#FFC700", "#FF0000", "#2E3191", "#41BBC7"];

interface ConfettiProps {
    onComplete?: () => void;
}

export function Confetti({ onComplete }: ConfettiProps) {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        const particleCount = 50;
        const newParticles: Particle[] = [];

        for (let i = 0; i < particleCount; i++) {
            newParticles.push({
                id: i,
                x: 50, // Start from center (percentage)
                y: 50,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                scale: Math.random() * 0.5 + 0.5,
                velocity: {
                    x: (Math.random() - 0.5) * 20, // Random spread
                    y: (Math.random() - 0.5) * 20,
                },
            });
        }

        setParticles(newParticles);

        if (onComplete) {
            const timer = setTimeout(onComplete, 1600); // slightly longer than duration
            return () => clearTimeout(timer);
        }
    }, [onComplete]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ x: "50vw", y: "50vh", opacity: 1, scale: 0 }}
                    animate={{
                        x: `calc(50vw + ${p.velocity.x * 20}px)`,
                        y: `calc(50vh + ${p.velocity.y * 20}px)`,
                        opacity: 0,
                        scale: p.scale,
                        rotate: p.rotation + 360,
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{
                        position: "absolute",
                        width: "10px",
                        height: "10px",
                        backgroundColor: p.color,
                        borderRadius: "2px",
                    }}
                />
            ))}
        </div>
    );
}
