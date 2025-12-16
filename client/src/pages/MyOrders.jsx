import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { get } from '../utils/api'
import './MyOrders.css'

function MyOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeStatus, setActiveStatus] = useState('all')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await get('/api/orders')
      if (response.success) {
        setOrders(response.data)
      } else {
        setError(response.error || '주문 목록을 불러오는데 실패했습니다.')
      }
    } catch (err) {
      console.error('주문 목록 로드 오류:', err)
      setError(err.message || '주문 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('ko-KR')
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

  const getDeliveryDate = (order) => {
    // 배송 완료일이 있으면 우선 사용, 없으면 배송 시작일 사용
    if (order.deliveredDate) {
      return formatDateTime(order.deliveredDate)
    }
    if (order.shippedDate) {
      return formatDateTime(order.shippedDate)
    }
    return '-'
  }

  const statusTabs = [
    { key: 'all', label: '전체' },
    { key: 'pending', label: '주문 대기' },
    { key: 'confirmed', label: '주문 확인' },
    { key: 'processing', label: '처리 중' },
    { key: 'shipped', label: '배송 중' },
    { key: 'delivered', label: '배송 완료' },
    { key: 'cancelled', label: '취소됨' },
    { key: 'refunded', label: '환불됨' },
  ]

  const getStatusCount = (statusKey) => {
    if (statusKey === 'all') return orders.length
    return orders.filter((order) => order.status === statusKey).length
  }

  const filteredOrders =
    activeStatus === 'all'
      ? orders
      : orders.filter((order) => order.status === activeStatus)

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="my-orders-container">
          <div className="loading-state">
            <p>주문 목록을 불러오는 중입니다...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="my-orders-page">
        <div className="my-orders-container">
          <div className="error-state">
            <p>{error}</p>
            <button className="back-btn" onClick={() => navigate('/')}>
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="my-orders-page">
        <div className="my-orders-container">
          <div className="empty-state">
            <h1 className="page-title">주문 내역</h1>
            <p>아직 주문 내역이 없습니다.</p>
            <button className="primary-btn" onClick={() => navigate('/')}>
              쇼핑하러 가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="my-orders-page">
      <div className="my-orders-container">
        <h1 className="page-title">주문 내역</h1>

        <div className="order-status-tabs">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`status-tab ${
                activeStatus === tab.key ? 'active' : ''
              }`}
              onClick={() => setActiveStatus(tab.key)}
            >
              {tab.label}
              <span className="status-count">{getStatusCount(tab.key)}</span>
            </button>
          ))}
        </div>

        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="order-card"
              onClick={() => navigate(`/orders/${order._id}`)}
            >
              <div className="order-card-header">
                <div className="order-id">주문번호: {order.orderNumber}</div>
                <div className="order-status">{getStatusText(order.status)}</div>
              </div>
              <div className="order-card-body">
                {order.items && order.items.length > 0 && (
                  <div className="order-item-thumb">
                    <img
                      src={
                        order.items[0].productImage ||
                        'https://via.placeholder.com/80x80?text=Product'
                      }
                      alt={order.items[0].productName}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80?text=Product'
                      }}
                    />
                  </div>
                )}
                <div className="order-main-info">
                  <div className="order-title">
                    {order.items && order.items.length > 0
                      ? order.items.length === 1
                        ? order.items[0].productName
                        : `${order.items[0].productName} 외 ${order.items.length - 1}개`
                      : '상품 정보 없음'}
                  </div>
                  {order.items &&
                    order.items.length > 0 &&
                    order.items[0].selectedOptions &&
                    Object.keys(order.items[0].selectedOptions).length > 0 && (
                      <div className="order-options">
                        {Object.entries(order.items[0].selectedOptions).map(
                          ([key, value]) => {
                            const optionLabels = {
                              color: '색상',
                              material: '재질',
                              size: '사이즈',
                              length: '길이',
                            }
                            const optionLabel = optionLabels[key] || key
                            let displayValue = value
                            if (key === 'color') {
                              const colorMap = {
                                yellow: '엘로우',
                                white: '화이트',
                                pink: '핑크',
                              }
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
                              <span key={key} className="order-option-tag">
                                {optionLabel}: {displayValue}
                              </span>
                            )
                          }
                        )}
                      </div>
                    )}
                  {order.items && order.items.length > 0 && (
                    <div className="order-quantity">
                      수량: {order.items[0].quantity}개
                      {order.items.length > 1 &&
                        ` 외 ${order.items.length - 1}개 상품`}
                    </div>
                  )}
                  <div className="order-date">
                    주문일시: {formatDateTime(order.createdAt)}
                  </div>
                  <div className="order-date">
                    배송일: {getDeliveryDate(order)}
                  </div>
                </div>
                <div className="order-price">
                  ₩{order.totalAmount.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MyOrders