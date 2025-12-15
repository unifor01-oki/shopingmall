import { createContext, useContext, useState, useEffect } from 'react'
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '../utils/auth'
import { get, post } from '../utils/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 초기 로드 시 토큰 확인 및 사용자 정보 가져오기
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken()
      const savedUser = getUser()

      if (token && savedUser) {
        // 토큰이 있으면 서버에서 사용자 정보 확인
        try {
          const response = await get('/api/auth/me')
          if (response.success) {
            setUserState(response.data)
            setIsAuthenticated(true)
            setUser(response.data) // 최신 정보로 업데이트
          } else {
            // 토큰이 유효하지 않으면 제거
            logout()
          }
        } catch (error) {
          console.error('인증 확인 오류:', error)
          logout()
        }
      } else {
        // 토큰이 없으면 로그아웃 상태
        logout()
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  /**
   * 일반 로그인
   */
  const login = async (email, password) => {
    try {
      const response = await post('/api/auth/login', { email, password })
      
      if (response.success) {
        setToken(response.data.token)
        setUser(response.data.user)
        setUserState(response.data.user)
        setIsAuthenticated(true)
        return { success: true, data: response.data }
      }
      
      return { success: false, error: response.error }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * 소셜 로그인
   */
  const socialLogin = async (provider, socialData) => {
    try {
      const response = await post('/api/auth/social', {
        provider,
        ...socialData,
      })
      
      if (response.success) {
        setToken(response.data.token)
        setUser(response.data.user)
        setUserState(response.data.user)
        setIsAuthenticated(true)
        return { success: true, data: response.data }
      }
      
      return { success: false, error: response.error }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  /**
   * 로그아웃
   */
  const logout = () => {
    removeToken()
    removeUser()
    setUserState(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    socialLogin,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

