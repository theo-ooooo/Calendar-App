import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useTransition,
  useDeferredValue,
} from "react";
import { format, isSameDay } from "date-fns";
import { eventsApi, Event } from "@/lib/events";

export function useEvents(
  startDate: Date,
  endDate: Date,
  selectedCalendars: string[]
) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // useDeferredValue로 선택된 캘린더 상태를 지연 처리
  const deferredSelectedCalendars = useDeferredValue(selectedCalendars);
  
  console.log("useEvents 호출:", { 
    startDate: format(startDate, "yyyy-MM-dd"), 
    endDate: format(endDate, "yyyy-MM-dd"), 
    selectedCalendars, 
    deferredSelectedCalendars 
  });

  // 날짜가 실제로 변경되었을 때만 이벤트를 다시 로드
  const startDateString = useMemo(
    () => format(startDate, "yyyy-MM-dd"),
    [startDate]
  );
  const endDateString = useMemo(() => format(endDate, "yyyy-MM-dd"), [endDate]);

  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("이벤트 로드 시작:", { startDateString, endDateString });
      const eventsData = await eventsApi.getEventsByDateRange(
        startDateString,
        endDateString
      );
      console.log("이벤트 데이터:", eventsData);

      startTransition(() => {
        setEvents(eventsData);
      });
    } catch (err) {
      setError("이벤트를 불러오는데 실패했습니다.");
      console.error("이벤트 로드 실패:", err);
    } finally {
      setIsLoading(false);
    }
  }, [startDateString, endDateString]);

  const getEventsForDate = useCallback(
    (date: Date) => {
      const filteredEvents = events.filter((event) => {
        const eventDate = new Date(event.startDate);
        const isSameDayMatch = isSameDay(eventDate, date);
        const isCalendarSelected = deferredSelectedCalendars.length === 0 || 
          deferredSelectedCalendars.includes(event.calendar.id);
        
        console.log("이벤트 필터링:", {
          eventTitle: event.title,
          eventDate: event.startDate,
          checkDate: format(date, "yyyy-MM-dd"),
          isSameDayMatch,
          isCalendarSelected,
          selectedCalendars: deferredSelectedCalendars,
          eventCalendarId: event.calendar.id
        });
        
        return isSameDayMatch && isCalendarSelected;
      });
      
      console.log(`${format(date, "yyyy-MM-dd")} 일정:`, filteredEvents);
      return filteredEvents;
    },
    [events, deferredSelectedCalendars]
  );

  // 메모이제이션된 필터링된 이벤트
  const filteredEvents = useMemo(() => {
    return events.filter((event) =>
      deferredSelectedCalendars.length === 0 || 
      deferredSelectedCalendars.includes(event.calendar.id)
    );
  }, [events, deferredSelectedCalendars]);

  const createEvent = async (eventData: any) => {
    try {
      const newEvent = await eventsApi.createEvent(eventData);
      setEvents((prev) => [...prev, newEvent]);
      return newEvent;
    } catch (err) {
      setError("이벤트 생성에 실패했습니다.");
      throw err;
    }
  };

  const updateEvent = async (eventId: string, eventData: any) => {
    try {
      const updatedEvent = await eventsApi.updateEvent(eventId, eventData);
      setEvents((prev) =>
        prev.map((event) => (event.id === eventId ? updatedEvent : event))
      );
      return updatedEvent;
    } catch (err) {
      setError("이벤트 수정에 실패했습니다.");
      throw err;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await eventsApi.deleteEvent(eventId);
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    } catch (err) {
      setError("이벤트 삭제에 실패했습니다.");
      throw err;
    }
  };

  useEffect(() => {
    loadEvents();
  }, [startDateString, endDateString]);

  return {
    events,
    isLoading,
    error,
    getEventsForDate,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: loadEvents,
  };
}
