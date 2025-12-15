const Product = require('../models/Product');

/**
 * 모든 상품 조회 (필터링 및 페이지네이션 지원)
 */
exports.getAllProducts = async (req, res) => {
  try {
    const { category, status, page = 1, limit = 10, search } = req.query;

    // 필터 객체 생성
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // 페이지네이션
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '상품 목록을 가져오는 중 오류가 발생했습니다.',
      message: error.message,
    });
  }
};

/**
 * 특정 상품 조회
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: '상품을 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 상품 ID입니다.',
      });
    }

    res.status(500).json({
      success: false,
      error: '상품 정보를 가져오는 중 오류가 발생했습니다.',
      message: error.message,
    });
  }
};

/**
 * 새 상품 생성
 */
exports.createProduct = async (req, res) => {
  try {
    // MongoDB 연결 상태 확인
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: '데이터베이스에 연결되지 않았습니다. MongoDB 서버가 실행 중인지 확인해주세요.',
      });
    }

    const {
      productName,
      sku,
      description,
      price,
      stock,
      category,
      status,
      image,
      images,
    } = req.body;

    // 필수 필드 검증
    if (!productName || !sku || !price || !stock || !category) {
      return res.status(400).json({
        success: false,
        error: '상품명, SKU, 판매가, 재고수량, 카테고리는 필수입니다.',
      });
    }

    // 카테고리 검증
    if (!['반지', '목걸이', '귀걸이', '팔찌', '기타'].includes(category)) {
      return res.status(400).json({
        success: false,
        error: '카테고리는 반지, 목걸이, 귀걸이, 팔찌, 기타 중 하나여야 합니다.',
      });
    }

    // 상태 검증
    if (status && !['selling', 'soldout', 'hidden'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: '상품 상태는 selling, soldout, hidden 중 하나여야 합니다.',
      });
    }

    const product = new Product({
      productName,
      sku: sku.toUpperCase(),
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      status: status || 'selling',
      image,
      images: images || [],
      createdBy: req.user.id,
    });

    const savedProduct = await product.save();

    console.log('✅ 상품 생성 성공:', {
      id: savedProduct._id,
      name: savedProduct.productName,
      sku: savedProduct.sku,
      database: mongoose.connection.db.databaseName,
    });

    res.status(201).json({
      success: true,
      message: '상품이 성공적으로 생성되었습니다.',
      data: savedProduct,
    });
  } catch (error) {
    // 중복 SKU 오류 처리
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: '이미 존재하는 SKU입니다.',
      });
    }

    // Mongoose 유효성 검사 오류 처리
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: '입력 데이터가 유효하지 않습니다.',
        details: errors,
      });
    }

    res.status(500).json({
      success: false,
      error: '상품 생성 중 오류가 발생했습니다.',
      message: error.message,
    });
  }
};

/**
 * 상품 정보 수정
 */
exports.updateProduct = async (req, res) => {
  try {
    const {
      productName,
      sku,
      description,
      price,
      stock,
      category,
      status,
      image,
      images,
    } = req.body;

    const updateData = {};

    // 수정 가능한 필드만 업데이트
    if (productName !== undefined) updateData.productName = productName;
    if (sku !== undefined) updateData.sku = sku.toUpperCase();
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (category !== undefined) {
      if (!['반지', '목걸이', '귀걸이', '팔찌', '기타'].includes(category)) {
        return res.status(400).json({
          success: false,
          error: '카테고리는 반지, 목걸이, 귀걸이, 팔찌, 기타 중 하나여야 합니다.',
        });
      }
      updateData.category = category;
    }
    if (status !== undefined) {
      if (!['selling', 'soldout', 'hidden'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: '상품 상태는 selling, soldout, hidden 중 하나여야 합니다.',
        });
      }
      updateData.status = status;
    }
    if (image !== undefined) updateData.image = image;
    if (images !== undefined) updateData.images = images;

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: '상품을 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      message: '상품 정보가 성공적으로 수정되었습니다.',
      data: product,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 상품 ID입니다.',
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: '이미 존재하는 SKU입니다.',
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: '입력 데이터가 유효하지 않습니다.',
        details: errors,
      });
    }

    res.status(500).json({
      success: false,
      error: '상품 정보 수정 중 오류가 발생했습니다.',
      message: error.message,
    });
  }
};

/**
 * 상품 삭제
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: '상품을 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      message: '상품이 성공적으로 삭제되었습니다.',
      data: {},
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 상품 ID입니다.',
      });
    }

    res.status(500).json({
      success: false,
      error: '상품 삭제 중 오류가 발생했습니다.',
      message: error.message,
    });
  }
};

