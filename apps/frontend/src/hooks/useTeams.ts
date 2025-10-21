import { useState, useEffect, useCallback } from "react";
import { teamsApi, Team } from "@/lib/teams";

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeams = useCallback(async () => {
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
  }, []);

  const createTeam = useCallback(async (data: any) => {
    try {
      const newTeam = await teamsApi.createTeam(data);
      setTeams((prev) => [...prev, newTeam]);
      return newTeam;
    } catch (err) {
      setError("팀 생성에 실패했습니다.");
      throw err;
    }
  }, []);

  const updateTeam = useCallback(async (teamId: string, data: any) => {
    try {
      const updatedTeam = await teamsApi.updateTeam(teamId, data);
      setTeams((prev) =>
        prev.map((team) => (team.id === teamId ? updatedTeam : team))
      );
      return updatedTeam;
    } catch (err) {
      setError("팀 수정에 실패했습니다.");
      throw err;
    }
  }, []);

  const deleteTeam = useCallback(async (teamId: string) => {
    try {
      await teamsApi.deleteTeam(teamId);
      setTeams((prev) => prev.filter((team) => team.id !== teamId));
    } catch (err) {
      setError("팀 삭제에 실패했습니다.");
      throw err;
    }
  }, []);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  return {
    teams,
    isLoading,
    error,
    createTeam,
    updateTeam,
    deleteTeam,
    refetch: loadTeams,
  };
}
