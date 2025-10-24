"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [error, setError] = useState("");
  const { isLoading } = useAuthStore();
  const router = useRouter();

  const handleKakaoLogin = () => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
    }/auth/kakao`;
    if (typeof window !== "undefined") {
      window.location.href = url;
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* 카카오 로그인 버튼 */}
        <button
          type="button"
          onClick={handleKakaoLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-6 py-4 bg-[#FEE500] hover:bg-[#FDD835] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200 group"
        >
          <svg 
            className="w-6 h-6 mr-3" 
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11L6.5 21.5c-1.5-1.5-1.5-3.5 0-5l3.773-3.773A13.5 13.5 0 0 1 12 3z"/>
          </svg>
          <span className="text-gray-800 font-medium text-base">
            {isLoading ? "로그인 중..." : "카카오로 계속하기"}
          </span>
        </button>

        {/* 간단한 설명 텍스트 */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            간편하게 카카오 계정으로 로그인하세요
          </p>
        </div>
      </div>
    </div>
  );
}
