"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 쿠키에 토큰이 설정되었으므로 사용자 정보 갱신
        await refreshUser();
        
        // 메인 페이지로 리다이렉트
        router.push("/");
      } catch (error) {
        console.error("Social login callback error:", error);
        // 에러 발생 시 로그인 페이지로 리다이렉트
        router.push("/login?error=social_login_failed");
      }
    };

    handleCallback();
  }, [router, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
        <p className="text-gray-600">로그인 처리중...</p>
      </div>
    </div>
  );
}

