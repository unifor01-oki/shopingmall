const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { authenticate, isAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/products
 * @desc    모든 상품 조회 (필터링 및 페이지네이션 지원)
 * @access  Public
 * @query   category, status, page, limit, search
 */
router.get('/', getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    특정 상품 조회
 * @access  Public
 */
router.get('/:id', getProductById);

/**
 * @route   POST /api/products
 * @desc    새 상품 생성
 * @access  Private (Admin only)
 */
router.post('/', authenticate, isAdmin, createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    상품 정보 수정
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, isAdmin, updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    상품 삭제
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, isAdmin, deleteProduct);

module.exports = router;

