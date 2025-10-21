import { api } from './api';

export interface Team {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  isPublic: boolean;
  inviteCode?: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  members: TeamMember[];
}

export interface TeamMember {
  id: string;
  role: 'member' | 'admin';
  status: 'pending' | 'accepted' | 'rejected';
  invitedBy?: string;
  invitedAt?: string;
  joinedAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
}

export interface CreateTeamData {
  name: string;
  description?: string;
  logo?: string;
}

export interface UpdateTeamData {
  name?: string;
  description?: string;
  logo?: string;
  isPublic?: boolean;
}

export interface InviteMemberData {
  email: string;
}

export const teamsApi = {
  // 팀 생성
  createTeam: async (data: CreateTeamData): Promise<Team> => {
    const response = await api.post('/teams', data);
    return response.data;
  },

  // 사용자의 팀 목록 조회
  getTeams: async (): Promise<Team[]> => {
    const response = await api.get('/teams');
    return response.data;
  },

  // 팀 상세 조회
  getTeam: async (id: string): Promise<Team> => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  // 팀 정보 수정
  updateTeam: async (id: string, data: UpdateTeamData): Promise<Team> => {
    const response = await api.put(`/teams/${id}`, data);
    return response.data;
  },

  // 팀 삭제
  deleteTeam: async (id: string): Promise<void> => {
    await api.delete(`/teams/${id}`);
  },

  // 초대 코드로 팀 참여
  joinTeam: async (inviteCode: string): Promise<Team> => {
    const response = await api.post('/teams/join', null, {
      params: { code: inviteCode }
    });
    return response.data;
  },

  // 팀 멤버 초대
  inviteMember: async (teamId: string, data: InviteMemberData): Promise<TeamMember> => {
    const response = await api.post(`/teams/${teamId}/invite`, data);
    return response.data;
  },

  // 팀 초대 수락
  acceptInvitation: async (teamId: string): Promise<TeamMember> => {
    const response = await api.post(`/teams/${teamId}/accept`);
    return response.data;
  },

  // 팀 초대 거절
  rejectInvitation: async (teamId: string): Promise<void> => {
    await api.post(`/teams/${teamId}/reject`);
  },

  // 팀 멤버 제거
  removeMember: async (teamId: string, memberId: string): Promise<void> => {
    await api.delete(`/teams/${teamId}/members/${memberId}`);
  },
};