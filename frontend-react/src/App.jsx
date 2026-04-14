import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import Home from './Home';
import TrackOrder from './TrackOrder';
import Admin from './Admin';
import ProductModal from './ProductModal';
import Legal from './Legal';
import Footer from './Footer';
import CustomerCare from './CustomerCare';
import HowToUse from './HowToUse';
import { ShoppingBag, X, ArrowRight, CheckCircle2, MapPin, HelpCircle, Trash2, Minus, Plus } from 'lucide-react';
import Intro from './Intro';
import axios from 'axios';
import API_URL from './api';
import { getImageUrl } from './utils';


function Navigation({ cartCount, onCartClick }) {
    const navigate = useNavigate();
    return (
        <nav className="fixed top-0 left-0 w-full h-20 glass z-40 transition-all flex items-center justify-center border-b border-gray-100/50">
            <div className="max-w-7xl w-full px-3 sm:px-6 md:px-8 flex justify-between items-center gap-1">
                <div className="flex items-center gap-2 text-[19px] sm:text-xl font-bold cursor-pointer shrink-0" onClick={() => navigate('/')}>
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent tracking-tight">ApniDukaan</span>
                </div>
                <div className="hidden sm:flex gap-10">
                    <button onClick={() => navigate('/')} className="font-bold text-gray-600 hover:text-gray-900 transition flex items-center shrink-0">Shop</button>
                    <button onClick={() => navigate('/track')} className="font-bold text-gray-600 hover:text-gray-900 transition flex items-center shrink-0">Track Orders</button>
                    <button onClick={() => document.dispatchEvent(new CustomEvent('open-how-to-use'))} className="font-bold text-gray-600 hover:text-gray-900 transition flex items-center gap-1 shrink-0"><HelpCircle size={16}/> How to Use</button>
                </div>
                <div className="flex gap-2 sm:gap-3 md:gap-4 items-center shrink-0">
                    <button onClick={() => navigate('/track')} className="text-xs font-bold text-gray-500 hover:text-gray-900 sm:hidden bg-gray-100 px-2.5 py-2 rounded-full shrink-0">Track</button>
                    <button onClick={() => document.dispatchEvent(new CustomEvent('open-how-to-use'))} className="text-xs font-bold text-blue-500 hover:text-blue-700 sm:hidden bg-blue-50 px-2.5 py-2 rounded-full flex items-center gap-1 shrink-0"><HelpCircle size={14}/> Help</button>
                    <button onClick={() => navigate('/admin')} className="text-sm font-bold text-gray-400 hover:text-gray-900 hidden sm:block shrink-0">Admin</button>
                    <button onClick={onCartClick} className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gray-900 text-white flex items-center justify-center hover:scale-105 shadow-md shadow-gray-200 transition-all shrink-0">
                        <ShoppingBag size={18} />
                        <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-red-500 text-white text-[9px] sm:text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full border border-white sm:border-2">{cartCount}</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default function App() {
    const [showIntro, setShowIntro] = useState(true);
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('apni_cart');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    useEffect(() => {
        localStorage.setItem('apni_cart', JSON.stringify(cart));
    }, [cart]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);
    const [selectedProductFromCart, setSelectedProductFromCart] = useState(null);
    const [orderPayload, setOrderPayload] = useState({});
    const [locationError, setLocationError] = useState('');

    const openProductFromCart = (productId) => {
        try {
            const cached = JSON.parse(localStorage.getItem('apni_products_cache') || '[]');
            const p = cached.find(x => x._id === productId);
            if (p) setSelectedProductFromCart(p);
        } catch(e){}
    };

    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    useEffect(() => { 
        const openHowToUse = () => setIsHowToUseOpen(true);
        document.addEventListener('open-how-to-use', openHowToUse);
        return () => document.removeEventListener('open-how-to-use', openHowToUse);
    }, []);

    const addToCart = (product, qty = 1) => {
        setCart(prev => {
            const ext = prev.find(p => p.productId === product._id);
            if (ext) return prev.map(p => p.productId === product._id ? { ...p, quantity: p.quantity + qty } : p);
            return [...prev, { 
                productId: product._id, 
                name: product.name, 
                price: product.price, 
                deliveryCharge: product.isFreeDelivery ? 0 : (product.deliveryCharge || 0),
                isFreeDelivery: product.isFreeDelivery,
                quantity: qty, 
                image: product.images?.[0] || product.image 
            }];
        });
    };
    const remFromCart = (id) => setCart(prev => prev.filter(p => p.productId !== id));
    const decreaseQty = (id) => setCart(prev => prev.map(p => 
        p.productId === id ? { ...p, quantity: p.quantity - 1 } : p
    ).filter(p => p.quantity > 0));
    
    // Detailed Calculations
    const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const deliveryTotal = cart.length > 0 ? Math.max(...cart.map(i => i.deliveryCharge || 0)) : 0;
    const totalCalc = subtotal + deliveryTotal;

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
            setAddrText('');
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
            customerName, phone, address: addrText, items: cart, 
            subtotal, deliveryTotal, total: totalCalc
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
                <div className="min-h-screen flex flex-col relative w-full overflow-x-hidden">
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
                                <motion.div key="cart-bg" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setIsCartOpen(false)} className="absolute inset-0 bg-black/50"/>
                                <motion.div key="cart-panel" initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',damping:25,stiffness:200}} className="absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-10 flex flex-col">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                        <h2 className="text-xl font-bold">Your Bag</h2>
                                        <button type="button" onClick={()=>setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
                                    </div>
                                    <div className="p-6 flex-1 overflow-y-auto space-y-4">
                                        {cart.length===0 ? <p className="text-gray-400">Empty bag.</p> : cart.map(c => (
                                            <div key={c.productId} className="flex gap-4 items-center">
                                                <div className="flex-shrink-0 cursor-pointer" onClick={() => openProductFromCart(c.productId)}>
                                                    <img src={getImageUrl(c.image)} className="w-16 h-16 object-cover rounded-xl bg-gray-50 border border-gray-100 shadow-sm hover:opacity-80 transition" alt={c.name}/>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-sm text-gray-900 cursor-pointer hover:text-blue-600 transition truncate" onClick={() => openProductFromCart(c.productId)}>{c.name}</h4>
                                                    <div className="flex items-center mt-1">
                                                        <span className="text-sm font-semibold text-gray-900 mr-2">₹{c.price}</span>
                                                        <div className="flex items-center bg-gray-100 rounded-lg">
                                                            <button type="button" onClick={() => decreaseQty(c.productId)} className="p-1.5 hover:bg-gray-200 rounded-l-lg text-gray-600 transition"><Minus size={14}/></button>
                                                            <span className="text-xs font-bold w-6 text-center">{c.quantity}</span>
                                                            <button type="button" onClick={() => addToCart({_id: c.productId}, 1)} className="p-1.5 hover:bg-gray-200 rounded-r-lg text-gray-600 transition"><Plus size={14}/></button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={()=>remFromCart(c.productId)} className="text-red-500 p-2 hover:bg-red-50 rounded-full transition"><Trash2 size={18}/></button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-6 border-t border-gray-100 bg-gray-50">
                                        <div className="max-h-32 overflow-y-auto mb-4 space-y-2 text-sm pr-2">
                                            {cart.map(c => (
                                                <div key={c.productId} className="flex justify-between items-start gap-2">
                                                    <span className="text-gray-600 truncate flex-1">{c.name} <span className="text-xs text-gray-400">x{c.quantity}</span></span>
                                                    <span className="font-semibold text-gray-800">₹{c.price * c.quantity}</span>
                                                </div>
                                            ))}
                                            {cart.length > 0 && (
                                                <div className="flex justify-between items-start gap-2 pt-2 border-t border-gray-200 mt-2">
                                                    <span className="text-gray-600">Delivery Charge</span>
                                                    <span className={deliveryTotal > 0 ? "font-semibold text-gray-800" : "font-black text-emerald-600 tracking-wider uppercase text-xs mt-0.5"}>{deliveryTotal > 0 ? `₹${deliveryTotal}` : 'FREE'}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between font-bold text-lg mb-4"><span>Total To Pay</span><span className="text-emerald-600">₹{totalCalc}</span></div>
                                        <button type="button" onClick={()=>{setIsCartOpen(false); setIsCheckoutOpen(true);}} disabled={cart.length===0} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:scale-[1.02] transition disabled:opacity-50">Secure Checkout</button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Checkout Details Modal */}
                    <AnimatePresence>
                        {isCheckoutOpen && (
                            <motion.div key="checkout-modal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4">
                                <motion.div initial={{scale:0.95, y:20}} animate={{scale:1, y:0}} exit={{scale:0.95, y:20}} className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative">

                                    {/* Header */}
                                    <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
                                        <h3 className="text-2xl font-extrabold text-gray-900">Delivery Details</h3>
                                        <button type="button" onClick={()=>{ setIsCheckoutOpen(false); setLocationError(''); }} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition"><X size={18}/></button>
                                    </div>

                                    <form onSubmit={handleMapClickSubmit} className="p-6 space-y-4">

                                        <button type="button" onClick={handleUseGPS} disabled={fetchingGPS}
                                            className="w-full py-4 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 border border-blue-500/20 bg-gradient-to-tr from-blue-500/5 to-blue-600/[0.02] text-blue-600 hover:from-blue-500/10 hover:to-blue-600/5 active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-white/40 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                                            {fetchingGPS
                                                ? <><div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"/> <span className="relative z-10">Detecting...</span></>
                                                : <><MapPin size={18} className="relative z-10"/> <span className="relative z-10 font-extrabold uppercase tracking-tight">Detect via GPS</span></>}
                                        </button>

                                        <div><input name="name" required placeholder="Full Name" className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 font-medium outline-none" /></div>
                                        <div><input name="phone" required type="tel" pattern="^[0-9]{10}$" title="Please enter a valid 10-digit mobile number" placeholder="Phone Number (10 digits)" className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 font-medium outline-none" /></div>

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
                            <motion.div key="confirm-modal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4">
                                <motion.div initial={{scale:0.9, y:20}} animate={{scale:1, y:0}} exit={{scale:0.9, y:20}} className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl text-center">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32}/></div>
                                    <h3 className="text-2xl font-extrabold mb-2 text-gray-900">Confirm Order</h3>
                                    <p className="text-gray-500 text-sm mb-6 font-medium">Review your order details.</p>
                                    
                                    <div className="bg-gray-50 p-5 rounded-2xl text-left text-sm space-y-3 mb-8 border border-gray-100 shadow-inner-sm">
                                        <div className="flex justify-between items-start">
                                            <p className="font-extrabold text-gray-900 tracking-tight">{orderPayload.customerName}</p>
                                            <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-gray-100 text-gray-400 font-mono italic">Customer</span>
                                        </div>
                                        <p className="text-gray-500 font-mono text-xs flex items-center gap-2">📞 {orderPayload.phone}</p>
                                        <div className="bg-white/50 p-2.5 rounded-xl border border-gray-100/50">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><MapPin size={10}/> Delivery Address</p>
                                            <p className="text-gray-600 leading-relaxed max-h-24 overflow-y-auto text-xs font-medium">{orderPayload.address}</p>
                                        </div>

                                        <div className="space-y-2 pt-3 border-t border-gray-200/40">
                                            <div className="flex justify-between text-xs text-gray-500 font-medium">
                                                <span>Items Price</span>
                                                <span>₹{orderPayload.subtotal}</span>
                                            </div>
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-gray-500">Delivery Charge</span>
                                                <span className={orderPayload.deliveryTotal > 0 ? 'text-gray-900' : 'text-emerald-600'}>
                                                    {orderPayload.deliveryTotal > 0 ? `+ ₹${orderPayload.deliveryTotal}` : 'FREE'}
                                                </span>
                                            </div>
                                            <div className="pt-2 mt-1 border-t border-gray-100 font-black flex justify-between text-base">
                                                <span className="text-gray-900">Total To Pay</span>
                                                <span className="text-emerald-600">₹{orderPayload.total}</span>
                                            </div>
                                        </div>
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
                            <motion.div key="order-success" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
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

                    {/* Cart Product Modal */}
                    <AnimatePresence>
                        {selectedProductFromCart && (
                            <ProductModal 
                                product={selectedProductFromCart} 
                                onClose={() => setSelectedProductFromCart(null)}
                                onAdd={(qty) => {
                                    addToCart(selectedProductFromCart, qty);
                                    setSelectedProductFromCart(null);
                                }}
                            />
                        )}
                    </AnimatePresence>
                </div>
            )}
            <Analytics />
        </>
    );
}
