"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { X, Plus, Edit, Trash2, Clock, MapPin, Calendar } from "lucide-react";
import { Event } from "@/lib/events";
import { EventCreateModal } from "./EventCreateModal";
import { useEvents } from "@/hooks/useEvents";
import { useCalendar } from "@/hooks/useCalendar";
import { startOfMonth, endOfMonth } from "date-fns";

interface DateEventsModalProps {
  date: Date;
  onClose: () => void;
  selectedCalendarType?: string;
}

export function DateEventsModal({
  date,
  onClose,
  selectedCalendarType = "personal",
}: DateEventsModalProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const { calendars } = useCalendar();
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const { getEventsForDate, updateEvent, deleteEvent, refetch } = useEvents(
    monthStart,
    monthEnd,
    []
  );

  const dayEvents = getEventsForDate(date);

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setShowCreateModal(true);
  };

  const handleDelete = async (eventId: string) => {
    if (confirm("이 이벤트를 삭제하시겠습니까?")) {
      try {
        await deleteEvent(eventId);
        await refetch();
      } catch (error) {
        console.error("이벤트 삭제 실패:", error);
        alert("이벤트 삭제에 실패했습니다.");
      }
    }
  };

  const handleCreateSuccess = async () => {
    setShowCreateModal(false);
    setEditingEvent(null);
    await refetch();
  };

  const formatEventTime = (event: Event) => {
    if (event.isAllDay) {
      return "종일";
    }
    const start = format(new Date(event.startDate), "HH:mm", { locale: ko });
    const end = format(new Date(event.endDate), "HH:mm", { locale: ko });
    return `${start} - ${end}`;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {format(date, "yyyy년 M월 d일 (EEE)", { locale: ko })}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {dayEvents.length}개의 일정
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setShowCreateModal(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>일정 추가</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* 이벤트 목록 */}
          <div className="flex-1 overflow-y-auto p-6">
            {dayEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  이 날짜에 일정이 없습니다
                </p>
                <button
                  onClick={() => {
                    setEditingEvent(null);
                    setShowCreateModal(true);
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  일정 추가하기
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer group"
                    style={{
                      borderLeft: `4px solid ${event.calendar.color}`,
                    }}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: event.calendar.color }}
                          />
                          <h3 className="font-semibold text-gray-900">
                            {event.title}
                          </h3>
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatEventTime(event)}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{event.calendar.name}</span>
                          </div>
                        </div>
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="mt-2 flex items-center space-x-1 text-xs text-gray-500">
                            <span>참석자:</span>
                            <span>
                              {event.attendees.map((a) => a.name).join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(event);
                          }}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors duration-200"
                          title="수정"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(event.id);
                          }}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors duration-200"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 선택된 이벤트 상세 보기 */}
          {selectedEvent && (
            <div className="border-t border-gray-100 p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedEvent.title}
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <span className="font-medium">시간:</span>{" "}
                  {formatEventTime(selectedEvent)}
                </div>
                {selectedEvent.description && (
                  <div>
                    <span className="font-medium">설명:</span>{" "}
                    {selectedEvent.description}
                  </div>
                )}
                {selectedEvent.location && (
                  <div>
                    <span className="font-medium">장소:</span>{" "}
                    {selectedEvent.location}
                  </div>
                )}
                <div>
                  <span className="font-medium">캘린더:</span>{" "}
                  {selectedEvent.calendar.name}
                </div>
                {selectedEvent.attendees &&
                  selectedEvent.attendees.length > 0 && (
                    <div>
                      <span className="font-medium">참석자:</span>{" "}
                      {selectedEvent.attendees.map((a) => a.name).join(", ")}
                    </div>
                  )}
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    handleEdit(selectedEvent);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(selectedEvent.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  삭제
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 이벤트 생성/수정 모달 */}
      {showCreateModal && (
        <EventCreateModal
          onClose={() => {
            setShowCreateModal(false);
            setEditingEvent(null);
          }}
          onSuccess={handleCreateSuccess}
          selectedDate={date}
          selectedCalendarType={selectedCalendarType}
          editingEvent={editingEvent}
        />
      )}
    </>
  );
}
