import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Heart, MapPin } from 'lucide-react';

export default function Footer() {
    const navigate = useNavigate();
    
    return (
        <footer className="w-full bg-white border-t border-gray-100 pt-16 pb-8 mt-auto relative z-10">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
                    {/* Brand Section */}
                    <div className="md:col-span-2">
                        <div className="text-2xl font-extrabold tracking-tight mb-4 text-gray-900">
                            Apni<span className="text-blue-500">Dukaan</span>
                        </div>
                        <p className="text-gray-500 font-medium mb-6 max-w-sm leading-relaxed">
                            Shahjahanpur's premier local marketplace. We connect you with the best daily needs, ensuring fast delivery and top-notch quality right at your doorstep.
                        </p>
                        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 w-max px-3 py-1.5 rounded-full">
                            <ShieldCheck size={16} /> 100% Secure & Trusted
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-xs">Platform</h4>
                        <ul className="space-y-4">
                            <li><button onClick={() => navigate('/')} className="text-gray-500 hover:text-blue-600 font-medium transition-colors text-sm flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all"/> Shop Products</button></li>
                            <li><button onClick={() => navigate('/track')} className="text-gray-500 hover:text-blue-600 font-medium transition-colors text-sm flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all"/> Track Order</button></li>
                            <li><a href="mailto:support@apnidukaan.com" className="text-gray-500 hover:text-blue-600 font-medium transition-colors text-sm flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all"/> Contact Support</a></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-xs">Legal & Info</h4>
                        <ul className="space-y-4">
                            <li><button onClick={() => navigate('/legal')} className="text-gray-500 hover:text-blue-600 font-medium transition-colors text-sm flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all"/> About Us</button></li>
                            <li><button onClick={() => navigate('/legal')} className="text-gray-500 hover:text-blue-600 font-medium transition-colors text-sm flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all"/> Terms & Conditions</button></li>
                            <li><button onClick={() => navigate('/legal')} className="text-gray-500 hover:text-blue-600 font-medium transition-colors text-sm flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all"/> Privacy Policy</button></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                    <div className="text-sm font-medium text-gray-500">
                        &copy; {new Date().getFullYear()} ApniDukaan. All rights reserved.
                    </div>
                    
                        <div className="flex flex-col items-center md:items-end gap-1">
                        <div className="text-xs font-bold text-gray-400 tracking-wider">
                            Developed in Shahjahanpur & operated locally
                        </div>
                        <div className="text-sm font-medium text-gray-600 flex items-center gap-1.5 mb-2">
                            Developed by <a href="https://krishnamportfolio.netlify.app/" target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">Krishnam Gupta</a>
                        </div>
                        <div className="text-xs text-gray-500 font-medium text-center md:text-right">
                           Serving Shahjahanpur with pride.
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
