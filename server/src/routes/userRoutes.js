const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

/**
 * @route   GET /api/users
 * @desc    모든 사용자 조회
 * @access  Public
 */
router.get('/', getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    특정 사용자 조회
 * @access  Public
 */
router.get('/:id', getUserById);

/**
 * @route   POST /api/users
 * @desc    새 사용자 생성
 * @access  Public
 */
router.post('/', createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    사용자 정보 수정
 * @access  Public
 */
router.put('/:id', updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    사용자 삭제
 * @access  Public
 */
router.delete('/:id', deleteUser);

module.exports = router;

