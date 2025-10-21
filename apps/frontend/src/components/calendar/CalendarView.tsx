"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Event } from "@/lib/events";
import { useCalendar } from "@/hooks/useCalendar";
import { useEvents } from "@/hooks/useEvents";

interface CalendarViewProps {
  onEventClick?: (event: Event) => void;
  onCreateEvent?: () => void;
}

export function CalendarView({ onEventClick, onCreateEvent }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const { 
    calendars, 
    selectedCalendars, 
    isLoading: calendarsLoading, 
    toggleCalendar 
  } = useCalendar();

  const { 
    events, 
    isLoading: eventsLoading, 
    getEventsForDate 
  } = useEvents(monthStart, monthEnd, selectedCalendars);

  const isLoading = calendarsLoading || eventsLoading;

  // 월 변경
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* 캘린더 헤더 */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {format(currentDate, "yyyy년 M월", { locale: ko })}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button
          onClick={onCreateEvent}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>일정 추가</span>
        </button>
      </div>

      {/* 캘린더 필터 */}
      <div className="p-4 border-b">
        <div className="flex flex-wrap gap-2">
          {calendars.map(calendar => (
            <button
              key={calendar.id}
              onClick={() => toggleCalendar(calendar.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedCalendars.includes(calendar.id)
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-gray-100 text-gray-600 border border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: calendar.color }}
                />
                <span>{calendar.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 캘린더 그리드 */}
      <div className="p-4">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["일", "월", "화", "수", "목", "금", "토"].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border border-gray-200 ${
                  isCurrentMonth ? "bg-white" : "bg-gray-50"
                } ${isToday ? "bg-blue-50" : ""}`}
              >
                <div className={`text-sm font-medium ${
                  isCurrentMonth ? "text-gray-900" : "text-gray-400"
                } ${isToday ? "text-blue-600" : ""}`}>
                  {format(day, "d")}
                </div>
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className="text-xs p-1 rounded cursor-pointer hover:opacity-80"
                      style={{ 
                        backgroundColor: event.calendar.color + "20",
                        borderLeft: `3px solid ${event.calendar.color}`
                      }}
                    >
                      <div className="truncate">{event.title}</div>
                      <div className="text-gray-500">
                        {format(new Date(event.startDate), "HH:mm")}
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 3}개 더
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
