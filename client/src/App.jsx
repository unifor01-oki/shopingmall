import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import { AdminRoute } from './components/AdminRoute'
import Home from './pages/Home'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Admin from './pages/Admin'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderDetail from './pages/OrderDetail'
import MyOrders from './pages/MyOrders'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* 일반 페이지 (Navbar 포함) */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/sign-up" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="/my-orders" element={<MyOrders />} />
              </Routes>
            </>
          }
        />
        {/* Admin 페이지 (Navbar 없음, AdminRoute로 보호) */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
