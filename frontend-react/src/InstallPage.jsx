import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Settings, CheckCircle2, ShieldCheck, ArrowLeft, Smartphone, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InstallPage() {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#fdfbf7] pb-20">
            {/* Header / Hero Section */}
            <div className="bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-700 pt-32 pb-20 px-6 text-center text-white relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto relative z-10"
                >
                    <button 
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all text-sm font-bold mb-8 border border-white/20"
                    >
                        <ArrowLeft size={16} /> Back to Shop
                    </button>
                    
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/30">
                        <Download size={40} className="text-white" />
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
                        Experience ApniDukan <br/> on Android
                    </h1>
                    <p className="text-white/80 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
                        Download our official app for a faster, smoother, and more premium shopping experience with instant notifications.
                    </p>
                </motion.div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Feature Cards */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center text-center"
                    >
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                            <Zap size={24} />
                        </div>
                        <h3 className="font-extrabold text-gray-900 mb-2">Lightning Fast</h3>
                        <p className="text-gray-500 text-sm font-medium">Optimized for performance, the app loads products instantly.</p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center text-center"
                    >
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                            <Smartphone size={24} />
                        </div>
                        <h3 className="font-extrabold text-gray-900 mb-2">Native Feel</h3>
                        <p className="text-gray-500 text-sm font-medium">Smooth gestures and transitions designed for mobile.</p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center text-center"
                    >
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="font-extrabold text-gray-900 mb-2">Secure</h3>
                        <p className="text-gray-500 text-sm font-medium">100% safe and secure official APK from ApniDukan.</p>
                    </motion.div>
                </div>

                {/* Installation Steps */}
                <div className="mt-16 bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-gray-200/50 border border-gray-100">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-10 text-center">Installation Guide</h2>
                    
                    <div className="space-y-12 max-w-2xl mx-auto">
                        <div className="flex gap-6 md:gap-10">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-lg shadow-blue-200">1</div>
                                <div className="w-0.5 h-full bg-gray-100 my-2"></div>
                            </div>
                            <div className="pb-4">
                                <h3 className="font-black text-gray-900 text-lg mb-2 uppercase tracking-tight">Download APK</h3>
                                <p className="text-gray-500 font-medium leading-relaxed">Click the primary download button below. Your browser may warn you about downloading files; choose <span className="text-blue-600 font-bold">"Download Anyway"</span>.</p>
                            </div>
                        </div>

                        <div className="flex gap-6 md:gap-10">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-lg shadow-indigo-200">2</div>
                                <div className="w-0.5 h-full bg-gray-100 my-2"></div>
                            </div>
                            <div className="pb-4">
                                <h3 className="font-black text-gray-900 text-lg mb-2 uppercase tracking-tight">Enable Settings</h3>
                                <p className="text-gray-500 font-medium leading-relaxed">Open the downloaded <span className="text-indigo-600 font-bold">app.apk</span>. If prompted, go to your phone settings and allow <span className="font-bold text-gray-800">"Install Unknown Apps"</span> for your browser.</p>
                            </div>
                        </div>

                        <div className="flex gap-6 md:gap-10">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-lg shadow-emerald-200">3</div>
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 text-lg mb-2 uppercase tracking-tight">Install & Launch</h3>
                                <p className="text-gray-500 font-medium leading-relaxed">Tap <span className="text-emerald-600 font-bold">"Install"</span> and wait for it to complete. Open the app and log in to start your premium shopping journey!</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 flex flex-col items-center">
                        <a 
                            href="/app.apk" 
                            download
                            className="group relative inline-flex items-center justify-center gap-3 px-12 py-5 bg-emerald-500 text-white font-black text-xl rounded-2xl hover:bg-emerald-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-emerald-200 overflow-hidden w-full max-w-md"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                            <Download size={24} />
                            Download App Now
                        </a>
                        <p className="mt-6 text-sm font-bold text-gray-400 flex items-center gap-2 uppercase tracking-widest">
                            <ShieldCheck size={16} className="text-emerald-500" /> Official Secure APK
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
