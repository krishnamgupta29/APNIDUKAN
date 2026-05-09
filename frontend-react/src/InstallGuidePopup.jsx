import React from 'react';
import { motion } from 'framer-motion';
import { Download, X, Settings, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';

export default function InstallGuidePopup({ onClose }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-0">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={onClose} 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8 text-white relative flex-shrink-0">
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-md"
                    >
                        <X size={18} className="text-white" />
                    </button>
                    
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-lg border border-white/30">
                        <Download size={28} className="text-white" />
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Install Official App</h2>
                    <p className="text-white/80 font-medium text-sm">Follow these simple steps to install the ApniDukan app on your Android device.</p>
                </div>
                
                {/* Steps */}
                <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">1</div>
                            <div className="w-0.5 h-full bg-gray-100 my-1"></div>
                        </div>
                        <div className="pb-4">
                            <h3 className="font-bold text-gray-900 text-base mb-1">Download APK</h3>
                            <p className="text-gray-500 text-sm">Click the download button below to get the official secure APK file.</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">2</div>
                            <div className="w-0.5 h-full bg-gray-100 my-1"></div>
                        </div>
                        <div className="pb-4">
                            <h3 className="font-bold text-gray-900 text-base mb-1">Open File</h3>
                            <p className="text-gray-500 text-sm">Once downloaded, open the <span className="font-semibold text-gray-700">app.apk</span> file from your notifications or downloads folder.</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
                                <Settings size={14} />
                            </div>
                            <div className="w-0.5 h-full bg-gray-100 my-1"></div>
                        </div>
                        <div className="pb-4">
                            <h3 className="font-bold text-gray-900 text-base mb-1">Allow Unknown Sources</h3>
                            <p className="text-gray-500 text-sm">If prompted, go to Settings and enable <span className="font-semibold text-gray-700">"Install from Unknown Sources"</span> for your browser.</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                                <CheckCircle2 size={16} />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-base mb-1">Install & Shop</h3>
                            <p className="text-gray-500 text-sm">Tap Install, open the app, and enjoy a faster, premium shopping experience!</p>
                        </div>
                    </div>
                    
                    <div className="bg-emerald-50 rounded-xl p-4 flex items-start gap-3 border border-emerald-100 mt-2">
                        <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">100% Safe & Secure</p>
                            <p className="text-emerald-600/80 text-xs">This is the official ApniDukan app. It contains no ads or malware.</p>
                        </div>
                    </div>
                </div>
                
                {/* Footer Action */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex-shrink-0">
                    <a 
                        href="/app.apk" 
                        download
                        onClick={onClose}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
                    >
                        <Download size={20} />
                        Download APK Now
                    </a>
                    <button onClick={onClose} className="w-full mt-4 text-sm font-bold text-gray-500 hover:text-gray-800 transition">
                        Cancel
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
