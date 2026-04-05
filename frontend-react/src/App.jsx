import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './Home';
import TrackOrder from './TrackOrder';
import Admin from './Admin';
import { ShoppingBag, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import Intro from './Intro';
import axios from 'axios';

function Navigation({ cartCount, onCartClick }) {
    const navigate = useNavigate();
    return (
        <nav className="fixed top-0 left-0 w-full h-20 glass z-40 transition-all flex items-center justify-center">
            <div className="max-w-7xl w-full px-8 flex justify-between items-center">
                <div className="flex items-center gap-2 text-xl font-bold cursor-pointer" onClick={() => navigate('/')}>
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ApniDukaan</span>
                </div>
                <div className="hidden sm:flex gap-10">
                    <button onClick={() => navigate('/')} className="font-medium hover:opacity-70 transition">Shop</button>
                    <button onClick={() => navigate('/track')} className="font-medium hover:opacity-70 transition">Track Orders</button>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => navigate('/admin')} className="text-sm font-medium opacity-60 hover:opacity-100 hidden sm:block">Admin</button>
                    <button onClick={onCartClick} className="relative w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:scale-105 shadow-sm transition-transform">
                        <ShoppingBag size={20} />
                        <span className="absolute -top-1 -right-1 bg-red-100 text-red-700 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{cartCount}</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default function App() {
    const [showIntro, setShowIntro] = useState(true);
    const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('react-cart')) || []);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [orderPayload, setOrderPayload] = useState({});

    useEffect(() => { localStorage.setItem('react-cart', JSON.stringify(cart)); }, [cart]);

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
            const res = await axios.post(`http://localhost:5000/api/orders`, orderPayload);
            setCart([]); setIsConfirmOpen(false);
            alert(`Order Placed! ID: ${res.data.orderId}`);
        } catch(e) { alert("Failed placing order."); }
    };

    return (
        <BrowserRouter>
            <AnimatePresence>{showIntro && <Intro onComplete={() => setShowIntro(false)} />}</AnimatePresence>

            {!showIntro && (
                <div className="min-h-screen flex flex-col relative w-full overflow-hidden">
                    <Navigation cartCount={cart.reduce((a,c) => a + c.quantity, 0)} onCartClick={() => setIsCartOpen(true)} />
                    
                    <div className="pt-20 flex-1 flex flex-col w-full">
                        <Routes>
                            <Route path="/" element={<Home addToCart={addToCart} />} />
                            <Route path="/track" element={<TrackOrder />} />
                            <Route path="/admin" element={<Admin />} />
                        </Routes>
                    </div>

                    {/* Cart Drawer */}
                    <AnimatePresence>
                        {isCartOpen && (
                            <>
                                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setIsCartOpen(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"/>
                                <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[70] flex flex-col">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                        <h2 className="text-xl font-bold">Your Bag</h2>
                                        <button onClick={()=>setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                                    </div>
                                    <div className="p-6 flex-1 overflow-y-auto space-y-4">
                                        {cart.length===0 ? <p className="text-gray-400">Empty bag.</p> : cart.map(c => (
                                            <div key={c.productId} className="flex gap-4 items-center">
                                                <img src={c.image} className="w-16 h-16 object-cover rounded-xl bg-gray-50"/>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-sm text-gray-900">{c.name}</h4>
                                                    <p className="text-sm text-gray-500">₹{c.price} x {c.quantity}</p>
                                                </div>
                                                <button onClick={()=>remFromCart(c.productId)} className="text-red-500 p-2"><X size={16}/></button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-6 border-t border-gray-100 bg-gray-50">
                                        <div className="flex justify-between font-bold text-lg mb-4"><span>Total</span><span>₹{totalCalc}</span></div>
                                        <button onClick={()=>{setIsCartOpen(false); setIsCheckoutOpen(true);}} disabled={cart.length===0} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:scale-[1.02] transition disabled:opacity-50">Secure Checkout</button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Checkout Details Modal */}
                    <AnimatePresence>
                        {isCheckoutOpen && (
                            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
                                <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
                                    <button onClick={()=>setIsCheckoutOpen(false)} className="absolute top-4 right-4 p-2"><X size={20}/></button>
                                    <h3 className="text-2xl font-bold mb-6">Delivery Details</h3>
                                    <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                                        <div><input name="name" required placeholder="Full Name" className="w-full p-4 border border-gray-200 rounded-xl focus:border-gray-900 outline-none" /></div>
                                        <div><input name="phone" required type="tel" placeholder="Phone Number" className="w-full p-4 border border-gray-200 rounded-xl focus:border-gray-900 outline-none" /></div>
                                        <div><textarea name="address" required rows="3" placeholder="Complete Address" className="w-full p-4 border border-gray-200 rounded-xl focus:border-gray-900 outline-none resize-none" /></div>
                                        
                                        <div className="pt-4 border-t border-gray-100">
                                            <p className="font-bold text-sm text-gray-500 mb-3 uppercase tracking-wider">Payment Method</p>
                                            <label className="flex items-center gap-3 p-4 border border-blue-500/30 bg-blue-50/30 rounded-xl cursor-pointer">
                                                <input type="radio" checked readOnly className="w-5 h-5 accent-blue-600" />
                                                <span className="font-semibold text-gray-900">Cash on Delivery (COD)</span>
                                            </label>
                                        </div>

                                        <button className="w-full py-4 mt-6 bg-gray-900 text-white font-bold rounded-xl flex justify-center items-center gap-2 hover:bg-black transition">Review Order <ArrowRight size={18}/></button>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Final Confirm Modal */}
                    <AnimatePresence>
                        {isConfirmOpen && (
                            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
                                <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32}/></div>
                                    <h3 className="text-2xl font-bold mb-2">Confirm Order</h3>
                                    <p className="text-gray-500 text-sm mb-6">Review your order total.</p>
                                    
                                    <div className="bg-gray-50 p-4 rounded-xl text-left text-sm space-y-2 mb-6">
                                        <p><strong>{orderPayload.customerName}</strong></p>
                                        <p className="text-gray-500">{orderPayload.phone}</p>
                                        <p className="text-gray-500">{orderPayload.address}</p>
                                        <div className="pt-2 mt-2 border-t border-gray-200 font-bold flex justify-between"><span>To Pay (COD)</span><span>₹{orderPayload.total}</span></div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={()=>setIsConfirmOpen(false)} className="flex-1 py-3 bg-gray-100 font-bold rounded-xl hover:bg-gray-200 transition">Cancel</button>
                                        <button onClick={confirmOrderPlace} className="flex-1 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition">Confirm</button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </BrowserRouter>
    );
}
