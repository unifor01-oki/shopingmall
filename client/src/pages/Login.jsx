import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const { login, socialLogin, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // 이미 로그인된 경우 홈으로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Google OAuth 스크립트 로드
  useEffect(() => {
    // Google Sign-In 스크립트 로드
    if (!window.google) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }

    // Kakao SDK 스크립트 로드
    if (!window.Kakao) {
      const script = document.createElement('script')
      script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js'
      script.integrity = 'sha384-TiCUE00hKBMImX3G/4gqJ6E4S4sQZ8WBe+p2e6uaL4kY9ge2x7QzbF5GfT1M5CE'
      script.crossOrigin = 'anonymous'
      document.body.appendChild(script)
    }

    // Facebook SDK 스크립트 로드
    if (!window.FB) {
      const script = document.createElement('script')
      script.src = 'https://connect.facebook.net/ko_KR/sdk.js'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'
      document.body.appendChild(script)
    }
  }, [])

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

  const validateForm = () => {
    const newErrors = {}

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.'
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.'
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.'
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
      const result = await login(formData.email, formData.password)
      
      if (result.success) {
        navigate('/', { replace: true })
      } else {
        setSubmitError(result.error || '로그인에 실패했습니다.')
      }
    } catch (error) {
      setSubmitError(error.message || '로그인 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Google 로그인
  const handleGoogleLogin = async () => {
    try {
      if (!window.google) {
        setSubmitError('Google 로그인 스크립트가 로드되지 않았습니다.')
        return
      }

      const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

      if (!GOOGLE_CLIENT_ID) {
        setSubmitError('Google 클라이언트 ID가 설정되지 않았습니다. .env 파일에 VITE_GOOGLE_CLIENT_ID를 설정해주세요.')
        return
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            // Google ID 토큰을 서버로 전송하여 검증
            const result = await socialLogin('google', {
              idToken: response.credential,
            })

            if (result.success) {
              navigate('/', { replace: true })
            } else {
              setSubmitError(result.error || 'Google 로그인에 실패했습니다.')
            }
          } catch (error) {
            setSubmitError(error.message || 'Google 로그인 처리 중 오류가 발생했습니다.')
          }
        },
      })

      window.google.accounts.id.prompt()
    } catch (error) {
      setSubmitError('Google 로그인 중 오류가 발생했습니다.')
    }
  }

  // Kakao 로그인
  const handleKakaoLogin = async () => {
    try {
      if (!window.Kakao) {
        setSubmitError('Kakao SDK가 로드되지 않았습니다.')
        return
      }

      const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY || ''

      if (!KAKAO_JS_KEY) {
        setSubmitError('Kakao JavaScript Key가 설정되지 않았습니다.')
        return
      }

      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(KAKAO_JS_KEY)
      }

      window.Kakao.Auth.login({
        success: async (authObj) => {
          try {
            // Kakao 사용자 정보 가져오기
            window.Kakao.API.request({
              url: '/v2/user/me',
              success: async (res) => {
                try {
                  const result = await socialLogin('kakao', {
                    socialId: res.id.toString(),
                    email: res.kakao_account?.email || `${res.id}@kakao.com`,
                    name: res.kakao_account?.profile?.nickname || res.properties?.nickname || 'Kakao User',
                    profileImage: res.kakao_account?.profile?.profile_image_url || res.properties?.profile_image || null,
                  })

                  if (result.success) {
                    navigate('/', { replace: true })
                  } else {
                    setSubmitError(result.error || 'Kakao 로그인에 실패했습니다.')
                  }
                } catch (error) {
                  setSubmitError('Kakao 로그인 처리 중 오류가 발생했습니다.')
                }
              },
              fail: (err) => {
                setSubmitError('Kakao 사용자 정보를 가져오는데 실패했습니다.')
              },
            })
          } catch (error) {
            setSubmitError('Kakao 로그인 중 오류가 발생했습니다.')
          }
        },
        fail: (err) => {
          setSubmitError('Kakao 로그인에 실패했습니다.')
        },
      })
    } catch (error) {
      setSubmitError('Kakao 로그인 중 오류가 발생했습니다.')
    }
  }

  // Facebook 로그인
  const handleFacebookLogin = async () => {
    try {
      if (!window.FB) {
        setSubmitError('Facebook SDK가 로드되지 않았습니다.')
        return
      }

      const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || ''

      if (!FACEBOOK_APP_ID) {
        setSubmitError('Facebook App ID가 설정되지 않았습니다.')
        return
      }

      // Facebook SDK 초기화
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0',
      })

      window.FB.login(
        async (response) => {
          if (response.authResponse) {
            try {
              // Facebook 사용자 정보 가져오기
              window.FB.api('/me', { fields: 'id,name,email,picture' }, async (userInfo) => {
                try {
                  const result = await socialLogin('facebook', {
                    socialId: userInfo.id,
                    email: userInfo.email || `${userInfo.id}@facebook.com`,
                    name: userInfo.name || 'Facebook User',
                    profileImage: userInfo.picture?.data?.url || null,
                  })

                  if (result.success) {
                    navigate('/', { replace: true })
                  } else {
                    setSubmitError(result.error || 'Facebook 로그인에 실패했습니다.')
                  }
                } catch (error) {
                  setSubmitError('Facebook 로그인 처리 중 오류가 발생했습니다.')
                }
              })
            } catch (error) {
              setSubmitError('Facebook 사용자 정보를 가져오는데 실패했습니다.')
            }
          } else {
            setSubmitError('Facebook 로그인이 취소되었습니다.')
          }
        },
        { scope: 'email,public_profile' }
      )
    } catch (error) {
      setSubmitError('Facebook 로그인 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">로그인</h1>
        
        <form onSubmit={handleSubmit} className="login-form">
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

          {submitError && (
            <div className="submit-error">{submitError}</div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="social-login-divider">
          <span>또는</span>
        </div>

        <div className="social-login-buttons">
          <button
            type="button"
            className="social-button google-button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google로 로그인
          </button>

          <button
            type="button"
            className="social-button kakao-button"
            onClick={handleKakaoLogin}
            disabled={isSubmitting}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 3C6.48 3 2 6.48 2 11c0 2.4 1.06 4.57 2.75 6.04L3 21l4.5-1.5c1.2.35 2.48.54 3.8.54 5.52 0 10-3.48 10-8s-4.48-8-10-8z"
                fill="#3C1E1E"
              />
            </svg>
            Kakao로 로그인
          </button>

          <button
            type="button"
            className="social-button facebook-button"
            onClick={handleFacebookLogin}
            disabled={isSubmitting}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                fill="#1877F2"
              />
            </svg>
            Facebook으로 로그인
          </button>
        </div>

        <div className="signup-link">
          계정이 없으신가요? <Link to="/sign-up">회원가입</Link>
        </div>
      </div>
    </div>
  )
}

export default Login

