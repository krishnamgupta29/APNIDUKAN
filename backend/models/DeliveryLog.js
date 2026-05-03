const mongoose = require('mongoose');

const deliveryLogSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    deliveryUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    oldStatus: { type: String },
    newStatus: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeliveryLog', deliveryLogSchema);
