import { useState, useEffect, useCallback, useMemo, useTransition, useDeferredValue } from "react";
import { calendarsApi, Calendar } from "@/lib/calendars";

export function useCalendar() {
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // useDeferredValue로 선택된 캘린더 상태를 지연 처리
  const deferredSelectedCalendars = useDeferredValue(selectedCalendars);

  const loadCalendars = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const calendarsData = await calendarsApi.getCalendars();
      
      startTransition(() => {
        setCalendars(calendarsData);
        setSelectedCalendars(calendarsData.map(cal => cal.id));
      });
    } catch (err) {
      setError("캘린더를 불러오는데 실패했습니다.");
      console.error("캘린더 로드 실패:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleCalendar = useCallback((calendarId: string) => {
    setSelectedCalendars(prev => 
      prev.includes(calendarId) 
        ? prev.filter(id => id !== calendarId)
        : [...prev, calendarId]
    );
  }, []);

  // 메모이제이션된 필터링된 캘린더
  const filteredCalendars = useMemo(() => {
    return calendars.filter(cal => deferredSelectedCalendars.includes(cal.id));
  }, [calendars, deferredSelectedCalendars]);

  // 메모이제이션된 선택된 캘린더 개수
  const selectedCount = useMemo(() => {
    return deferredSelectedCalendars.length;
  }, [deferredSelectedCalendars]);

  useEffect(() => {
    loadCalendars();
  }, [loadCalendars]);

  return {
    calendars,
    selectedCalendars: deferredSelectedCalendars,
    filteredCalendars,
    selectedCount,
    isLoading,
    isPending,
    error,
    toggleCalendar,
    refetch: loadCalendars
  };
}
