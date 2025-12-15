import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { get, post, put, del } from '../utils/api'
import './Admin.css'

// 상품 목록 컴포넌트
function ProductManagementView({ onAddProduct, onEditProduct, refreshTrigger }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  useEffect(() => {
    loadProducts()
  }, [filters, currentPage, refreshTrigger])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '3',
      })
      if (filters.category) params.append('category', filters.category)
      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)

      const response = await get(`/api/products?${params.toString()}`)
      if (response.success) {
        setProducts(response.data)
        setTotalPages(response.pages || 1)
        setTotalProducts(response.total || 0)
      }
    } catch (err) {
      setError(err.message || '상품 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await del(`/api/products/${productId}`)
      if (response.success) {
        alert('상품이 삭제되었습니다.')
        loadProducts()
      }
    } catch (err) {
      alert(err.message || '상품 삭제에 실패했습니다.')
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

  return (
    <div className="product-list-page">
      <div className="product-list-header">
        <h1 className="page-title">상품 관리</h1>
        <button onClick={onAddProduct} className="add-product-btn">
          + 상품 등록
        </button>
      </div>

      {/* 필터 */}
      <div className="product-filters">
        <input
          type="text"
          placeholder="상품명, SKU 검색..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="filter-input"
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="filter-select"
        >
          <option value="">전체 카테고리</option>
          <option value="반지">반지</option>
          <option value="목걸이">목걸이</option>
          <option value="귀걸이">귀걸이</option>
          <option value="팔찌">팔찌</option>
          <option value="기타">기타</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="filter-select"
        >
          <option value="">전체 상태</option>
          <option value="selling">판매중</option>
          <option value="soldout">품절</option>
          <option value="hidden">숨김</option>
        </select>
      </div>

      {/* 상품 테이블 */}
      <div className="product-table-container">
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <table className="product-table">
            <thead>
              <tr>
                <th>번호</th>
                <th>이미지</th>
                <th>상품명</th>
                <th>SKU</th>
                <th>카테고리</th>
                <th>판매가</th>
                <th>재고</th>
                <th>상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="9" className="empty-state">
                    등록된 상품이 없습니다.
                  </td>
                </tr>
              ) : (
                products.map((product, index) => {
                  // 전체 상품 수에서 현재 페이지의 인덱스를 빼서 연번 계산 (최신이 1번)
                  // 최신 상품이 맨 위에 오므로 역순으로 번호 매김
                  const rowNumber = totalProducts - ((currentPage - 1) * 3 + index)
                  
                  return (
                    <tr key={product._id || product.id}>
                      <td>{rowNumber}</td>
                      <td>
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.productName}
                            className="product-thumbnail"
                          />
                        ) : (
                          <div className="product-thumbnail-placeholder">이미지 없음</div>
                        )}
                      </td>
                      <td>{product.productName}</td>
                      <td>{product.sku}</td>
                      <td>{product.category}</td>
                      <td>₩{product.price?.toLocaleString()}</td>
                      <td>{product.stock}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(product.status)}`}>
                          {getStatusText(product.status)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => onEditProduct(product)}
                            className="edit-btn"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(product._id || product.id)}
                            className="delete-btn"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="page-btn page-btn-nav"
            title="첫 페이지"
          >
            ««
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="page-btn page-btn-nav"
            title="이전 페이지"
          >
            ‹
          </button>
          
          <div className="page-numbers">
            {(() => {
              const pages = []
              const showPages = []
              
              // 항상 첫 페이지와 마지막 페이지 표시
              showPages.push(1)
              
              // 현재 페이지 주변 페이지 추가
              for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                if (!showPages.includes(i)) {
                  showPages.push(i)
                }
              }
              
              // 마지막 페이지 추가
              if (totalPages > 1 && !showPages.includes(totalPages)) {
                showPages.push(totalPages)
              }
              
              // 정렬
              showPages.sort((a, b) => a - b)
              
              // 페이지 번호와 생략 표시 생성
              let prevPage = 0
              showPages.forEach((pageNum) => {
                if (pageNum - prevPage > 1) {
                  pages.push(
                    <span key={`ellipsis-${prevPage}`} className="page-ellipsis">
                      ...
                    </span>
                  )
                }
                pages.push(
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`page-btn page-number ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                )
                prevPage = pageNum
              })
              
              return pages
            })()}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="page-btn page-btn-nav"
            title="다음 페이지"
          >
            ›
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="page-btn page-btn-nav"
            title="마지막 페이지"
          >
            »»
          </button>
        </div>
      )}
      
      {/* 페이지 정보 */}
      {totalProducts > 0 && (
        <div className="pagination-info">
          전체 {totalProducts}개 중 {((currentPage - 1) * 3) + 1} - {Math.min(currentPage * 3, totalProducts)}개 표시
        </div>
      )}
    </div>
  )
}

// 상품 등록/수정 컴포넌트
function ProductForm({ product, onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    productName: product?.productName || '',
    sku: product?.sku || '',
    description: product?.description || '',
    price: product?.price || '',
    stock: product?.stock || '',
    category: product?.category || '',
    status: product?.status || 'selling',
    image: product?.image || '',
  })
  const [previewImage, setPreviewImage] = useState(product?.image || '')
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const categories = ['반지', '목걸이', '귀걸이', '팔찌', '기타']

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const processImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    // 파일 크기 제한 (3MB로 줄임 - Base64로 변환하면 약 4배 증가)
    if (file.size > 3 * 1024 * 1024) {
      alert('이미지 파일 크기는 3MB 이하여야 합니다.')
      return
    }

    // 이미지 압축 및 리사이즈
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // 최대 크기 설정 (800px)
        const maxWidth = 800
        const maxHeight = 800
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        // Canvas를 사용하여 이미지 리사이즈
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // 압축된 이미지를 Base64로 변환 (품질 0.8)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8)
        
        setFormData((prev) => ({
          ...prev,
          image: compressedBase64,
        }))
        setPreviewImage(compressedBase64)
      }
      img.onerror = () => {
        alert('이미지를 로드하는 중 오류가 발생했습니다.')
      }
      img.src = e.target.result
    }
    reader.onerror = () => {
      alert('파일을 읽는 중 오류가 발생했습니다.')
    }
    reader.readAsDataURL(file)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      processImageFile(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processImageFile(files[0])
    }
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: '',
    }))
    setPreviewImage('')
    // 파일 input 초기화
    const fileInput = document.getElementById('image')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // 필수 필드 검증
      if (!formData.productName || !formData.sku || !formData.price || !formData.stock || !formData.category) {
        setError('모든 필수 항목을 입력해주세요.')
        setIsSubmitting(false)
        return
      }

      // 이미지 크기 검증 (Base64는 원본보다 약 1.33배 큼)
      if (formData.image && formData.image.length > 10 * 1024 * 1024) {
        setError('이미지가 너무 큽니다. 더 작은 이미지를 사용해주세요.')
        setIsSubmitting(false)
        return
      }

      const productData = {
        productName: formData.productName.trim(),
        sku: formData.sku.trim().toUpperCase(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        status: formData.status,
        image: formData.image,
      }

      // 가격과 재고 유효성 검증
      if (isNaN(productData.price) || productData.price < 0) {
        setError('올바른 판매가를 입력해주세요.')
        setIsSubmitting(false)
        return
      }

      if (isNaN(productData.stock) || productData.stock < 0) {
        setError('올바른 재고수량을 입력해주세요.')
        setIsSubmitting(false)
        return
      }

      let response
      if (product?._id || product?.id) {
        // 수정
        response = await put(`/api/products/${product._id || product.id}`, productData)
      } else {
        // 생성
        response = await post('/api/products', productData)
      }

      if (response.success) {
        alert(product ? '상품이 수정되었습니다.' : '상품이 등록되었습니다.')
        if (onSuccess) onSuccess()
      } else {
        const errorMessage = response.error || response.message || '상품 저장에 실패했습니다.'
        setError(errorMessage)
      }
    } catch (err) {
      let errorMessage = '상품 저장 중 오류가 발생했습니다.'
      
      if (err.message) {
        if (err.message.includes('entity too large')) {
          errorMessage = '이미지 파일이 너무 큽니다. 더 작은 이미지를 사용해주세요.'
        } else if (err.message.includes('Network')) {
          errorMessage = '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      console.error('상품 저장 오류:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) onCancel()
  }

  return (
    <div className="product-management">
      <div className="product-form-container">
        <h1 className="product-form-title">
          {product ? '상품 수정' : '상품 등록'}
        </h1>
        
        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-grid">
            {/* 왼쪽 컬럼 */}
            <div className="form-column">
              {/* 상품명 */}
              <div className="form-group">
                <label htmlFor="productName" className="form-label">
                  상품명
                </label>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="상품명을 입력하세요"
                  required
                />
              </div>

              {/* SKU */}
              <div className="form-group">
                <label htmlFor="sku" className="form-label">
                  SKU
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="SKU를 입력하세요"
                  required
                />
              </div>

              {/* 상세설명 */}
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  상세설명
                </label>
                <div className="editor-toolbar">
                  <button type="button" className="toolbar-btn">↶</button>
                  <button type="button" className="toolbar-btn">↷</button>
                  <div className="toolbar-divider"></div>
                  <button type="button" className="toolbar-btn">B</button>
                  <button type="button" className="toolbar-btn">I</button>
                  <button type="button" className="toolbar-btn">U</button>
                  <div className="toolbar-divider"></div>
                  <button type="button" className="toolbar-btn">⬅</button>
                  <button type="button" className="toolbar-btn">➡</button>
                  <button type="button" className="toolbar-btn">⬌</button>
                  <div className="toolbar-divider"></div>
                  <button type="button" className="toolbar-btn">🔗</button>
                  <button type="button" className="toolbar-btn">⛶</button>
                  <button type="button" className="toolbar-btn">🖼</button>
                  <button type="button" className="toolbar-btn">+</button>
                </div>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-textarea"
                  rows="8"
                  placeholder="상품 상세설명을 입력하세요"
                />
              </div>

              {/* 판매가 */}
              <div className="form-group">
                <label htmlFor="price" className="form-label">
                  판매가
                </label>
                <div className="price-input-wrapper">
                  <span className="currency">₩</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="form-input price-input"
                    placeholder="0"
                    min="0"
                    required
                  />
                  <div className="number-controls">
                    <button type="button" className="number-btn">▲</button>
                    <button type="button" className="number-btn">▼</button>
                  </div>
                </div>
              </div>

              {/* 재고수량 */}
              <div className="form-group">
                <label htmlFor="stock" className="form-label">
                  재고수량
                </label>
                <div className="stock-input-wrapper">
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="form-input stock-input"
                    placeholder="0"
                    min="0"
                    required
                  />
                  <div className="number-controls">
                    <button type="button" className="number-btn">▲</button>
                    <button type="button" className="number-btn">▼</button>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽 컬럼 */}
            <div className="form-column">
              {/* 상품 이미지 */}
              <div className="form-group">
                <label className="form-label">상품 이미지</label>
                <div
                  className={`image-upload-area ${isDragging ? 'dragging' : ''} ${previewImage ? 'has-image' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {!previewImage ? (
                    <>
                      <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="image-input"
                      />
                      <label htmlFor="image" className="image-upload-label">
                        <div className="upload-icon">📷</div>
                        <p className="upload-text">
                          {isDragging ? '여기에 이미지를 놓으세요' : '드래그 앤 드롭 또는 클릭하여 업로드'}
                        </p>
                        <span className="file-select-btn">파일 선택</span>
                      </label>
                    </>
                  ) : (
                    <div className="image-preview-container">
                      <div className="image-preview">
                        <img src={previewImage} alt="미리보기" className="preview-image" />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={handleRemoveImage}
                          title="이미지 제거"
                        >
                          ×
                        </button>
                      </div>
                      <div className="image-actions">
                        <label htmlFor="image" className="change-image-btn">
                          이미지 변경
                        </label>
                        <input
                          type="file"
                          id="image"
                          name="image"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="image-input"
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 카테고리 */}
              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  카테고리
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">카테고리를 선택하세요</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* 상품 상태 */}
              <div className="form-group">
                <label className="form-label">상품 상태</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="status"
                      value="selling"
                      checked={formData.status === 'selling'}
                      onChange={handleChange}
                      className="radio-input"
                    />
                    <span className="radio-text">판매중</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="status"
                      value="soldout"
                      checked={formData.status === 'soldout'}
                      onChange={handleChange}
                      className="radio-input"
                    />
                    <span className="radio-text">품절</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="status"
                      value="hidden"
                      checked={formData.status === 'hidden'}
                      onChange={handleChange}
                      className="radio-input"
                    />
                    <span className="radio-text">숨김</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="cancel-btn">
              취소
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '상품 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Admin() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [productViewMode, setProductViewMode] = useState('list') // 'list', 'add', 'edit'
  const [editingProduct, setEditingProduct] = useState(null)

  // 임시 데이터
  const kpiData = {
    todaySales: 1250000,
    todayOrders: 35,
    newMembers: 12,
    lowStock: 3,
  }

  const weeklySalesData = [
    { name: '월', sales: 800000 },
    { name: '화', sales: 1200000 },
    { name: '수', sales: 900000 },
    { name: '목', sales: 1500000 },
    { name: '금', sales: 1100000 },
    { name: '토', sales: 1800000 },
    { name: '일', sales: 2000000 },
  ]

  const recentOrders = [
    { orderNumber: '22770701', customerName: '홍길동', amount: 250000, status: '결제완료, 배송준비' },
    { orderNumber: '22770702', customerName: '김철수', amount: 180000, status: '배송중' },
    { orderNumber: '22770703', customerName: '이영희', amount: 320000, status: '결제완료, 배송준비' },
    { orderNumber: '22770704', customerName: '박민수', amount: 95000, status: '배송완료' },
    { orderNumber: '22770705', customerName: '최지영', amount: 450000, status: '결제완료, 배송준비' },
  ]

  const menuItems = [
    { id: 'dashboard', label: '대시보드', icon: '🏠' },
    { id: 'orders', label: '주문 관리', icon: '🛒' },
    { id: 'products', label: '상품 관리', icon: '📦' },
    { id: 'members', label: '회원 관리', icon: '👥' },
    { id: 'statistics', label: '통계', icon: '📊' },
    { id: 'settings', label: '설정', icon: '⚙️' },
  ]

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId)
    if (menuId === 'dashboard') {
      navigate('/admin')
    } else if (menuId === 'products') {
      setProductViewMode('list')
      setEditingProduct(null)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="admin-container">
      {/* 사이드바 */}
      <aside className="admin-sidebar">
        <div className="sidebar-header" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">🛒</div>
          <span className="logo-text">OKI-MALL</span>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="admin-main">
        {/* 헤더 */}
        <header className="admin-header">
          <h1 className="page-title">
            {activeMenu === 'dashboard'
              ? '대시보드'
              : activeMenu === 'products' && productViewMode !== 'list'
              ? productViewMode === 'add'
                ? '상품 등록'
                : '상품 수정'
              : menuItems.find((item) => item.id === activeMenu)?.label || '관리'}
          </h1>
          <div className="header-actions">
            <button className="icon-btn">?</button>
            <button className="icon-btn">🔔</button>
            <div className="user-menu">
              <button className="user-btn">
                <span className="user-avatar">{user?.name?.[0] || 'U'}</span>
                <span className="user-name">{user?.name || '사용자'}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              <div className="user-dropdown">
                <button onClick={handleLogout}>로그아웃</button>
              </div>
            </div>
          </div>
        </header>

        {/* 대시보드 콘텐츠 */}
        {activeMenu === 'dashboard' && (
          <div className="dashboard-content">
            {/* KPI 카드 */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon blue">🛒</div>
                <div className="kpi-info">
                  <h3 className="kpi-title">오늘 매출</h3>
                  <p className="kpi-value">₩{kpiData.todaySales.toLocaleString()}</p>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon blue">🛒</div>
                <div className="kpi-info">
                  <h3 className="kpi-title">오늘 주문수</h3>
                  <p className="kpi-value">{kpiData.todayOrders}건</p>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon green">👥</div>
                <div className="kpi-info">
                  <h3 className="kpi-title">신규 가입자</h3>
                  <p className="kpi-value">{kpiData.newMembers}명</p>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon red">🔔</div>
                <div className="kpi-info">
                  <h3 className="kpi-title">재고 부족 알림</h3>
                  <p className="kpi-value">{kpiData.lowStock}건</p>
                </div>
              </div>
            </div>

            {/* 주간 매출 추이 */}
            <div className="chart-card">
              <h2 className="chart-title">주간 매출 추이</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklySalesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    formatter={(value) => [`₩${value.toLocaleString()}`, '매출']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* 최근 주문 내역 */}
            <div className="table-card">
              <h2 className="table-title">최근 주문 내역</h2>
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>주문번호</th>
                    <th>고객명</th>
                    <th>결제금액</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.orderNumber}>
                      <td>{order.orderNumber}</td>
                      <td>{order.customerName}</td>
                      <td>₩{order.amount.toLocaleString()}</td>
                      <td>{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 상품 관리 페이지 */}
        {activeMenu === 'products' && productViewMode === 'list' && (
          <ProductManagementView
            onAddProduct={() => setProductViewMode('add')}
            onEditProduct={(product) => {
              setEditingProduct(product)
              setProductViewMode('edit')
            }}
            refreshTrigger={productViewMode}
            key={productViewMode === 'list' ? Date.now() : 'form'} // 목록으로 돌아올 때 새로고침
          />
        )}

        {/* 상품 등록/수정 페이지 */}
        {activeMenu === 'products' && productViewMode !== 'list' && (
          <ProductForm
            product={editingProduct}
            onCancel={() => {
              setProductViewMode('list')
              setEditingProduct(null)
            }}
            onSuccess={() => {
              setProductViewMode('list')
              setEditingProduct(null)
            }}
          />
        )}

        {/* 다른 메뉴 페이지들 */}
        {activeMenu !== 'dashboard' && activeMenu !== 'products' && (
          <div className="page-content">
            <h2>{menuItems.find((item) => item.id === activeMenu)?.label}</h2>
            <p>이 페이지는 준비 중입니다.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Admin

