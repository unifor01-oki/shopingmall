const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, '이메일은 필수입니다.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, '올바른 이메일 형식이 아닙니다.'],
    },
    name: {
      type: String,
      required: [true, '이름은 필수입니다.'],
      trim: true,
    },
    password: {
      type: String,
      required: function() {
        // 소셜 로그인 사용자는 비밀번호가 없을 수 있음
        return !this.socialId;
      },
      minlength: [6, '비밀번호는 최소 6자 이상이어야 합니다.'],
      select: false, // 기본적으로 조회 시 제외
    },
    user_type: {
      type: String,
      required: [true, '사용자 유형은 필수입니다.'],
      enum: {
        values: ['customer', 'admin'],
        message: '사용자 유형은 customer 또는 admin이어야 합니다.',
      },
      default: 'customer',
    },
    address: {
      type: String,
      trim: true,
    },
    // 소셜 로그인 관련 필드
    socialId: {
      type: String,
      sparse: true, // 여러 소셜 로그인을 위한 인덱스
    },
    socialProvider: {
      type: String,
      enum: ['google', 'kakao', 'facebook'],
    },
    profileImage: {
      type: String,
    },
  },
  {
    timestamps: true, // createdAt과 updatedAt 자동 생성
  }
);

// 인덱스 추가 (이메일 검색 성능 향상)
userSchema.index({ email: 1 });
userSchema.index({ socialId: 1, socialProvider: 1 }, { unique: true, sparse: true });

// 비밀번호 해싱 (저장 전)
userSchema.pre('save', async function (next) {
  // 비밀번호가 변경되지 않았거나 소셜 로그인 사용자인 경우 스킵
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 비밀번호 비교 메서드
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// JSON 변환 시 password 제외
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

