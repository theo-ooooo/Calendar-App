import { api } from "./api";

export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  role: string;
  provider: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export const authApi = {
  // 로그인
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<{ status: boolean; data: AuthResponse }>(
      "/auth/login",
      credentials
    );
    return response.data;
  },

  // 회원가입
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<{ status: boolean; data: AuthResponse }>(
      "/auth/register",
      credentials
    );
    return response.data;
  },

  // 프로필 조회
  getProfile: async (): Promise<User> => {
    const response = await api.get<{ status: boolean; data: User }>(
      "/auth/profile"
    );
    return response.data;
  },

  // 토큰 갱신
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<{ status: boolean; data: AuthResponse }>(
      "/auth/refresh",
      { refreshToken }
    );
    return response.data;
  },

  // 로그아웃
  logout: async (refreshToken: string): Promise<void> => {
    await api.post("/auth/logout", { refreshToken });
  },

  // 모든 기기 로그아웃
  logoutAll: async (): Promise<void> => {
    await api.post("/auth/logout-all");
  },

  // 소셜 로그인 URL 생성
  getSocialLoginUrl: (provider: "google" | "kakao" | "naver"): string => {
    return `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
    }/auth/${provider}`;
  },
};
