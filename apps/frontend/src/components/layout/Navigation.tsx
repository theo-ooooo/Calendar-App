"use client";

import { useTransition } from "react";
import { Calendar, Users, User } from "lucide-react";

type TabType = "calendar" | "teams" | "profile";

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tab: TabType) => {
    startTransition(() => {
      onTabChange(tab);
    });
  };

  const tabs = [
    {
      id: "calendar" as TabType,
      label: "캘린더",
      icon: Calendar,
    },
    {
      id: "teams" as TabType,
      label: "팀 관리",
      icon: Users,
    },
    {
      id: "profile" as TabType,
      label: "마이페이지",
      icon: User,
    },
  ];

  return (
    <nav className="bg-white/50 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                disabled={isPending}
                className={`py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs sm:text-sm transition-all duration-200 disabled:opacity-50 rounded-t-xl whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? "bg-slate-50 text-slate-700 border-b-2 border-slate-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Icon
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      isActive ? "text-slate-700" : "text-gray-500"
                    }`}
                  />
                  <span className="hidden sm:inline">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
