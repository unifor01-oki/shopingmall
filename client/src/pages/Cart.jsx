import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import './Cart.css'

function Cart() {
  const navigate = useNavigate()
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
  } = useCart()

  const handleQuantityChange = (itemId, delta) => {
    const item = cartItems.find((item) => item.id === itemId)
    if (item) {
      const newQuantity = item.quantity + delta
      if (newQuantity > 0) {
        updateQuantity(itemId, newQuantity)
      } else {
        removeFromCart(itemId)
      }
    }
  }

  const handleCheckout = () => {
    navigate('/checkout')
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <h1 className="cart-title">장바구니</h1>
          <div className="empty-cart">
            <p className="empty-message">장바구니가 비어있습니다.</p>
            <button onClick={() => navigate('/')} className="continue-shopping-btn">
              쇼핑 계속하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1 className="cart-title">장바구니</h1>
          <button onClick={clearCart} className="clear-cart-btn">
            전체 삭제
          </button>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img
                    src={item.image || 'https://via.placeholder.com/150x150?text=Product'}
                    alt={item.productName}
                    onClick={() => navigate(`/product/${item.productId}`)}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150x150?text=Product'
                    }}
                  />
                </div>

                <div className="cart-item-info">
                  <h3
                    className="cart-item-name"
                    onClick={() => navigate(`/product/${item.productId}`)}
                  >
                    {item.productName}
                  </h3>
                  <div className="cart-item-options">
                    {item.selectedOptions &&
                      Object.entries(item.selectedOptions).map(([key, value]) => {
                        // 옵션 타입을 한글로 변환
                        const optionLabels = {
                          color: '색상',
                          material: '재질',
                          size: '사이즈',
                          length: '길이',
                        }
                        const optionLabel = optionLabels[key] || key
                        
                        // 옵션 값을 한글로 변환 (간단한 매핑)
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
                  <p className="cart-item-price">₩{item.price?.toLocaleString()}</p>
                </div>

                <div className="cart-item-quantity">
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(item.id, -1)}
                  >
                    −
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(item.id, 1)}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  <p className="item-total-price">
                    ₩{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>

                <button
                  className="remove-item-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-header">
              <h2>주문 요약</h2>
            </div>
            <div className="summary-row">
              <span>상품 금액</span>
              <span>₩{getTotalPrice().toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>배송비</span>
              <span>무료</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>총 결제금액</span>
              <span>₩{getTotalPrice().toLocaleString()}</span>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              주문하기
            </button>
            <button
              className="continue-shopping-btn"
              onClick={() => navigate('/')}
            >
              쇼핑 계속하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart

