# 주문(Order) 스키마 디자인 문서

## 개요
쇼핑몰 주문 시스템을 위한 MongoDB 스키마 설계 문서입니다.

## 스키마 구조

### 1. 주문 기본 정보

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `orderNumber` | String | ✅ | 주문번호 (고유값, 자동 생성) |
| `status` | String | ✅ | 주문 상태 (pending, confirmed, processing, shipped, delivered, cancelled, refunded) |

**주문 상태 설명:**
- `pending`: 주문 대기 (결제 전)
- `confirmed`: 주문 확인 (결제 완료 후)
- `processing`: 처리 중 (상품 준비 중)
- `shipped`: 배송 중
- `delivered`: 배송 완료
- `cancelled`: 취소됨
- `refunded`: 환불됨

### 2. 고객 정보

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `userId` | ObjectId | ✅ | 주문한 사용자 ID (User 참조) |
| `customerName` | String | ✅ | 주문자 이름 |
| `customerEmail` | String | ✅ | 주문자 이메일 |
| `customerPhone` | String | ✅ | 주문자 전화번호 |

### 3. 배송 정보 (`shippingAddress`)

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `recipientName` | String | ✅ | 수령인 이름 |
| `phone` | String | ✅ | 수령인 전화번호 |
| `postalCode` | String | ✅ | 우편번호 |
| `address` | String | ✅ | 기본 주소 |
| `detailAddress` | String | ❌ | 상세 주소 |
| `deliveryRequest` | String | ❌ | 배송 요청사항 |

### 4. 주문 상품 정보 (`items[]`)

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `productId` | ObjectId | ✅ | 상품 ID (Product 참조) |
| `productName` | String | ✅ | 상품명 (스냅샷) |
| `productImage` | String | ❌ | 상품 이미지 (스냅샷) |
| `sku` | String | ✅ | 상품 SKU (스냅샷) |
| `selectedOptions` | Map | ❌ | 선택한 옵션 (색상, 재질, 사이즈 등) |
| `quantity` | Number | ✅ | 수량 |
| `unitPrice` | Number | ✅ | 단가 (주문 시점 가격) |
| `totalPrice` | Number | ✅ | 총 가격 (단가 × 수량) |

**참고:** 상품 정보는 주문 시점의 스냅샷으로 저장하여, 이후 상품 정보가 변경되어도 주문 내역은 유지됩니다.

### 5. 금액 정보

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `subtotal` | Number | ✅ | 상품 총액 (모든 상품의 totalPrice 합계) |
| `shippingFee` | Number | ✅ | 배송비 (기본값: 0) |
| `discount` | Number | ❌ | 할인금액 (기본값: 0) |
| `totalAmount` | Number | ✅ | 최종 결제금액 (subtotal + shippingFee - discount) |

### 6. 결제 정보

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `paymentMethod` | String | ✅ | 결제 방법 (card, bank_transfer, virtual_account, phone, point) |
| `paymentStatus` | String | ✅ | 결제 상태 (pending, completed, failed, refunded) |
| `paymentId` | String | ❌ | 결제 고유 ID (PG사에서 발급) |
| `paymentDate` | Date | ❌ | 결제일시 |

**결제 방법 설명:**
- `card`: 카드 결제
- `bank_transfer`: 계좌이체
- `virtual_account`: 가상계좌
- `phone`: 휴대폰 결제
- `point`: 포인트 결제

### 7. 배송 추적 정보

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `trackingNumber` | String | ❌ | 운송장 번호 |
| `shippedDate` | Date | ❌ | 배송일 |
| `deliveredDate` | Date | ❌ | 배송 완료일 |

### 8. 취소/환불 정보

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `cancelledDate` | Date | ❌ | 취소일 |
| `cancelledReason` | String | ❌ | 취소 사유 |
| `refundAmount` | Number | ❌ | 환불금액 |
| `refundDate` | Date | ❌ | 환불일 |

### 9. 기타 정보

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `notes` | String | ❌ | 주문 메모 |
| `createdAt` | Date | ✅ | 주문 생성일 (자동) |
| `updatedAt` | Date | ✅ | 주문 수정일 (자동) |

## 인덱스

다음 필드에 인덱스가 설정되어 있습니다:
- `orderNumber` (고유 인덱스)
- `userId` (사용자별 주문 조회)
- `status` (상태별 주문 조회)
- `createdAt` (최신 주문 조회)
- `paymentStatus` (결제 상태별 조회)

## 주문번호 생성 규칙

주문번호는 자동으로 생성되며, 형식은 다음과 같습니다:
```
ORD-YYYYMMDD-HHMMSS-XXXX
```

예시: `ORD-20241215-143025-1234`
- `ORD`: 주문(Order) 접두사
- `YYYYMMDD`: 주문 날짜
- `HHMMSS`: 주문 시간
- `XXXX`: 4자리 랜덤 숫자

## 가상 필드 (Virtual Fields)

### statusText
주문 상태를 한글로 반환합니다.
- `pending` → "주문 대기"
- `confirmed` → "주문 확인"
- `processing` → "처리 중"
- `shipped` → "배송 중"
- `delivered` → "배송 완료"
- `cancelled` → "취소됨"
- `refunded` → "환불됨"

### paymentStatusText
결제 상태를 한글로 반환합니다.
- `pending` → "결제 대기"
- `completed` → "결제 완료"
- `failed` → "결제 실패"
- `refunded` → "환불됨"

## 사용 예시

### 주문 생성 예시

```javascript
const order = new Order({
  userId: user._id,
  customerName: '홍길동',
  customerEmail: 'hong@example.com',
  customerPhone: '010-1234-5678',
  shippingAddress: {
    recipientName: '홍길동',
    phone: '010-1234-5678',
    postalCode: '12345',
    address: '서울시 강남구 테헤란로 123',
    detailAddress: '456호',
    deliveryRequest: '문 앞에 놓아주세요',
  },
  items: [
    {
      productId: product._id,
      productName: '골드 반지',
      productImage: 'https://example.com/image.jpg',
      sku: 'RING-001',
      selectedOptions: {
        color: 'yellow',
        material: 'k18',
        size: 'size_12',
      },
      quantity: 1,
      unitPrice: 150000,
      totalPrice: 150000,
    },
  ],
  subtotal: 150000,
  shippingFee: 0,
  discount: 0,
  totalAmount: 150000,
  paymentMethod: 'card',
  paymentStatus: 'pending',
});
```

## 주의사항

1. **스냅샷 저장**: 상품 정보(`productName`, `productImage`, `sku`, `unitPrice`)는 주문 시점의 값을 저장하여, 이후 상품 정보가 변경되어도 주문 내역은 유지됩니다.

2. **옵션 저장**: `selectedOptions`는 Map 타입으로 저장되며, 옵션 타입(키)과 선택한 값(값)을 저장합니다.

3. **금액 계산**: `totalAmount`는 `subtotal + shippingFee - discount`로 계산되며, 주문 생성 시 자동으로 계산되어야 합니다.

4. **상태 관리**: 주문 상태와 결제 상태는 별도로 관리되며, 주문 상태 변경 시 적절한 날짜 필드도 함께 업데이트해야 합니다.

