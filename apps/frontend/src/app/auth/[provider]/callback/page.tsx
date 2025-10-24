"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

const providerNames = {
  google: "구글",
  kakao: "카카오",
  naver: "네이버",
};

export default function SocialCallbackPage() {
  const params = useParams();
  const provider = params.provider as string;

  useEffect(() => {
    if (!provider || !["google", "kakao", "naver"].includes(provider)) {
      window.location.href = "/login?error=invalid_provider";
      return;
    }

    // 백엔드 provider callback API로 리다이렉트
    window.location.href = `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
    }/auth/${provider}/callback${window.location.search}`;
  }, [provider]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {providerNames[provider as keyof typeof providerNames] || "소셜"}{" "}
          로그인 처리중...
        </p>
      </div>
    </div>
  );
}

