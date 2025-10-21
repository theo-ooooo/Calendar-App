import { useState, useEffect } from "react";
import { teamsApi, Team, CreateTeamData, UpdateTeamData } from "@/lib/teams";

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const teamsData = await teamsApi.getTeams();
      setTeams(teamsData);
    } catch (err) {
      setError("팀 목록을 불러오는데 실패했습니다.");
      console.error("팀 로드 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createTeam = async (teamData: CreateTeamData) => {
    try {
      const newTeam = await teamsApi.createTeam(teamData);
      setTeams(prev => [...prev, newTeam]);
      return newTeam;
    } catch (err) {
      setError("팀 생성에 실패했습니다.");
      throw err;
    }
  };

  const updateTeam = async (teamId: string, teamData: UpdateTeamData) => {
    try {
      const updatedTeam = await teamsApi.updateTeam(teamId, teamData);
      setTeams(prev => prev.map(team => 
        team.id === teamId ? updatedTeam : team
      ));
      return updatedTeam;
    } catch (err) {
      setError("팀 수정에 실패했습니다.");
      throw err;
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      await teamsApi.deleteTeam(teamId);
      setTeams(prev => prev.filter(team => team.id !== teamId));
    } catch (err) {
      setError("팀 삭제에 실패했습니다.");
      throw err;
    }
  };

  const joinTeam = async (inviteCode: string) => {
    try {
      const team = await teamsApi.joinTeam(inviteCode);
      await loadTeams(); // 팀 목록 새로고침
      return team;
    } catch (err) {
      setError("팀 참여에 실패했습니다.");
      throw err;
    }
  };

  const inviteMember = async (teamId: string, email: string) => {
    try {
      const member = await teamsApi.inviteMember(teamId, { email });
      await loadTeams(); // 팀 목록 새로고침
      return member;
    } catch (err) {
      setError("멤버 초대에 실패했습니다.");
      throw err;
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  return {
    teams,
    isLoading,
    error,
    createTeam,
    updateTeam,
    deleteTeam,
    joinTeam,
    inviteMember,
    refetch: loadTeams
  };
}
