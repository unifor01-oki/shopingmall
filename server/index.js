const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// 환경 변수
const PORT = process.env.PORT || 5003;
const MONGODB_URI =
  process.env.MONGODB_ATLAS_URL ||
  'mongodb://localhost:27017/shopingmall';

// CORS 허용 origin 설정
// - 개발: 로컬 호스트들
// - 배포: CLIENT_URL 환경 변수(쉼표로 여러 개 설정 가능)
// - CLIENT_URL이 없으면 모든 origin 허용 (배포 초기 단계용)
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? (() => {
        const clientUrl = process.env.CLIENT_URL || '';
        const origins = clientUrl
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean);
        // CLIENT_URL이 설정되지 않았으면 모든 origin 허용 (나중에 제한 가능)
        return origins.length > 0 ? origins : true;
      })()
    : ['http://localhost:5173', 'http://localhost:3000'];

// 미들웨어
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(morgan('dev'));
// 이미지 업로드를 위한 body 크기 제한 증가 (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB 연결 (비동기로 처리하여 서버 시작을 막지 않음)
const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 10000, // 10초 타임아웃
      socketTimeoutMS: 45000,
    };

    console.log('MongoDB 연결 시도 중...');
    console.log('연결 URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // 비밀번호 숨김
    
    await mongoose.connect(MONGODB_URI, options);
    
    const dbName = mongoose.connection.db.databaseName;
    const host = mongoose.connection.host;
    const port = mongoose.connection.port;
    
    console.log('✅ MongoDB 연결 성공!');
    console.log(`   호스트: ${host}:${port}`);
    console.log(`   데이터베이스: ${dbName}`);
    console.log(`   상태: ${mongoose.connection.readyState === 1 ? '연결됨' : '연결 안됨'}\n`);
    
    // 연결 이벤트 리스너
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB 연결 오류:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB 연결이 끊어졌습니다.');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB 재연결 성공');
    });

    // 연결 상태 주기적 확인
    setInterval(() => {
      if (mongoose.connection.readyState === 0) {
        console.log('⚠️  MongoDB 연결 끊김 감지 - 재연결 시도...');
        connectDB();
      }
    }, 30000); // 30초마다 확인
  } catch (err) {
    console.error('❌ MongoDB 연결 실패:', err.message);
    console.error('연결 URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
    console.error('\n📋 해결 방법:');
    console.error('1. MongoDB 서버가 실행 중인지 확인하세요.');
    console.error('2. MongoDB Atlas Network Access에서 IP 허용 확인');
    console.error('3. 환경 변수 MONGODB_ATLAS_URL이 올바른지 확인하세요.');
    console.error('4. 방화벽 설정을 확인하세요.\n');
    
    // 프로덕션 환경에서도 연결 실패 시 서버는 계속 실행
    console.error('⚠️  MongoDB 연결 실패했지만 서버는 계속 실행됩니다.');
    console.error('   환경 변수 MONGODB_ATLAS_URL을 확인해주세요.\n');
    
    // 재연결 시도 (5초 후)
    setTimeout(() => {
      console.log('🔄 MongoDB 재연결 시도...');
      connectDB();
    }, 5000);
  }
};

// 서버 시작 후 MongoDB 연결 시도 (서버 시작을 막지 않음)
// 데이터베이스 연결은 서버 시작과 독립적으로 처리

// 기본 라우트
app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = {
    0: '연결 안됨',
    1: '연결됨',
    2: '연결 중',
    3: '연결 해제 중',
  };

  res.json({
    message: 'OKI-MALL API 서버입니다.',
    version: '1.0.0',
    database: {
      status: dbStatusText[dbStatus] || '알 수 없음',
      connected: dbStatus === 1,
      name: mongoose.connection.db?.databaseName || '연결 안됨',
    },
  });
});

// MongoDB 연결 상태 확인 엔드포인트
// 헬스 체크는 서버가 실행 중인지만 확인 (MongoDB 연결 상태와 무관하게 200 반환)
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const isConnected = dbStatus === 1;

  // 서버가 실행 중이면 항상 200 반환 (Cloudtype liveness/readiness probe 통과)
  res.status(200).json({
    success: true,
    server: 'running',
    database: {
      connected: isConnected,
      status: isConnected ? '연결됨' : '연결 안됨',
      name: mongoose.connection.db?.databaseName || null,
      host: mongoose.connection.host || null,
    },
    timestamp: new Date().toISOString(),
  });
});

// API 라우트
app.use('/api', require('./src/routes'));

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    error: '요청한 리소스를 찾을 수 없습니다.',
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || '서버 내부 오류가 발생했습니다.',
  });
});

// 서버 시작 (MongoDB 연결과 독립적으로)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  console.log(`📍 클라이언트: http://localhost:5173`);
  console.log(`📍 환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 MongoDB URI: ${MONGODB_URI ? '설정됨' : '설정 안됨'}`);
  console.log(`\n🔄 MongoDB 연결을 시작합니다...\n`);
  
  // 서버가 시작된 후 MongoDB 연결 시도
  connectDB().catch((err) => {
    console.error('MongoDB 초기 연결 실패:', err.message);
    console.error('서버는 계속 실행되며, MongoDB는 백그라운드에서 재연결을 시도합니다.');
  });
});

// 서버 시작 실패 시 에러 처리
server.on('error', (err) => {
  console.error('❌ 서버 시작 실패:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`포트 ${PORT}가 이미 사용 중입니다.`);
  }
  // 에러가 발생해도 프로세스를 종료하지 않음 (Cloudtype에서 재시도 가능)
});

// 포트 충돌 등 서버 시작 에러 처리
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ 포트 ${PORT}가 이미 사용 중입니다.`);
    console.error('해결 방법:');
    console.error(`1. 다른 포트를 사용하려면 .env 파일에서 PORT 값을 변경하세요.`);
    console.error(`2. 포트 ${PORT}를 사용 중인 프로세스를 종료하세요:`);
    console.error(`   Windows: netstat -ano | findstr :${PORT}`);
    console.error(`   그 후 taskkill /PID <PID번호> /F\n`);
  } else {
    console.error('서버 시작 중 오류 발생:', err);
  }
  process.exit(1);
});

