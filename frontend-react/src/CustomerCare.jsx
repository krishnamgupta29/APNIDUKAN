import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, X, HeadphonesIcon } from 'lucide-react';

export default function CustomerCare() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        key="customer-care-popup"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 bg-white rounded-3xl shadow-2xl border border-gray-100 w-72 overflow-hidden flex flex-col origin-bottom-right"
                    >
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center">
                            <div className="flex items-center gap-2 font-bold">
                                <HeadphonesIcon size={20} />
                                Need Help?
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={18} /></button>
                        </div>
                        <div className="p-5 flex flex-col gap-3">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center mb-1">Contact Support</p>
                            
                            <a href="tel:+919876543210" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded-xl transition-colors group">
                                <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Phone size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-extrabold text-gray-900">+91 98765 43210</span>
                                    <span className="text-xs text-gray-500 font-medium tracking-wide">Call us instantly</span>
                                </div>
                            </a>

                            <a href="mailto:support@apnidukaan.com" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-indigo-50 border border-gray-100 rounded-xl transition-colors group">
                                <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <Mail size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[13px] font-bold text-gray-900 truncate max-w-[130px]">support@apnidukaan.com</span>
                                    <span className="text-xs text-gray-500 font-medium tracking-wide">Drop an email</span>
                                </div>
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 md:w-16 md:h-16 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all outline-none border-4 border-white/50"
            >
                {isOpen ? <X size={24} /> : <HeadphonesIcon size={24} />}
            </button>
        </div>
    );
}
