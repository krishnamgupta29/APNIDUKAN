const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

router.post('/', orderController.createOrder); // public
router.get('/user/:phone', orderController.getOrderHistory); // public
router.post('/:id/feedback', orderController.submitFeedback); // public

router.get('/', auth, orderController.getOrders); // protected
router.put('/:id/status', auth, orderController.updateOrderStatus); // protected
router.delete('/:id', auth, orderController.deleteOrder); // protected

module.exports = router;
