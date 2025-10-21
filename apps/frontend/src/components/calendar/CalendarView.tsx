"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, CalendarPlus } from "lucide-react";
import { Event } from "@/lib/events";
import { useCalendar } from "@/hooks/useCalendar";
import { useEvents } from "@/hooks/useEvents";
import { CalendarCreateModal } from "./CalendarCreateModal";

interface CalendarViewProps {
  onEventClick?: (event: Event) => void;
  onCreateEvent?: () => void;
}

export function CalendarView({
  onEventClick,
  onCreateEvent,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);

  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);

  // 달력에 표시할 날짜들 (이전 달 마지막 주 + 현재 달 + 다음 달 첫 주)
  const calendarStart = useMemo(() => {
    const start = startOfWeek(monthStart, { weekStartsOn: 0 }); // 일요일부터 시작
    return start;
  }, [monthStart]);

  const calendarEnd = useMemo(() => {
    const end = endOfWeek(monthEnd, { weekStartsOn: 0 }); // 일요일로 끝
    return end;
  }, [monthEnd]);

  const daysInMonth = useMemo(
    () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    [calendarStart, calendarEnd]
  );

  const {
    calendars,
    selectedCalendars,
    isLoading: calendarsLoading,
    toggleCalendar,
    createCalendar,
  } = useCalendar();

  const {
    events,
    isLoading: eventsLoading,
    getEventsForDate,
  } = useEvents(monthStart, monthEnd, selectedCalendars);

  const isLoading = calendarsLoading || eventsLoading;

  // 월 변경
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 캘린더 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4 sm:p-6">
          {/* 월 표시 및 네비게이션 */}
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {format(currentDate, "yyyy년 M월", { locale: ko })}
            </h2>
            <div className="flex items-center space-x-1">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              <CalendarPlus className="w-4 h-4" />
              <span className="hidden sm:inline">캘린더 추가</span>
            </button>
            <button
              onClick={onCreateEvent}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">일정 추가</span>
            </button>
          </div>
        </div>
      </div>

      {/* 캘린더 필터 */}
      <div className="p-4 sm:p-6 bg-gray-50/50 border-b border-gray-100">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {calendars.map((cal) => (
            <label
              key={cal.id}
              className={`inline-flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium cursor-pointer transition-all duration-200 ${
                selectedCalendars.includes(cal.id)
                  ? "shadow-sm ring-2 ring-offset-2"
                  : "hover:shadow-sm hover:scale-105"
              }`}
              style={{
                backgroundColor: selectedCalendars.includes(cal.id)
                  ? `${cal.color}15`
                  : "white",
                color: selectedCalendars.includes(cal.id)
                  ? cal.color
                  : "#6B7280",
                ringColor: selectedCalendars.includes(cal.id)
                  ? cal.color
                  : undefined,
              }}
            >
              <input
                type="checkbox"
                checked={selectedCalendars.includes(cal.id)}
                onChange={() => toggleCalendar(cal.id)}
                className="sr-only"
              />
              <div
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-2 sm:mr-3 border-2 ${
                  selectedCalendars.includes(cal.id)
                    ? "border-current"
                    : "border-gray-300"
                }`}
                style={{
                  backgroundColor: selectedCalendars.includes(cal.id)
                    ? cal.color
                    : "transparent",
                }}
              />
              <span className="truncate max-w-20 sm:max-w-none">
                {cal.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 캘린더 그리드 */}
      <div className="grid grid-cols-7 text-center text-xs sm:text-sm font-semibold text-gray-600 bg-gray-50 border-b border-gray-200">
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <div key={day} className="py-2 sm:py-4">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
        {daysInMonth.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={index}
              className={`min-h-[80px] sm:min-h-[120px] p-2 sm:p-3 bg-white hover:bg-gray-50/50 transition-colors duration-150 ${
                !isCurrentMonth ? "text-gray-300 bg-gray-50/30" : ""
              } ${isToday ? "bg-blue-50/50" : ""}`}
            >
              <time
                dateTime={format(day, "yyyy-MM-dd")}
                className={`block text-right text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
                  isToday
                    ? "text-white bg-blue-500 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center mx-auto text-xs sm:text-sm"
                    : isCurrentMonth
                    ? "text-gray-800"
                    : "text-gray-400"
                }`}
              >
                {format(day, "d")}
              </time>
              <div className="space-y-0.5 sm:space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick?.(event)}
                    className="text-xs truncate rounded-lg px-1.5 sm:px-2 py-1 sm:py-1.5 cursor-pointer hover:shadow-sm transition-all duration-150 hover:scale-105"
                    style={{
                      backgroundColor: `${event.calendar.color}15`,
                      color: event.calendar.color,
                      borderLeft: `2px solid ${event.calendar.color}`,
                    }}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 캘린더 생성 모달 */}
      {showCreateModal && (
        <CalendarCreateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
