import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, ArrowLeft, History } from 'lucide-react';

export default function Checkout({ cart, subtotal, deliveryTotal, totalCalc, setOrderPayload }) {
    const navigate = useNavigate();
    const [nameText, setNameText] = useState('');
    const [phoneText, setPhoneText] = useState('');
    const [addrText, setAddrText] = useState('');
    const [fetchingGPS, setFetchingGPS] = useState(false);
    const [locationError, setLocationError] = useState('');
    const [savedDetails, setSavedDetails] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('apnidukan_user_details');
        if (saved) {
            setSavedDetails(JSON.parse(saved));
        }
    }, []);

    const handleAutoFill = () => {
        if (savedDetails) {
            setNameText(savedDetails.name || '');
            setPhoneText(savedDetails.phone || '');
            setAddrText(savedDetails.address || '');
        }
    };

    const reverseGeocode = async (lat, lon) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await res.json();
            return data;
        } catch(e) { return null; }
    };

    const handleUseGPS = () => {
        if (!navigator.geolocation) return alert("Geolocation not supported");
        setFetchingGPS(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            const geo = await reverseGeocode(latitude, longitude);
            if (geo) setAddrText(geo.display_name);
            setFetchingGPS(false);
        }, () => { setFetchingGPS(false); alert("Unable to get location"); });
    };

    const handleMapClickSubmit = async (e) => {
        e.preventDefault();
        const customerName = nameText;
        const phone = phoneText;
        setLocationError('');

        localStorage.setItem('apnidukan_user_details', JSON.stringify({
            name: customerName,
            phone: phone,
            address: addrText
        }));

        setOrderPayload({
            customerName, phone, address: addrText, items: cart, 
            subtotal, deliveryTotal, total: totalCalc
        });
        navigate('/confirm-order');
    };

    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your bag is empty</h2>
                <button onClick={() => navigate('/')} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold">Shop Now</button>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            transition={{ duration: 0.3 }}
            className="max-w-xl mx-auto w-full px-4 py-8 mb-16"
        >
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 mb-6 transition">
                <ArrowLeft size={16} /> Back
            </button>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">Delivery Details</h3>

                <form onSubmit={handleMapClickSubmit} className="space-y-4">
                    <div className="flex gap-2">
                        <button type="button" onClick={handleUseGPS} disabled={fetchingGPS}
                            className="flex-1 py-4 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border border-blue-500/20 bg-gradient-to-tr from-blue-500/5 to-blue-600/[0.02] text-blue-600 hover:from-blue-500/10 hover:to-blue-600/5 active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/40 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                            {fetchingGPS
                                ? <><div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"/> <span className="relative z-10">Detecting...</span></>
                                : <><MapPin size={18} className="relative z-10"/> <span className="relative z-10 font-extrabold uppercase tracking-tight">GPS</span></>}
                        </button>
                        
                        {savedDetails && (
                            <button type="button" onClick={handleAutoFill}
                                className="flex-1 py-4 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border border-purple-500/20 bg-gradient-to-tr from-purple-500/5 to-purple-600/[0.02] text-purple-600 hover:from-purple-500/10 hover:to-purple-600/5 active:scale-[0.98] transition-all shadow-sm relative overflow-hidden group">
                                <History size={18} /> <span className="font-extrabold uppercase tracking-tight">Auto-fill</span>
                            </button>
                        )}
                    </div>

                    <div>
                        <input name="name" required value={nameText} onChange={e => setNameText(e.target.value)} placeholder="Full Name" className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 font-medium outline-none transition" />
                    </div>
                    <div>
                        <input name="phone" required value={phoneText} onChange={e => setPhoneText(e.target.value)} type="tel" pattern="^[0-9]{10}$" title="Please enter a valid 10-digit mobile number" placeholder="Phone Number (10 digits)" className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 font-medium outline-none transition" />
                    </div>

                    <div className="relative group">
                        <div className="absolute left-3.5 top-4 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                            <MapPin size={18} />
                        </div>
                        <textarea
                            name="address" required rows="4"
                            value={addrText}
                            onChange={e => { setAddrText(e.target.value); setLocationError(''); }}
                            placeholder="Enter full address with landmarks (e.g. Near Big Temple, Civil Lines)"
                            className={`w-full p-3.5 pl-11 bg-gray-50 border rounded-2xl focus:bg-white font-medium outline-none resize-none transition-all text-sm ${
                                locationError ? 'border-red-300 focus:border-red-500 bg-red-50/50' : 'border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
                            }`}
                        />
                        <AnimatePresence>
                            {locationError && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 overflow-hidden">
                                    <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-2.5 text-xs font-bold flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                        {locationError.replace('❌ ', '')}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <label className="flex items-center gap-3 p-4 border-2 border-blue-500/30 bg-blue-50/50 rounded-xl cursor-pointer">
                            <input type="radio" checked readOnly className="w-5 h-5 accent-blue-600" />
                            <span className="font-bold text-gray-900 text-sm">Cash on Delivery (COD)</span>
                        </label>
                    </div>

                    <button type="submit" className="w-full mt-4 py-4 bg-gray-900 text-white font-bold rounded-xl flex justify-center items-center gap-2 hover:bg-black transition shadow-xl shadow-gray-900/10 active:scale-[0.98]">
                        Review Order <ArrowRight size={18}/>
                    </button>
                </form>
            </div>
        </motion.div>
    );
}
