import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const Intro = React.forwardRef(({ onComplete }, ref) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 3500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div 
            ref={ref}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-[#fbf8cc] via-[#fde4cf] to-[#ffcfd2]"
        >
            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center z-10"
            >
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-4">
                    Apni<span className="text-blue-500">Dukaan</span>
                </h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="text-lg md:text-xl font-medium text-gray-700/80 max-w-sm mx-auto"
                >
                    Shahjahanpur’s Trusted Delivery Platform
                </motion.p>
            </motion.div>
        </motion.div>
    );
});

export default Intro;
