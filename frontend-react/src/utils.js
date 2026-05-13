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
            // Check if order already exists
            const exists = history.find(o => o._id === order._id);
            if (!exists) {
                localStorage.setItem('apni_order_history', JSON.stringify([order, ...history]));
            }
        } catch (e) {
            console.error("Local save failed", e);
        }
    },
    getOrders: () => {
        try {
            return JSON.parse(localStorage.getItem('apni_order_history') || '[]');
        } catch (e) {
            return [];
        }
    },
    updateOrderStatus: (orderId, status, feedback = null) => {
        try {
            const history = JSON.parse(localStorage.getItem('apni_order_history') || '[]');
            const updated = history.map(o => {
                if (o._id === orderId) {
                    return { ...o, status, feedbackGiven: !!feedback, feedback: feedback || o.feedback };
                }
                return o;
            });
            localStorage.setItem('apni_order_history', JSON.stringify(updated));
        } catch (e) {}
    }
};
