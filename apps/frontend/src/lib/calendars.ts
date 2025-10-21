import { api } from './api';

export interface Calendar {
  id: string;
  name: string;
  description?: string;
  color: string;
  type: 'personal' | 'team';
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  team?: {
    id: string;
    name: string;
  };
  events: Event[];
}

export interface CreateCalendarData {
  name: string;
  description?: string;
  color: string;
  isPublic?: boolean;
  teamId?: string;
}

export interface UpdateCalendarData {
  name?: string;
  description?: string;
  color?: string;
  isPublic?: boolean;
}

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

export const calendarsApi = {
  // 캘린더 생성
  createCalendar: async (data: CreateCalendarData): Promise<Calendar> => {
    const response = await api.post('/calendars', data);
    return response.data;
  },

  // 사용자의 캘린더 목록 조회
  getCalendars: async (): Promise<Calendar[]> => {
    const response = await api.get('/calendars');
    return response.data;
  },

  // 팀 캘린더 목록 조회
  getTeamCalendars: async (teamId: string): Promise<Calendar[]> => {
    const response = await api.get(`/calendars/team/${teamId}`);
    return response.data;
  },

  // 캘린더 상세 조회
  getCalendar: async (id: string): Promise<Calendar> => {
    const response = await api.get(`/calendars/${id}`);
    return response.data;
  },

  // 캘린더 정보 수정
  updateCalendar: async (id: string, data: UpdateCalendarData): Promise<Calendar> => {
    const response = await api.put(`/calendars/${id}`, data);
    return response.data;
  },

  // 캘린더 삭제
  deleteCalendar: async (id: string): Promise<void> => {
    await api.delete(`/calendars/${id}`);
  },
};
