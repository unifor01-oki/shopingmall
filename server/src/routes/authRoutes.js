const express = require('express');
const router = express.Router();
const {
  login,
  socialLogin,
  getCurrentUser,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   POST /api/auth/login
 * @desc    일반 로그인
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/social
 * @desc    소셜 로그인 (Google, Kakao, Facebook)
 * @access  Public
 */
router.post('/social', socialLogin);

/**
 * @route   GET /api/auth/me
 * @desc    현재 사용자 정보 조회
 * @access  Private
 */
router.get('/me', authenticate, getCurrentUser);

module.exports = router;

