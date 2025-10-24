import { useCallback, useMemo, useDeferredValue } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isSameDay } from "date-fns";
import { eventsApi, Event } from "@/lib/events";

export function useEvents(
  startDate: Date,
  endDate: Date,
  selectedCalendars: string[]
) {
  const queryClient = useQueryClient();
  
  // useDeferredValue로 선택된 캘린더 상태를 지연 처리
  const deferredSelectedCalendars = useDeferredValue(selectedCalendars);

  // 날짜가 실제로 변경되었을 때만 이벤트를 다시 로드
  const startDateString = useMemo(
    () => format(startDate, "yyyy-MM-dd"),
    [startDate]
  );
  const endDateString = useMemo(() => format(endDate, "yyyy-MM-dd"), [endDate]);

  // React Query로 이벤트 데이터 페칭
  const {
    data: events = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["events", startDateString, endDateString],
    queryFn: () => eventsApi.getEventsByDateRange(startDateString, endDateString),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  // 이벤트 생성 뮤테이션
  const createEventMutation = useMutation({
    mutationFn: (eventData: any) => eventsApi.createEvent(eventData),
    onSuccess: (newEvent) => {
      // 캐시 업데이트
      queryClient.setQueryData(
        ["events", startDateString, endDateString],
        (oldEvents: Event[] = []) => [...oldEvents, newEvent]
      );
    },
    onError: (error) => {
      console.error("이벤트 생성 실패:", error);
    },
  });

  // 이벤트 수정 뮤테이션
  const updateEventMutation = useMutation({
    mutationFn: ({ eventId, eventData }: { eventId: string; eventData: any }) =>
      eventsApi.updateEvent(eventId, eventData),
    onSuccess: (updatedEvent) => {
      // 캐시 업데이트
      queryClient.setQueryData(
        ["events", startDateString, endDateString],
        (oldEvents: Event[] = []) =>
          oldEvents.map((event) =>
            event.id === updatedEvent.id ? updatedEvent : event
          )
      );
    },
    onError: (error) => {
      console.error("이벤트 수정 실패:", error);
    },
  });

  // 이벤트 삭제 뮤테이션
  const deleteEventMutation = useMutation({
    mutationFn: (eventId: string) => eventsApi.deleteEvent(eventId),
    onSuccess: (_, eventId) => {
      // 캐시 업데이트
      queryClient.setQueryData(
        ["events", startDateString, endDateString],
        (oldEvents: Event[] = []) =>
          oldEvents.filter((event) => event.id !== eventId)
      );
    },
    onError: (error) => {
      console.error("이벤트 삭제 실패:", error);
    },
  });

  const getEventsForDate = useCallback(
    (date: Date) => {
      const filteredEvents = events.filter((event) => {
        const eventDate = new Date(event.startDate);
        const isSameDayMatch = isSameDay(eventDate, date);
        const isCalendarSelected =
          deferredSelectedCalendars.length === 0 ||
          deferredSelectedCalendars.includes(event.calendar.id);

        return isSameDayMatch && isCalendarSelected;
      });

      return filteredEvents;
    },
    [events, deferredSelectedCalendars]
  );

  // 메모이제이션된 필터링된 이벤트
  const filteredEvents = useMemo(() => {
    return events.filter(
      (event) =>
        deferredSelectedCalendars.length === 0 ||
        deferredSelectedCalendars.includes(event.calendar.id)
    );
  }, [events, deferredSelectedCalendars]);

  const createEvent = async (eventData: any) => {
    return createEventMutation.mutateAsync(eventData);
  };

  const updateEvent = async (eventId: string, eventData: any) => {
    return updateEventMutation.mutateAsync({ eventId, eventData });
  };

  const deleteEvent = async (eventId: string) => {
    return deleteEventMutation.mutateAsync(eventId);
  };

  return {
    events,
    isLoading: isLoading || createEventMutation.isPending || updateEventMutation.isPending || deleteEventMutation.isPending,
    error: error?.message || createEventMutation.error?.message || updateEventMutation.error?.message || deleteEventMutation.error?.message,
    getEventsForDate,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch,
  };
}
