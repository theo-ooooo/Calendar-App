import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* 로고 */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center mb-8">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        {/* 회원가입 폼 */}
        <RegisterForm />

        {/* 하단 링크 */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            이미 계정이 있으신가요?{" "}
            <a
              href="/login"
              className="font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              로그인하기
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
