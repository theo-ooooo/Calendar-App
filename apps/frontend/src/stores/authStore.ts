import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, authApi } from "@/lib/auth";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setUser: (user: User) => void;
  initialize: () => Promise<void>;
}

// 초기화 플래그 (전역)
let isInitializing = false;
let hasInitialized = false;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false, // 초기 상태를 false로 변경
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password });
          // 쿠키는 서버에서 설정되므로 클라이언트에서는 처리하지 않음
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register({ email, password, name });
          // 쿠키는 서버에서 설정되므로 클라이언트에서는 처리하지 않음
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      refreshUser: async () => {
        set({ isLoading: true });
        try {
          const userData = await authApi.getProfile();
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error("Failed to refresh user:", error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setUser: (user: User) => {
        set({ user });
      },

      initialize: async () => {
        console.log("Initialize called - isInitializing:", isInitializing);
        
        // 이미 초기화 중이면 중복 방지
        if (isInitializing) {
          console.log("Already initializing, skipping...");
          return;
        }

        // 이미 사용자 정보가 있으면 스킵
        const state = get();
        if (state.user && state.isAuthenticated) {
          console.log("User already exists, skipping...");
          return;
        }

        console.log("Starting initialization...");
        isInitializing = true;
        set({ isLoading: true });

        try {
          console.log("Calling getProfile API...");
          const userData = await authApi.getProfile();
          console.log("Profile data received:", userData);
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });
          hasInitialized = true;
          console.log("Initialize completed successfully");
        } catch (error: any) {
          console.error("Failed to initialize auth:", error);

          // 에러 발생 시 단순히 비인증 상태로 설정만 하고 추가 API 호출 안 함
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          hasInitialized = true;
          console.log("Initialize failed, set to unauthenticated");
        } finally {
          isInitializing = false;
          console.log("Initialize finally block - isInitializing reset");
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
