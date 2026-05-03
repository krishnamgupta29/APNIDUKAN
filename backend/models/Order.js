const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    items: [
        {
            productId: { type: String, required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            image: { type: String }
        }
    ],
    total: { type: Number, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'NEW', 'CONFIRMED', 'DELIVERED', 'RETURNED', 'ARCHIVED', 'assigned', 'delivered', 'returned'] },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deliveredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    feedbackGiven: { type: Boolean, default: false },
    feedback: {
        rating: { type: Number },
        comment: { type: String },
        submittedAt: { type: Date }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
