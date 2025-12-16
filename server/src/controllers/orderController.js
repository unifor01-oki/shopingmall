const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * 주문 생성
 */
exports.createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentMethod,
      items,
      notes,
    } = req.body;

    const userId = req.user.id;

    // 필수 필드 검증
    if (!shippingAddress || !paymentMethod || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: '배송 정보, 결제 방법, 주문 상품은 필수입니다.',
      });
    }

    // 배송 정보 검증
    if (
      !shippingAddress.recipientName ||
      !shippingAddress.phone ||
      !shippingAddress.postalCode ||
      !shippingAddress.address
    ) {
      return res.status(400).json({
        success: false,
        error: '배송 정보를 모두 입력해주세요.',
      });
    }

    // 주문 상품 정보 검증 및 가격 계산
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `상품을 찾을 수 없습니다: ${item.productId}`,
        });
      }

      // 재고 확인
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `${product.productName}의 재고가 부족합니다. (재고: ${product.stock}개)`,
        });
      }

      // 옵션 가격 조정 계산
      let unitPrice = product.price;
      if (item.selectedOptions && product.options && product.options.length > 0) {
        product.options.forEach((option) => {
          const selectedValue = item.selectedOptions[option.type];
          if (selectedValue) {
            const optionValue = option.values.find((v) => v.value === selectedValue);
            if (optionValue && optionValue.priceAdjustment) {
              unitPrice += optionValue.priceAdjustment;
            }
          }
        });
      }

      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        productId: product._id,
        productName: product.productName,
        productImage: product.image || '',
        sku: product.sku,
        selectedOptions: item.selectedOptions || {},
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    // 최종 금액 계산
    const shippingFee = 0; // 무료 배송
    const discount = 0; // 할인 없음
    const totalAmount = subtotal + shippingFee - discount;

    // 주문 생성
    const order = new Order({
      userId,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: shippingAddress.phone,
      shippingAddress,
      items: orderItems,
      subtotal,
      shippingFee,
      discount,
      totalAmount,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
      notes: notes || '',
    });

    const savedOrder = await order.save();

    // 재고 차감
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({
      success: true,
      message: '주문이 성공적으로 생성되었습니다.',
      data: savedOrder,
    });
  } catch (error) {
    console.error('주문 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: '주문 생성 중 오류가 발생했습니다.',
      message: error.message,
    });
  }
};

/**
 * 사용자 주문 목록 조회
 */
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('items.productId', 'productName image');

    const total = await Order.countDocuments({ userId });

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '주문 목록을 가져오는 중 오류가 발생했습니다.',
      message: error.message,
    });
  }
};

/**
 * 특정 주문 조회
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'items.productId',
      'productName image sku'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: '주문을 찾을 수 없습니다.',
      });
    }

    // 본인 주문만 조회 가능 (관리자는 모든 주문 조회 가능)
    if (
      req.user.user_type !== 'admin' &&
      order.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: '주문 조회 권한이 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 주문 ID입니다.',
      });
    }

    res.status(500).json({
      success: false,
      error: '주문 정보를 가져오는 중 오류가 발생했습니다.',
      message: error.message,
    });
  }
};

/**
 * 주문 상태 업데이트 (관리자만)
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: '주문 상태는 필수입니다.',
      });
    }

    const updateData = { status };

    // 배송 중일 때 운송장 번호 추가
    if (status === 'shipped') {
      updateData.shippedDate = new Date();
      if (trackingNumber) {
        updateData.trackingNumber = trackingNumber;
      }
    }

    // 배송 완료일 때
    if (status === 'delivered') {
      updateData.deliveredDate = new Date();
    }

    // 취소일 때
    if (status === 'cancelled') {
      updateData.cancelledDate = new Date();
      if (req.body.cancelledReason) {
        updateData.cancelledReason = req.body.cancelledReason;
      }
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: '주문을 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      message: '주문 상태가 성공적으로 업데이트되었습니다.',
      data: order,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 주문 ID입니다.',
      });
    }

    res.status(500).json({
      success: false,
      error: '주문 상태 업데이트 중 오류가 발생했습니다.',
      message: error.message,
    });
  }
};

/**
 * 결제 상태 업데이트
 */
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentId } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        error: '결제 상태는 필수입니다.',
      });
    }

    const updateData = {
      paymentStatus,
    };

    if (paymentStatus === 'completed') {
      updateData.paymentDate = new Date();
      updateData.status = 'confirmed'; // 결제 완료 시 주문 확인 상태로 변경
      if (paymentId) {
        updateData.paymentId = paymentId;
      }
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: '주문을 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      message: '결제 상태가 성공적으로 업데이트되었습니다.',
      data: order,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 주문 ID입니다.',
      });
    }

    res.status(500).json({
      success: false,
      error: '결제 상태 업데이트 중 오류가 발생했습니다.',
      message: error.message,
    });
  }
};

