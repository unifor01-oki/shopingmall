import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import './Navbar.css'

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { getTotalQuantity } = useCart()
  const isAdmin = user?.user_type === 'admin'
  const cartQuantity = getTotalQuantity()

  return (
    <nav className="navbar">
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
          <>
            <span className="welcome-message">
              환영합니다. <strong>{user?.name}</strong>님!
            </span>
            {isAdmin && (
              <Link to="/admin" className="nav-button admin-btn">
                Admin
              </Link>
            )}
            <button onClick={logout} className="nav-button logout-btn">
              로그아웃
            </button>
          </>
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

