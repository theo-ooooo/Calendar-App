"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Repeat,
} from "lucide-react";
import { useCalendar } from "@/hooks/useCalendar";
import { eventsApi, Event } from "@/lib/events";
import { Calendar } from "@/lib/calendars";
import { format, addDays } from "date-fns";
import { ko } from "date-fns/locale";

const eventSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  description: z.string().optional(),
  startDate: z.string().min(1, "시작 날짜를 선택해주세요"),
  endDate: z.string().min(1, "종료 날짜를 선택해주세요"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  isAllDay: z.boolean(),
  calendarId: z.string().min(1, "캘린더를 선택해주세요"),
  attendeeEmails: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventCreateModalProps {
  onClose: () => void;
  onSuccess: () => void;
  selectedDate?: Date;
  selectedCalendarType?: string;
  editingEvent?: Event | null;
}

export function EventCreateModal({
  onClose,
  onSuccess,
  selectedDate,
  selectedCalendarType = "personal",
  editingEvent,
}: EventCreateModalProps) {
  const [isAllDay, setIsAllDay] = useState(true);
  const [error, setError] = useState("");

  const { calendars, createCalendar } = useCalendar();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      isAllDay: false,
      startDate: selectedDate
        ? format(selectedDate, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      endDate: selectedDate
        ? format(selectedDate, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
    },
  });

  // 수정 모드일 때 폼 데이터 설정
  useEffect(() => {
    if (editingEvent) {
      const calendarList = calendars as Calendar[];
      if (calendarList.length > 0) {
        const startDate = new Date(editingEvent.startDate);
        const endDate = new Date(editingEvent.endDate);
        const isAllDayEvent = editingEvent.isAllDay;

        setIsAllDay(isAllDayEvent);

        reset({
          title: editingEvent.title,
          description: editingEvent.description || "",
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(endDate, "yyyy-MM-dd"),
          startTime: isAllDayEvent ? "" : format(startDate, "HH:mm"),
          endTime: isAllDayEvent ? "" : format(endDate, "HH:mm"),
          location: editingEvent.location || "",
          isAllDay: isAllDayEvent,
          calendarId: editingEvent.calendar?.id || calendarList[0]?.id || "",
          attendeeEmails:
            editingEvent.attendees?.map((a) => a.email).join(", ") || "",
        });
      }
    }
  }, [editingEvent, reset, calendars]);

  const watchedStartDate = watch("startDate");
  const watchedStartTime = watch("startTime");
  const watchedEndTime = watch("endTime");

  // 선택된 타입에 따른 캘린더 필터링
  const filteredCalendars = useMemo(() => {
    const calendarList = calendars as Calendar[];
    if (selectedCalendarType === "personal") {
      return calendarList.filter((cal) => cal.type === "personal");
    } else {
      // 팀 ID로 필터링
      return calendarList.filter(
        (cal) => cal.team?.id === selectedCalendarType
      );
    }
  }, [calendars, selectedCalendarType]);

  // 종료 시간 자동 설정
  useEffect(() => {
    if (watchedStartTime && !watchedEndTime) {
      const [hours, minutes] = watchedStartTime.split(":").map(Number);
      const endTime = new Date();
      endTime.setHours(hours + 1, minutes);
      setValue("endTime", format(endTime, "HH:mm"));
    }
  }, [watchedStartTime, watchedEndTime, setValue]);

  // 종료 날짜 자동 설정
  useEffect(() => {
    if (watchedStartDate && !watch("endDate")) {
      setValue("endDate", watchedStartDate);
    }
  }, [watchedStartDate, setValue, watch]);

  const onSubmit = async (data: EventFormData) => {
    try {
      setError("");

      // 시간 정보 처리
      let startDateTime = data.startDate;
      let endDateTime = data.endDate;

      if (!isAllDay && data.startTime && data.endTime) {
        startDateTime = `${data.startDate}T${data.startTime}:00`;
        endDateTime = `${data.endDate}T${data.endTime}:00`;
      } else if (!isAllDay && data.startTime) {
        startDateTime = `${data.startDate}T${data.startTime}:00`;
        endDateTime = `${data.endDate}T${data.startTime}:00`;
      }

      // 참석자 이메일 처리
      const attendeeEmails = data.attendeeEmails
        ? data.attendeeEmails
            .split(",")
            .map((email) => email.trim())
            .filter(Boolean)
        : [];

      if (editingEvent) {
        // 수정 시에는 calendarId 제외
        const updateData = {
          title: data.title,
          description: data.description || "",
          startDate: startDateTime,
          endDate: endDateTime,
          location: data.location || "",
          isAllDay,
          attendeeEmails,
          status: "confirmed" as const,
          repeatType: "none" as const,
          isPublic: false,
        };
        await eventsApi.updateEvent(editingEvent.id, updateData);
      } else {
        // 생성 시에는 calendarId 포함
        const createData = {
          title: data.title,
          description: data.description || "",
          startDate: startDateTime,
          endDate: endDateTime,
          location: data.location || "",
          isAllDay,
          calendarId: data.calendarId,
          attendeeEmails,
          status: "confirmed" as const,
          repeatType: "none" as const,
          isPublic: false,
        };
        await eventsApi.createEvent(createData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "일정 생성에 실패했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingEvent ? "일정 수정" : "새 일정 만들기"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* 제목 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              제목 *
            </label>
            <input
              {...register("title")}
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
              placeholder="일정 제목을 입력하세요"
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              설명
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400 resize-none"
              placeholder="일정에 대한 설명을 입력하세요"
            />
          </div>

          {/* 캘린더 선택 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              <CalendarIcon className="w-4 h-4 inline mr-2" />
              캘린더 선택 *
            </label>

            {/* 캘린더 목록 */}
            <div className="space-y-2">
              {filteredCalendars.map((calendar: Calendar) => (
                <label
                  key={calendar.id}
                  className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                >
                  <input
                    {...register("calendarId")}
                    type="radio"
                    value={calendar.id}
                    className="sr-only"
                  />
                  <div
                    className="w-4 h-4 rounded-full mr-3 border-2"
                    style={{
                      backgroundColor:
                        calendar.id === watch("calendarId")
                          ? calendar.color
                          : "transparent",
                      borderColor: calendar.color,
                    }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {calendar.name}
                    </div>
                    {calendar.description && (
                      <div className="text-sm text-gray-500">
                        {calendar.description}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
            {errors.calendarId && (
              <p className="mt-2 text-sm text-red-600">
                {errors.calendarId.message}
              </p>
            )}
          </div>

          {/* 날짜 및 시간 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                <Clock className="w-4 h-4 inline mr-2" />
                시작 날짜 *
              </label>
              <input
                {...register("startDate")}
                type="date"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 text-gray-800"
              />
              {errors.startDate && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                <Clock className="w-4 h-4 inline mr-2" />
                종료 날짜 *
              </label>
              <input
                {...register("endDate")}
                type="date"
                min={watchedStartDate}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 text-gray-800"
              />
              {errors.endDate && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {/* 종일 여부 */}
          <div className="flex items-center p-4 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              checked={isAllDay}
              onChange={(e) => {
                setIsAllDay(e.target.checked);
                if (e.target.checked) {
                  setValue("startTime", "");
                  setValue("endTime", "");
                }
              }}
              className="h-5 w-5 text-slate-600 focus:ring-slate-500 border-gray-300 rounded"
            />
            <label className="ml-3 block text-sm font-medium text-gray-800">
              종일 일정
            </label>
          </div>

          {/* 시간 (종일이 아닌 경우만) */}
          {!isAllDay && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  시작 시간
                </label>
                <input
                  {...register("startTime")}
                  type="time"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  종료 시간
                </label>
                <input
                  {...register("endTime")}
                  type="time"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 text-gray-800"
                />
              </div>
            </div>
          )}

          {/* 장소 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              <MapPin className="w-4 h-4 inline mr-2" />
              장소
            </label>
            <input
              {...register("location")}
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
              placeholder="장소를 입력하세요"
            />
          </div>

          {/* 참석자 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              <Users className="w-4 h-4 inline mr-2" />
              참석자 (이메일로 구분)
            </label>
            <input
              {...register("attendeeEmails")}
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
              placeholder="user1@example.com, user2@example.com"
            />
            <p className="mt-2 text-xs text-gray-500">
              여러 이메일은 쉼표(,)로 구분해주세요
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:scale-105"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 text-sm font-semibold text-white bg-slate-600 hover:bg-slate-700 disabled:opacity-50 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              {isSubmitting
                ? editingEvent
                  ? "수정 중..."
                  : "생성 중..."
                : editingEvent
                ? "일정 수정"
                : "일정 생성"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
