import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowRight, Zap, ShieldCheck, MapPin, ShoppingBag, Plus } from 'lucide-react';
import axios from 'axios';
import ProductModal from './ProductModal';
import API_URL from './api';
import { getImageUrl } from './utils';

function ProductCard({ p, onClick, onAdd }) {
    const originalPrice = p.originalPrice && p.originalPrice > p.price ? p.originalPrice : null;
    const sources = p.images?.length > 0 ? p.images.map(getImageUrl) : [getImageUrl(p.image)];
    
    // Multi Image Hover Rotation State
    const [hoverIdx, setHoverIdx] = React.useState(0);
    const [isHovered, setIsHovered] = React.useState(false);
    
    // Interactive local stars
    const [starHover, setStarHover] = React.useState(0);
    const [starLocked, setStarLocked] = React.useState(false);

    React.useEffect(() => {
        let timeout, interval;
        if (isHovered && sources.length > 1) {
            timeout = setTimeout(() => {
                interval = setInterval(() => {
                    setHoverIdx(curr => (curr + 1) % sources.length);
                }, 2000);
            }, 1000);
        } else {
            setHoverIdx(0);
        }
        return () => { clearTimeout(timeout); clearInterval(interval); };
    }, [isHovered, sources.length]);

    // Handle mobile touch for swipe preview
    let touchX = 0;
    const onTouchStart = e => { touchX = e.changedTouches[0].screenX; };
    const onTouchEnd = e => {
        const d = e.changedTouches[0].screenX;
        if(d < touchX - 30) setHoverIdx(c => (c + 1) % sources.length);
        if(d > touchX + 30) setHoverIdx(c => (c - 1 + sources.length) % sources.length);
    };

    return (
        <Link 
            to={`/product/${p._id}`}
            onClick={(e) => { e.preventDefault(); if(!p.outOfStock) onClick(); }} 
            className={`flex flex-col h-full bg-white/60 backdrop-blur-xl rounded-3xl p-3 md:p-5 shadow-sm shadow-emerald-900/5 border border-platinum-200 relative group transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-900/10 cursor-pointer overflow-hidden ${p.outOfStock ? 'opacity-90' : ''}`}
        >
            {/* Free Delivery Premium Badge */}
            {p.isFreeDelivery && !p.outOfStock && (
                <div className="absolute top-5 left-5 bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 text-[9px] md:text-[10px] font-bold px-3 py-1 rounded-full z-10 tracking-widest uppercase shadow-sm border border-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Free Del
                </div>
            )}
            
            {/* Responsive Image Box (Aspect Ratio maintained) */}
            <div 
                className="w-full aspect-square rounded-2xl bg-gradient-to-b from-gray-50 flex-shrink-0 to-white overflow-hidden relative mb-4 flex items-center justify-center p-2 md:p-4 border border-gray-100/50"
                onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
                onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
            >
                {sources.map((src, idx) => (
                    <img key={idx} src={src} className={`absolute w-full h-full object-contain p-4 md:p-6 transition-all duration-700 ease-in-out origin-center ${idx === hoverIdx ? 'opacity-100 scale-100 group-hover:scale-105' : 'opacity-0 scale-95 pointer-events-none'}`} loading="lazy" />
                ))}
                
                {/* Out Of Stock Dark Filter Overflow overlay */}
                {p.outOfStock && (
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none"></div>
                )}
            </div>

            {/* Typography & Details (Flex-1 forces footer to bottom) */}
            <div className="flex flex-col flex-1">
                <h3 className="font-bold text-sm md:text-lg text-gray-800 line-clamp-2 md:line-clamp-1 mb-2 leading-tight">{p.name}</h3>
                
                {/* Interactive Stars Row */}
                <div className="flex items-center gap-0.5 mb-auto" onClick={(e) => e.stopPropagation()}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                            key={star} 
                            size={14} 
                            onMouseEnter={() => !starLocked && setStarHover(star)}
                            onMouseLeave={() => !starLocked && setStarHover(0)}
                            onClick={() => { setStarLocked(true); setStarHover(star); }}
                            className={`transition-all duration-300 ease-out cursor-pointer ${
                                (starLocked ? star <= starHover : star <= (starHover || p.averageRating)) 
                                ? 'fill-[#FFD700] text-[#FFD700] drop-shadow-[0_0_2px_rgba(255,215,0,0.5)] scale-110' 
                                : 'text-gray-200 fill-transparent scale-100'
                            }`} 
                        />
                    ))}
                    <span className="text-xs font-semibold text-gray-500 ml-1.5">({p.totalReviews})</span>
                </div>
                
                {/* Price Matrix */}
                <div className="flex items-baseline gap-2 mt-4 pt-4 border-t border-gray-100/60 relative">
                    <span className={`text-lg md:text-2xl font-extrabold tracking-tight ${p.outOfStock ? 'text-gray-400' : 'text-emerald-800'}`}>₹{p.price}</span>
                    {originalPrice && <span className="text-xs md:text-sm font-semibold text-red-400 line-through">₹{originalPrice}</span>}
                </div>

                {/* Explicit Out of Stock Typography */}
                {p.outOfStock && (
                    <div className="mt-2.5 bg-red-50 border border-red-100/50 px-2 py-1.5 rounded-lg w-max shadow-inner">
                        <span className="text-red-600/90 font-black text-[10px] md:text-xs tracking-widest block uppercase">OUT OF STOCK</span>
                    </div>
                )}
            </div>

            {/* Quick Add CTA */}
            <button 
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(e); }}
                disabled={p.outOfStock}
                className={`absolute bottom-3 right-3 md:bottom-5 md:right-5 w-10 h-10 md:w-12 md:h-12 border rounded-2xl flex items-center justify-center transition-all duration-300 z-20 shadow-lg ${p.outOfStock ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed shadow-none' : 'bg-gray-900 border-gray-800 text-white hover:bg-emerald-600 hover:border-emerald-500 hover:rotate-90 hover:scale-110 shadow-gray-200'}`}
            >
                <Plus size={20} strokeWidth={2.5} />
            </button>
        </Link>
    );
}

export default function Home({ addToCart }) {
    const { productId, category } = useParams();
    const [products, setProducts] = React.useState([]);
    const [selectedProduct, setSelectedProduct] = React.useState(null);

    React.useEffect(() => {
        axios.get(`${API_URL}/api/products`).then(res => {
            setProducts(res.data);
            if (productId) {
                const found = res.data.find(p => p._id === productId);
                if (found) setSelectedProduct(found);
            }
        });
    }, [productId]);

    return (
        <main className="flex-1 w-full flex flex-col items-center bg-[#fdfbf7]">
            {/* HERO */}
            <section className="w-full max-w-7xl mx-auto px-6 py-16 sm:py-24 lg:py-32 flex flex-col items-center text-center">
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} className="w-full">
                    <div className="inline-flex items-center gap-2 px-4 py-2 border border-blue-100 bg-blue-50/80 backdrop-blur-md rounded-full text-xs sm:text-sm font-semibold text-blue-700 mb-6 sm:mb-8 font-sans shadow-sm">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                        </span>
                        Shahjahanpur's #1 Delivery Network
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6 sm:mb-8">
                        Apni Dukan <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">Shahjahanpur 🚀</span>
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto font-medium leading-relaxed px-4">
                        Experience lightning-fast online shopping in Shahjahanpur. Shop groceries and daily essentials with our trusted local store service.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button onClick={()=>document.getElementById('shop').scrollIntoView({behavior:'smooth'})} className="px-8 sm:px-10 py-3.5 sm:py-4 bg-gray-900 text-white font-bold rounded-full hover:scale-105 hover:bg-black shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
                            Start Shopping <ArrowRight size={20}/>
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* FEATURES */}
            <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">Fast Delivery in Shahjahanpur</h2>
                    <div className="w-16 sm:w-20 h-1 bg-blue-400 mt-3 sm:mt-4 rounded-full opacity-80"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[
                        { title: "24h Delivery", icon: <Zap size={24}/>, desc: "Lightning fast processing" },
                        { title: "Trusted Platform", icon: <ShieldCheck size={24}/>, desc: "Secure & reliable service" },
                        { title: "Local Service", icon: <MapPin size={24}/>, desc: "Heart of Shahjahanpur" },
                        { title: "Easy Ordering", icon: <ShoppingBag size={24}/>, desc: "Smooth checkout flow" }
                    ].map((f, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once:true }} transition={{ delay: i*0.1 }}
                            className="bg-white/80 backdrop-blur-sm border border-gray-100/60 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-all flex flex-col items-center text-center group">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                                {f.icon}
                            </div>
                            <h3 className="text-sm sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">{f.title}</h3>
                            <p className="hidden sm:block text-gray-500 text-xs sm:text-sm">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* SHOP GRID */}
            <section id="shop" className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-16 sm:py-20 relative">
                <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">Shop Products in Shahjahanpur</h2>
                    <h2 className="text-xl sm:text-2xl font-bold text-emerald-600 mt-2">Best Deals Near You</h2>
                    <div className="w-16 sm:w-20 h-1 bg-emerald-400 mt-3 sm:mt-4 rounded-full opacity-80"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 items-stretch">
                    {products.map((p) => <ProductCard key={p._id} p={p} onClick={()=>setSelectedProduct(p)} onAdd={(e) => { e.stopPropagation(); addToCart(p); }} />)}
                </div>
            </section>

            <AnimatePresence>
                {selectedProduct && <ProductModal key={selectedProduct._id} product={selectedProduct} onClose={()=>setSelectedProduct(null)} onAdd={() => addToCart(selectedProduct)} />}
            </AnimatePresence>
        </main>
    );
}
