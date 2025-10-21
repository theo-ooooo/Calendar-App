"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/auth";
import { User, Mail, Calendar, Settings, LogOut } from "lucide-react";

export function UserProfile() {
  const { user, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleSave = async () => {
    try {
      const updatedUser = await authApi.updateProfile({
        name: profileData.name,
      });
      // 스토어 업데이트
      useAuthStore.getState().setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error("프로필 업데이트 실패:", error);
      alert("프로필 업데이트에 실패했습니다.");
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.name || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  const handleDeactivate = async () => {
    if (confirm("정말로 계정을 비활성화하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      try {
        await authApi.deactivateAccount();
        logout();
        alert("계정이 비활성화되었습니다.");
      } catch (error) {
        console.error("계정 비활성화 실패:", error);
        alert("계정 비활성화에 실패했습니다.");
      }
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        {/* 프로필 헤더 */}
        <div className="px-6 py-8 border-b">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  가입일: {new Date(user.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {user.provider === "local" ? "일반 계정" : `${user.provider} 계정`}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
            >
              <Settings className="w-4 h-4" />
              <span>{isEditing ? "취소" : "편집"}</span>
            </button>
          </div>
        </div>

        {/* 프로필 편집 폼 */}
        {isEditing && (
          <div className="px-6 py-6 border-b bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">프로필 수정</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 계정 정보 */}
        <div className="px-6 py-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">계정 정보</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm font-medium text-gray-700">사용자 ID</span>
              <span className="text-sm text-gray-500 font-mono">{user.id}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm font-medium text-gray-700">계정 상태</span>
              <span className={`text-sm px-2 py-1 rounded-full ${
                user.isActive 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {user.isActive ? "활성" : "비활성"}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm font-medium text-gray-700">역할</span>
              <span className="text-sm text-gray-500 capitalize">{user.role}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-gray-700">로그인 방식</span>
              <span className="text-sm text-gray-500 capitalize">{user.provider}</span>
            </div>
          </div>
        </div>

        {/* 위험 구역 */}
        <div className="px-6 py-6 border-t bg-red-50">
          <h3 className="text-lg font-medium text-red-900 mb-4">위험 구역</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-red-900">계정 삭제</p>
                <p className="text-sm text-red-700">계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
              </div>
              <button 
                onClick={handleDeactivate}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                계정 비활성화
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
