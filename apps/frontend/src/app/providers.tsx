"use client";

import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/stores/authStore";

interface ProvidersProps {
  children: React.ReactNode;
}

function AuthInitializer() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // 클라이언트에서만 실행
    if (typeof window === "undefined") return;

    // 쿠키 확인
    const hasCookie =
      document.cookie.includes("accessToken") ||
      document.cookie.includes("refreshToken");

    console.log("AuthInitializer - Cookie check:", { hasCookie });

    // 쿠키가 있으면 초기화 (사용자 정보 없으면 profile API 호출)
    if (hasCookie) {
      initialize();
    }
  }, []); // 빈 의존성 배열로 한 번만 실행

  return null;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      {children}
    </QueryClientProvider>
  );
}
