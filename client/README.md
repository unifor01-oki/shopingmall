# OKI-MALL Client

Vite + React로 구성된 OKI-MALL 클라이언트 애플리케이션입니다.

## 기술 스택

- **Vite**: 빠른 빌드 도구
- **React 19**: UI 라이브러리
- **ESLint**: 코드 품질 관리

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

`.env` 파일 내용:
```
VITE_API_URL=http://localhost:5003
VITE_ENV=development
```

### 3. 개발 서버 실행

```bash
npm run dev
```

개발 서버는 `http://localhost:5173`에서 실행됩니다.

### 4. 빌드

프로덕션 빌드:
```bash
npm run build
```

빌드 결과물 미리보기:
```bash
npm run preview
```

## 프로젝트 구조

```
client/
├── public/          # 정적 파일
├── src/
│   ├── assets/      # 이미지 등의 자산
│   ├── utils/       # 유틸리티 함수
│   │   └── api.js   # API 요청 함수
│   ├── App.jsx      # 메인 앱 컴포넌트
│   ├── App.css      # 앱 스타일
│   ├── index.css    # 글로벌 스타일
│   └── main.jsx     # 진입점
├── .env.example     # 환경 변수 예시
├── vite.config.js   # Vite 설정
└── package.json
```

## API 연동

`src/utils/api.js` 파일에 API 요청 유틸리티 함수가 포함되어 있습니다.

사용 예시:
```javascript
import { get, post } from './utils/api'

// GET 요청
const data = await get('/api/products')

// POST 요청
const result = await post('/api/products', { name: '상품명', price: 10000 })
```

## 서버 연결

이 클라이언트는 `http://localhost:5003`에서 실행되는 서버와 연동됩니다.

Vite의 프록시 설정을 통해 `/api/*` 요청이 자동으로 백엔드 서버로 전달됩니다.

## 추가 정보

- [Vite 문서](https://vite.dev)
- [React 문서](https://react.dev)
