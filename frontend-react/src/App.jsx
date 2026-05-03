import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './Home';
import TrackOrder from './TrackOrder';
import Admin from './Admin';
import ProductPage from './ProductPage';
import Legal from './Legal';
import Footer from './Footer';
import HowToUse from './HowToUse';
import SupportPage from './SupportPage';
import { ShoppingBag, X, ArrowRight, CheckCircle2, MapPin, HelpCircle, Trash2, Minus, Plus, HeadphonesIcon } from 'lucide-react';
import Intro from './Intro';
import axios from 'axios';
import API_URL from './api';
import { getImageUrl } from './utils';
import Checkout from './Checkout';
import ConfirmOrder from './ConfirmOrder';
import OrderSuccess from './OrderSuccess';
import FAQs from './FAQs';
import Login from './Login';
import DeliveryPanel from './DeliveryPanel';

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
                    <button onClick={() => navigate('/how-to-use')} className="font-bold text-gray-600 hover:text-gray-900 transition flex items-center gap-1 shrink-0"><HelpCircle size={16}/> How to Use</button>
                    <button onClick={() => navigate('/support')} className="font-bold text-gray-600 hover:text-gray-900 transition flex items-center gap-1 shrink-0"><HeadphonesIcon size={16}/> Support</button>
                </div>
                <div className="flex gap-2 sm:gap-3 md:gap-4 items-center shrink-0">
                    <button onClick={() => navigate('/track')} className="text-xs font-bold text-gray-500 hover:text-gray-900 sm:hidden bg-gray-100 px-2.5 py-2 rounded-full shrink-0">Track</button>
                    <button onClick={() => navigate('/how-to-use')} className="text-xs font-bold text-purple-600 hover:text-purple-700 sm:hidden bg-purple-50 p-2 rounded-full flex items-center shrink-0"><HelpCircle size={16}/></button>
                    <button onClick={() => navigate('/support')} className="text-xs font-bold text-blue-600 hover:text-blue-700 sm:hidden bg-blue-50 p-2 rounded-full flex items-center shrink-0"><HeadphonesIcon size={16}/></button>
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
    const [orderPayload, setOrderPayload] = useState({});
    const navigate = useNavigate();

    const openProductFromCart = (productId) => {
        setIsCartOpen(false);
        navigate(`/product/${productId}`);
        window.scrollTo(0, 0);
    };

    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

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
                            <Route path="/products" element={<Home addToCart={addToCart} />} />
                            <Route path="/category/:categoryName" element={<Home addToCart={addToCart} />} />
                            <Route path="/product/:productId" element={<ProductPage addToCart={addToCart} />} />
                            <Route path="/track" element={<TrackOrder />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/admin" element={<Admin />} />
                            <Route path="/delivery" element={<DeliveryPanel />} />
                            <Route path="/legal" element={<Legal />} />
                            <Route path="/support" element={<SupportPage />} />
                            <Route path="/how-to-use" element={<HowToUse />} />
                            <Route path="/faqs" element={<FAQs />} />
                            <Route path="/checkout" element={<Checkout cart={cart} subtotal={subtotal} deliveryTotal={deliveryTotal} totalCalc={totalCalc} setOrderPayload={setOrderPayload} />} />
                            <Route path="/confirm-order" element={<ConfirmOrder orderPayload={orderPayload} setCart={setCart} setOrderPayload={setOrderPayload} />} />
                            <Route path="/order-success" element={<OrderSuccess orderPayload={orderPayload} setOrderPayload={setOrderPayload} />} />
                        </Routes>
                    </div>

                    <Footer />

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
                                        <button type="button" onClick={()=>{setIsCartOpen(false); navigate('/checkout');}} disabled={cart.length===0} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:scale-[1.02] transition disabled:opacity-50">Secure Checkout</button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </>
    );
}
