const Order = require('../models/Order');
const Product = require('../models/Product');
const twilio = require('twilio');
const client = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

async function sendWhatsApp(phone, message) {
    if (client && process.env.TWILIO_WHATSAPP_NUMBER) {
        try {
            await client.messages.create({ body: message, from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, to: `whatsapp:+91${phone}` });
        } catch (e) { console.error("Twilio err:", e.message); }
    } else {
        console.log(`[WhatsApp Mock to ${phone}]: ${message}`);
    }
}

exports.createOrder = async (req, res) => {
    try {
        const { customerName, phone, address, items, total } = req.body;
        const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
        const savedOrder = await new Order({ orderId, customerName, phone, address, items, total }).save();

        const msgBody = `Hi ${customerName},\nYour order at ApniDukaan has been received!\nOrder ID: ${orderId}\nTotal: ₹${total}`;
        const adminMsg = `New Order! ID: ${orderId}, Total: ₹${total}`;
        await sendWhatsApp(phone, msgBody);
        if(process.env.ADMIN_WHATSAPP_NUMBER) await sendWhatsApp(process.env.ADMIN_WHATSAPP_NUMBER.replace('+91',''), adminMsg);
        
        res.status(201).json(savedOrder);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getOrders = async (req, res) => {
    try { res.json(await Order.find().sort({ createdAt: -1 })); } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getOrderHistory = async (req, res) => {
    try { 
        // Only return non-archived orders for users
        res.json(await Order.find({ phone: req.params.phone, status: { $ne: 'ARCHIVED' } }).sort({ createdAt: -1 })); 
    } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        
        let msg = `ApniDukaan: Your order ${updatedOrder.orderId} status is now ${status}.`;
        if(status === 'CONFIRMED') msg = `ApniDukaan: Great news! Your order ${updatedOrder.orderId} is confirmed and being prepared.`;
        if(status === 'DELIVERED') msg = `ApniDukaan: Your order ${updatedOrder.orderId} has been delivered. Enjoy and please leave feedback!`;
        if(status !== 'ARCHIVED') await sendWhatsApp(updatedOrder.phone, msg);

        res.json(updatedOrder);
    } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if(!order) return res.status(404).json({error: 'Not found'});
        if(order.status !== 'DELIVERED' && order.status !== 'ARCHIVED') return res.status(400).json({error: 'Can only delete completed/archived orders'});
        await Order.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Order deleted' });
    } catch(err) { res.status(500).json({ error: err.message }); }
};

exports.submitFeedback = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order || order.status !== 'DELIVERED') return res.status(400).json({ error: 'Order not eligible for feedback' });
        if (order.feedbackGiven) return res.status(400).json({ error: 'Feedback already given' });
        
        order.feedbackGiven = true;
        order.feedback = { rating, comment, submittedAt: new Date() };
        await order.save();

        order.items.forEach(async (item) => {
            const product = await Product.findById(item.productId);
            if(product) {
                const total = product.totalReviews || 0;
                const avg = product.averageRating || 0;
                const newTotal = total + 1;
                const newAvg = ((avg * total) + rating) / newTotal;
                product.totalReviews = newTotal;
                product.averageRating = parseFloat(newAvg.toFixed(1));
                await product.save();
            }
        });

        res.json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
};
