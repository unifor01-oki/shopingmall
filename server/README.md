# OKI-MALL API Server

Node.js, Express, MongoDB를 사용한 OKI-MALL API 서버입니다.

## 기술 스택

- **Node.js**: JavaScript 런타임
- **Express**: 웹 애플리케이션 프레임워크
- **MongoDB**: NoSQL 데이터베이스
- **Mongoose**: MongoDB 객체 모델링 도구

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 필요한 환경 변수를 설정하세요.

```bash
cp .env.example .env
```

`.env` 파일을 열어서 MongoDB 연결 URI를 설정하세요:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/shopingmall
```

### 3. MongoDB 실행

로컬 MongoDB를 실행하거나, MongoDB Atlas와 같은 클라우드 서비스를 사용하세요.

로컬 MongoDB 설치가 필요한 경우:
- Windows: [MongoDB Community Edition 다운로드](https://www.mongodb.com/try/download/community)
- 또는 Docker를 사용: `docker run -d -p 27017:27017 mongo`

### 4. 서버 실행

개발 모드 (nodemon 사용):
```bash
npm run dev
```

프로덕션 모드:
```bash
npm start
```

서버가 성공적으로 시작되면 `http://localhost:3000`에서 API를 사용할 수 있습니다.

## 프로젝트 구조

```
server/
├── src/
│   ├── config/
│   │   └── database.js      # MongoDB 연결 설정
│   ├── routes/
│   │   └── index.js         # 라우트 설정
│   └── index.js             # 서버 진입점
├── .env.example             # 환경 변수 예시
├── .gitignore
├── package.json
└── README.md
```

## API 엔드포인트

### 기본 엔드포인트

- `GET /`: 서버 정보 확인
- `GET /api`: API 정보 확인

## 다음 단계

1. 모델 생성 (`src/models/`)
2. 라우터 추가 (`src/routes/`)
3. 컨트롤러 생성 (`src/controllers/`)
4. 미들웨어 추가 (`src/middlewares/`)
5. 유효성 검사 (예: express-validator)

