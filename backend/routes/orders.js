const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', orderController.createOrder); // public
router.get('/user/:phone', orderController.getOrderHistory); // public
router.post('/:id/feedback', orderController.submitFeedback); // public
router.post('/sync', orderController.syncOrders); // public

router.get('/', protect, authorize('admin'), orderController.getOrders);
router.put('/:id/assign', protect, authorize('admin'), orderController.assignOrder);
router.get('/logs', protect, authorize('admin'), orderController.getDeliveryLogs);

router.get('/my-deliveries', protect, authorize('delivery'), orderController.getMyDeliveries);

router.put('/:id/status', protect, authorize('admin', 'delivery'), orderController.updateOrderStatus);
router.delete('/:id', protect, authorize('admin'), orderController.deleteOrder);

module.exports = router;
