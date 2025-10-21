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
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 및 제목 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                일정공유 서비스
              </h1>
            </div>
          </div>

          {/* 우측 메뉴 */}
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="알림"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="설정"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            {/* 사용자 정보 및 로그아웃 */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">
                안녕하세요, {user.name}님
              </span>
              <button
                onClick={handleLogout}
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4 inline mr-1" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
