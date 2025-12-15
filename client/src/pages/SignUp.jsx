import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { post } from '../utils/api'
import './SignUp.css'

function SignUp() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    privacy: false,
    marketing: false,
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // 필드 변경 시 해당 필드의 에러 제거
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
    setSubmitError('')
  }

  const handleAgreementChange = (name, checked) => {
    if (name === 'all') {
      setAgreements({
        all: checked,
        terms: checked,
        privacy: checked,
        marketing: checked,
      })
    } else {
      const newAgreements = {
        ...agreements,
        [name]: checked,
      }
      // 모든 개별 동의가 체크되면 전체 동의도 체크
      newAgreements.all =
        newAgreements.terms &&
        newAgreements.privacy &&
        newAgreements.marketing
      setAgreements(newAgreements)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // 이름 검증
    if (!formData.name) {
      newErrors.name = '이름을 입력해주세요.'
    }

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.'
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.'
    }

    // 휴대폰 번호 검증
    if (!formData.phone) {
      newErrors.phone = '휴대폰 번호를 입력해주세요.'
    } else if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(formData.phone.replace(/-/g, ''))) {
      newErrors.phone = '올바른 휴대폰 번호 형식이 아닙니다.'
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.'
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.'
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }

    // 필수 동의 검증
    if (!agreements.terms) {
      newErrors.terms = '이용약관에 동의해주세요.'
    }
    if (!agreements.privacy) {
      newErrors.privacy = '개인정보처리방침에 동의해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const userData = {
        email: formData.email,
        name: formData.name,
        password: formData.password,
        user_type: 'customer',
        address: formData.phone || '',
      }

      const response = await post('/api/users', userData)

      if (response.success) {
        alert('회원가입이 완료되었습니다!')
        navigate('/')
      }
    } catch (error) {
      setSubmitError(error.message || '회원가입 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1 className="signup-title">회원가입</h1>
        
        <form onSubmit={handleSubmit} className="signup-form">
          {/* 이름 */}
          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="이름을 입력하세요"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          {/* 이메일 */}
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="example@email.com"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* 휴대폰 번호 */}
          <div className="form-group">
            <label htmlFor="phone">휴대폰 번호</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
              placeholder="010-1234-5678"
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          {/* 비밀번호 */}
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="비밀번호를 입력하세요"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* 비밀번호 확인 */}
          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="비밀번호를 다시 입력하세요"
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          {/* 동의 섹션 */}
          <div className="agreements-section">
            <div className="agreement-item all-agreement">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreements.all}
                  onChange={(e) => handleAgreementChange('all', e.target.checked)}
                />
                <span className="checkbox-text">모든 동의</span>
              </label>
            </div>

            <div className="agreement-divider"></div>

            <div className="agreement-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreements.terms}
                  onChange={(e) => handleAgreementChange('terms', e.target.checked)}
                />
                <span className="checkbox-text">
                  이용약관 동의 <span className="required">(필수)</span>
                </span>
              </label>
              {errors.terms && <span className="error-message">{errors.terms}</span>}
            </div>

            <div className="agreement-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreements.privacy}
                  onChange={(e) => handleAgreementChange('privacy', e.target.checked)}
                />
                <span className="checkbox-text">
                  개인정보처리방침 동의 <span className="required">(필수)</span>
                </span>
              </label>
              {errors.privacy && <span className="error-message">{errors.privacy}</span>}
            </div>

            <div className="agreement-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreements.marketing}
                  onChange={(e) => handleAgreementChange('marketing', e.target.checked)}
                />
                <span className="checkbox-text">
                  마케팅 정보 수신 동의 <span className="optional">(선택)</span>
                </span>
              </label>
            </div>
          </div>

          {submitError && (
            <div className="submit-error">{submitError}</div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? '가입 중...' : '가입하기'}
          </button>
        </form>

        <div className="login-link">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </div>
      </div>
    </div>
  )
}

export default SignUp
