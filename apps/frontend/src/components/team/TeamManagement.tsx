"use client";

import { Suspense } from "react";
import { useTeams } from "@/hooks/useTeams";
import { SuspenseFallback } from "./SuspenseFallback";
import { Plus, Users, Settings, Trash2, UserPlus } from "lucide-react";

export function TeamManagement() {
  const { 
    teams, 
    isLoading, 
    error, 
    createTeam, 
    deleteTeam, 
    joinTeam, 
    inviteMember 
  } = useTeams();

  const handleCreateTeam = async () => {
    const name = prompt("팀 이름을 입력하세요:");
    if (name) {
      try {
        await createTeam({ name, description: "" });
      } catch (err) {
        alert("팀 생성에 실패했습니다.");
      }
    }
  };

  const handleJoinTeam = async () => {
    const inviteCode = prompt("초대 코드를 입력하세요:");
    if (inviteCode) {
      try {
        await joinTeam(inviteCode);
        alert("팀에 성공적으로 참여했습니다!");
      } catch (err) {
        alert("팀 참여에 실패했습니다.");
      }
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (confirm(`"${teamName}" 팀을 삭제하시겠습니까?`)) {
      try {
        await deleteTeam(teamId);
      } catch (err) {
        alert("팀 삭제에 실패했습니다.");
      }
    }
  };

  const handleInviteMember = async (teamId: string) => {
    const email = prompt("초대할 멤버의 이메일을 입력하세요:");
    if (email) {
      try {
        await inviteMember(teamId, email);
        alert("멤버를 성공적으로 초대했습니다!");
      } catch (err) {
        alert("멤버 초대에 실패했습니다.");
      }
    }
  };

  if (isLoading) {
    return <SuspenseFallback message="팀 목록을 불러오는 중..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">팀 관리</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleJoinTeam}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            <UserPlus className="w-4 h-4" />
            <span>팀 참여</span>
          </button>
          <button
            onClick={handleCreateTeam}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>팀 생성</span>
          </button>
        </div>
      </div>

      {/* 팀 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">아직 팀이 없습니다</h3>
            <p className="text-gray-500 mb-4">새 팀을 생성하거나 초대 코드로 팀에 참여해보세요.</p>
            <button
              onClick={handleCreateTeam}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              첫 팀 만들기
            </button>
          </div>
        ) : (
          teams.map(team => (
            <div key={team.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                  {team.description && (
                    <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleInviteMember(team.id)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="멤버 초대"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team.id, team.name)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="팀 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{team.members?.length || 0}명의 멤버</span>
                </div>
                {team.inviteCode && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">초대 코드:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {team.inviteCode}
                    </code>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="text-xs text-gray-500">
                  생성일: {new Date(team.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
