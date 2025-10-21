export interface JwtPayload {
  sub: string; // 사용자 ID
  email: string;
  name: string;
  type?: 'access' | 'refresh'; // 토큰 타입 구분
  iat?: number; // 발급 시간
  exp?: number; // 만료 시간
}