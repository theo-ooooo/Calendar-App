"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
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
  const daysInMonth = useMemo(
    () => eachDayOfInterval({ start: monthStart, end: monthEnd }),
    [monthStart, monthEnd]
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
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {format(currentDate, "yyyy년 M월", { locale: ko })}
          </h2>
          <div className="flex space-x-1">
            <button
              onClick={goToPreviousMonth}
              className="p-2.5 hover:bg-white/60 rounded-xl transition-all duration-200 hover:shadow-sm"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2.5 hover:bg-white/60 rounded-xl transition-all duration-200 hover:shadow-sm"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md hover:scale-105"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>캘린더 추가</span>
          </button>
          <button
            onClick={onCreateEvent}
            className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>일정 추가</span>
          </button>
        </div>
      </div>

      {/* 캘린더 필터 */}
      <div className="p-6 bg-gray-50/50 border-b border-gray-100">
        <div className="flex flex-wrap gap-3">
          {calendars.map((cal) => (
            <label
              key={cal.id}
              className={`inline-flex items-center px-4 py-2.5 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 ${
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
                ringColor: selectedCalendars.includes(cal.id) ? cal.color : undefined,
              }}
            >
              <input
                type="checkbox"
                checked={selectedCalendars.includes(cal.id)}
                onChange={() => toggleCalendar(cal.id)}
                className="sr-only"
              />
              <div
                className={`w-3 h-3 rounded-full mr-3 border-2 ${
                  selectedCalendars.includes(cal.id) ? "border-current" : "border-gray-300"
                }`}
                style={{
                  backgroundColor: selectedCalendars.includes(cal.id) ? cal.color : "transparent",
                }}
              />
              <span>{cal.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 캘린더 그리드 */}
      <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-600 bg-gray-50 border-b border-gray-200">
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <div key={day} className="py-4">
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
              className={`min-h-[120px] p-3 bg-white hover:bg-gray-50/50 transition-colors duration-150 ${
                !isCurrentMonth ? "text-gray-300 bg-gray-50/30" : ""
              } ${isToday ? "bg-blue-50/50" : ""}`}
            >
              <time
                dateTime={format(day, "yyyy-MM-dd")}
                className={`block text-right text-sm font-medium mb-2 ${
                  isToday 
                    ? "text-white bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center mx-auto" 
                    : isCurrentMonth 
                    ? "text-gray-800" 
                    : "text-gray-400"
                }`}
              >
                {format(day, "d")}
              </time>
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick?.(event)}
                    className="text-xs truncate rounded-lg px-2 py-1.5 cursor-pointer hover:shadow-sm transition-all duration-150 hover:scale-105"
                    style={{
                      backgroundColor: `${event.calendar.color}15`,
                      color: event.calendar.color,
                      borderLeft: `3px solid ${event.calendar.color}`,
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
