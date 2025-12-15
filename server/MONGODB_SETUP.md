# MongoDB 연결 가이드

## MongoDB 연결 확인 방법

### 1. MongoDB 서버 실행 확인

#### Windows에서 MongoDB 확인:
```powershell
# MongoDB 서비스 상태 확인
Get-Service MongoDB

# MongoDB 서비스 시작 (필요한 경우)
Start-Service MongoDB
```

#### MongoDB Compass에서 확인:
1. MongoDB Compass 실행
2. 연결 문자열 입력: `mongodb://localhost:27017`
3. 연결 테스트

### 2. 서버 연결 상태 확인

#### API 엔드포인트로 확인:
```bash
# 브라우저에서 접속
http://localhost:5003/api/health

# 또는 curl 사용
curl http://localhost:5003/api/health
```

#### 응답 예시 (연결 성공):
```json
{
  "success": true,
  "database": {
    "connected": true,
    "status": "연결됨",
    "name": "shopingmall",
    "host": "localhost"
  }
}
```

### 3. 서버 로그 확인

서버를 실행하면 다음과 같은 로그가 표시됩니다:

**연결 성공 시:**
```
✅ MongoDB 연결 성공!
   호스트: localhost:27017
   데이터베이스: shopingmall
   상태: 연결됨
```

**연결 실패 시:**
```
❌ MongoDB 연결 실패: ...
📋 해결 방법:
1. MongoDB 서버가 실행 중인지 확인하세요.
...
```

### 4. 문제 해결

#### 문제 1: "MongoDB 연결 실패"
**해결 방법:**
1. MongoDB 서버가 실행 중인지 확인
2. MongoDB Compass에서 연결 테스트
3. `.env` 파일의 `MONGODB_URI` 확인

#### 문제 2: "데이터베이스에 연결되지 않았습니다"
**해결 방법:**
1. 서버를 재시작
2. MongoDB 서버 재시작
3. 연결 상태 확인: `http://localhost:5003/api/health`

#### 문제 3: 상품이 저장되지 않음
**해결 방법:**
1. 서버 콘솔에서 에러 메시지 확인
2. MongoDB Compass에서 `shopingmall` 데이터베이스 확인
3. `products` 컬렉션 확인

### 5. MongoDB Compass에서 데이터 확인

1. MongoDB Compass 실행
2. 연결: `mongodb://localhost:27017`
3. 데이터베이스 선택: `shopingmall`
4. 컬렉션 확인: `products`

### 6. 수동으로 MongoDB 시작 (서비스가 없는 경우)

```bash
# MongoDB 설치 경로로 이동 (기본 경로)
cd "C:\Program Files\MongoDB\Server\<version>\bin"

# MongoDB 서버 시작
mongod --dbpath "C:\data\db"
```

## 현재 설정

- **데이터베이스 이름**: `shopingmall`
- **연결 URI**: `mongodb://localhost:27017/shopingmall`
- **포트**: `27017` (MongoDB 기본 포트)

## 연결 테스트

서버 실행 후 다음 명령어로 테스트:

```bash
# 1. 서버 상태 확인
curl http://localhost:5003/

# 2. 데이터베이스 연결 상태 확인
curl http://localhost:5003/api/health

# 3. 상품 목록 조회 (연결 확인)
curl http://localhost:5003/api/products
```

