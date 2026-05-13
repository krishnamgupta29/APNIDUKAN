import API_URL from './api';

export const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/400';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
};

export const LocalOrderStore = {
    saveOrder: (order) => {
        try {
            const history = JSON.parse(localStorage.getItem('apni_order_history') || '[]');
            // Check for duplicates
            if (history.some(o => o._id === order._id || o.orderId === order.orderId)) return;
            localStorage.setItem('apni_order_history', JSON.stringify([order, ...history]));
        } catch (e) {
            console.error('Local save error:', e);
        }
    },
    getOrders: () => {
        try {
            return JSON.parse(localStorage.getItem('apni_order_history') || '[]');
        } catch (e) {
            return [];
        }
    }
};
