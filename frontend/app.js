document.addEventListener('DOMContentLoaded', () => {
    feather.replace();
    initScrollReveal();
    initParallax();
    fetchProducts();
    updateCartCount();
    injectStarIcons();
});

const API_URL = 'http://localhost:5000/api';
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];
let currentRating = 0;
let pendingOrderPayload = null;

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.querySelector('.toast-msg').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function scrollToCurrent(id) {
    document.querySelectorAll('.section, section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

function initScrollReveal() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('active'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    setTimeout(() => document.querySelectorAll('.hero-content, .hero-visual').forEach(el => el.classList.add('active')), 100);
}

function initParallax() {
    const elem = document.querySelector('.parallax-layer');
    if (!elem) return;
    document.addEventListener('mousemove', e => {
        const x = (window.innerWidth - e.pageX * 2) / 90;
        const y = (window.innerHeight - e.pageY * 2) / 90;
        elem.style.transform = `rotateX(${y}deg) rotateY(${-x}deg)`;
    });
}

function toggleCart() {
    document.getElementById('cart-drawer').classList.toggle('open');
    document.getElementById('cart-overlay').classList.toggle('active');
    renderCart();
}

function openCheckout() {
    if(cart.length === 0) return showToast('Cart is empty!');
    toggleCart();
    setTimeout(() => {
        document.getElementById('checkout-overlay').classList.add('active');
        document.getElementById('checkout-modal').classList.add('open');
    }, 300);
}

function closeCheckout() {
    document.getElementById('checkout-overlay').classList.remove('active');
    document.getElementById('checkout-modal').classList.remove('open');
}

function closeSuccess() {
    document.getElementById('success-overlay').classList.remove('active');
    document.getElementById('success-modal').classList.remove('open');
    scrollToCurrent('history');
}

async function fetchProducts() {
    try {
        const res = await fetch(`${API_URL}/products`);
        products = await res.json();
    } catch(err) { console.error('DB Error'); }
    renderProducts(products);
}

// Global Image Hover Rotator Engine
let gridRotators = {};

window.startGridRotation = (id) => {
    if (window.matchMedia("(hover: none)").matches) return; // Ignore on touch screens
    const container = document.getElementById(`gc-${id}`);
    if (!container) return;
    const imgs = container.querySelectorAll('.grid-img');
    if (imgs.length <= 1) return;
    
    // Slight initial delay to prevent strobe effects when moving mouse fast across items
    gridRotators[id] = { cur: 0, timer: setTimeout(() => {
        gridRotators[id].interval = setInterval(() => {
            imgs[gridRotators[id].cur].classList.remove('active');
            gridRotators[id].cur = (gridRotators[id].cur + 1) % imgs.length;
            imgs[gridRotators[id].cur].classList.add('active');
        }, 2000);
    }, 1000) };
};

window.stopGridRotation = (id) => {
    if (!gridRotators[id]) return;
    clearTimeout(gridRotators[id].timer);
    clearInterval(gridRotators[id].interval);
    
    // Reset firmly back to image zero index
    const container = document.getElementById(`gc-${id}`);
    if (container) {
        const imgs = container.querySelectorAll('.grid-img');
        if (imgs.length > 0) {
            imgs.forEach(i => i.classList.remove('active'));
            gridRotators[id].cur = 0;
            imgs[0].classList.add('active');
        }
    }
    delete gridRotators[id];
};

function renderProducts(items) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = items.map((p, i) => {
        let sources = [];
        if (p.images && p.images.length > 0) {
            sources = p.images.map(img => `http://localhost:5000${img}`);
        } else if (p.image) {
            sources = [p.image];
        } else {
            sources = ['https://via.placeholder.com/400'];
        }

        const imagesHtml = sources.map((url, k) => `
            <img src="${url}" class="grid-img ${k === 0 ? 'active' : ''}" loading="lazy">
        `).join('');

        return `
        <div class="product-card reveal" style="transition-delay: ${Math.min(i*0.1, 0.5)}s" onclick="openProductDetail('${p._id}')">
            <div class="img-container" id="gc-${p._id}" onmouseenter="startGridRotation('${p._id}')" onmouseleave="stopGridRotation('${p._id}')">
                ${imagesHtml}
            </div>
            <div class="card-content">
                <h3 class="product-title">${p.name}</h3>
                <p class="product-price">₹${p.price}</p>
                <div class="product-rating"><span>🏪 ${p.averageRating || 0}</span> <small>(${p.totalReviews || 0} reviews)</small></div>
                <button class="add-btn" onclick="event.stopPropagation(); addToCart('${p._id}')"><i data-feather="plus"></i></button>
            </div>
        </div>
    `}).join('');
    initScrollReveal();
    feather.replace();
}

// Carousel Memory State Variables
let carouselInterval;
let currentCarouselSlide = 0;
let totalCarouselSlides = 0;

window.openProductDetail = (id) => {
    const p = products.find(x => x._id === id);
    if(!p) return;
    
    let sources = [];
    if (p.images && p.images.length > 0) sources = p.images.map(img => `http://localhost:5000${img}`);
    else if (p.image) sources = [p.image];
    else sources = ['https://via.placeholder.com/400'];

    totalCarouselSlides = sources.length;
    currentCarouselSlide = 0;
    
    // Inject Carousel Template View
    const slidesHtml = sources.map((url, idx) => `
        <img src="${url}" class="carousel-slide ${idx === 0 ? 'active' : ''}" id="c-slide-${idx}">
    `).join('');
    
    const dotsHtml = sources.map((_, idx) => `
        <div class="carousel-dot ${idx === 0 ? 'active' : ''}" onclick="goToCarouselSlide(${idx})"></div>
    `).join('');

    const arrowsHtml = totalCarouselSlides > 1 ? `
        <button class="carousel-btn prev-btn" onclick="prevCarouselSlide()"><i data-feather="chevron-left"></i></button>
        <button class="carousel-btn next-btn" onclick="nextCarouselSlide()"><i data-feather="chevron-right"></i></button>
    ` : '';

    const html = `
        <div class="pm-carousel-zone" id="pm-carousel-zone" 
             onmouseenter="pauseCarousel()" 
             onmouseleave="resumeCarousel()">
            ${slidesHtml}
            ${arrowsHtml}
            <div class="carousel-dots">${totalCarouselSlides > 1 ? dotsHtml : ''}</div>
        </div>
        <div class="pm-info">
            <h2>${p.name}</h2>
            <div class="price">₹${p.price}</div>
            <p class="desc">${p.description}</p>
            ${p.instructions ? `<div class="instructor-block"><h5>Notes / Instructions</h5><p>${p.instructions}</p></div>` : ''}
            <button class="btn primary-btn btn-lg" onclick="addToCart('${p._id}'); closeProductModal();">Add to Cart</button>
        </div>
    `;

    document.getElementById('product-modal-content').innerHTML = html;
    document.getElementById('product-overlay').classList.add('active');
    document.getElementById('product-modal').classList.add('open');
    feather.replace();
    
    if (totalCarouselSlides > 1) {
        resumeCarousel(); // start auto playback automatically
        setupMobileSwipe();
    }
}

// Carousel Architecture Navigation
window.goToCarouselSlide = (idx) => {
    document.querySelectorAll('.carousel-slide').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.carousel-dot').forEach(d => d.classList.remove('active'));
    
    document.getElementById(`c-slide-${idx}`).classList.add('active');
    const dots = document.querySelectorAll('.carousel-dot');
    if (dots.length > idx) dots[idx].classList.add('active');
    
    currentCarouselSlide = idx;
};
window.nextCarouselSlide = () => { goToCarouselSlide((currentCarouselSlide + 1) % totalCarouselSlides); };
window.prevCarouselSlide = () => { goToCarouselSlide((currentCarouselSlide - 1 + totalCarouselSlides) % totalCarouselSlides); };

window.resumeCarousel = () => {
    clearInterval(carouselInterval);
    if (totalCarouselSlides > 1) {
        carouselInterval = setInterval(window.nextCarouselSlide, 3000);
    }
};
window.pauseCarousel = () => { clearInterval(carouselInterval); };

// Touch events for Mobile logic (Fallback mechanism requested by user)
function setupMobileSwipe() {
    const el = document.getElementById('pm-carousel-zone');
    if (!el) return;
    
    let touchstartX = 0;
    let touchendX = 0;
    
    el.addEventListener('touchstart', e => { 
        touchstartX = e.changedTouches[0].screenX; 
        pauseCarousel(); // interrupt auto slide when interacting naturally
    }, {passive:true});
    
    el.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        handleSwipeGesture();
        resumeCarousel(); // restart interval once user lets go
    }, {passive:true});
    
    function handleSwipeGesture() {
        const threshold = 40;
        if (touchendX < touchstartX - threshold) window.nextCarouselSlide(); // Swiped Left
        else if (touchendX > touchstartX + threshold) window.prevCarouselSlide(); // Swiped Right
    }
}

function closeProductModal() {
    pauseCarousel(); // Prevent ghost intervals draining client CPU implicitly
    document.getElementById('product-overlay').classList.remove('active');
    document.getElementById('product-modal').classList.remove('open');
}

function addToCart(prodId) {
    const product = products.find(p => p._id === prodId);
    if(!product) return;
    const existing = cart.find(c => c.productId === product._id);
    if(existing) existing.quantity += 1;
    else {
        let imgUrl = 'https://via.placeholder.com/400';
        if (product.images && product.images.length > 0) imgUrl = `http://localhost:5000${product.images[0]}`;
        else if (product.image) imgUrl = product.image;
        cart.push({ productId: product._id, name: product.name, price: product.price, quantity: 1, image: imgUrl });
    }
    saveCart(); showToast('Added to Cart 🛒');
}

function saveCart() { localStorage.setItem('cart', JSON.stringify(cart)); updateCartCount(); }
function updateCartCount() {
    document.getElementById('cart-badge').innerText = cart.reduce((s, i) => s + i.quantity, 0);
    if(document.getElementById('cart-drawer').classList.contains('open')) renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    let total = 0;
    if(cart.length === 0) return container.innerHTML = '<p class="txt-muted">Your bag is empty.</p>', document.getElementById('cart-total-price').innerText = '₹0';
    container.innerHTML = cart.map((item, index) => {
        total += item.price * item.quantity;
        return `<div class="cart-item-card">
            <img src="${item.image}">
            <div class="cart-info"><h4>${item.name}</h4><p>₹${item.price} x ${item.quantity}</p></div>
            <button class="remove-btn" onclick="removeFromCart(${index})"><i data-feather="trash-2"></i></button>
        </div>`;
    }).join('');
    document.getElementById('cart-total-price').innerText = `₹${total}`;
    feather.replace();
}

function removeFromCart(idx) { cart.splice(idx, 1); saveCart(); }

/* Checkout Flow with Review Modal */
document.getElementById('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const totalCalc = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    pendingOrderPayload = {
        customerName: document.getElementById('cust-name').value, 
        phone: document.getElementById('cust-phone').value,
        address: document.getElementById('cust-address').value, 
        items: cart, 
        total: totalCalc
    };
    
    // Construct review details
    const div = document.getElementById('confirm-summary-details');
    div.innerHTML = `
        <div style="margin-bottom:1rem">
            <strong>${pendingOrderPayload.customerName}</strong><br>
            Phone: ${pendingOrderPayload.phone}<br>
            Address: ${pendingOrderPayload.address}<br>
            <span style="display:inline-block; margin-top:5px; background:#e0e0e0; padding:2px 8px; border-radius:12px; font-size:0.8rem">Payment: COD</span>
        </div>
        <strong>Items:</strong><ul style="list-style:none; padding:0; margin-top:5px;">
        ${cart.map(c => `<li>${c.quantity}x ${c.name} - ₹${c.price}</li>`).join('')}
        </ul>
        <div style="font-size:1.1rem; font-weight:700; margin-top:1rem; border-top:1px solid #ccc; padding-top:0.5rem">
            Total Payable Action: ₹${totalCalc}
        </div>
    `;

    closeCheckout();
    document.getElementById('order-confirm-overlay').classList.add('active');
    document.getElementById('order-confirm-modal').classList.add('open');
});

function closeOrderConfirm() {
    document.getElementById('order-confirm-overlay').classList.remove('active');
    document.getElementById('order-confirm-modal').classList.remove('open');
}

document.getElementById('final-confirm-btn').addEventListener('click', async (e) => {
    const btn = e.target;
    btn.innerHTML = `<span class="spinner">Placing...</span>`;
    try {
        const res = await fetch(`${API_URL}/orders`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(pendingOrderPayload) });
        if(res.ok) {
            const data = await res.json();
            cart = []; saveCart(); document.getElementById('checkout-form').reset(); closeOrderConfirm();
            document.getElementById('success-order-id').innerText = data.orderId;
            document.getElementById('success-overlay').classList.add('active');
            document.getElementById('success-modal').classList.add('open');
        }
    } catch(err) { showToast('Backend error.'); }
    btn.innerHTML = `Place Order <i data-feather="check"></i>`; feather.replace();
});

/* Order Timeline Logic */
async function fetchHistory() {
    const phone = document.getElementById('history-phone').value;
    if(!phone) return showToast('Enter phone number');
    const container = document.getElementById('history-results');
    try {
        const orders = await (await fetch(`${API_URL}/orders/user/${phone}`)).json();
        if(orders.length === 0) return container.innerHTML = '<p class="txt-muted">No active orders found.</p>';
        container.innerHTML = orders.map(o => {
            
            const states = ['NEW', 'CONFIRMED', 'DELIVERED'];
            const curIdx = states.indexOf(o.status);
            const timelineHtml = `
            <div class="timeline">
                ${states.map((s, idx) => `
                    <div class="timeline-step ${idx <= curIdx ? 'active' : ''}">
                        <div class="timeline-dot">${idx <= curIdx ? '<i data-feather="check" style="width:14px"></i>' : ''}</div>
                        <div style="font-size:0.75rem">${s}</div>
                    </div>
                `).join('')}
            </div>
            `;

            const fbHtml = (o.status === 'DELIVERED' && !o.feedbackGiven) ? 
                `<button class="btn secondary-btn" style="width:100%; margin-top:1.5rem" onclick="openFeedback('${o._id}')">Review & Rate Us 🏪</button>` : 
                 (o.feedbackGiven ? `<div class="mt-2 text-sm txt-muted text-center" style="margin-top:1rem">Thanks! You rated ${o.feedback.rating}/5</div>` : '');
            
            return `
            <div class="history-card">
                <div class="order-top">
                    <div class="order-info">
                        <h4>Order ${o.orderId}</h4>
                        <p>${new Date(o.createdAt).toLocaleDateString()} | Total: ₹${o.total}</p>
                    </div>
                    <div class="order-status-badge badge-${o.status.toLowerCase()}">${o.status}</div>
                </div>
                <div class="order-items-list">
                    ${o.items.map(i => `${i.quantity}x ${i.name}`).join(' | ')}
                </div>
                ${timelineHtml}
                ${fbHtml}
            </div>`;
        }).join('');
        feather.replace();
    } catch(e) { container.innerHTML = '<p style="color:red">Error fetching data.</p>'; }
}

/* Feedback logic */
let currentFeedbackOrderId = null;
let ratingLocked = false;
const svgStarPath = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

function injectStarIcons() {
    const container = document.getElementById('star-rating');
    let html = '';
    for(let i=1; i<=5; i++) {
        html += `<div class="star-svg" data-val="${i}">${svgStarPath}</div>`;
    }
    container.innerHTML = html;
    initFeedbackStars();
}

function initFeedbackStars() {
    const icons = document.querySelectorAll('#star-rating .star-svg');
    icons.forEach(icon => {
        icon.addEventListener('mouseover', (e) => {
            if(ratingLocked) return;
            const hoverVal = parseInt(icon.getAttribute('data-val'));
            icons.forEach(s => {
                if(parseInt(s.getAttribute('data-val')) <= hoverVal) s.classList.add('hovered');
                else s.classList.remove('hovered');
            });
        });
        icon.addEventListener('mouseout', () => {
            if(ratingLocked) return;
            icons.forEach(s => s.classList.remove('hovered'));
        });
        icon.addEventListener('click', (e) => {
            if(ratingLocked) return;
            currentRating = parseInt(icon.getAttribute('data-val'));
            ratingLocked = true;
            icons.forEach(s => {
                const val = parseInt(s.getAttribute('data-val'));
                s.classList.remove('hovered');
                if(val <= currentRating) s.classList.add('filled');
                else s.classList.remove('filled');
            });
        });
    });
}
function openFeedback(id) {
    currentFeedbackOrderId = id; currentRating = 0; ratingLocked = false;
    document.getElementById('feedback-order-id').innerText = id;
    document.querySelectorAll('#star-rating .star-svg').forEach(s => { s.classList.remove('filled'); s.classList.remove('hovered'); });
    document.getElementById('feedback-comment').value = '';
    document.getElementById('feedback-overlay').classList.add('active');
    document.getElementById('feedback-modal').classList.add('open');
}
function closeFeedback() {
    document.getElementById('feedback-overlay').classList.remove('active');
    document.getElementById('feedback-modal').classList.remove('open');
}
async function submitFeedback() {
    if(currentRating === 0) return showToast('Please click an icon to set a rating');
    try {
        await fetch(`${API_URL}/orders/${currentFeedbackOrderId}/feedback`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ rating: currentRating, comment: document.getElementById('feedback-comment').value })
        });
        showToast('Feedback submitted!'); closeFeedback(); fetchHistory();
    } catch(e) { showToast('Error saving feedback'); }
}

/* Admin Login Gate */
function openAdminLogin() {
    document.getElementById('gate-password').value = '';
    document.getElementById('gate-error').style.opacity = '0';
    document.getElementById('admin-login-overlay').classList.add('active');
    document.getElementById('admin-login-modal').classList.add('open');
}
function closeAdminLogin() {
    document.getElementById('admin-login-overlay').classList.remove('active');
    document.getElementById('admin-login-modal').classList.remove('open');
}

document.getElementById('admin-gate-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('gate-submit-btn');
    const err = document.getElementById('gate-error');
    const pwd = document.getElementById('gate-password').value;
    
    btn.innerHTML = `<span class="spinner" style="font-size:0.8rem">Authenticating...</span>`;
    err.style.opacity = '0';
    
    setTimeout(() => {
        if(pwd === "apnidukanspn9140") {
            localStorage.setItem("isAdmin", "true");
            window.location.href = "/admin";
        } else {
            btn.innerHTML = `Authenticate <i data-feather="key"></i>`;
            feather.replace();
            const modal = document.getElementById('admin-login-modal');
            modal.classList.add('shake');
            setTimeout(() => modal.classList.remove('shake'), 400);
            err.style.opacity = '1';
        }
    }, 500);
});
