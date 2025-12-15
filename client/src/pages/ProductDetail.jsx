import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { get } from '../utils/api'
import { useCart } from '../contexts/CartContext'
import './ProductDetail.css'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOptions, setSelectedOptions] = useState({})
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await get(`/api/products/${id}`)
      
      if (response.success) {
        setProduct(response.data)
      } else {
        setError('상품을 불러오는데 실패했습니다.')
      }
    } catch (err) {
      console.error('상품 로드 오류:', err)
      setError(err.message || '상품을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status) => {
    const statusMap = {
      selling: '판매중',
      soldout: '품절',
      hidden: '숨김',
    }
    return statusMap[status] || status
  }

  const getStatusClass = (status) => {
    const classMap = {
      selling: 'status-selling',
      soldout: 'status-soldout',
      hidden: 'status-hidden',
    }
    return classMap[status] || ''
  }

  // 카테고리별 기본 옵션 생성 (순서: 색상 → 재질 → 사이즈)
  const getDefaultOptions = (category) => {
    // 공통 색상 옵션
    const colorOptions = [
      { value: 'yellow', label: '엘로우', priceAdjustment: 0, stock: 10 },
      { value: 'white', label: '화이트', priceAdjustment: 0, stock: 10 },
      { value: 'pink', label: '핑크', priceAdjustment: 0, stock: 10 },
    ]

    // 공통 재질 옵션
    const materialOptions = [
      { value: 'k14', label: 'K14', priceAdjustment: 0, stock: 10 },
      { value: 'k18', label: 'K18', priceAdjustment: 50000, stock: 10 },
      { value: 'k24', label: 'K24', priceAdjustment: 100000, stock: 10 },
      { value: 'pt950', label: 'PT950', priceAdjustment: 150000, stock: 10 },
      { value: 'silver', label: 'Silver', priceAdjustment: -30000, stock: 10 },
    ]

    const defaultOptions = {
      반지: [
        {
          type: 'color',
          label: '색상',
          values: colorOptions,
        },
        {
          type: 'material',
          label: '재질',
          values: materialOptions,
        },
        {
          type: 'size',
          label: '사이즈',
          values: Array.from({ length: 19 }, (_, i) => {
            const size = i + 5 // 5호부터 23호까지
            return {
              value: `size_${size}`,
              label: `${size}호`,
              priceAdjustment: 0,
              stock: 10,
            }
          }),
        },
      ],
      목걸이: [
        {
          type: 'color',
          label: '색상',
          values: colorOptions,
        },
        {
          type: 'material',
          label: '재질',
          values: materialOptions,
        },
        {
          type: 'length',
          label: '길이',
          values: [
            { value: '40cm', label: '40cm', priceAdjustment: 0, stock: 10 },
            { value: '41cm', label: '41cm', priceAdjustment: 0, stock: 10 },
            { value: '42cm', label: '42cm', priceAdjustment: 0, stock: 10 },
          ],
        },
      ],
      귀걸이: [
        {
          type: 'color',
          label: '색상',
          values: colorOptions,
        },
        {
          type: 'material',
          label: '재질',
          values: materialOptions,
        },
      ],
      팔찌: [
        {
          type: 'color',
          label: '색상',
          values: colorOptions,
        },
        {
          type: 'material',
          label: '재질',
          values: materialOptions,
        },
        {
          type: 'size',
          label: '사이즈',
          values: [
            { value: '17.5cm', label: '17.5cm', priceAdjustment: 0, stock: 10 },
          ],
        },
      ],
      기타: [
        {
          type: 'color',
          label: '색상',
          values: colorOptions,
        },
        {
          type: 'material',
          label: '재질',
          values: materialOptions,
        },
      ],
    }
    return defaultOptions[category] || []
  }

  // 사용 가능한 옵션 가져오기 (상품에 저장된 옵션이 있으면 사용, 없으면 기본 옵션)
  const availableOptions = product?.options && product.options.length > 0
    ? product.options
    : getDefaultOptions(product?.category)

  // 단가 계산 (옵션 포함)
  const calculateUnitPrice = () => {
    if (!product) return 0
    let unitPrice = product.price || 0
    availableOptions.forEach((option) => {
      const selectedValue = selectedOptions[option.type]
      if (selectedValue) {
        const optionValue = option.values.find((v) => v.value === selectedValue)
        if (optionValue && optionValue.priceAdjustment) {
          unitPrice += optionValue.priceAdjustment
        }
      }
    })
    return unitPrice
  }

  // 총 금액 계산 (단가 × 수량)
  const calculateTotalPrice = () => {
    return calculateUnitPrice() * quantity
  }

  // 옵션별 가격 조정 합계
  const getTotalOptionAdjustment = () => {
    let totalAdjustment = 0
    availableOptions.forEach((option) => {
      const selectedValue = selectedOptions[option.type]
      if (selectedValue) {
        const optionValue = option.values.find((v) => v.value === selectedValue)
        if (optionValue && optionValue.priceAdjustment) {
          totalAdjustment += optionValue.priceAdjustment
        }
      }
    })
    return totalAdjustment
  }

  // 선택된 옵션의 재고 확인
  const getSelectedStock = () => {
    if (availableOptions.length === 0) return product?.stock || 0
    
    let minStock = Infinity
    availableOptions.forEach((option) => {
      const selectedValue = selectedOptions[option.type]
      if (selectedValue) {
        const optionValue = option.values.find((v) => v.value === selectedValue)
        if (optionValue && optionValue.stock !== undefined) {
          minStock = Math.min(minStock, optionValue.stock)
        }
      }
    })
    return minStock === Infinity ? product?.stock || 0 : minStock
  }

  // 모든 필수 옵션이 선택되었는지 확인
  const areAllOptionsSelected = () => {
    if (availableOptions.length === 0) return true
    return availableOptions.every((option) => selectedOptions[option.type])
  }

  const handleOptionChange = (optionType, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionType]: value,
    }))
  }

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const newQuantity = prev + delta
      const maxStock = getSelectedStock()
      if (newQuantity < 1) return 1
      if (newQuantity > maxStock) return maxStock
      return newQuantity
    })
  }

  const handleBuyClick = () => {
    if (!areAllOptionsSelected()) {
      alert('모든 옵션을 선택해주세요.')
      return
    }

    if (getSelectedStock() === 0) {
      alert('재고가 부족합니다.')
      return
    }

    // 장바구니에 추가
    addToCart(product, selectedOptions, quantity)
    
    // 장바구니 페이지로 이동
    navigate('/cart')
  }

  if (loading) {
    return (
      <div className="product-detail">
        <div className="loading-state">
          <p>상품 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="product-detail">
        <div className="error-state">
          <p>{error || '상품을 찾을 수 없습니다.'}</p>
          <button onClick={() => navigate('/')} className="back-btn">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="product-detail">
      <div className="product-detail-container">
        {/* 뒤로가기 버튼 */}
        <button onClick={() => navigate(-1)} className="back-button">
          ← 뒤로가기
        </button>

        <div className="product-detail-content">
          {/* 상품 이미지 */}
          <div className="product-image-section">
            <img
              src={product.image || 'https://via.placeholder.com/600x750?text=Product'}
              alt={product.productName}
              className="product-detail-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x750?text=Product'
              }}
            />
          </div>

          {/* 상품 정보 */}
          <div className="product-info-section">
            <div className="product-header">
              <h1 className="product-detail-name">{product.productName}</h1>
              <span className={`status-badge ${getStatusClass(product.status)}`}>
                {getStatusText(product.status)}
              </span>
            </div>

            <div className="product-price-section">
              {areAllOptionsSelected() ? (
                <>
                  <div className="price-display">
                    <div className="unit-price-info">
                      <span className="price-label">단가</span>
                      <span className="unit-price">
                        ₩{calculateUnitPrice().toLocaleString()}
                        {getTotalOptionAdjustment() !== 0 && (
                          <span className="base-price">
                            {' '}(기본 ₩{product.price?.toLocaleString()}
                            {getTotalOptionAdjustment() > 0 ? ' +' : ' '}
                            ₩{Math.abs(getTotalOptionAdjustment()).toLocaleString()})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="price-display">
                  <p className="product-detail-price">
                    ₩{product.price?.toLocaleString()}
                  </p>
                  <p className="price-hint">
                    옵션을 모두 선택하면 정확한 가격이 표시됩니다.
                  </p>
                </div>
              )}
            </div>

            <div className="product-details">
              <div className="detail-row">
                <span className="detail-label">SKU</span>
                <span className="detail-value">{product.sku}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">카테고리</span>
                <span className="detail-value">{product.category}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">재고</span>
                <span className="detail-value">{product.stock}개</span>
              </div>
            </div>

            {/* 옵션 선택 */}
            {availableOptions.length > 0 && (
              <div className="product-options">
                {availableOptions.map((option) => (
                  <div key={option.type} className="option-group">
                    <label className="option-label">
                      {option.label}
                      <span className="option-required">*</span>
                    </label>
                    <div className="option-values">
                      {option.values.map((optValue) => {
                        const isSelected = selectedOptions[option.type] === optValue.value
                        const isOutOfStock = optValue.stock === 0
                        return (
                          <button
                            key={optValue.value}
                            type="button"
                            className={`option-button ${isSelected ? 'selected' : ''} ${
                              isOutOfStock ? 'out-of-stock' : ''
                            }`}
                            onClick={() => !isOutOfStock && handleOptionChange(option.type, optValue.value)}
                            disabled={isOutOfStock}
                          >
                            {optValue.label}
                            {optValue.priceAdjustment !== 0 && (
                              <span className="price-adjustment">
                                {optValue.priceAdjustment > 0 ? '+' : ''}
                                ₩{optValue.priceAdjustment.toLocaleString()}
                              </span>
                            )}
                            {isOutOfStock && <span className="stock-badge">품절</span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 수량 선택 */}
            <div className="quantity-selector">
              <label className="quantity-label">수량</label>
              <div className="quantity-controls">
                <button
                  type="button"
                  className="quantity-button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  className="quantity-input"
                  value={quantity}
                  min="1"
                  max={getSelectedStock()}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1
                    const maxStock = getSelectedStock()
                    setQuantity(Math.max(1, Math.min(value, maxStock)))
                  }}
                />
                <button
                  type="button"
                  className="quantity-button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= getSelectedStock()}
                >
                  +
                </button>
              </div>
              <span className="stock-info">
                재고: {getSelectedStock()}개
              </span>
            </div>

            {product.description && (
              <div className="product-description">
                <h3 className="description-title">상품 설명</h3>
                <p className="description-text">{product.description}</p>
              </div>
            )}

            {/* 총 금액 표시 (구매하기 버튼 위) */}
            {areAllOptionsSelected() && (
              <div className="total-price-section">
                <div className="total-price-info">
                  <span className="price-label">총 금액</span>
                  <span className="total-price">
                    ₩{calculateTotalPrice().toLocaleString()}
                    {quantity > 1 && (
                      <span className="quantity-info">
                        {' '}(₩{calculateUnitPrice().toLocaleString()} × {quantity}개)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="product-actions">
              {product.status === 'selling' &&
              getSelectedStock() > 0 &&
              areAllOptionsSelected() ? (
                <button className="buy-button" onClick={handleBuyClick}>
                  구매하기 ({quantity}개)
                </button>
              ) : (
                <button className="buy-button disabled" disabled>
                  {!areAllOptionsSelected()
                    ? '옵션을 선택해주세요'
                    : getSelectedStock() === 0
                    ? '품절'
                    : '구매 불가'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

