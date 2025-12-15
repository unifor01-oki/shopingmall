const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, '상품명은 필수입니다.'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU는 필수입니다.'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, '판매가는 필수입니다.'],
      min: [0, '판매가는 0 이상이어야 합니다.'],
    },
    stock: {
      type: Number,
      required: [true, '재고수량은 필수입니다.'],
      min: [0, '재고수량은 0 이상이어야 합니다.'],
      default: 0,
    },
    category: {
      type: String,
      required: [true, '카테고리는 필수입니다.'],
      enum: {
        values: ['반지', '목걸이', '귀걸이', '팔찌', '기타'],
        message: '카테고리는 반지, 목걸이, 귀걸이, 팔찌, 기타 중 하나여야 합니다.',
      },
    },
    status: {
      type: String,
      required: [true, '상품 상태는 필수입니다.'],
      enum: {
        values: ['selling', 'soldout', 'hidden'],
        message: '상품 상태는 selling, soldout, hidden 중 하나여야 합니다.',
      },
      default: 'selling',
    },
    image: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    options: [
      {
        type: {
          type: String,
          required: true,
          trim: true,
        },
        label: {
          type: String,
          required: true,
          trim: true,
        },
        values: [
          {
            value: String,
            label: String,
            priceAdjustment: {
              type: Number,
              default: 0,
            },
            stock: {
              type: Number,
              default: 0,
            },
          },
        ],
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true, // createdAt과 updatedAt 자동 생성
  }
);

// 인덱스 추가
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ createdAt: -1 });

// JSON 변환 시 가상 필드 추가
productSchema.virtual('statusText').get(function () {
  const statusMap = {
    selling: '판매중',
    soldout: '품절',
    hidden: '숨김',
  };
  return statusMap[this.status] || this.status;
});

// JSON 변환 시 가상 필드 포함
productSchema.set('toJSON', { virtuals: true });

// 컬렉션 이름을 명시적으로 'products'로 지정 (users와 동일한 방식)
const Product = mongoose.model('Product', productSchema, 'products');

module.exports = Product;

