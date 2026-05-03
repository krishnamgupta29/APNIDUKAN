const express = require('express');
const router = express.Router();
const { loginUser, registerDeliveryUser, getDeliveryUsers, deleteDeliveryUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/login', loginUser);

// Admin-only routes
router.post('/register-delivery', protect, authorize('admin'), registerDeliveryUser);
router.get('/delivery-users', protect, authorize('admin'), getDeliveryUsers);
router.delete('/delivery-users/:id', protect, authorize('admin'), deleteDeliveryUser);

module.exports = router;
