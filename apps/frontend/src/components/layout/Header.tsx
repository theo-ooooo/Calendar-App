"use client";

import { useTransition } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  Bell, 
  Settings, 
  LogOut 
} from "lucide-react";

interface HeaderProps {
  onLogout?: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      logout();
      router.push("/login");
      onLogout?.();
    });
  };

  if (!user) return null;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* 로고 및 제목 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                일정공유 서비스
              </h1>
            </div>
          </div>

          {/* 우측 메뉴 */}
          <div className="flex items-center space-x-2">
            <button 
              className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
              title="알림"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button 
              className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
              title="설정"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            {/* 사용자 정보 및 로그아웃 */}
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
              <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-full">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{user.name.charAt(0)}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  안녕하세요, {user.name}님
                </span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isPending}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <LogOut className="w-4 h-4 inline mr-2" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
