const Order = require('../models/Order');
const Product = require('../models/Product');
const DeliveryLog = require('../models/DeliveryLog');
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
        // Increased to 6 digits for 900,000 unique combinations
        const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
        const savedOrder = await new Order({ orderId, customerName, phone, address, items, total }).save();

        // WhatsApp disabled to improve speed / since it's not active
        // const msgBody = `Hi ${customerName},\nYour order at ApniDukaan has been received!\nOrder ID: ${orderId}\nTotal: ₹${total}`;
        // const adminMsg = `New Order! ID: ${orderId}, Total: ₹${total}`;
        // sendWhatsApp(phone, msgBody);
        // if(process.env.ADMIN_WHATSAPP_NUMBER) sendWhatsApp(process.env.ADMIN_WHATSAPP_NUMBER.replace('+91',''), adminMsg);
        
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
        const orderId = req.params.id;
        const order = await Order.findById(orderId);
        
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // If delivery user, check assignment
        if (req.user && req.user.role === 'delivery') {
            if (!order.assignedTo || order.assignedTo.toString() !== req.user.id) {
                return res.status(403).json({ error: 'You can only update your assigned orders' });
            }
            if (!['delivered', 'returned'].includes(status)) {
                return res.status(400).json({ error: 'Delivery users can only mark delivered or returned' });
            }
        }

        const oldStatus = order.status;
        order.status = status;
        
        if (status === 'delivered' && req.user && req.user.role === 'delivery') {
            order.deliveredBy = req.user.id;
        }

        const updatedOrder = await order.save();

        if (req.user) {
            await DeliveryLog.create({
                orderId: updatedOrder._id,
                deliveryUserId: req.user.id,
                oldStatus,
                newStatus: status
            });
        }

        res.json(updatedOrder);
    } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if(!order) return res.status(404).json({error: 'Not found'});
        await Order.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Order deleted' });
    } catch(err) { res.status(500).json({ error: err.message }); }
};

exports.submitFeedback = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const order = await Order.findById(req.params.id);
        const st = order?.status?.toUpperCase();
        if (!order || (st !== 'DELIVERED' && st !== 'RETURNED')) return res.status(400).json({ error: 'Order not eligible for feedback' });
        if (order.feedbackGiven) return res.status(400).json({ error: 'Feedback already given' });
        
        order.feedbackGiven = true;
        order.feedback = { rating, comment, submittedAt: new Date() };
        await order.save();

        if (st === 'DELIVERED' && rating > 0) {
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
        }

        res.json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.assignOrder = async (req, res) => {
    try {
        const { deliveryUserId } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { 
            assignedTo: deliveryUserId,
            status: 'assigned' 
        }, { new: true });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getMyDeliveries = async (req, res) => {
    try {
        const orders = await Order.find({ assignedTo: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getDeliveryLogs = async (req, res) => {
    try {
        const logs = await DeliveryLog.find().populate('orderId deliveryUserId', 'orderId customerName username').sort({ timestamp: -1 });
        res.json(logs);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.syncOrders = async (req, res) => {
    try {
        const { orderIds } = req.body;
        if (!Array.isArray(orderIds)) return res.status(400).json({ error: 'orderIds must be an array' });
        
        // Find orders where either _id or orderId matches any of the provided IDs
        const orders = await Order.find({ 
            $or: [
                { _id: { $in: orderIds.filter(id => id.length === 24) } }, // Valid Mongo IDs
                { orderId: { $in: orderIds } } // Custom ORD-XXXX IDs
            ]
        });
        res.json(orders);
    } catch (err) { res.status(500).json({ error: err.message }); }
};
