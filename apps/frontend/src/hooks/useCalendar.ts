import { useState, useCallback, useMemo, useDeferredValue } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { calendarsApi, Calendar } from "@/lib/calendars";

export function useCalendar() {
  const queryClient = useQueryClient();
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);

  // useDeferredValue로 선택된 캘린더 상태를 지연 처리
  const deferredSelectedCalendars = useDeferredValue(selectedCalendars);

  // React Query로 캘린더 데이터 페칭
  const {
    data: calendars = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["calendars"],
    queryFn: calendarsApi.getCalendars,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    onSuccess: (data) => {
      // 캘린더 로드 완료 시 모든 캘린더 선택
      if (data && data.length > 0 && selectedCalendars.length === 0) {
        const calendarIds = data.map((cal) => cal.id);
        setSelectedCalendars(calendarIds);
      }
    },
  });

  // 캘린더 생성 뮤테이션
  const createCalendarMutation = useMutation({
    mutationFn: (data: any) => calendarsApi.createCalendar(data),
    onSuccess: (newCalendar) => {
      // 캐시 업데이트
      queryClient.setQueryData(
        ["calendars"],
        (oldCalendars: Calendar[] = []) => [...oldCalendars, newCalendar]
      );
      // 새로 생성된 캘린더를 선택 목록에 추가
      setSelectedCalendars((prev) => [...prev, newCalendar.id]);
    },
    onError: (error) => {
      console.error("캘린더 생성 실패:", error);
    },
  });

  const createCalendar = useCallback(
    async (data: any) => {
      return createCalendarMutation.mutateAsync(data);
    },
    [createCalendarMutation]
  );

  const toggleCalendar = useCallback((calendarId: string) => {
    setSelectedCalendars((prev) =>
      prev.includes(calendarId)
        ? prev.filter((id) => id !== calendarId)
        : [...prev, calendarId]
    );
  }, []);

  // 메모이제이션된 필터링된 캘린더
  const filteredCalendars = useMemo(() => {
    return calendars.filter((cal) =>
      deferredSelectedCalendars.includes(cal.id)
    );
  }, [calendars, deferredSelectedCalendars]);

  // 메모이제이션된 선택된 캘린더 개수
  const selectedCount = useMemo(() => {
    return deferredSelectedCalendars.length;
  }, [deferredSelectedCalendars]);

  return {
    calendars,
    selectedCalendars: deferredSelectedCalendars,
    filteredCalendars,
    selectedCount,
    isLoading: isLoading || createCalendarMutation.isPending,
    error: error?.message || createCalendarMutation.error?.message,
    toggleCalendar,
    createCalendar,
    refetch,
  };
}
