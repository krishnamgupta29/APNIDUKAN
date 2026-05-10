import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, HeadphonesIcon, BookOpen, Shield, FileText, ChevronRight } from 'lucide-react';

export default function NativeSettings() {
    const navigate = useNavigate();

    const menuItems = [
        { icon: <HeadphonesIcon size={20} className="text-blue-500" />, title: "Support", path: "/support" },
        { icon: <HelpCircle size={20} className="text-[var(--color-pink-orchid)]" />, title: "How to Use", path: "/how-to-use" },
        { icon: <BookOpen size={20} className="text-emerald-500" />, title: "FAQs", path: "/faqs" },
        { icon: <Shield size={20} className="text-purple-500" />, title: "Privacy Policy", path: "/legal" },
        { icon: <FileText size={20} className="text-orange-500" />, title: "Terms & Conditions", path: "/legal" },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-24">
            <div className="bg-white/70 backdrop-blur-xl border-b border-[var(--color-pink-orchid)]/10 px-4 pt-12 pb-6 shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>

            <div className="px-4 py-6">
                <div className="bg-white rounded-[20px] shadow-sm border border-[var(--color-pink-orchid)]/10 overflow-hidden">
                    {menuItems.map((item, idx) => (
                        <div 
                            key={idx}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center justify-between p-4 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer ${idx !== menuItems.length - 1 ? 'border-b border-gray-50' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-[12px] bg-gray-50 flex items-center justify-center">
                                    {item.icon}
                                </div>
                                <span className="font-semibold text-gray-800 text-sm">{item.title}</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-400" />
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ApniDukan Shahjahanpur</p>
                    <p className="text-[10px] text-gray-400 mt-1">Version 1.0.0 • Premium Edition</p>
                </div>
            </div>
        </div>
    );
}
