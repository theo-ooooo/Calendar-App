"use client";

import { useState, useTransition } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { CalendarView } from "../calendar";
import { TeamManagement } from "../team";
import { EventModal } from "../event";
import { UserProfile } from "./UserProfile";
import { Header } from "./Header";
import { Navigation } from "./Navigation";
import { SuspenseFallback } from "../ui";

type TabType = "calendar" | "teams" | "profile";

export function MainDashboard() {
  const { user, isAuthenticated, isLoading, refreshUser, logout } =
    useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("calendar");
  const [isPending, startTransition] = useTransition();
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // 인증 상태 확인
  if (!isAuthenticated || !user) {
    router.push("/login");
    return null;
  }

  const handleTabChange = (tab: TabType) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header />

      {/* 네비게이션 탭 */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          {isPending && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm text-blue-700">로딩 중...</span>
              </div>
            </div>
          )}

          {activeTab === "calendar" && (
            <CalendarView
              onEventClick={handleEventClick}
              onCreateEvent={handleCreateEvent}
            />
          )}
          {activeTab === "teams" && <TeamManagement />}
          {activeTab === "profile" && <UserProfile />}
        </div>
      </main>

      {/* 이벤트 모달 */}
      {showEventModal && (
        <EventModal
          event={selectedEvent}
          onClose={() => setShowEventModal(false)}
          onSave={() => {
            setShowEventModal(false);
            // 이벤트 저장 후 캘린더 새로고침 로직
          }}
        />
      )}
    </div>
  );
}
