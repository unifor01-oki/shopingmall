const User = require('../models/User');

/**
 * 모든 사용자 조회
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '사용자 목록을 가져오는 중 오류가 발생했습니다.',
      message: error.message,
    });
  }
};

/**
 * 특정 사용자 조회
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 사용자 ID입니다.',
      });
    }

    res.status(500).json({
      success: false,
      error: '사용자 정보를 가져오는 중 오류가 발생했습니다.',
      message: error.message,
    });
  }
};

/**
 * 새 사용자 생성
 */
exports.createUser = async (req, res) => {
  try {
    const { email, name, password, user_type, address } = req.body;

    // 필수 필드 검증
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        error: '이메일, 이름, 비밀번호는 필수입니다.',
      });
    }

    // user_type 검증
    if (user_type && !['customer', 'admin'].includes(user_type)) {
      return res.status(400).json({
        success: false,
        error: '사용자 유형은 customer 또는 admin이어야 합니다.',
      });
    }

    const user = new User({
      email,
      name,
      password,
      user_type: user_type || 'customer',
      address,
    });

    const savedUser = await user.save();

    res.status(201).json({
      success: true,
      message: '사용자가 성공적으로 생성되었습니다.',
      data: savedUser,
    });
  } catch (error) {
    // 중복 이메일 오류 처리
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: '이미 존재하는 이메일입니다.',
      });
    }

    // Mongoose 유효성 검사 오류 처리
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: '입력 데이터가 유효하지 않습니다.',
        details: errors,
      });
    }

    res.status(500).json({
      success: false,
      error: '사용자 생성 중 오류가 발생했습니다.',
      message: error.message,
    });
  }
};

/**
 * 사용자 정보 수정
 */
exports.updateUser = async (req, res) => {
  try {
    const { name, password, user_type, address } = req.body;
    const updateData = {};

    // 수정 가능한 필드만 업데이트
    if (name !== undefined) updateData.name = name;
    if (password !== undefined) updateData.password = password;
    if (user_type !== undefined) {
      if (!['customer', 'admin'].includes(user_type)) {
        return res.status(400).json({
          success: false,
          error: '사용자 유형은 customer 또는 admin이어야 합니다.',
        });
      }
      updateData.user_type = user_type;
    }
    if (address !== undefined) updateData.address = address;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true, // 업데이트된 문서 반환
        runValidators: true, // 스키마 유효성 검사 실행
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      message: '사용자 정보가 성공적으로 수정되었습니다.',
      data: user,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 사용자 ID입니다.',
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: '입력 데이터가 유효하지 않습니다.',
        details: errors,
      });
    }

    res.status(500).json({
      success: false,
      error: '사용자 정보 수정 중 오류가 발생했습니다.',
      message: error.message,
    });
  }
};

/**
 * 사용자 삭제
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      message: '사용자가 성공적으로 삭제되었습니다.',
      data: {},
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 사용자 ID입니다.',
      });
    }

    res.status(500).json({
      success: false,
      error: '사용자 삭제 중 오류가 발생했습니다.',
      message: error.message,
    });
  }
};

