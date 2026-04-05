const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    deliveryCharge: { type: Number, default: 0 },
    isFreeDelivery: { type: Boolean, default: false },
    outOfStock: { type: Boolean, default: false },
    images: [{ type: String }],
    description: { type: String, required: true },
    instructions: { type: String },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
});
module.exports = mongoose.model('Product', productSchema);
