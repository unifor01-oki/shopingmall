const express = require('express');
const router = express.Router();

// API 라우트 모듈 import
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');

// 라우트 등록
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

// 기본 API 라우트
router.get('/', (req, res) => {
  res.json({
    message: 'API 엔드포인트입니다.',
    endpoints: {
      '/api/auth': '인증 관련 API',
      '/api/users': '사용자 관련 API',
      '/api/products': '상품 관련 API',
      '/api/orders': '주문 관련 API',
    },
  });
});

module.exports = router;

