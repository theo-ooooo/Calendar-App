"use client";

import { useEffect, useState, useTransition } from "react";
import { useAuthStore } from "@/stores/authStore";
import { CalendarView } from "../calendar";
import { TeamManagement } from "../team";
import { EventCreateModal } from "../event";
import { UserProfile } from "./UserProfile";
import { Header } from "./Header";
import { Navigation } from "./Navigation";
import { SuspenseFallback } from "../ui";

type TabType = "calendar" | "teams" | "profile";

export function MainDashboard() {
  const { user, isLoading } = useAuthStore();
  const initialize = useAuthStore((state) => state.initialize);
  const [activeTab, setActiveTab] = useState<TabType>("calendar");
  const [isPending, startTransition] = useTransition();
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    if (isLoading || !user) {
      initialize();
    }
  }, [isLoading, user]);

  // 사용자 정보 로딩 중
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-gray-600">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
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
        <EventCreateModal
          editingEvent={selectedEvent}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          onSuccess={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
            // 이벤트 저장 후 캘린더 새로고침 로직
          }}
        />
      )}
    </div>
  );
}
