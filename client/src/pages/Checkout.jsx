import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { post } from '../utils/api'
import './Checkout.css'

function Checkout() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { cartItems, getTotalPrice, clearCart } = useCart()

  const [formData, setFormData] = useState({
    // 배송 정보
    recipientName: user?.name || '',
    phone: '',
    postalCode: '',
    address: '',
    detailAddress: '',
    deliveryRequest: '',
    // 결제 정보
    paymentMethod: 'card',
    // 기타
    notes: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // 로그인 확인
  if (!isAuthenticated) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="auth-required">
            <p>주문하려면 로그인이 필요합니다.</p>
            <button onClick={() => navigate('/login')} className="login-btn">
              로그인하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 장바구니가 비어있으면
  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="empty-cart">
            <p>장바구니가 비어있습니다.</p>
            <button onClick={() => navigate('/cart')} className="back-btn">
              장바구니로 돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // 폼 검증
      if (
        !formData.recipientName ||
        !formData.phone ||
        !formData.postalCode ||
        !formData.address
      ) {
        setError('배송 정보를 모두 입력해주세요.')
        setIsSubmitting(false)
        return
      }

      // 주문 데이터 준비
      const orderData = {
        shippingAddress: {
          recipientName: formData.recipientName,
          phone: formData.phone,
          postalCode: formData.postalCode,
          address: formData.address,
          detailAddress: formData.detailAddress,
          deliveryRequest: formData.deliveryRequest,
        },
        paymentMethod: formData.paymentMethod,
        items: cartItems.map((item) => ({
          productId: item.productId,
          selectedOptions: item.selectedOptions || {},
          quantity: item.quantity,
        })),
        notes: formData.notes,
      }

      // 주문 생성
      const response = await post('/api/orders', orderData)

      if (response.success) {
        // 장바구니 비우기
        clearCart()
        
        // 주문 완료 페이지로 이동 (또는 주문 상세 페이지)
        navigate(`/orders/${response.data._id}`, {
          state: { order: response.data },
        })
      } else {
        setError(response.error || '주문 생성에 실패했습니다.')
      }
    } catch (err) {
      console.error('주문 생성 오류:', err)
      setError(err.message || '주문 생성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const subtotal = getTotalPrice()
  const shippingFee = 0
  const discount = 0
  const totalAmount = subtotal + shippingFee - discount

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="checkout-title">주문하기</h1>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="checkout-content">
            {/* 배송 정보 */}
            <div className="checkout-section">
              <h2 className="section-title">배송 정보</h2>
              <div className="form-group">
                <label htmlFor="recipientName">
                  수령인 이름 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="recipientName"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  전화번호 <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="010-1234-5678"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="postalCode">
                  우편번호 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="12345"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  기본 주소 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="서울시 강남구 테헤란로 123"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="detailAddress">상세 주소</label>
                <input
                  type="text"
                  id="detailAddress"
                  name="detailAddress"
                  value={formData.detailAddress}
                  onChange={handleChange}
                  placeholder="456호"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="deliveryRequest">배송 요청사항</label>
                <textarea
                  id="deliveryRequest"
                  name="deliveryRequest"
                  value={formData.deliveryRequest}
                  onChange={handleChange}
                  placeholder="문 앞에 놓아주세요"
                  rows="3"
                  className="form-textarea"
                />
              </div>
            </div>

            {/* 결제 방법 */}
            <div className="checkout-section">
              <h2 className="section-title">결제 방법</h2>
              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                  />
                  <span>카드 결제</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={formData.paymentMethod === 'bank_transfer'}
                    onChange={handleChange}
                  />
                  <span>계좌이체</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="virtual_account"
                    checked={formData.paymentMethod === 'virtual_account'}
                    onChange={handleChange}
                  />
                  <span>가상계좌</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="phone"
                    checked={formData.paymentMethod === 'phone'}
                    onChange={handleChange}
                  />
                  <span>휴대폰 결제</span>
                </label>
              </div>
            </div>

            {/* 주문 상품 */}
            <div className="checkout-section">
              <h2 className="section-title">주문 상품</h2>
              <div className="order-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="order-item">
                    <img
                      src={item.image || 'https://via.placeholder.com/80x80?text=Product'}
                      alt={item.productName}
                      className="order-item-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80?text=Product'
                      }}
                    />
                    <div className="order-item-info">
                      <h3 className="order-item-name">{item.productName}</h3>
                      {item.selectedOptions &&
                        Object.entries(item.selectedOptions).length > 0 && (
                          <div className="order-item-options">
                            {Object.entries(item.selectedOptions).map(([key, value]) => {
                              const optionLabels = {
                                color: '색상',
                                material: '재질',
                                size: '사이즈',
                                length: '길이',
                              }
                              const optionLabel = optionLabels[key] || key
                              let displayValue = value
                              if (key === 'color') {
                                const colorMap = { yellow: '엘로우', white: '화이트', pink: '핑크' }
                                displayValue = colorMap[value] || value
                              } else if (key === 'material') {
                                const materialMap = {
                                  k14: 'K14',
                                  k18: 'K18',
                                  k24: 'K24',
                                  pt950: 'PT950',
                                  silver: 'Silver',
                                }
                                displayValue = materialMap[value] || value
                              } else if (key === 'size' && value.startsWith('size_')) {
                                displayValue = `${value.replace('size_', '')}호`
                              }
                              return (
                                <span key={key} className="option-tag">
                                  {optionLabel}: {displayValue}
                                </span>
                              )
                            })}
                          </div>
                        )}
                      <div className="order-item-quantity">수량: {item.quantity}개</div>
                    </div>
                    <div className="order-item-price">
                      ₩{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 주문 메모 */}
            <div className="checkout-section">
              <h2 className="section-title">주문 메모</h2>
              <div className="form-group">
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="주문 시 요청사항을 입력해주세요"
                  rows="3"
                  className="form-textarea"
                />
              </div>
            </div>
          </div>

          {/* 주문 요약 */}
          <div className="checkout-summary">
            <h2 className="summary-title">주문 요약</h2>
            <div className="summary-row">
              <span>상품 금액</span>
              <span>₩{subtotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>배송비</span>
              <span>무료</span>
            </div>
            <div className="summary-row">
              <span>할인</span>
              <span>₩{discount.toLocaleString()}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>총 결제금액</span>
              <span>₩{totalAmount.toLocaleString()}</span>
            </div>
            <button
              type="submit"
              className="submit-order-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? '주문 처리 중...' : '주문하기'}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/cart')}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Checkout

