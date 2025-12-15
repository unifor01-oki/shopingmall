const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { OAuth2Client } = require('google-auth-library');

/**
 * 일반 로그인
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 필수 필드 검증
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '이메일과 비밀번호를 입력해주세요.',
      });
    }

    // 사용자 조회 (비밀번호 포함)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    // 소셜 로그인 사용자인 경우
    if (user.socialProvider) {
      return res.status(400).json({
        success: false,
        error: `${user.socialProvider} 계정으로 가입된 이메일입니다. 소셜 로그인을 이용해주세요.`,
      });
    }

    // 비밀번호 확인
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    // JWT 토큰 생성
    const token = generateToken({
      id: user._id,
      email: user.email,
      user_type: user.user_type,
    });

    res.status(200).json({
      success: true,
      message: '로그인 성공',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          user_type: user.user_type,
          profileImage: user.profileImage,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '로그인 중 오류가 발생했습니다.',
      message: error.message,
    });
  }
};

/**
 * 소셜 로그인 (Google, Kakao, Facebook)
 */
exports.socialLogin = async (req, res) => {
  try {
    const { provider, socialId, email, name, profileImage, idToken } = req.body;

    // Google의 경우 ID 토큰 검증
    if (provider === 'google' && idToken) {
      try {
        const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
        
        if (!GOOGLE_CLIENT_ID) {
          return res.status(500).json({
            success: false,
            error: 'Google 클라이언트 ID가 설정되지 않았습니다.',
          });
        }

        const client = new OAuth2Client(GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
          idToken: idToken,
          audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        
        // 검증된 정보 사용
        const verifiedSocialId = payload.sub;
        const verifiedEmail = payload.email;
        const verifiedName = payload.name;
        const verifiedProfileImage = payload.picture;

        // 소셜 ID로 기존 사용자 찾기
        let user = await User.findOne({
          socialId: verifiedSocialId,
          socialProvider: provider,
        });

        if (user) {
          // 기존 사용자 - 토큰 발급
          const token = generateToken({
            id: user._id,
            email: user.email,
            user_type: user.user_type,
          });

          return res.status(200).json({
            success: true,
            message: '로그인 성공',
            data: {
              token,
              user: {
                id: user._id,
                email: user.email,
                name: user.name,
                user_type: user.user_type,
                profileImage: user.profileImage,
              },
            },
          });
        }

        // 새 사용자 - 이메일로 기존 계정 확인
        const existingUser = await User.findOne({ email: verifiedEmail.toLowerCase() });

        if (existingUser) {
          if (!existingUser.socialProvider) {
            return res.status(400).json({
              success: false,
              error: '이미 가입된 이메일입니다. 일반 로그인을 이용해주세요.',
            });
          }
          return res.status(400).json({
            success: false,
            error: `${existingUser.socialProvider} 계정으로 이미 가입되어 있습니다.`,
          });
        }

        // 새 사용자 생성
        user = new User({
          email: verifiedEmail.toLowerCase(),
          name: verifiedName,
          socialId: verifiedSocialId,
          socialProvider: provider,
          profileImage: verifiedProfileImage,
          user_type: 'customer',
        });

        await user.save();

        // 토큰 발급
        const token = generateToken({
          id: user._id,
          email: user.email,
          user_type: user.user_type,
        });

        return res.status(201).json({
          success: true,
          message: '회원가입 및 로그인 성공',
          data: {
            token,
            user: {
              id: user._id,
              email: user.email,
              name: user.name,
              user_type: user.user_type,
              profileImage: user.profileImage,
            },
          },
        });
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: 'Google 토큰 검증에 실패했습니다.',
          message: error.message,
        });
      }
    }

    // Kakao, Facebook의 경우 기존 로직 사용
    // 필수 필드 검증
    if (!provider || !socialId || !email || !name) {
      return res.status(400).json({
        success: false,
        error: '필수 정보가 누락되었습니다.',
      });
    }

    // 지원하는 소셜 로그인 제공자 확인
    if (!['google', 'kakao', 'facebook'].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: '지원하지 않는 소셜 로그인 제공자입니다.',
      });
    }

    // 소셜 ID로 기존 사용자 찾기
    let user = await User.findOne({
      socialId,
      socialProvider: provider,
    });

    if (user) {
      // 기존 사용자 - 토큰 발급
      const token = generateToken({
        id: user._id,
        email: user.email,
        user_type: user.user_type,
      });

      return res.status(200).json({
        success: true,
        message: '로그인 성공',
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            user_type: user.user_type,
            profileImage: user.profileImage,
          },
        },
      });
    }

    // 새 사용자 - 이메일로 기존 계정 확인
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      // 일반 계정이 있는 경우
      if (!existingUser.socialProvider) {
        return res.status(400).json({
          success: false,
          error: '이미 가입된 이메일입니다. 일반 로그인을 이용해주세요.',
        });
      }
      // 다른 소셜 로그인으로 가입된 경우
      return res.status(400).json({
        success: false,
        error: `${existingUser.socialProvider} 계정으로 이미 가입되어 있습니다.`,
      });
    }

    // 새 사용자 생성
    user = new User({
      email: email.toLowerCase(),
      name,
      socialId,
      socialProvider: provider,
      profileImage,
      user_type: 'customer',
    });

    await user.save();

    // 토큰 발급
    const token = generateToken({
      id: user._id,
      email: user.email,
      user_type: user.user_type,
    });

    res.status(201).json({
      success: true,
      message: '회원가입 및 로그인 성공',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          user_type: user.user_type,
          profileImage: user.profileImage,
        },
      },
    });
  } catch (error) {
    // 중복 오류 처리
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: '이미 존재하는 계정입니다.',
      });
    }

    res.status(500).json({
      success: false,
      error: '소셜 로그인 중 오류가 발생했습니다.',
      message: error.message,
    });
  }
};

/**
 * 현재 사용자 정보 조회
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        user_type: user.user_type,
        profileImage: user.profileImage,
        socialProvider: user.socialProvider,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '사용자 정보 조회 중 오류가 발생했습니다.',
      message: error.message,
    });
  }
};

