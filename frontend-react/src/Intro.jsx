import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Intro({ onComplete }) {
    useEffect(() => {
        const timer = setTimeout(onComplete, 3500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-[#fbf8cc] via-[#fde4cf] to-[#ffcfd2]"
        >
            {/* Subtle 3D floating shapes (CSS based via framer-motion) */}
            <motion.div 
                animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 left-20 w-32 h-32 bg-white/40 rounded-full blur-xl"
            />
            <motion.div 
                animate={{ y: [0, 30, 0], scale: [1, 1.2, 1] }} 
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-20 right-20 w-48 h-48 bg-blue-200/30 rounded-full blur-2xl"
            />

            <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                className="text-center z-10"
            >
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-4">
                    Apni<span className="text-blue-500">Dukaan</span>
                </h1>
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="text-lg md:text-xl font-medium text-gray-700/80 max-w-sm mx-auto"
                >
                    Shahjahanpur’s Trusted Local Delivery Platform
                </motion.p>
            </motion.div>
        </motion.div>
    );
}
