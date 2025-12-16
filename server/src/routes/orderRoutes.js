const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
} = require('../controllers/orderController');
const { authenticate, isAdmin } = require('../middleware/auth');

/**
 * @route   POST /api/orders
 * @desc    주문 생성
 * @access  Private
 */
router.post('/', authenticate, createOrder);

/**
 * @route   GET /api/orders
 * @desc    사용자 주문 목록 조회
 * @access  Private
 */
router.get('/', authenticate, getUserOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    특정 주문 조회
 * @access  Private
 */
router.get('/:id', authenticate, getOrderById);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    주문 상태 업데이트 (관리자만)
 * @access  Private (Admin only)
 */
router.put('/:id/status', authenticate, isAdmin, updateOrderStatus);

/**
 * @route   PUT /api/orders/:id/payment
 * @desc    결제 상태 업데이트
 * @access  Private
 */
router.put('/:id/payment', authenticate, updatePaymentStatus);

module.exports = router;

