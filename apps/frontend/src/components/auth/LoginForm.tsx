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
          <svg className="w-6 h-6 mr-3" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.9" fillRule="evenodd" clipRule="evenodd" d="M10.5 1.75781C5.80539 1.75781 2 4.73244 2 8.40197C2 10.6833 3.4718 12.6957 5.71307 13.8921L4.77001 17.3775C4.6867 17.6862 5.0349 17.9316 5.30223 17.753L9.43596 14.9923C9.78477 15.0263 10.1393 15.0459 10.5 15.0459C15.1944 15.0459 19 12.0713 19 8.40197C19 4.73244 15.1944 1.75781 10.5 1.75781Z" fill="black" />
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
