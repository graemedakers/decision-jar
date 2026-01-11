"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function Jar3D() {
    return (
        <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto perspective-1000">
            {/* Glow underneath */}
            {/* Grounding Shadow / Glow */}
            <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-48 h-12 bg-slate-900/20 dark:bg-primary/30 blur-2xl rounded-full pointer-events-none" />

            {/* Jar Image */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full h-full flex items-center justify-center pt-8"
            >
                <Image
                    src="/jar-hero.png"
                    alt="Date Jar"
                    fill
                    className="object-contain drop-shadow-2xl"
                    sizes="(max-width: 768px) 100vw, 320px"
                    priority
                />
            </motion.div>
        </div>
    );
}
