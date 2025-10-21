import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 py-4 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
        {/* 로고 및 제목 섹션 */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-600 to-gray-700 rounded-2xl flex items-center justify-center shadow-xl mb-4 sm:mb-6">
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-white"
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
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
            ScheduleSync
          </h2>
          <p className="text-sm sm:text-lg text-gray-600 mb-6 sm:mb-8">
            팀과 함께하는 스마트 일정 관리
          </p>
        </div>

        {/* 회원가입 폼 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-8">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
              회원가입
            </h3>
            <p className="mt-2 text-center text-xs sm:text-sm text-gray-600">
              새 계정을 만들어 일정 관리를 시작하세요
            </p>
          </div>
          <RegisterForm />
        </div>

        {/* 하단 링크 */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            이미 계정이 있으신가요?{" "}
            <a
              href="/login"
              className="font-semibold text-slate-600 hover:text-slate-700 transition-colors"
            >
              로그인하기
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
