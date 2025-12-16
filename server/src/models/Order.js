const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // 주문 기본 정보
    orderNumber: {
      type: String,
      required: [true, '주문번호는 필수입니다.'],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      required: [true, '주문 상태는 필수입니다.'],
      enum: {
        values: [
          'pending',      // 주문 대기
          'confirmed',    // 주문 확인
          'processing',   // 처리 중
          'shipped',      // 배송 중
          'delivered',    // 배송 완료
          'cancelled',    // 취소됨
          'refunded',     // 환불됨
        ],
        message: '유효하지 않은 주문 상태입니다.',
      },
      default: 'pending',
    },

    // 고객 정보
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '주문자 정보는 필수입니다.'],
    },
    customerName: {
      type: String,
      required: [true, '주문자 이름은 필수입니다.'],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, '주문자 이메일은 필수입니다.'],
      trim: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      required: [true, '주문자 전화번호는 필수입니다.'],
      trim: true,
    },

    // 배송 정보
    shippingAddress: {
      recipientName: {
        type: String,
        required: [true, '수령인 이름은 필수입니다.'],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, '수령인 전화번호는 필수입니다.'],
        trim: true,
      },
      postalCode: {
        type: String,
        required: [true, '우편번호는 필수입니다.'],
        trim: true,
      },
      address: {
        type: String,
        required: [true, '주소는 필수입니다.'],
        trim: true,
      },
      detailAddress: {
        type: String,
        trim: true,
      },
      deliveryRequest: {
        type: String,
        trim: true,
        default: '',
      },
    },

    // 주문 상품 정보
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        productName: {
          type: String,
          required: true,
          trim: true,
        },
        productImage: {
          type: String,
          trim: true,
        },
        sku: {
          type: String,
          required: true,
          trim: true,
        },
        selectedOptions: {
          type: Map,
          of: String,
          default: {},
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, '수량은 1개 이상이어야 합니다.'],
        },
        unitPrice: {
          type: Number,
          required: true,
          min: [0, '단가는 0 이상이어야 합니다.'],
        },
        totalPrice: {
          type: Number,
          required: true,
          min: [0, '총 가격은 0 이상이어야 합니다.'],
        },
      },
    ],

    // 금액 정보
    subtotal: {
      type: Number,
      required: [true, '상품 총액은 필수입니다.'],
      min: [0, '상품 총액은 0 이상이어야 합니다.'],
    },
    shippingFee: {
      type: Number,
      required: [true, '배송비는 필수입니다.'],
      min: [0, '배송비는 0 이상이어야 합니다.'],
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, '할인금액은 0 이상이어야 합니다.'],
    },
    totalAmount: {
      type: Number,
      required: [true, '최종 결제금액은 필수입니다.'],
      min: [0, '최종 결제금액은 0 이상이어야 합니다.'],
    },

    // 결제 정보
    paymentMethod: {
      type: String,
      required: [true, '결제 방법은 필수입니다.'],
      enum: {
        values: [
          'card',              // 카드 결제
          'bank_transfer',     // 계좌이체
          'naver_pay',         // 네이버페이
          'kakao_pay',         // 카카오페이
          'phone',             // 휴대폰 결제
          'point',             // 포인트 결제
        ],
        message: '유효하지 않은 결제 방법입니다.',
      },
    },
    paymentStatus: {
      type: String,
      required: [true, '결제 상태는 필수입니다.'],
      enum: {
        values: [
          'pending',    // 결제 대기
          'completed',  // 결제 완료
          'failed',     // 결제 실패
          'refunded',   // 환불됨
        ],
        message: '유효하지 않은 결제 상태입니다.',
      },
      default: 'pending',
    },
    paymentId: {
      type: String,
      trim: true,
    },
    paymentDate: {
      type: Date,
    },

    // 배송 정보
    trackingNumber: {
      type: String,
      trim: true,
    },
    shippedDate: {
      type: Date,
    },
    deliveredDate: {
      type: Date,
    },

    // 취소/환불 정보
    cancelledDate: {
      type: Date,
    },
    cancelledReason: {
      type: String,
      trim: true,
    },
    refundAmount: {
      type: Number,
      min: [0, '환불금액은 0 이상이어야 합니다.'],
    },
    refundDate: {
      type: Date,
    },

    // 기타 정보
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt과 updatedAt 자동 생성
  }
);

// 인덱스 추가
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });

// 주문번호 자동 생성 (검증 전에 수행)
// required 검증에 걸리지 않도록 'validate' 훅에서 orderNumber를 생성
orderSchema.pre('validate', async function (next) {
  if (!this.orderNumber) {
    // 날짜 기반 주문번호 생성: ORD-YYYYMMDD-HHMMSS-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomStr = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    this.orderNumber = `ORD-${dateStr}-${timeStr}-${randomStr}`;
  }
  next();
});

// JSON 변환 시 가상 필드 추가
orderSchema.virtual('statusText').get(function () {
  const statusMap = {
    pending: '주문 대기',
    confirmed: '주문 확인',
    processing: '처리 중',
    shipped: '배송 중',
    delivered: '배송 완료',
    cancelled: '취소됨',
    refunded: '환불됨',
  };
  return statusMap[this.status] || this.status;
});

orderSchema.virtual('paymentStatusText').get(function () {
  const statusMap = {
    pending: '결제 대기',
    completed: '결제 완료',
    failed: '결제 실패',
    refunded: '환불됨',
  };
  return statusMap[this.paymentStatus] || this.paymentStatus;
});

// JSON 변환 시 가상 필드 포함
orderSchema.set('toJSON', { virtuals: true });

// 컬렉션 이름을 명시적으로 'orders'로 지정
const Order = mongoose.model('Order', orderSchema, 'orders');

module.exports = Order;

