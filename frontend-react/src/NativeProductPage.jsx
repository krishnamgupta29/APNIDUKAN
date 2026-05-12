import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ShoppingBag, Truck, Package, Star, Plus, Minus, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import API_URL from './api';
import { getImageUrl } from './utils';
import { NativeProductCard } from './NativeHome';

/* ─── Helpers ───────────────────────────────────────────────── */
function StarRating({ rating, count }) {
    const r = parseFloat(rating) || 0;
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(s => {
                    const fill = Math.min(1, Math.max(0, r - (s - 1)));
                    return (
                        <div key={s} className="relative" style={{ width: 16, height: 16 }}>
                            <span style={{ fontSize: 16, color: '#e5e7eb', lineHeight: 1 }}>★</span>
                            <span
                                style={{
                                    fontSize: 16,
                                    color: '#f59e0b',
                                    lineHeight: 1,
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    width: `${fill * 100}%`,
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                }}
                            >★</span>
                        </div>
                    );
                })}
            </div>
            <span className="text-sm font-bold text-gray-700">{r.toFixed(1)}</span>
            {count > 0 && <span className="text-xs text-gray-400 font-medium">({count} ratings)</span>}
        </div>
    );
}

function categorize(p) {
    const t = ((p.name || '') + ' ' + (p.description || '')).toLowerCase();
    if (t.match(/t-shirt|shirt|pant|jeans|dress|shoe|wear|kurti|saree|jacket|suit/)) return 'Fashion';
    if (t.match(/phone|laptop|earphone|headphone|cable|charger|watch|speaker|battery/)) return 'Electronics';
    if (t.match(/rice|dal|wheat|sugar|salt|oil|masala|grocery|food|snack|drink|atta/)) return 'Groceries';
    if (t.match(/soap|shampoo|cream|lotion|makeup|perfume|beauty|health|medicine/)) return 'Beauty';
    return 'General';
}

/* ─── NativeProductPage ──────────────────────────────────────── */
export default function NativeProductPage({ addToCart }) {
    const { productId } = useParams();
    const navigate      = useNavigate();

    const [allProducts, setAllProducts] = useState([]);
    const [product, setProduct]         = useState(null);
    const [loading, setLoading]         = useState(true);
    const [curImg, setCurImg]           = useState(0);
    const [qty, setQty]                 = useState(1);
    const [added, setAdded]             = useState(false);
    let tx = 0;

    useEffect(() => {
        setCurImg(0);
        setQty(1);
        setAdded(false);
        const load = async () => {
            setLoading(true);
            try {
                // Try cache first
                let cached = [];
                try { const c = localStorage.getItem('apni_products_cache'); if (c) cached = JSON.parse(c); } catch {}
                if (cached.length) {
                    setAllProducts(cached);
                    const f = cached.find(p => p._id === productId);
                    if (f) setProduct(f);
                }
                // Fresh fetch
                const res = await axios.get(`${API_URL}/api/products`);
                setAllProducts(res.data);
                const found = res.data.find(p => p._id === productId);
                if (found) { setProduct(found); setCurImg(0); }
                try { localStorage.setItem('apni_products_cache', JSON.stringify(res.data)); } catch {}
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [productId]);

    const sources = useMemo(() => {
        if (!product) return [];
        return product.images?.length > 0 ? product.images.map(getImageUrl) : [getImageUrl(product.image)];
    }, [product]);

    const relatedProducts = useMemo(() => {
        if (!product || !allProducts.length) return [];
        const cat = categorize(product);
        return allProducts.filter(p => p._id !== product._id && categorize(p) === cat).slice(0, 4);
    }, [product, allProducts]);

    const handleAdd = () => {
        if (!product || product.outOfStock) return;
        addToCart(product, qty);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    /* ── Loading ── */
    if (loading && !product) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center" style={{ background: '#f0f1f7' }}>
                <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: '#f72585' }} />
            </div>
        );
    }

    if (!product && !loading) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center gap-4 px-4 text-center" style={{ background: '#f0f1f7' }}>
                <div className="text-5xl">😕</div>
                <h2 className="text-xl font-extrabold text-gray-800">Product not found</h2>
                <button onClick={() => navigate('/')} className="px-6 py-3 rounded-[14px] text-white font-bold" style={{ background: 'linear-gradient(135deg,#f72585,#4361ee)' }}>
                    Back to Home
                </button>
            </div>
        );
    }

    const hasDiscount  = product.originalPrice && product.originalPrice > product.price;
    const discountPct  = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    const totalImages  = sources.length;

    return (
        <div className="flex flex-col min-h-screen pb-32" style={{ background: '#f0f1f7' }}>

            {/* ── Back bar ── */}
            <div
                className="sticky top-0 z-40 flex items-center gap-3 px-4 pt-10 pb-3"
                style={{ background: 'linear-gradient(160deg,#0d0221 0%,#240046 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
            >
                <button
                    onClick={() => navigate(-1)}
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                    style={{ background: 'rgba(255,255,255,0.12)' }}
                >
                    <ChevronLeft size={20} className="text-white" />
                </button>
                <h1 className="text-sm font-bold text-white line-clamp-1 flex-1">{product.name}</h1>
                {product.outOfStock && (
                    <span className="text-[10px] font-extrabold text-red-400 bg-red-400/15 px-2.5 py-1 rounded-full border border-red-400/25">Out of Stock</span>
                )}
            </div>

            {/* ── Image Gallery ── */}
            <div
                className="relative bg-white"
                style={{ aspectRatio: '1/1' }}
                onTouchStart={e => { tx = e.changedTouches[0].screenX; }}
                onTouchEnd={e => {
                    const d = e.changedTouches[0].screenX;
                    if (d < tx - 40) setCurImg(c => (c + 1) % totalImages);
                    if (d > tx + 40) setCurImg(c => (c - 1 + totalImages) % totalImages);
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.img
                        key={curImg}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.22 }}
                        src={sources[curImg]}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-contain p-6"
                        style={{ background: '#f6f7fb' }}
                    />
                </AnimatePresence>

                {/* Discount badge */}
                {hasDiscount && (
                    <div className="absolute top-4 left-4 text-white text-xs font-extrabold px-2.5 py-1 rounded-full z-10" style={{ background: '#f72585', boxShadow: '0 3px 10px rgba(247,37,133,0.4)' }}>
                        {discountPct}% OFF
                    </div>
                )}

                {/* Thumbnail dots */}
                {totalImages > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {sources.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurImg(i)}
                                className={`rounded-full transition-all duration-200 ${i === curImg ? 'w-5 h-1.5 bg-gray-800' : 'w-1.5 h-1.5 bg-gray-300'}`}
                            />
                        ))}
                    </div>
                )}

                {/* Thumbnail strip */}
                {totalImages > 1 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                        {sources.map((src, i) => (
                            <button
                                key={i}
                                onClick={() => setCurImg(i)}
                                className={`w-10 h-10 rounded-[10px] overflow-hidden border-2 transition-all ${i === curImg ? 'border-gray-800 scale-110' : 'border-transparent opacity-60'}`}
                                style={{ background: '#f6f7fb' }}
                            >
                                <img src={src} alt="" className="w-full h-full object-contain p-0.5 mix-blend-multiply" loading="lazy" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Product Info Card ── */}
            <div className="bg-white mx-3 mt-3 rounded-[20px] px-4 py-5" style={{ boxShadow: '0 2px 16px rgba(67,97,238,0.09)' }}>
                {/* Name */}
                <h2 className="text-lg font-extrabold text-gray-900 leading-tight mb-3">{product.name}</h2>

                {/* Rating */}
                <div className="mb-4">
                    <StarRating rating={product.averageRating} count={product.totalReviews || 0} />
                </div>

                {/* Pricing Section */}
                <div className="mb-5">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Pricing</p>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            {hasDiscount && (
                                <span className="relative text-2xl font-bold text-red-500 px-1">
                                    ₹{product.originalPrice}
                                    <span className="absolute inset-0 flex items-center justify-center">
                                        <span className="w-full h-[2px] bg-red-500 -rotate-[20deg]" />
                                    </span>
                                </span>
                            )}
                            <span className={`text-4xl font-black ${hasDiscount ? 'text-emerald-600' : 'text-gray-900'}`}>₹{product.price}</span>
                            {hasDiscount && (
                                <span className="text-[11px] font-black text-white px-2 py-1 rounded-lg" style={{ background: 'linear-gradient(135deg,#f72585,#7209b7)' }}>
                                    {discountPct}% OFF
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Truck size={14} className={product.isFreeDelivery ? 'text-emerald-500' : 'text-blue-500'} />
                            <span className={`text-[13px] font-semibold ${product.isFreeDelivery ? 'text-emerald-600' : 'text-blue-600'}`}>
                                {product.isFreeDelivery ? 'Free Delivery' : `Delivery: ₹${product.deliveryCharge}`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {product.description && (
                    <div>
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Description</p>
                        <p className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-line">{product.description}</p>
                    </div>
                )}
            </div>

            {/* ── Related Products ── */}
            {relatedProducts.length > 0 && (
                <div className="px-3 mt-4">
                    <p className="text-sm font-extrabold text-gray-800 mb-3">You May Also Like</p>
                    <div className="grid grid-cols-2 gap-2.5">
                        {relatedProducts.map(p => (
                            <NativeProductCard
                                key={p._id}
                                p={p}
                                onClick={() => { navigate(`/product/${p._id}`); window.scrollTo(0, 0); }}
                                onAdd={addToCart}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Sticky Bottom Add to Cart ── */}
            {!product.outOfStock && (
                <div className="fixed bottom-0 left-0 w-full z-40 px-4 pb-safe" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)', paddingTop: 12, background: 'rgba(240,241,247,0.95)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: '1px solid rgba(67,97,238,0.1)' }}>
                    <div className="flex items-center gap-3">
                        {/* Qty */}
                        <div
                            className="flex items-center rounded-[14px] overflow-hidden flex-shrink-0"
                            style={{ border: '1.5px solid rgba(67,97,238,0.15)', background: '#fff', height: 52 }}
                        >
                            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-12 h-full flex items-center justify-center text-gray-600 active:bg-gray-100 transition-colors">
                                <Minus size={16} />
                            </button>
                            <span className="font-extrabold text-base text-gray-900 w-8 text-center">{qty}</span>
                            <button onClick={() => setQty(q => q + 1)} className="w-12 h-full flex items-center justify-center text-gray-600 active:bg-gray-100 transition-colors">
                                <Plus size={16} />
                            </button>
                        </div>

                        {/* Add button */}
                        <button
                            onClick={handleAdd}
                            className="flex-1 h-[52px] rounded-[14px] font-extrabold text-white text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                            style={{
                                background: added
                                    ? 'linear-gradient(135deg,#10b981,#059669)'
                                    : 'linear-gradient(135deg,#f72585,#4361ee)',
                                boxShadow: '0 6px 20px rgba(247,37,133,0.4)',
                            }}
                        >
                            <ShoppingBag size={17} />
                            {added ? '✓ Added to Cart' : `Add ${qty > 1 ? `${qty}x ` : ''}to Cart · ₹${product.price * qty}`}
                        </button>
                    </div>
                </div>
            )}

            {/* Out of stock sticky footer */}
            {product.outOfStock && (
                <div className="fixed bottom-0 left-0 w-full z-40 px-4 pb-safe" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)', paddingTop: 12, background: 'rgba(240,241,247,0.95)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: '1px solid rgba(67,97,238,0.1)' }}>
                    <div className="w-full h-[52px] rounded-[14px] bg-gray-200 flex items-center justify-center gap-2">
                        <Package size={17} className="text-gray-400" />
                        <span className="font-extrabold text-gray-400 text-sm">Currently Out of Stock</span>
                    </div>
                </div>
            )}
        </div>
    );
}
