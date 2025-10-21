"use client";

import { useTransition } from "react";
import { 
  Calendar, 
  Users, 
  User 
} from "lucide-react";

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
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                disabled={isPending}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors disabled:opacity-50 ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
