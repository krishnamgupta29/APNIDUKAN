// Extracted from previous versions, mapping ARCHIVED into completed lists
document.addEventListener('DOMContentLoaded', () => {
    feather.replace();
    fetchOrders(); 
    fetchCatalog();
});

const API_URL = 'http://localhost:5000/api';
const ADMIN_TOKEN = 'apnidukanspn9140';

function showToast(msg) {
    const t = document.getElementById('toast');
    t.querySelector('.toast-msg').innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

function logoutAdmin() {
    localStorage.removeItem('isAdmin');
    window.location.href = '/';
}

function switchView(viewId, el) {
    document.querySelectorAll('.nav-menu li').forEach(li => li.classList.remove('active'));
    document.querySelectorAll('.content-view').forEach(v => v.classList.remove('active'));
    el.classList.add('active');
    document.getElementById(`view-${viewId}`).classList.add('active');
}

async function fetchOrders() {
    try {
        const res = await fetch(`${API_URL}/orders`, { headers: { 'x-admin-token': ADMIN_TOKEN } });
        const orders = await res.json();
        
        const activeOrders = orders.filter(o => o.status === 'NEW' || o.status === 'CONFIRMED');
        const completedOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'ARCHIVED');

        renderActiveOrders(activeOrders);
        renderCompletedOrders(completedOrders);
        feather.replace();
    } catch(err) { showToast('Error gathering orders.'); }
}

async function fetchCatalog() {
    try {
        const res = await fetch(`${API_URL}/products`);
        const products = await res.json();
        const tbody = document.getElementById('catalog-tbody');
        tbody.innerHTML = products.map(p => {
            const img = (p.images && p.images.length > 0) ? `http://localhost:5000${p.images[0]}` : 'https://via.placeholder.com/40';
            return `
            <tr>
                <td><img src="${img}" class="prod-thumb" style="vertical-align:middle;margin-right:0.5rem"> <strong>${p.name}</strong></td>
                <td><span style="font-size:0.85rem">${p.description.substring(0, 40)}...</span></td>
                <td>₹${p.price}</td>
                <td>⭐ ${p.averageRating} (${p.totalReviews})</td>
                <td><button class="icon-btn-danger" title="Delete Product" onclick="promptDelete('product', '${p._id}')"><i data-feather="trash-2"></i></button></td>
            </tr>
        `}).join('');
        feather.replace();
    } catch(err) { showToast('Error loading catalog.'); }
}

function renderActiveOrders(orders) {
    document.getElementById('active-orders-tbody').innerHTML = orders.map(o => `
        <tr>
            <td><strong>${o.orderId}</strong><br><small>${new Date(o.createdAt).toLocaleDateString()}</small></td>
            <td><strong>${o.customerName}</strong><br>${o.phone}</td>
            <td>${o.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</td>
            <td>₹${o.total}</td>
            <td>
                <select class="status-select" onchange="updateOrderStatus('${o._id}', this.value)">
                    <option value="NEW" ${o.status==='NEW'?'selected':''}>NEW</option>
                    <option value="CONFIRMED" ${o.status==='CONFIRMED'?'selected':''}>CONFIRMED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                </select>
            </td>
        </tr>
    `).join('');
}

function renderCompletedOrders(orders) {
    document.getElementById('completed-orders-tbody').innerHTML = orders.map(o => `
        <tr>
            <td><strong>${o.orderId}</strong><br><small>${new Date(o.createdAt).toLocaleDateString()}</small></td>
            <td><strong>${o.customerName}</strong><br>${o.phone}</td>
            <td>${o.items.map(i => `${i.name}`).join(', ')}</td>
            <td>₹${o.total}</td>
            <td>
                <select class="status-select" onchange="updateOrderStatus('${o._id}', this.value)" style="margin-bottom:0.5rem">
                    <option value="DELIVERED" ${o.status==='DELIVERED'?'selected':''}>DELIVERED</option>
                    <option value="ARCHIVED" ${o.status==='ARCHIVED'?'selected':''}>ARCHIVED</option>
                </select>
                <br>
                ${o.feedbackGiven ? `<div style="color:#f5a623">🏪 ${o.feedback.rating}/5</div><i>${o.feedback.comment}</i>` : '<small>No feedback</small>'}
            </td>
            <td><button class="icon-btn-danger" title="Delete Order" onclick="promptDelete('order', '${o._id}')"><i data-feather="trash-2"></i></button></td>
        </tr>
    `).join('');
}

async function updateOrderStatus(id, status) {
    try {
        await fetch(`${API_URL}/orders/${id}/status`, { 
            method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_TOKEN },
            body: JSON.stringify({ status })
        });
        showToast('Status Updated! WhatsApp Triggered.');
        fetchOrders();
    } catch(err) { showToast('Error'); }
}

let targetDelete = { type: null, id: null };
window.promptDelete = (type, id) => {
    targetDelete = { type, id };
    document.getElementById('confirm-overlay').classList.add('active');
    document.getElementById('confirm-modal').classList.add('active');
}
window.closeConfirmModal = () => {
    document.getElementById('confirm-overlay').classList.remove('active');
    document.getElementById('confirm-modal').classList.remove('active');
    targetDelete = { type: null, id: null };
}
document.getElementById('confirm-target-btn').onclick = async () => {
    if(!targetDelete.id) return closeConfirmModal();
    const endpoint = targetDelete.type === 'product' ? `/products/${targetDelete.id}` : `/orders/${targetDelete.id}`;
    try {
        await fetch(API_URL + endpoint, { method: 'DELETE', headers: { 'x-admin-token': ADMIN_TOKEN }});
        showToast(`${targetDelete.type} deleted successfully`);
        if(targetDelete.type === 'product') fetchCatalog();
        else fetchOrders();
    } catch(err) { showToast('Deletion error'); }
    closeConfirmModal();
}

document.getElementById('add-product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button'); btn.innerHTML = 'Uploading...';
    try {
        await fetch(`${API_URL}/products`, { method: 'POST', headers: { 'x-admin-token': ADMIN_TOKEN }, body: new FormData(e.target) });
        showToast('Product uploaded to database!'); e.target.reset(); fetchCatalog();
    } catch(err) { showToast('Upload Error.'); }
    btn.innerHTML = `<i data-feather="upload"></i> Upload`; feather.replace();
});
