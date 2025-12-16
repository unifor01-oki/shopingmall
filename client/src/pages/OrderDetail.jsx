import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { get } from '../utils/api'
import './OrderDetail.css'

function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [order, setOrder] = useState(location.state?.order || null)
  const [loading, setLoading] = useState(!order)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!order && id) {
      loadOrder()
    }
  }, [id, order])

  const loadOrder = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await get(`/api/orders/${id}`)
      
      if (response.success) {
        setOrder(response.data)
      } else {
        setError('주문 정보를 불러오는데 실패했습니다.')
      }
    } catch (err) {
      console.error('주문 로드 오류:', err)
      setError(err.message || '주문 정보를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status) => {
    const statusMap = {
      pending: '주문 대기',
      confirmed: '주문 확인',
      processing: '처리 중',
      shipped: '배송 중',
      delivered: '배송 완료',
      cancelled: '취소됨',
      refunded: '환불됨',
    }
    return statusMap[status] || status
  }

  const getPaymentStatusText = (status) => {
    const statusMap = {
      pending: '결제 대기',
      completed: '결제 완료',
      failed: '결제 실패',
      refunded: '환불됨',
    }
    return statusMap[status] || status
  }

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="order-detail-container">
          <div className="loading-state">
            <p>주문 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="order-detail-page">
        <div className="order-detail-container">
          <div className="error-state">
            <p>{error || '주문을 찾을 수 없습니다.'}</p>
            <button onClick={() => navigate('/')} className="back-btn">
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="order-detail-page">
      <div className="order-detail-container">
        <div className="order-header">
          <h1 className="order-title">주문 완료</h1>
          <p className="order-number">주문번호: {order.orderNumber}</p>
        </div>

        <div className="order-status-section">
          <div className="status-badge">
            <span className="status-label">주문 상태</span>
            <span className="status-value">{getStatusText(order.status)}</span>
          </div>
          <div className="status-badge">
            <span className="status-label">결제 상태</span>
            <span className="status-value">{getPaymentStatusText(order.paymentStatus)}</span>
          </div>
        </div>

        <div className="order-content">
          {/* 배송 정보 */}
          <div className="order-section">
            <h2 className="section-title">배송 정보</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">수령인</span>
                <span className="info-value">{order.shippingAddress.recipientName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">전화번호</span>
                <span className="info-value">{order.shippingAddress.phone}</span>
              </div>
              <div className="info-item full-width">
                <span className="info-label">주소</span>
                <span className="info-value">
                  [{order.shippingAddress.postalCode}] {order.shippingAddress.address}
                  {order.shippingAddress.detailAddress && ` ${order.shippingAddress.detailAddress}`}
                </span>
              </div>
              {order.shippingAddress.deliveryRequest && (
                <div className="info-item full-width">
                  <span className="info-label">배송 요청사항</span>
                  <span className="info-value">{order.shippingAddress.deliveryRequest}</span>
                </div>
              )}
            </div>
          </div>

          {/* 주문 상품 */}
          <div className="order-section">
            <h2 className="section-title">주문 상품</h2>
            <div className="order-items">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <img
                    src={item.productImage || 'https://via.placeholder.com/100x100?text=Product'}
                    alt={item.productName}
                    className="order-item-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100?text=Product'
                    }}
                  />
                  <div className="order-item-info">
                    <h3 className="order-item-name">{item.productName}</h3>
                    <p className="order-item-sku">SKU: {item.sku}</p>
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
                    <p className="order-item-quantity">수량: {item.quantity}개</p>
                  </div>
                  <div className="order-item-price">
                    ₩{item.totalPrice.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 주문 요약 */}
          <div className="order-section">
            <h2 className="section-title">주문 요약</h2>
            <div className="summary-grid">
              <div className="summary-row">
                <span>상품 금액</span>
                <span>₩{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>배송비</span>
                <span>₩{order.shippingFee.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="summary-row">
                  <span>할인</span>
                  <span>-₩{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>총 결제금액</span>
                <span>₩{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 결제 정보 */}
          <div className="order-section">
            <h2 className="section-title">결제 정보</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">결제 방법</span>
                <span className="info-value">
                  {order.paymentMethod === 'card' && '카드 결제'}
                  {order.paymentMethod === 'bank_transfer' && '계좌이체'}
                  {order.paymentMethod === 'naver_pay' && '네이버페이'}
                  {order.paymentMethod === 'kakao_pay' && '카카오페이'}
                  {order.paymentMethod === 'phone' && '휴대폰 결제'}
                  {order.paymentMethod === 'point' && '포인트 결제'}
                </span>
              </div>
              {order.paymentDate && (
                <div className="info-item">
                  <span className="info-label">결제일시</span>
                  <span className="info-value">
                    {new Date(order.paymentDate).toLocaleString('ko-KR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="order-actions">
          <button onClick={() => navigate('/')} className="home-btn">
            홈으로 가기
          </button>
          <button onClick={() => navigate('/cart')} className="cart-btn">
            장바구니
          </button>
          <button onClick={() => navigate('/my-orders')} className="orders-btn">
            내 주문 목록 보기
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail

