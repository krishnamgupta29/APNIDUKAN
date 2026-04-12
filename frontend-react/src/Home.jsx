import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowRight, Zap, ShieldCheck, MapPin, ShoppingBag, Plus } from 'lucide-react';
import axios from 'axios';
import ProductModal from './ProductModal';
import API_URL from './api';
import { getImageUrl } from './utils';

// ─── Skeleton shimmer card ────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="flex flex-col h-full bg-white/70 rounded-3xl p-3 md:p-5 border border-gray-100 overflow-hidden relative">
            {/* shimmer overlay */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent z-10" />
            {/* image placeholder */}
            <div className="w-full aspect-square rounded-2xl bg-gray-100 mb-4" />
            {/* name */}
            <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-2" />
            <div className="h-3 bg-gray-100 rounded-full w-1/2 mb-4" />
            {/* stars */}
            <div className="flex gap-1 mb-auto">
                {[...Array(5)].map((_, i) => <div key={i} className="w-3 h-3 rounded-full bg-gray-100" />)}
            </div>
            {/* price */}
            <div className="h-6 bg-gray-100 rounded-full w-1/3 mt-4" />
        </div>
    );
}

export default function Home({ addToCart }) {
    const [products, setProducts] = useState(() => {
        // Instant load from cache on first render — avoids blank screen
        try {
            const cached = localStorage.getItem('apni_products_cache');
            if (cached) return JSON.parse(cached);
        } catch {}
        return [];
    });
    const [loading, setLoading] = useState(products.length === 0);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/products`, {
                    timeout: 8000, // 8s timeout
                });
                if (!cancelled) {
                    setProducts(res.data);
                    setLoading(false);
                    // Cache in localStorage for next visit
                    try { localStorage.setItem('apni_products_cache', JSON.stringify(res.data)); } catch {}
                }
            } catch {
                if (!cancelled) setLoading(false); // stop skeleton even on error
            }
        };
        fetchProducts();
        return () => { cancelled = true; };
    }, []);

    const skeletonCount = 6;

    return (
        <main className="flex-1 w-full flex flex-col items-center bg-[#fdfbf7]">
            {/* ── HERO ─────────────────────────────────────────────────── */}
            <section className="w-full max-w-7xl mx-auto px-6 py-14 sm:py-24 lg:py-32 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="w-full"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 border border-blue-100 bg-blue-50/80 backdrop-blur-md rounded-full text-xs sm:text-sm font-semibold text-blue-700 mb-6 sm:mb-8 shadow-sm">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600" />
                        </span>
                        Shahjahanpur's #1 Delivery Network
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6 sm:mb-8">
                        Fast. Trusted. <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                            Local Delivery 🚀
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto font-medium leading-relaxed px-4">
                        Experience lightning-fast Delivery within 24h across Shahjahanpur. Shop your daily needs with our trusted platform.
                    </p>
                    <button
                        onClick={() => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 sm:px-10 py-3.5 sm:py-4 bg-gray-900 text-white font-bold rounded-full hover:scale-105 active:scale-95 hover:bg-black shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-2 w-full sm:w-auto mx-auto touch-manipulation"
                    >
                        Start Shopping <ArrowRight size={20} />
                    </button>
                </motion.div>
            </section>

            {/* ── FEATURES ─────────────────────────────────────────────── */}
            <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {[
                    { title: 'Delivery within 24h', icon: <Zap size={22} />, desc: 'Lightning fast processing' },
                    { title: 'Trusted Platform', icon: <ShieldCheck size={22} />, desc: 'Secure & reliable service' },
                    { title: 'Local Service', icon: <MapPin size={22} />, desc: 'Heart of Shahjahanpur' },
                    { title: 'Easy Ordering', icon: <ShoppingBag size={22} />, desc: 'Smooth checkout flow' },
                ].map((f, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-white border border-gray-100/60 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-xl active:scale-95 transform-gpu hover:-translate-y-1 sm:hover:-translate-y-2 transition-all flex flex-col items-center text-center group touch-manipulation"
                    >
                        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                            {f.icon}
                        </div>
                        <h3 className="text-sm sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">{f.title}</h3>
                        <p className="hidden sm:block text-gray-500 text-xs sm:text-sm">{f.desc}</p>
                    </motion.div>
                ))}
            </section>

            {/* ── SHOP GRID ─────────────────────────────────────────────── */}
            <section id="shop" className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-14 sm:py-20">
                <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">Curated Selection</h2>
                    <div className="w-16 sm:w-20 h-1 bg-emerald-400 mt-3 rounded-full opacity-80" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 items-stretch">
                    {loading
                        ? [...Array(skeletonCount)].map((_, i) => <SkeletonCard key={i} />)
                        : products.map((p) => (
                            <ProductCard
                                key={p._id}
                                p={p}
                                onClick={() => setSelectedProduct(p)}
                                onAdd={(e) => { e.stopPropagation(); addToCart(p); }}
                            />
                        ))
                    }
                </div>

                {/* No products state */}
                {!loading && products.length === 0 && (
                    <div className="text-center py-20 text-gray-400 font-medium">
                        <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
                        <p>Products loading soon…</p>
                    </div>
                )}
            </section>

            <AnimatePresence>
                {selectedProduct && (
                    <ProductModal
                        key={selectedProduct._id}
                        product={selectedProduct}
                        onClose={() => setSelectedProduct(null)}
                        onAdd={(qty) => addToCart(selectedProduct, qty)}
                    />
                )}
            </AnimatePresence>
        </main>
    );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ p, onClick, onAdd }) {
    const originalPrice = p.originalPrice && p.originalPrice > p.price ? p.originalPrice : null;
    const sources = p.images?.length > 0 ? p.images.map(getImageUrl) : [getImageUrl(p.image)];

    const [hoverIdx, setHoverIdx] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const touchXRef = useRef(0);
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (isHovered && sources.length > 1) {
            timeoutRef.current = setTimeout(() => {
                intervalRef.current = setInterval(() => {
                    setHoverIdx(c => (c + 1) % sources.length);
                }, 2000);
            }, 1000);
        } else {
            clearTimeout(timeoutRef.current);
            clearInterval(intervalRef.current);
            setHoverIdx(0);
        }
        return () => {
            clearTimeout(timeoutRef.current);
            clearInterval(intervalRef.current);
        };
    }, [isHovered, sources.length]);

    // Passive touch handlers via ref (fixes Chrome passive listener warning)
    const imgBoxRef = useRef(null);
    useEffect(() => {
        const el = imgBoxRef.current;
        if (!el) return;
        const onTouchStart = (e) => { touchXRef.current = e.changedTouches[0].screenX; };
        const onTouchEnd = (e) => {
            const d = e.changedTouches[0].screenX - touchXRef.current;
            if (d < -30) setHoverIdx(c => (c + 1) % sources.length);
            if (d > 30) setHoverIdx(c => (c - 1 + sources.length) % sources.length);
        };
        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchend', onTouchEnd, { passive: true });
        return () => {
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchend', onTouchEnd);
        };
    }, [sources.length]);

    return (
        <div
            onClick={onClick}
            className={`flex flex-col h-full bg-white rounded-3xl p-3 md:p-5 shadow-sm border border-gray-100 relative group transition-all duration-200 ease-out active:scale-[0.97] transform-gpu hover:-translate-y-2 hover:shadow-xl cursor-pointer overflow-hidden touch-manipulation select-none`}
        >
            {/* Free Delivery Badge */}
            {p.isFreeDelivery && !p.outOfStock && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 text-[9px] md:text-[10px] font-bold px-2.5 py-1 rounded-full z-10 tracking-widest uppercase shadow-sm border border-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Free Del
                </div>
            )}

            {/* Image box */}
            <div
                ref={imgBoxRef}
                className="w-full aspect-square rounded-2xl bg-gradient-to-b from-gray-50 to-white overflow-hidden relative mb-3 flex items-center justify-center border border-gray-100/50"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {sources.map((src, idx) => (
                    <img
                        key={idx}
                        src={src}
                        alt={p.name}
                        className={`absolute w-full h-full object-contain p-4 md:p-6 transition-all duration-500 ease-in-out ${idx === hoverIdx ? 'opacity-100 scale-100 group-hover:scale-105' : 'opacity-0 scale-95 pointer-events-none'}`}
                        loading="lazy"
                        decoding="async"
                    />
                ))}
            </div>

            {/* Info */}
            <div className="flex flex-col flex-1">
                <h3 className="font-bold text-sm md:text-base text-gray-800 line-clamp-2 mb-1.5 leading-snug">{p.name}</h3>

                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-auto" onClick={e => e.stopPropagation()}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star
                            key={star}
                            size={12}
                            className={`transition-colors duration-200 ${star <= Math.round(p.averageRating || 0)
                                ? 'fill-[#FFD700] text-[#FFD700]'
                                : 'text-gray-200 fill-transparent'}`}
                        />
                    ))}
                    <span className="text-[10px] font-semibold text-gray-400 ml-1">({p.totalReviews || 0})</span>
                </div>

                {/* Price */}
                <div className="flex flex-col gap-0.5 mt-3 pt-3 border-t border-gray-100/60">
                    <div className="flex items-baseline gap-2">
                        <span className={`text-lg md:text-xl font-extrabold tracking-tight ${p.outOfStock ? 'text-gray-400' : 'text-emerald-800'}`}>
                            ₹{p.price}
                        </span>
                        {originalPrice && (
                            <span className="text-xs font-semibold text-red-400/60 line-through">
                                ₹{originalPrice}
                            </span>
                        )}
                    </div>
                    {!p.isFreeDelivery && (p.deliveryCharge || 0) > 0 && !p.outOfStock && (
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                            + ₹{p.deliveryCharge} Delivery
                        </span>
                    )}
                </div>

                {p.outOfStock && (
                    <div className="mt-2 bg-red-50 border border-red-100/50 px-2 py-1 rounded-lg w-max">
                        <span className="text-red-600/90 font-black text-[10px] tracking-widest uppercase">OUT OF STOCK</span>
                    </div>
                )}
            </div>

            {/* Add button */}
            <button
                onClick={onAdd}
                disabled={p.outOfStock}
                className={`absolute bottom-3 right-3 md:bottom-5 md:right-5 w-9 h-9 md:w-11 md:h-11 border rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-200 z-20 shadow-md touch-manipulation active:scale-90 ${p.outOfStock
                    ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed shadow-none'
                    : 'bg-gray-900 border-gray-800 text-white hover:bg-emerald-600 hover:border-emerald-500 hover:rotate-90 hover:scale-110 active:scale-90'}`}
            >
                <Plus size={18} strokeWidth={2.5} />
            </button>
        </div>
    );
}
