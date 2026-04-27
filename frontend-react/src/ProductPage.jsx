import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import API_URL from './api';
import { getImageUrl } from './utils';
import { ProductCard } from './Home';

const categorizeProduct = (p) => {
    const text = ((p.name || "") + " " + (p.description || "")).toLowerCase();
    if (text.match(/t-shirt|shirt|pant|jeans|dress|shoe|sneaker|wear|clothing|apparel|kurti|saree|jacket|suit/)) {
        if (text.match(/boy|men|gents/)) return 'Boys & Men';
        if (text.match(/girl|women|ladies/)) return 'Girls & Women';
        if (text.match(/kid|baby|child/)) return 'Kids';
        return 'Fashion';
    }
    if (text.match(/phone|laptop|earphone|headphone|cable|charger|watch|speaker|tv|monitor|electronics|battery/)) return 'Electronics';
    if (text.match(/rice|dal|wheat|sugar|salt|oil|spices|masala|grocery|food|snack|drink|beverage|atta/)) return 'Groceries';
    if (text.match(/soap|shampoo|cream|lotion|makeup|perfume|beauty|health|medicine|face/)) return 'Health & Beauty';
    if (text.match(/toy|game|play|teddy/)) return 'Toys & Games';
    if (text.match(/bag|purse|wallet|sunglass/)) return 'Accessories';
    if (text.match(/home|bed|sheet|kitchen|cook|clean|wash/)) return 'Home & Kitchen';
    return 'General';
};

export default function ProductPage({ addToCart }) {
    const { productId } = useParams();
    const navigate = useNavigate();
    
    const [allProducts, setAllProducts] = useState([]);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [curImg, setCurImg] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [qty, setQty] = useState(1);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                let cached = [];
                try {
                    const c = localStorage.getItem('apni_products_cache');
                    if (c) cached = JSON.parse(c);
                } catch {}
                
                if (cached.length > 0) {
                    setAllProducts(cached);
                    const found = cached.find(p => p._id === productId);
                    if (found) setProduct(found);
                }

                const res = await axios.get(`${API_URL}/api/products`);
                setAllProducts(res.data);
                const foundApi = res.data.find(p => p._id === productId);
                if (foundApi) {
                    setProduct(foundApi);
                    setCurImg(0);
                    setQty(1);
                }
                setLoading(false);
                try { localStorage.setItem('apni_products_cache', JSON.stringify(res.data)); } catch {}
            } catch (error) {
                console.error("Failed fetching products", error);
                setLoading(false);
            }
        };
        fetchProducts();
    }, [productId]);

    const sources = useMemo(() => {
        if (!product) return [];
        return product.images?.length > 0 ? product.images.map(getImageUrl) : [getImageUrl(product.image)];
    }, [product]);

    const totalImages = sources.length;

    // Mobile Swipe Handler
    let touchX = 0;
    const handleTouchStart = e => { touchX = e.changedTouches[0].screenX; };
    const handleTouchEnd = e => {
        const d = e.changedTouches[0].screenX;
        if(d < touchX - 40) setCurImg((c) => (c + 1) % totalImages);
        if(d > touchX + 40) setCurImg((c) => (c - 1 + totalImages) % totalImages);
    };

    // Auto Play Gallery (Hover Effect Desktop)
    useEffect(() => {
        if (!isHovered || totalImages <= 1) return;
        const interval = setInterval(() => { setCurImg(c => (c + 1) % totalImages); }, 1000);
        return () => clearInterval(interval);
    }, [isHovered, totalImages]);

    const relatedProducts = useMemo(() => {
        if (!product || !allProducts.length) return [];
        const cat = categorizeProduct(product);
        return allProducts
            .filter(p => p._id !== product._id && categorizeProduct(p) === cat)
            .slice(0, 4);
    }, [product, allProducts]);

    if (loading && !product) {
        return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div></div>;
    }

    if (!product && !loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
                <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
                <button onClick={() => navigate('/')} className="px-6 py-2 bg-gray-900 text-white rounded-full font-bold">Back to Home</button>
            </div>
        );
    }

    const hasDiscount = product.originalPrice && product.originalPrice > product.price;

    return (
        <main className="w-full min-h-screen bg-[#fdfbf7] pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 mb-6 transition"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row mb-12 lg:mb-16">
                    {/* Left/Top: Images */}
                    <div 
                        className="w-full md:w-1/2 lg:w-3/5 bg-[#fbfbfb] relative flex items-center justify-center p-6 md:p-12 min-h-[350px] md:min-h-[500px] group border-b md:border-b-0 md:border-r border-gray-100"
                        onMouseEnter={() => setIsHovered(true)} 
                        onMouseLeave={() => setIsHovered(false)}
                        onTouchStart={handleTouchStart} 
                        onTouchEnd={handleTouchEnd}
                    >
                        <AnimatePresence mode="wait">
                            <motion.img 
                                key={curImg}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.3 }}
                                src={sources[curImg]} 
                                className="absolute w-full h-full object-contain p-6 md:p-12 transition-transform duration-500 group-hover:scale-105" 
                            />
                        </AnimatePresence>
                        
                        {totalImages > 1 && (
                            <>
                                <button onClick={() => setCurImg((c) => (c - 1 + totalImages) % totalImages)} className="absolute left-4 w-10 h-10 bg-white/80 backdrop-blur border border-gray-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-white hover:scale-110 hidden md:flex z-10 shadow-sm text-gray-600"><ChevronLeft/></button>
                                <button onClick={() => setCurImg((c) => (c + 1) % totalImages)} className="absolute right-4 w-10 h-10 bg-white/80 backdrop-blur border border-gray-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-white hover:scale-110 hidden md:flex z-10 shadow-sm text-gray-600"><ChevronRight/></button>
                                <div className="absolute bottom-4 md:bottom-6 flex gap-2 z-10 bg-white/50 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white/50">
                                    {sources.map((_, i) => <div key={i} onClick={() => setCurImg(i)} className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full cursor-pointer transition-all ${i === curImg ? 'bg-gray-800 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`} />)}
                                </div>
                            </>
                        )}
                        
                        {product.outOfStock && (
                            <div className="absolute top-6 right-6 px-4 py-1.5 bg-red-100/90 backdrop-blur text-red-700 text-xs font-black rounded-lg tracking-widest shadow-sm border border-red-200 z-10 uppercase">
                                Out of Stock
                            </div>
                        )}
                    </div>

                    {/* Right/Bottom: Details */}
                    <div className="w-full md:w-1/2 lg:w-2/5 p-6 md:p-10 lg:p-12 flex flex-col justify-center">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 leading-tight tracking-tight">{product.name}</h1>
                        
                        <div className="flex flex-wrap items-center gap-3 mb-6 lg:mb-8">
                            <span className="px-3 py-1 rounded-full bg-yellow-100/80 border border-yellow-200/50 text-yellow-800 text-sm font-bold flex items-center gap-1 shadow-sm">⭐ {product.averageRating || 0}</span>
                            <span className="text-gray-500 text-sm font-medium">{product.totalReviews || 0} Ratings</span>
                        </div>

                        <div className="flex items-end gap-3 mb-6 lg:mb-8">
                            <span className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tighter">₹{product.price}</span>
                            {hasDiscount && <span className="text-xl text-gray-400 line-through mb-1 font-semibold">₹{product.originalPrice}</span>}
                            {hasDiscount && (
                                <span className="ml-2 mb-1 px-2.5 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-md">
                                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                </span>
                            )}
                        </div>

                        <div className="space-y-6 mb-8 lg:mb-10">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</h3>
                                <p className="text-gray-600 leading-relaxed text-sm md:text-base font-medium whitespace-pre-line">
                                    {product.description}
                                </p>
                            </div>
                            
                            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100/60 flex flex-col gap-1.5 shadow-sm">
                               <strong className="text-xs tracking-wider uppercase text-emerald-800 font-bold">Delivery Information</strong>
                               {product.isFreeDelivery ? 
                                    <span className="text-emerald-600 font-extrabold text-sm flex items-center gap-2">✓ Free Local Delivery</span> : 
                                    <span className="text-gray-700 font-bold text-sm flex items-center gap-2">🚚 Delivery Charge: ₹{product.deliveryCharge}</span>
                               }
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-auto">
                            <div className="flex items-center justify-between border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl overflow-hidden h-[56px] w-full sm:w-[130px] shrink-0">
                                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="flex-1 h-full text-xl font-bold flex items-center justify-center text-gray-600 active:bg-gray-300 transition">-</button>
                                <span className="font-extrabold text-lg text-gray-900 w-10 text-center">{qty}</span>
                                <button onClick={() => setQty(q => q + 1)} className="flex-1 h-full text-xl font-bold flex items-center justify-center text-gray-600 active:bg-gray-300 transition">+</button>
                            </div>
                            <button 
                                disabled={product.outOfStock}
                                onClick={() => { addToCart(product, qty); }} 
                                className={`flex flex-1 h-[56px] w-full rounded-xl font-bold text-lg transition-all items-center justify-center gap-2 ${product.outOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : 'bg-gray-900 text-white hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-gray-900/20 hover:bg-black'}`}
                            >
                                <ShoppingBag size={20}/> {product.outOfStock ? 'Unavailable' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* You may also like */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16 lg:mt-24">
                        <div className="flex flex-col items-center text-center mb-8">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">You may also like</h2>
                            <div className="w-16 sm:w-20 h-1 bg-emerald-400 mt-3 rounded-full opacity-80" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 items-stretch">
                            {relatedProducts.map((p) => (
                                <ProductCard
                                    key={p._id}
                                    p={p}
                                    onClick={() => {
                                        navigate(`/product/${p._id}`);
                                        window.scrollTo(0, 0);
                                    }}
                                    onAdd={(e) => { e.stopPropagation(); addToCart(p); }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
