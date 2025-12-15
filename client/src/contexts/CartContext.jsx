import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])

  // 로컬 스토리지에서 장바구니 불러오기
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('장바구니 로드 오류:', error)
        setCartItems([])
      }
    }
  }, [])

  // 장바구니를 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  // 장바구니에 상품 추가
  const addToCart = (product, selectedOptions, quantity) => {
    const cartItem = {
      id: `${product._id || product.id}_${Date.now()}_${Math.random()}`,
      productId: product._id || product.id,
      productName: product.productName,
      price: product.price,
      image: product.image,
      category: product.category,
      selectedOptions,
      quantity,
      addedAt: new Date().toISOString(),
    }

    setCartItems((prev) => [...prev, cartItem])
    return cartItem
  }

  // 장바구니에서 상품 제거
  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  // 장바구니 수량 업데이트
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
      return
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  // 장바구니 비우기
  const clearCart = () => {
    setCartItems([])
  }

  // 장바구니 총 수량 계산
  const getTotalQuantity = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  // 장바구니 총 금액 계산
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      // 옵션 가격 조정 계산
      let itemPrice = item.price
      if (item.selectedOptions) {
        // 옵션별 가격 조정 합산 (간단한 구현)
        // 실제로는 옵션 정보를 더 상세히 저장해야 함
      }
      return total + itemPrice * item.quantity
    }, 0)
  }

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalQuantity,
    getTotalPrice,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

