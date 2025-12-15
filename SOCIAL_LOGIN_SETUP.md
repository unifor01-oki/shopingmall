# 소셜 로그인 설정 가이드

이 프로젝트는 Google, Kakao, Facebook 소셜 로그인을 지원합니다.

## 1. 서버 설정

### 1.1 환경 변수 설정

`server/.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
PORT=5003
MONGODB_URI=mongodb://localhost:27017/shopingmall
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your-google-client-id
```

### 1.2 Google 클라이언트 ID 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "사용자 인증 정보"로 이동
4. "사용자 인증 정보 만들기" > "OAuth 클라이언트 ID" 선택
5. 애플리케이션 유형: "웹 애플리케이션"
6. 승인된 JavaScript 원본: `http://localhost:5173`
7. 승인된 리디렉션 URI: `http://localhost:5173`
8. 생성된 클라이언트 ID를 `GOOGLE_CLIENT_ID`에 설정

## 2. 클라이언트 설정

### 2.1 환경 변수 설정

`client/.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_API_URL=http://localhost:5003
VITE_ENV=development
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_KAKAO_JS_KEY=your-kakao-javascript-key
VITE_FACEBOOK_APP_ID=your-facebook-app-id
```

### 2.2 Kakao JavaScript Key 설정

1. [Kakao Developers](https://developers.kakao.com/)에 접속
2. 내 애플리케이션 > 애플리케이션 추가하기
3. 플랫폼 설정 > Web 플랫폼 등록
   - 사이트 도메인: `http://localhost:5173`
4. 제품 설정 > 카카오 로그인 활성화
5. Redirect URI: `http://localhost:5173`
6. JavaScript 키를 `VITE_KAKAO_JS_KEY`에 설정

### 2.3 Facebook App ID 설정

1. [Facebook Developers](https://developers.facebook.com/)에 접속
2. 앱 만들기
3. Facebook 로그인 제품 추가
4. 설정 > 기본 설정에서 앱 ID 확인
5. 앱 도메인: `localhost`
6. 플랫폼 추가 > 웹사이트
   - 사이트 URL: `http://localhost:5173`
7. 앱 ID를 `VITE_FACEBOOK_APP_ID`에 설정

## 3. 사용 방법

### 3.1 일반 로그인

1. 회원가입 페이지에서 계정 생성
2. 로그인 페이지에서 이메일과 비밀번호로 로그인

### 3.2 소셜 로그인

로그인 페이지에서 원하는 소셜 로그인 버튼을 클릭하면 됩니다.

- **Google 로그인**: Google 계정으로 로그인
- **Kakao 로그인**: 카카오 계정으로 로그인
- **Facebook 로그인**: Facebook 계정으로 로그인

## 4. 주의사항

- 소셜 로그인을 사용하지 않는 경우, 해당 환경 변수는 비워둬도 됩니다.
- 프로덕션 환경에서는 반드시 강력한 `JWT_SECRET`을 사용하세요.
- 각 소셜 로그인 플랫폼의 정책을 확인하고 준수하세요.

## 5. 문제 해결

### Google 로그인이 작동하지 않는 경우
- Google Cloud Console에서 OAuth 동의 화면이 설정되었는지 확인
- 클라이언트 ID가 올바르게 설정되었는지 확인
- 브라우저 콘솔에서 오류 메시지 확인

### Kakao 로그인이 작동하지 않는 경우
- Kakao Developers에서 플랫폼이 올바르게 설정되었는지 확인
- JavaScript 키가 올바르게 설정되었는지 확인
- Redirect URI가 정확히 일치하는지 확인

### Facebook 로그인이 작동하지 않는 경우
- Facebook Developers에서 앱이 올바르게 설정되었는지 확인
- 앱 ID가 올바르게 설정되었는지 확인
- 앱이 공개 모드인지 확인 (개발 중에는 테스트 사용자 추가 필요)

