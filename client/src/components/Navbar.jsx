import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import './Navbar.css'

function Navbar({ variant }) {
  const { user, isAuthenticated, logout } = useAuth()
  const { getTotalQuantity } = useCart()
  const isAdmin = user?.user_type === 'admin'
  const cartQuantity = getTotalQuantity()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <nav className={`navbar ${variant === 'admin' ? 'navbar-admin' : ''}`}>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/rings" className="nav-link">반지</Link>
        <Link to="/necklaces" className="nav-link">목걸이</Link>
        <Link to="/earrings" className="nav-link">귀걸이</Link>
        <Link to="/bracelets" className="nav-link">팔찌</Link>
        <Link to="/others" className="nav-link">기타</Link>
      </div>
      <div className="nav-right">
        <Link to="/cart" className="cart-link">
          <span className="cart-icon">🛒</span>
          {cartQuantity > 0 && (
            <span className="cart-badge">{cartQuantity}</span>
          )}
        </Link>
        {isAuthenticated ? (
          <div className="nav-user-menu" ref={menuRef}>
            <button
              type="button"
              className="nav-user-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span className="nav-user-name">
                환영합니다. <strong>{user?.name}</strong>님
              </span>
              <span className="nav-dropdown-arrow">▼</span>
            </button>
            {menuOpen && (
              <div className="nav-user-dropdown">
                <Link
                  to="/my-orders"
                  className="nav-dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                내 주문 목록
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="nav-dropdown-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    logout()
                  }}
                  className="nav-dropdown-item nav-logout-item"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="nav-button login-btn">
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar

