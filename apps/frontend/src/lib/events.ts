import { api } from './api';

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  status: 'tentative' | 'confirmed' | 'cancelled';
  isAllDay: boolean;
  reminder?: number;
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeatUntil?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  calendar: {
    id: string;
    name: string;
    color: string;
  };
  attendees: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  }[];
}

export interface CreateEventData {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  status?: 'tentative' | 'confirmed' | 'cancelled';
  isAllDay?: boolean;
  reminder?: number;
  repeatType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeatUntil?: string;
  isPublic?: boolean;
  calendarId: string;
  attendeeEmails?: string[];
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  status?: 'tentative' | 'confirmed' | 'cancelled';
  isAllDay?: boolean;
  reminder?: number;
  repeatType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeatUntil?: string;
  isPublic?: boolean;
  attendeeEmails?: string[];
}

export const eventsApi = {
  // 이벤트 생성
  createEvent: async (data: CreateEventData): Promise<Event> => {
    const response = await api.post('/events', data);
    return response.data;
  },

  // 캘린더별 이벤트 목록 조회
  getEventsByCalendar: async (calendarId: string): Promise<Event[]> => {
    const response = await api.get(`/events/calendar/${calendarId}`);
    return response.data;
  },

  // 날짜 범위별 이벤트 조회
  getEventsByDateRange: async (startDate: string, endDate: string): Promise<Event[]> => {
    const response = await api.get('/events/date-range', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // 이벤트 검색
  searchEvents: async (query: string): Promise<Event[]> => {
    const response = await api.get('/events/search', {
      params: { q: query }
    });
    return response.data;
  },

  // 다가오는 이벤트 조회
  getUpcomingEvents: async (limit?: number): Promise<Event[]> => {
    const response = await api.get('/events/upcoming', {
      params: { limit }
    });
    return response.data;
  },

  // 이벤트 상세 조회
  getEvent: async (id: string): Promise<Event> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // 이벤트 수정
  updateEvent: async (id: string, data: UpdateEventData): Promise<Event> => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },

  // 이벤트 삭제
  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },
};
