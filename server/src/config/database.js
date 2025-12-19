const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_ATLAS_URL || 'mongodb://localhost:27017/shopingmall';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      // MongoDB 6.0 이상에서는 더 이상 필요하지 않지만 호환성을 위해 유지
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`MongoDB 연결 성공: ${conn.connection.host}`);

    // 연결 이벤트 리스너
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB 연결 오류:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB 연결이 끊어졌습니다.');
    });

    // 프로세스 종료 시 연결 종료
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB 연결이 종료되었습니다.');
      process.exit(0);
    });
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    process.exit(1);
  }
};

module.exports = connectDB;

