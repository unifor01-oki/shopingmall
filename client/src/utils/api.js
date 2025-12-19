/**
 * API 유틸리티 함수
 */

import { getToken, removeToken, removeUser } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003'

// 개발 환경에서 API URL 확인
if (import.meta.env.DEV) {
  console.log('API URL:', API_URL)
}

/**
 * 기본 fetch 래퍼
 */
async function request(endpoint, options = {}) {
  // API_URL이 상대 경로이거나 비어있으면 에러
  if (!API_URL || API_URL.startsWith('/')) {
    const errorMsg = `API URL이 설정되지 않았습니다. VITE_API_URL 환경 변수를 확인해주세요. 현재 값: ${API_URL}`
    console.error(errorMsg)
    throw new Error(errorMsg)
  }
  
  const url = `${API_URL}${endpoint}`
  
  // 개발 환경에서 요청 URL 확인
  if (import.meta.env.DEV) {
    console.log('API 요청 URL:', url)
  }
  
  // 토큰 가져오기
  const token = getToken()
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  // 토큰이 있으면 Authorization 헤더에 추가
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  // body가 객체인 경우 JSON으로 변환
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  try {
    const response = await fetch(url, config)
    
    // 401 오류 시 자동 로그아웃
    if (response.status === 401) {
      removeToken()
      removeUser()
      // 로그인 페이지로 리다이렉트 (window.location 사용)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.')
    }
    
    // 응답이 JSON이 아닌 경우 처리
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      const text = await response.text()
      
      // HTML 응답인 경우 (보통 잘못된 URL로 인한 것)
      if (text.trim().startsWith('<!doctype') || text.trim().startsWith('<!DOCTYPE')) {
        console.error('API 요청이 HTML을 반환했습니다. API URL을 확인해주세요.')
        console.error('요청 URL:', url)
        console.error('설정된 API_URL:', API_URL)
        throw new Error('서버에 연결할 수 없습니다. API URL 설정을 확인해주세요.')
      }
      
      throw new Error(text || '알 수 없는 오류가 발생했습니다.')
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('API 요청 오류:', error)
    
    // 네트워크 오류 처리
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.')
    }
    
    throw error
  }
}

/**
 * GET 요청
 */
export async function get(endpoint) {
  return request(endpoint, { method: 'GET' })
}

/**
 * POST 요청
 */
export async function post(endpoint, data) {
  return request(endpoint, {
    method: 'POST',
    body: data,
  })
}

/**
 * PUT 요청
 */
export async function put(endpoint, data) {
  return request(endpoint, {
    method: 'PUT',
    body: data,
  })
}

/**
 * DELETE 요청
 */
export async function del(endpoint) {
  return request(endpoint, { method: 'DELETE' })
}

/**
 * API URL 가져오기
 */
export function getApiUrl() {
  return API_URL
}

