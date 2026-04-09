const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
    try {
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
        res.json(await Product.find().lean());
    } 
    catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, price, originalPrice, deliveryCharge, isFreeDelivery, outOfStock, description, instructions } = req.body;
        const images = req.files ? req.files.map(f => f.path) : [];
        if (req.body.imageUrl && images.length === 0) images.push(req.body.imageUrl);
        const newProduct = new Product({ 
            name, price, 
            originalPrice: originalPrice || price, 
            deliveryCharge: deliveryCharge || 0,
            isFreeDelivery: isFreeDelivery === 'true' || isFreeDelivery === true,
            outOfStock: outOfStock === 'true' || outOfStock === true,
            description, instructions, images 
        });
        res.status(201).json(await newProduct.save());
    } 
    catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
};

exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Product deleted' });
    } catch(err) { res.status(500).json({ error: err.message }); }
};
