"use client";

import { useState } from "react";
import { useCalendar } from "@/hooks/useCalendar";
import { X, Palette } from "lucide-react";

interface CalendarCreateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CALENDAR_COLORS = [
  "#6B7280", // gray
  "#374151", // dark gray
  "#4B5563", // slate
  "#1F2937", // dark slate
  "#3B82F6", // blue
  "#1E40AF", // dark blue
  "#059669", // emerald
  "#047857", // dark emerald
  "#7C3AED", // violet
  "#5B21B6", // dark violet
];

export function CalendarCreateModal({
  onClose,
  onSuccess,
}: CalendarCreateModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: CALENDAR_COLORS[0],
    isPublic: false,
  });
  const { createCalendar } = useCalendar();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createCalendar(formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("캘린더 생성 실패:", error);
      alert("캘린더 생성에 실패했습니다.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">새 캘린더 만들기</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              캘린더 이름 *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
              placeholder="예: 개인 일정, 팀 프로젝트"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              설명
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400 resize-none"
              placeholder="캘린더에 대한 설명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-4">
              <Palette className="w-4 h-4 inline mr-2" />
              색상 선택
            </label>
            <div className="grid grid-cols-5 gap-3">
              {CALENDAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  className={`w-12 h-12 rounded-xl border-2 transition-all duration-200 hover:scale-110 ${
                    formData.color === color
                      ? "border-gray-800 shadow-lg ring-2 ring-offset-2"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                  style={{
                    backgroundColor: color,
                    ringColor: formData.color === color ? color : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center p-4 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="h-5 w-5 text-slate-600 focus:ring-slate-500 border-gray-300 rounded"
            />
            <label className="ml-3 block text-sm font-medium text-gray-800">
              공개 캘린더로 만들기
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:scale-105"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-semibold text-white bg-slate-600 hover:bg-slate-700 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
