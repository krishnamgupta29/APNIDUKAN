import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, HeadphonesIcon, MessageSquare, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SupportPage() {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="w-full min-h-[80vh] flex flex-col items-center bg-[#fdfbf7] py-10 px-4 sm:px-6">
            <div className="w-full max-w-4xl mx-auto">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 mb-8 transition"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="flex flex-col items-center text-center mb-12">
                    <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-inner"
                    >
                        <HeadphonesIcon size={40} strokeWidth={2} />
                    </motion.div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                        How can we help you?
                    </h1>
                    <p className="text-gray-500 font-medium max-w-xl mx-auto">
                        Whether you have a question about your order, need assistance with a product, or just want to share feedback, our team is here for you.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mx-auto">
                    {/* Email Support Card */}
                    <motion.a 
                        href="mailto:supportspn07@gmail.com"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col items-center text-center cursor-pointer"
                    >
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Mail size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Email Support</h3>
                        <p className="text-sm text-gray-500 mb-6 flex-1">
                            Drop us an email anytime. We usually respond within 24 hours.
                        </p>
                        <div className="text-indigo-600 font-bold bg-indigo-50 px-4 py-2 rounded-xl group-hover:bg-indigo-100 transition-colors w-full break-all">
                            supportspn07@gmail.com
                        </div>
                    </motion.a>

                    {/* Feedback / Suggestions Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col items-center text-center cursor-pointer"
                        onClick={() => navigate('/faqs')}
                    >
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <MessageSquare size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">App Guide & FAQs</h3>
                        <p className="text-sm text-gray-500 mb-6 flex-1">
                            New to Apni Dukan? Learn how to order, track, and use the platform effectively.
                        </p>
                        <div className="text-emerald-600 font-bold flex items-center gap-2 group-hover:text-emerald-700 transition-colors">
                            Read Guide <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </motion.div>
                </div>
                
                <div className="mt-16 text-center border-t border-gray-200/60 pt-8">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Operating Location</p>
                    <p className="text-gray-900 font-medium">Shahjahanpur, Uttar Pradesh</p>
                </div>
            </div>
        </main>
    );
}
