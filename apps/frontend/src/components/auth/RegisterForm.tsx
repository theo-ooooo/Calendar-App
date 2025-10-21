"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "이름은 최소 2자 이상이어야 합니다")
      .max(20, "이름은 최대 20자까지 가능합니다"),
    email: z.string().email("올바른 이메일을 입력해주세요"),
    password: z
      .string()
      .min(8, "비밀번호는 최소 8자 이상이어야 합니다")
      .max(50, "비밀번호는 최대 50자까지 가능합니다"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [error, setError] = useState("");
  const { register: registerUser, isLoading } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError("");

    try {
      await registerUser(data.email, data.password, data.name);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "회원가입에 실패했습니다");
    }
  };

  const handleSocialLogin = (provider: "google" | "kakao" | "naver") => {
    const url = `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
    }/auth/${provider}`;
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-gray-800 mb-2"
          >
            이름
          </label>
          <input
            {...register("name")}
            type="text"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
            placeholder="이름을 입력하세요"
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-800 mb-2"
          >
            이메일
          </label>
          <input
            {...register("email")}
            type="email"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
            placeholder="이메일을 입력하세요"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-gray-800 mb-2"
          >
            비밀번호
          </label>
          <input
            {...register("password")}
            type="password"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
            placeholder="비밀번호를 입력하세요"
          />
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-semibold text-gray-800 mb-2"
          >
            비밀번호 확인
          </label>
          <input
            {...register("confirmPassword")}
            type="password"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
            placeholder="비밀번호를 다시 입력하세요"
          />
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 transition-all duration-200 hover:scale-105"
        >
          {isLoading ? "회원가입 중..." : "회원가입"}
        </button>
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-500 font-medium">또는</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all duration-200 hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="hidden sm:inline">Google</span>
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin("kakao")}
            className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-200 rounded-xl shadow-sm bg-yellow-400 text-sm font-medium text-gray-700 hover:bg-yellow-500 transition-all duration-200 hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11L6.5 21.5c-1.5-1.5-1.5-3.5 0-5l3.773-3.773A13.5 13.5 0 0 1 12 3z"/>
            </svg>
            <span className="hidden sm:inline">Kakao</span>
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin("naver")}
            className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-200 rounded-xl shadow-sm bg-green-500 text-sm font-medium text-white hover:bg-green-600 transition-all duration-200 hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"/>
            </svg>
            <span className="hidden sm:inline">Naver</span>
          </button>
        </div>
      </div>
    </form>
  );
}
