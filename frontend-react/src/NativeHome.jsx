import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from './api';
import { getImageUrl } from './utils';

/* ─── Banner Data ─────────────────────────────────────────── */
const BANNERS = [
    { id: 1, tag: 'Express Delivery', title: 'Same Day\nDelivery', sub: 'Anywhere in Shahjahanpur', icon: '⚡', cta: 'Shop Now', grad: 'linear-gradient(135deg,#f72585 0%,#7209b7 100%)' },
    { id: 2, tag: 'Festival Special',  title: 'Upto 40%\nOFF',      sub: 'On selected products',         icon: '🎉', cta: 'Explore Deals', grad: 'linear-gradient(135deg,#3f37c9 0%,#4cc9f0 100%)' },
    { id: 3, tag: 'Handmade & Artisan',title: 'Local\nGifts',        sub: 'Crafted with love',            icon: '🎁', cta: 'View Collection', grad: 'linear-gradient(135deg,#560bad 0%,#f72585 100%)' },
    { id: 4, tag: 'Free Delivery',     title: 'Free Shipping\nAvailable', sub: 'On select products',     icon: '🚚', cta: 'Start Shopping', grad: 'linear-gradient(135deg,#4361ee 0%,#4cc9f0 100%)' },
    { id: 5, tag: 'Trending Now',      title: 'Most Loved\nProducts', sub: 'Trending in your city',      icon: '🔥', cta: 'See All', grad: 'linear-gradient(135deg,#b5179e 0%,#3f37c9 100%)' },
];

const CATEGORY_CONFIG = [
    { id: 'All',         emoji: '🏪' },
    { id: 'Fashion',     emoji: '👗' },
    { id: 'Electronics', emoji: '📱' },
    { id: 'Groceries',   emoji: '🛒' },
    { id: 'Beauty',      emoji: '💄' },
    { id: 'General',     emoji: '📦' },
];

/* ─── Banner Carousel ─────────────────────────────────────── */
function BannerCarousel() {
    const [cur, setCur] = useState(0);
    const timerRef = useRef(null);
    let tx = 0;

    const restart = (next) => {
        clearInterval(timerRef.current);
        setCur(next);
        timerRef.current = setInterval(() => setCur(c => (c + 1) % BANNERS.length), 3200);
    };

    useEffect(() => {
        timerRef.current = setInterval(() => setCur(c => (c + 1) % BANNERS.length), 3200);
        return () => clearInterval(timerRef.current);
    }, []);

    const b = BANNERS[cur];

    return (
        <div className="px-4 mb-5">
            <div
                className="relative rounded-[24px] overflow-hidden"
                style={{ height: 162 }}
                onTouchStart={e => { tx = e.changedTouches[0].screenX; }}
                onTouchEnd={e => {
                    const d = e.changedTouches[0].screenX;
                    if (d < tx - 40) restart((cur + 1) % BANNERS.length);
                    if (d > tx + 40) restart((cur - 1 + BANNERS.length) % BANNERS.length);
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={b.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.32, ease: 'easeInOut' }}
                        className="absolute inset-0 p-5 flex flex-col justify-between"
                        style={{ background: b.grad }}
                    >
                        <div className="absolute right-3 bottom-0 text-[110px] leading-none opacity-15 select-none">{b.icon}</div>
                        <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10" />
                        <div className="absolute -left-4 bottom-2 w-16 h-16 rounded-full bg-white/10" />
                        <span className="relative z-10 text-[9px] font-extrabold tracking-widest uppercase text-white/80 bg-white/15 self-start px-2.5 py-1 rounded-full backdrop-blur-sm">
                            {b.tag}
                        </span>
                        <div className="relative z-10">
                            <h2 className="text-[22px] font-black text-white leading-tight whitespace-pre-line drop-shadow">{b.title}</h2>
                            <p className="text-white/70 text-[11px] font-semibold mt-0.5">{b.sub}</p>
                            <span className="inline-block mt-2 text-[10px] font-extrabold text-white bg-white/20 px-3 py-1 rounded-full">{b.cta} →</span>
                        </div>
                    </motion.div>
                </AnimatePresence>
                {/* Dot indicators */}
                <div className="absolute bottom-3 right-4 flex gap-1.5 z-20">
                    {BANNERS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => restart(i)}
                            className={`rounded-full transition-all duration-300 ${i === cur ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Skeleton Card ───────────────────────────────────────── */
function SkeletonCard() {
    return (
        <div className="flex flex-col bg-white rounded-[18px] overflow-hidden relative" style={{ boxShadow: '0 2px 12px rgba(67,97,238,0.07)' }}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-gray-100 to-transparent z-10" />
            <div className="w-full aspect-square bg-gray-100" />
            <div className="p-3 space-y-2">
                <div className="h-2.5 bg-gray-100 rounded-full w-3/4" />
                <div className="h-2.5 bg-gray-100 rounded-full w-1/2" />
                <div className="h-4 bg-gray-100 rounded-full w-1/3 mt-1" />
            </div>
        </div>
    );
}

/* ─── Product Card ────────────────────────────────────────── */
export function NativeProductCard({ p, onClick, onAdd }) {
    const origPrice = p.originalPrice && p.originalPrice > p.price ? p.originalPrice : null;
    const discPct   = origPrice ? Math.round(((origPrice - p.price) / origPrice) * 100) : null;
    const src       = p.images?.length > 0 ? getImageUrl(p.images[0]) : getImageUrl(p.image);
    const rating    = parseFloat(p.averageRating) || 4.5;

    return (
        <div
            onClick={onClick}
            className="flex flex-col bg-white rounded-[18px] overflow-hidden relative active:scale-[0.97] transition-transform duration-150"
            style={{ boxShadow: '0 2px 14px rgba(67,97,238,0.08)' }}
        >
            {/* ── Image ── */}
            <div className="relative w-full" style={{ aspectRatio: '1/1', background: '#f6f7fb' }}>
                <img
                    src={src}
                    alt={p.name}
                    className="absolute inset-0 w-full h-full object-contain p-2 mix-blend-multiply"
                    loading="lazy"
                />
                {/* Badges */}
                {p.isFreeDelivery && !p.outOfStock && (
                    <span className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[7px] font-extrabold px-1.5 py-0.5 rounded-full z-10 tracking-wider">FREE DEL</span>
                )}
                {discPct && !p.outOfStock && (
                    <span className="absolute top-1.5 right-1.5 text-white text-[7px] font-extrabold px-1.5 py-0.5 rounded-full z-10" style={{ background: '#f72585' }}>
                        {discPct}% OFF
                    </span>
                )}
                {p.outOfStock && (
                    <span className="absolute top-1.5 left-1.5 bg-gray-700/85 text-white text-[7px] font-extrabold px-1.5 py-0.5 rounded-full z-10 backdrop-blur-sm">OUT OF STOCK</span>
                )}
            </div>

            {/* ── Info ── */}
            <div className="px-2.5 pb-2.5 pt-2 flex flex-col flex-1">
                <h3 className="font-semibold text-[11px] text-gray-800 line-clamp-2 leading-tight mb-1.5">{p.name}</h3>

                {/* Stars */}
                <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                        {[1,2,3,4,5].map(s => (
                            <span key={s} style={{ fontSize: 9, color: s <= Math.round(rating) ? '#f59e0b' : '#e5e7eb' }}>★</span>
                        ))}
                    </div>
                    <span className="text-[9px] text-gray-400 font-medium">{rating.toFixed(1)}</span>
                </div>

                {/* Price + Add button */}
                <div className="flex items-end justify-between mt-auto pt-2 gap-1 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {origPrice && (
                            <span className="relative text-[13px] font-bold text-red-500 px-0.5">
                                ₹{origPrice}
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <span className="w-full h-[1.5px] bg-red-500 -rotate-[20deg]" />
                                </span>
                            </span>
                        )}
                        <div className={`text-base font-black leading-none ${origPrice ? 'text-emerald-600' : 'text-gray-900'}`}>₹{p.price}</div>
                    </div>
                    <button
                        onClick={e => { e.stopPropagation(); onAdd(p); }}
                        disabled={p.outOfStock}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 flex-shrink-0 ${p.outOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-white shadow-lg'}`}
                        style={!p.outOfStock ? { background: 'linear-gradient(135deg,#f72585,#4361ee)', boxShadow: '0 4px 12px rgba(247,37,133,0.3)' } : {}}
                    >
                        <Plus size={16} strokeWidth={3} />
                    </button>
                </div>

                {/* Delivery */}
                {!p.outOfStock && (
                    <div className="mt-2 flex items-center gap-1">
                        <Truck size={10} className={p.isFreeDelivery ? 'text-emerald-500' : 'text-blue-400'} />
                        <span className={`text-[9px] font-semibold uppercase tracking-tight ${p.isFreeDelivery ? 'text-emerald-500' : 'text-blue-500'}`}>
                            {p.isFreeDelivery ? 'Free Delivery' : `₹${p.deliveryCharge} Delivery`}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Categorize Helper ───────────────────────────────────── */
function categorize(p) {
    const t = ((p.name || '') + ' ' + (p.description || '')).toLowerCase();
    if (t.match(/t-shirt|shirt|pant|jeans|dress|shoe|wear|kurti|saree|jacket|suit/)) return 'Fashion';
    if (t.match(/phone|laptop|earphone|headphone|cable|charger|watch|speaker|battery/)) return 'Electronics';
    if (t.match(/rice|dal|wheat|sugar|salt|oil|masala|grocery|food|snack|drink|atta/)) return 'Groceries';
    if (t.match(/soap|shampoo|cream|lotion|makeup|perfume|beauty|health|medicine/)) return 'Beauty';
    return 'General';
}

/* ─── NativeHome ──────────────────────────────────────────── */
export default function NativeHome({ addToCart }) {
    const [products, setProducts] = useState(() => {
        try { const c = localStorage.getItem('apni_products_cache'); return c ? JSON.parse(c) : []; } catch { return []; }
    });
    const [loading, setLoading] = useState(products.length === 0);
    const [search, setSearch] = useState('');
    const [cat, setCat] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        let dead = false;
        axios.get(`${API_URL}/api/products`).then(r => {
            if (dead) return;
            setProducts(r.data);
            setLoading(false);
            try { localStorage.setItem('apni_products_cache', JSON.stringify(r.data)); } catch {}
        }).catch(() => { if (!dead) setLoading(false); });
        return () => { dead = true; };
    }, []);

    const withCat = products.map(p => ({ ...p, _cat: categorize(p) }));
    const cats    = ['All', ...Array.from(new Set(withCat.map(p => p._cat)))];
    const filtered = withCat.filter(p => {
        const mc = cat === 'All' || p._cat === cat;
        const ms = p.name.toLowerCase().includes(search.toLowerCase());
        return mc && ms;
    });

    const catEmoji = { All: '🏪', Fashion: '👗', Electronics: '📱', Groceries: '🛒', Beauty: '💄', General: '📦' };

    return (
        <div className="flex flex-col min-h-screen pb-28" style={{ background: '#f0f1f7' }}>

            {/* ── Header ── */}
            <div
                className="sticky top-0 z-40 px-4 pt-10 pb-4"
                style={{ background: 'linear-gradient(160deg,#0d0221 0%,#240046 100%)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <img src="/assets/app-logo.png" className="w-10 h-10 rounded-[12px] shadow-lg border border-white/10" alt="Logo" />
                        <div>
                            <p className="text-white/50 text-[10px] font-semibold tracking-widest uppercase">Shahjahanpur</p>
                            <h1
                                className="text-xl font-black tracking-tight"
                                style={{ background: 'linear-gradient(90deg,#f72585,#4cc9f0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                            >
                                ApniDukan
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        <span className="text-[10px]">⚡</span>
                        <span className="text-white text-[10px] font-bold">Fast Delivery</span>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 rounded-[14px] text-sm font-medium outline-none"
                        style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                </div>
            </div>

            {/* ── Categories ── */}
            <div className="px-4 py-3">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {cats.map(c => (
                        <button
                            key={c}
                            onClick={() => setCat(c)}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-[11px] transition-all duration-200 ${
                                cat === c
                                    ? 'text-white shadow-lg scale-105'
                                    : 'bg-white text-gray-500 border border-gray-200'
                            }`}
                            style={cat === c ? { background: 'linear-gradient(135deg,#f72585,#7209b7)', boxShadow: '0 4px 12px rgba(247,37,133,0.35)' } : {}}
                        >
                            <span>{catEmoji[c] || '📦'}</span>
                            <span>{c}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Banners ── */}
            {!search && cat === 'All' && <BannerCarousel />}

            {/* ── Section Title ── */}
            {!search && (
                <div className="px-4 mb-3 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-extrabold text-gray-900 leading-tight">
                            {cat === 'All' ? 'All Products' : cat}
                        </h2>
                        <p className="text-[11px] text-gray-400 font-medium">{filtered.length} items available</p>
                    </div>
                </div>
            )}

            {/* ── Product Grid ── */}
            <div className="px-3 grid grid-cols-2 gap-2.5 pb-6">
                {loading
                    ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
                    : filtered.map(p => (
                        <NativeProductCard
                            key={p._id}
                            p={p}
                            onClick={() => navigate(`/product/${p._id}`)}
                            onAdd={addToCart}
                        />
                    ))
                }
            </div>

            {!loading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="font-bold text-gray-700 text-base mb-1">No products found</h3>
                    <p className="text-gray-400 text-sm">Try a different category or search term</p>
                </div>
            )}
        </div>
    );
}
