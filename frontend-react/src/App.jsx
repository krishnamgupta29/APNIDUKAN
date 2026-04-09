import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './Home';
import TrackOrder from './TrackOrder';
import Admin from './Admin';
import Legal from './Legal';
import Footer from './Footer';
import CustomerCare from './CustomerCare';
import HowToUse from './HowToUse';
import { ShoppingBag, X, ArrowRight, CheckCircle2, MapPin, HelpCircle } from 'lucide-react';
import Intro from './Intro';
import axios from 'axios';
import API_URL from './api';
import { getImageUrl } from './utils';


function Navigation({ cartCount, onCartClick }) {
    const navigate = useNavigate();
    return (
        <nav className="fixed top-0 left-0 w-full h-20 glass z-40 transition-all flex items-center justify-center border-b border-gray-100/50">
            <div className="max-w-7xl w-full px-6 md:px-8 flex justify-between items-center">
                <div className="flex items-center gap-2 text-xl font-bold cursor-pointer" onClick={() => navigate('/')}>
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent tracking-tight">ApniDukaan</span>
                </div>
                <div className="hidden sm:flex gap-10">
                    <button onClick={() => navigate('/')} className="font-bold text-gray-600 hover:text-gray-900 transition">Shop</button>
                    <button onClick={() => navigate('/track')} className="font-bold text-gray-600 hover:text-gray-900 transition">Track Orders</button>
                    <button onClick={() => document.dispatchEvent(new CustomEvent('open-how-to-use'))} className="font-bold text-gray-600 hover:text-gray-900 transition flex items-center gap-1"><HelpCircle size={16}/> How to Use</button>
                </div>
                <div className="flex gap-3 md:gap-4 items-center">
                    <button onClick={() => navigate('/track')} className="text-xs font-bold text-gray-500 hover:text-gray-900 sm:hidden bg-gray-100 px-3 py-2 rounded-full">Track</button>
                    <button onClick={() => document.dispatchEvent(new CustomEvent('open-how-to-use'))} className="text-xs font-bold text-blue-500 hover:text-blue-700 sm:hidden bg-blue-50 px-3 py-2 rounded-full flex items-center gap-1"><HelpCircle size={14}/> Help</button>
                    <button onClick={() => navigate('/admin')} className="text-sm font-bold text-gray-400 hover:text-gray-900 hidden sm:block">Admin</button>
                    <button onClick={onCartClick} className="relative w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center hover:scale-105 shadow-md shadow-gray-200 transition-all">
                        <ShoppingBag size={18} />
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{cartCount}</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default function App() {
    const [showIntro, setShowIntro] = useState(true);
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);
    const [orderPayload, setOrderPayload] = useState({});
    const [locationError, setLocationError] = useState('');

    useEffect(() => { 
        const openHowToUse = () => setIsHowToUseOpen(true);
        document.addEventListener('open-how-to-use', openHowToUse);
        return () => document.removeEventListener('open-how-to-use', openHowToUse);
    }, []);

    const addToCart = (product) => {
        setCart(prev => {
            const ext = prev.find(p => p.productId === product._id);
            if (ext) return prev.map(p => p.productId === product._id ? { ...p, quantity: p.quantity + 1 } : p);
            return [...prev, { productId: product._id, name: product.name, price: product.price, quantity: 1, image: product.images?.[0] || product.image }];
        });
    };
    const remFromCart = (id) => setCart(prev => prev.filter(p => p.productId !== id));
    const totalCalc = cart.reduce((s, i) => s + (i.price * i.quantity), 0);

    const handleCheckoutSubmit = (e) => {
        e.preventDefault();
        setOrderPayload({
            customerName: e.target.name.value, phone: e.target.phone.value,
            address: e.target.address.value, items: cart, total: totalCalc
        });
        setIsCheckoutOpen(false); setIsConfirmOpen(true);
    };

    const confirmOrderPlace = async () => {
        try {
            const res = await axios.post(`${API_URL}/api/orders`, orderPayload);
            setCart([]); setIsConfirmOpen(false);
            setOrderPayload(prev => ({...prev, placedId: res.data.orderId}));
        } catch(e) { alert("Failed placing order."); }
    };
    
    // GPS & Checkout Handlers
    const [addrText, setAddrText] = useState('');
    const [fetchingGPS, setFetchingGPS] = useState(false);
    
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
        const customerName = e.target.name.value;
        const phone = e.target.phone.value;
        setLocationError('');

        setOrderPayload({
            customerName, phone, address: addrText, items: cart, total: totalCalc
        });
        setIsCheckoutOpen(false); setIsConfirmOpen(true);
    };

    const navigate = useNavigate();

    return (
        <>
            <AnimatePresence>
                {showIntro && <Intro key="intro" onComplete={() => setShowIntro(false)} />}
            </AnimatePresence>

            {!showIntro && (
                <div className="min-h-screen flex flex-col relative w-full overflow-hidden">
                    <Navigation cartCount={cart.reduce((a,c) => a + c.quantity, 0)} onCartClick={() => setIsCartOpen(true)} />
                    
                    <div className="pt-20 flex-1 flex flex-col w-full">
                        <Routes>
                            <Route path="/" element={<Home addToCart={addToCart} />} />
                            <Route path="/track" element={<TrackOrder />} />
                            <Route path="/admin" element={<Admin />} />
                            <Route path="/legal" element={<Legal />} />
                        </Routes>
                    </div>

                    <Footer />
                    <CustomerCare />
                    <HowToUse isOpen={isHowToUseOpen} onClose={() => setIsHowToUseOpen(false)} />

                    {/* Cart Drawer */}
                    <AnimatePresence>
                        {isCartOpen && (
                            <motion.div key="cart-container" className="fixed inset-0 z-[60]">
                                <motion.div key="cart-bg" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setIsCartOpen(false)} className="absolute inset-0 bg-black/20 backdrop-blur-sm"/>
                                <motion.div key="cart-panel" initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',damping:25,stiffness:200}} className="absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-10 flex flex-col">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                        <h2 className="text-xl font-bold">Your Bag</h2>
                                        <button type="button" onClick={()=>setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
                                    </div>
                                    <div className="p-6 flex-1 overflow-y-auto space-y-4">
                                        {cart.length===0 ? <p className="text-gray-400">Empty bag.</p> : cart.map(c => (
                                            <div key={c.productId} className="flex gap-4 items-center">
                                                <img src={getImageUrl(c.image)} className="w-16 h-16 object-cover rounded-xl bg-gray-50 border border-gray-100 shadow-sm" alt={c.name}/>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-sm text-gray-900">{c.name}</h4>
                                                    <p className="text-sm text-gray-500">₹{c.price} x {c.quantity}</p>
                                                </div>
                                                <button type="button" onClick={()=>remFromCart(c.productId)} className="text-red-500 p-2"><X size={16}/></button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-6 border-t border-gray-100 bg-gray-50">
                                        <div className="flex justify-between font-bold text-lg mb-4"><span>Total</span><span>₹{totalCalc}</span></div>
                                        <button type="button" onClick={()=>{setIsCartOpen(false); setIsCheckoutOpen(true);}} disabled={cart.length===0} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:scale-[1.02] transition disabled:opacity-50">Secure Checkout</button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Checkout Details Modal */}
                    <AnimatePresence>
                        {isCheckoutOpen && (
                            <motion.div key="checkout-modal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/40 backdrop-blur-md z-[80] flex items-center justify-center p-4">
                                <motion.div initial={{scale:0.95, y:20}} animate={{scale:1, y:0}} exit={{scale:0.95, y:20}} className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative">

                                    {/* Header */}
                                    <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
                                        <h3 className="text-2xl font-extrabold text-gray-900">Delivery Details</h3>
                                        <button type="button" onClick={()=>{ setIsCheckoutOpen(false); setLocationError(''); }} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition"><X size={18}/></button>
                                    </div>

                                    <form onSubmit={handleMapClickSubmit} className="p-6 space-y-4">

                                        {/* GPS Button */}
                                        <button type="button" onClick={handleUseGPS} disabled={fetchingGPS}
                                            className="w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all disabled:opacity-60">
                                            {fetchingGPS
                                                ? <><div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"/> Detecting Location...</>
                                                : <><MapPin size={16}/> Use Current Location (GPS)</>}
                                        </button>

                                        <div><input name="name" required placeholder="Full Name" className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 font-medium outline-none" /></div>
                                        <div><input name="phone" required type="tel" placeholder="Phone Number" className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 font-medium outline-none" /></div>

                                        <div>
                                            <textarea
                                                name="address" required rows="3"
                                                value={addrText}
                                                onChange={e => { setAddrText(e.target.value); setLocationError(''); }}
                                                placeholder="Enter your full address (Shahjahanpur)"
                                                className={`w-full p-3.5 bg-gray-50 border rounded-xl focus:bg-white font-medium outline-none resize-none transition-colors ${
                                                    locationError ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                                                }`}
                                            />
                                            {/* Inline Error Message */}
                                            {locationError && (
                                                <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                                                    <span className="text-base leading-none mt-0.5">❌</span>
                                                    <p className="text-sm font-semibold leading-snug">{locationError.replace('❌ ', '')}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-2 border-t border-gray-100">
                                            <label className="flex items-center gap-3 p-4 border-2 border-blue-500/30 bg-blue-50/50 rounded-xl cursor-pointer">
                                                <input type="radio" checked readOnly className="w-5 h-5 accent-blue-600" />
                                                <span className="font-bold text-gray-900 text-sm">Cash on Delivery (COD)</span>
                                            </label>
                                        </div>

                                        <button className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl flex justify-center items-center gap-2 hover:bg-black transition shadow-xl shadow-gray-900/10">
                                            Review Order <ArrowRight size={18}/>
                                        </button>
                                    </form>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Final Confirm Modal */}
                    <AnimatePresence>
                        {isConfirmOpen && !orderPayload.placedId && (
                            <motion.div key="confirm-modal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/40 backdrop-blur-md z-[90] flex items-center justify-center p-4">
                                <motion.div initial={{scale:0.9, y:20}} animate={{scale:1, y:0}} exit={{scale:0.9, y:20}} className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl text-center">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32}/></div>
                                    <h3 className="text-2xl font-extrabold mb-2 text-gray-900">Confirm Order</h3>
                                    <p className="text-gray-500 text-sm mb-6 font-medium">Review your order details.</p>
                                    
                                    <div className="bg-gray-50 p-4 rounded-xl text-left text-sm space-y-2 mb-6 border border-gray-100">
                                        <p className="font-bold text-gray-900">{orderPayload.customerName}</p>
                                        <p className="text-gray-500 font-mono text-xs">{orderPayload.phone}</p>
                                        <p className="text-gray-500 leading-relaxed max-h-20 overflow-y-auto">{orderPayload.address}</p>
                                        <div className="pt-3 mt-3 border-t border-gray-200 font-bold flex justify-between text-base"><span>To Pay (COD)</span><span className="text-emerald-600">₹{orderPayload.total}</span></div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={()=>setIsConfirmOpen(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">Go Back</button>
                                        <button onClick={confirmOrderPlace} className="flex-1 py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition shadow-xl shadow-gray-900/20">Confirm Place</button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Order Success Styled UI Modal */}
                        {orderPayload.placedId && (
                            <motion.div key="order-success" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                                <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} className="bg-gradient-to-b from-emerald-50 to-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-emerald-100 text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                                    
                                    <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring", delay: 0.1}} className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                        <CheckCircle2 size={40} strokeWidth={2.5}/>
                                    </motion.div>
                                    
                                    <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h3>
                                    <p className="text-gray-500 font-medium text-sm mb-6">Your order has been successfully placed to {orderPayload.customerName.split(' ')[0]}.</p>
                                    
                                    <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm mb-8">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order Tracking ID</p>
                                        <p className="font-mono text-lg font-bold tracking-wider text-gray-900">{orderPayload.placedId}</p>
                                    </div>

                                    <button onClick={()=>{setOrderPayload({}); navigate('/track');}} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20">
                                        Track Order
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </>
    );
}
