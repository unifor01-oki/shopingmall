import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { get } from '../utils/api'
import './Home.css'

function Home() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError('')
      
      // 전체 상품 조회 (판매중인 상품만 표시)
      const params = new URLSearchParams({
        status: 'selling',
        limit: '1000', // 전체 상품을 가져오기 위해 큰 값 설정
      })
      
      const response = await get(`/api/products?${params.toString()}`)
      
      if (response.success) {
        setProducts(response.data || [])
      } else {
        setError('상품을 불러오는데 실패했습니다.')
      }
    } catch (err) {
      console.error('상품 로드 오류:', err)
      setError(err.message || '상품을 불러오는 중 오류가 발생했습니다.')
      // 에러가 발생해도 빈 배열로 설정하여 UI가 깨지지 않도록
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home">

      {/* 로고 */}
      <div className="logo-section">
        <h1 className="logo">OKI-MALL</h1>
      </div>

      {/* 제품 그리드 */}
      <div className="products-container">
        {loading ? (
          <div className="loading-state">
            <p>상품을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={loadProducts} className="retry-btn">
              다시 시도
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>등록된 상품이 없습니다.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div
                key={product._id || product.id}
                className="product-card"
                onClick={() => navigate(`/product/${product._id || product.id}`)}
              >
                <div className="product-image-container">
                  <img
                    src={product.image || 'https://via.placeholder.com/400x500?text=Product'}
                    alt={product.productName}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x500?text=Product'
                    }}
                  />
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.productName}</h3>
                  <p className="product-price">₩{product.price?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 푸터 */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">OKI-MALL</div>
          <div className="footer-info">
            OKI-MALL Online Shopping Platform
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home

