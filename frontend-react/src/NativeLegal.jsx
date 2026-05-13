import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, FileText, ChevronLeft, Scale, Info, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Legal() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('privacy');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activeTab]);

    const tabs = [
        { id: 'privacy', label: 'Privacy', icon: Lock, color: '#4361ee' },
        { id: 'terms', label: 'Terms', icon: FileText, color: '#f72585' },
        { id: 'security', label: 'Security', icon: ShieldCheck, color: '#10b981' },
    ];

    return (
        <div className="flex flex-col min-h-screen pb-20" style={{ background: '#f8f9fd' }}>
            {/* Header */}
            <div 
                className="sticky top-0 z-40 px-4 pt-12 pb-6"
                style={{ background: 'linear-gradient(160deg,#0d0221 0%,#240046 100%)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
            >
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 active:scale-90 transition-transform"
                    >
                        <ChevronLeft size={24} className="text-white" />
                    </button>
                    <h1 className="text-2xl font-black text-white">Legal Center</h1>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/10 rounded-2xl p-1 gap-1">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-white text-gray-900 shadow-lg' : 'text-white/60'}`}
                            >
                                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                <span className={`text-xs font-black ${isActive ? 'opacity-100' : 'opacity-80'}`}>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Section */}
            <div className="px-4 mt-8 flex-1">
                <AnimatePresence mode="wait">
                    {activeTab === 'privacy' && (
                        <motion.div
                            key="privacy"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Info size={20} />
                                    </div>
                                    <h2 className="text-lg font-black text-gray-900">Your Data Privacy</h2>
                                </div>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                    We collect only the essential information required to process and deliver your orders (Name, Phone Number, and Delivery Address).
                                </p>
                            </div>

                            <div className="bg-blue-600 rounded-[32px] p-6 text-white shadow-xl shadow-blue-600/20">
                                <h3 className="text-base font-black mb-2 flex items-center gap-2">
                                    <CheckCircle size={18} /> No Data Selling
                                </h3>
                                <p className="text-xs text-white/80 font-medium leading-relaxed">
                                    We guarantee that your personal data will never be sold, rented, or misused by any third party. Your info stays within ApniDukan.
                                </p>
                            </div>

                            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50">
                                <h3 className="text-base font-black text-gray-900 mb-2">Communication</h3>
                                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                                    We will only contact you regarding your active orders or critical account updates via the phone number provided.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'terms' && (
                        <motion.div
                            key="terms"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
                                        <Scale size={20} />
                                    </div>
                                    <h2 className="text-lg font-black text-gray-900">Service Terms</h2>
                                </div>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                    Our delivery services are strictly operational within the boundaries of Shahjahanpur, Uttar Pradesh.
                                </p>
                            </div>

                            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50">
                                <h3 className="text-base font-black text-gray-900 mb-2">Order Fulfillment</h3>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                    We strive to fulfill all confirmed orders within 24 hours. Any delays will be communicated proactively.
                                </p>
                            </div>

                            <div className="bg-gray-900 rounded-[32px] p-6 text-white">
                                <h3 className="text-base font-black mb-2">Right to Refuse</h3>
                                <p className="text-xs text-white/70 font-medium leading-relaxed">
                                    We reserve the right to cancel any order if the delivery location is outside our service area or if the product is out of stock.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <h2 className="text-lg font-black text-gray-900">App Security</h2>
                                </div>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                    Your trust is our biggest asset. All transactions on ApniDukan are completely secure with standard encryption.
                                </p>
                            </div>

                            <div className="bg-emerald-600 rounded-[32px] p-6 text-white shadow-xl shadow-emerald-600/20">
                                <h3 className="text-base font-black mb-2 flex items-center gap-2">
                                    <Lock size={18} /> No Sensitive Storage
                                </h3>
                                <p className="text-xs text-white/80 font-medium leading-relaxed">
                                    We do not store any sensitive payment information on our servers. All local deliveries are handled by our trusted internal network.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer space */}
            <div className="py-10 text-center opacity-30">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Updated April 2026</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Shahjahanpur, UP</p>
            </div>
        </div>
    );
}
