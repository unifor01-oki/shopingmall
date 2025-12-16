const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * JWT 인증 미들웨어
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: '인증 토큰이 필요합니다.',
      });
    }

    const token = authHeader.substring(7); // 'Bearer ' 제거

    // 토큰 검증
    const decoded = verifyToken(token);

    // 사용자 정보 가져오기
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.',
      });
    }

    // 요청 객체에 사용자 정보 추가
    // 주문 등에서 사용자 이름/이메일을 사용할 수 있도록 name도 포함
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      user_type: user.user_type,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: '유효하지 않은 토큰입니다.',
      message: error.message,
    });
  }
};

/**
 * Admin 권한 체크 미들웨어
 */
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.user_type === 'admin') {
    return next();
  }

  res.status(403).json({
    success: false,
    error: 'Admin 권한이 필요합니다.',
  });
};

