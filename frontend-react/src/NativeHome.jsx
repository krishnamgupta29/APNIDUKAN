import React, { useState, useEffect } from 'react';
import { Search, Zap, Star, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from './api';
import { getImageUrl } from './utils';

function NativeSkeletonCard() {
    return (
        <div className="flex flex-col h-full bg-white/80 rounded-[20px] p-3 shadow-sm border border-[var(--color-pink-orchid)]/20 overflow-hidden relative backdrop-blur-sm">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent z-10" />
            <div className="w-full aspect-square rounded-[14px] bg-[var(--color-icy-blue)]/30 mb-3" />
            <div className="h-3 bg-[var(--color-icy-blue)]/50 rounded-full w-3/4 mb-1.5" />
            <div className="h-2.5 bg-[var(--color-icy-blue)]/50 rounded-full w-1/2 mb-3" />
            <div className="h-4 bg-[var(--color-icy-blue)]/50 rounded-full w-1/3 mt-auto" />
        </div>
    );
}

export function NativeProductCard({ p, onClick, onAdd }) {
    const originalPrice = p.originalPrice && p.originalPrice > p.price ? p.originalPrice : null;
    const src = p.images?.length > 0 ? getImageUrl(p.images[0]) : getImageUrl(p.image);

    return (
        <div
            onClick={onClick}
            className="flex flex-col h-full bg-white/90 backdrop-blur-md rounded-[20px] p-2.5 shadow-sm border border-white/40 relative active:scale-95 transition-transform overflow-hidden"
        >
            {p.isFreeDelivery && !p.outOfStock && (
                <div className="absolute top-2 left-2 bg-gradient-to-r from-[var(--color-pink-orchid)] to-[var(--color-pastel-petal)] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full z-10 tracking-wider shadow-sm">
                    FREE DEL
                </div>
            )}
            <div className="w-full aspect-square rounded-[14px] bg-gradient-to-br from-[var(--color-icy-blue)]/20 to-[var(--color-sky-blue)]/10 overflow-hidden relative mb-2 flex items-center justify-center p-2">
                <img src={src} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <div className="flex flex-col flex-1 px-0.5">
                <h3 className="font-semibold text-xs text-gray-800 line-clamp-2 leading-tight mb-1">{p.name}</h3>
                <div className="flex items-center gap-0.5 mb-auto">
                    <Star size={10} className="fill-[var(--color-pink-orchid)] text-[var(--color-pink-orchid)]" />
                    <span className="text-[9px] font-medium text-gray-500">{p.averageRating || '4.5'}</span>
                </div>
                <div className="flex items-end justify-between mt-2 pt-1 border-t border-[var(--color-pink-orchid)]/10">
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 tracking-tight">₹{p.price}</span>
                        {originalPrice && <span className="text-[9px] font-medium text-gray-400 line-through">₹{originalPrice}</span>}
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAdd(p); }}
                        disabled={p.outOfStock}
                        className={`w-7 h-7 rounded-[10px] flex items-center justify-center shadow-sm transition-all ${
                            p.outOfStock ? 'bg-gray-200 text-gray-400' : 'bg-gradient-to-br from-[var(--color-pink-orchid)] to-[var(--color-pastel-petal)] text-white active:scale-90'
                        }`}
                    >
                        <Plus size={14} strokeWidth={3} />
                    </button>
                </div>
            </div>
            {p.outOfStock && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-20">
                    <span className="bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg transform -rotate-12">OUT OF STOCK</span>
                </div>
            )}
        </div>
    );
}

export default function NativeHome({ addToCart }) {
    const [products, setProducts] = useState(() => {
        try {
            const cached = localStorage.getItem('apni_products_cache');
            if (cached) return JSON.parse(cached);
        } catch {}
        return [];
    });
    const [loading, setLoading] = useState(products.length === 0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/products`);
                if (!cancelled) {
                    setProducts(res.data);
                    setLoading(false);
                    try { localStorage.setItem('apni_products_cache', JSON.stringify(res.data)); } catch {}
                }
            } catch {
                if (!cancelled) setLoading(false);
            }
        };
        fetchProducts();
        return () => { cancelled = true; };
    }, []);

    const categorizeProduct = (p) => {
        const text = ((p.name || "") + " " + (p.description || "")).toLowerCase();
        if (text.match(/t-shirt|shirt|pant|jeans|dress|shoe|sneaker|wear|clothing|apparel|kurti|saree|jacket|suit/)) return 'Fashion';
        if (text.match(/phone|laptop|earphone|headphone|cable|charger|watch|speaker|tv|monitor|electronics|battery/)) return 'Electronics';
        if (text.match(/rice|dal|wheat|sugar|salt|oil|spices|masala|grocery|food|snack|drink|beverage|atta/)) return 'Groceries';
        if (text.match(/soap|shampoo|cream|lotion|makeup|perfume|beauty|health|medicine|face/)) return 'Beauty';
        return 'General';
    };

    const productsWithCategory = products.map(p => ({ ...p, category: categorizeProduct(p) }));
    const availableCategories = ['All', ...Array.from(new Set(productsWithCategory.map(p => p.category)))];
    
    const filteredProducts = productsWithCategory.filter(p => {
        const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[var(--color-icy-blue)]/20 pb-24">
            {/* Header / Search */}
            <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-[var(--color-pink-orchid)]/10 px-4 pt-10 pb-3 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-xl font-extrabold bg-gradient-to-r from-[var(--color-pink-orchid)] to-[var(--color-sky-blue)] bg-clip-text text-transparent">
                        ApniDukan
                    </h1>
                    <div className="bg-[var(--color-blush-pop)]/20 text-[var(--color-pink-orchid)] text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Zap size={10} className="fill-current" /> Fast Del
                    </div>
                </div>
                <div className="relative w-full">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search for products..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 bg-white border-0 rounded-[16px] shadow-[0_2px_10px_rgba(205,180,219,0.15)] focus:ring-2 focus:ring-[var(--color-pink-orchid)]/50 outline-none text-sm font-medium placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="px-4 py-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {availableCategories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-full font-bold text-xs transition-all shadow-sm ${
                                selectedCategory === cat 
                                    ? 'bg-gradient-to-r from-[var(--color-pink-orchid)] to-[var(--color-sky-blue)] text-white scale-105' 
                                    : 'bg-white text-gray-500 border border-[var(--color-pink-orchid)]/20'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Banner */}
            {!searchQuery && selectedCategory === 'All' && (
                <div className="px-4 mb-4">
                    <div className="w-full h-28 rounded-[20px] bg-gradient-to-br from-[var(--color-pink-orchid)] to-[var(--color-pastel-petal)] p-4 text-white relative overflow-hidden shadow-md">
                        <div className="relative z-10">
                            <span className="text-[10px] font-bold tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">Premium Delivery</span>
                            <h2 className="text-xl font-black mt-2 leading-tight">Same Day<br/>in Shahjahanpur</h2>
                        </div>
                        <Zap size={80} className="absolute -right-4 -bottom-4 text-white/10 rotate-12" />
                    </div>
                </div>
            )}

            {/* Product Grid */}
            <div className="px-4 grid grid-cols-2 gap-3 pb-8">
                {loading
                    ? [...Array(6)].map((_, i) => <NativeSkeletonCard key={i} />)
                    : filteredProducts.map((p) => (
                        <NativeProductCard
                            key={p._id}
                            p={p}
                            onClick={() => navigate(`/product/${p._id}`)}
                            onAdd={addToCart}
                        />
                    ))
                }
            </div>

            {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-10 px-4">
                    <p className="text-gray-400 text-sm">No products found.</p>
                </div>
            )}
        </div>
    );
}
