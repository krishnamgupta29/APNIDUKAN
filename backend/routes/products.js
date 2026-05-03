const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'apnidukan',
        allowedFormats: ['jpg', 'png', 'webp', 'jpeg'],
    },
});

const upload = multer({ storage });

router.get('/', productController.getProducts);
router.post('/', protect, authorize('admin'), upload.array('images', 5), productController.createProduct);
router.delete('/:id', protect, authorize('admin'), productController.deleteProduct);

module.exports = router;
