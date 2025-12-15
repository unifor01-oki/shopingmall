/**
 * 인증 관련 유틸리티 함수
 */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

/**
 * 토큰 저장
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * 토큰 가져오기
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * 토큰 제거
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * 사용자 정보 저장
 */
export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * 사용자 정보 가져오기
 */
export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('사용자 정보 파싱 오류:', error);
    return null;
  }
};

/**
 * 사용자 정보 제거
 */
export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

/**
 * 로그아웃 (토큰 및 사용자 정보 제거)
 */
export const logout = () => {
  removeToken();
  removeUser();
};

/**
 * 로그인 상태 확인
 */
export const isAuthenticated = () => {
  return !!getToken();
};

