"use client";

import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Mission, CreateMissionData } from "@/types/Mission";
import ImageUploadInput from "./ImageUploadInput";
import RichTextEditor from "./RichTextEditor";
import { useFileUpload } from "@/hooks/useFileUpload";

interface MissionModalProps {
  isOpen: boolean;
  courses: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSave: (missionData: CreateMissionData) => void;
  mission?: Mission | null;
  course?: { id: string; name: string }; // 과정 정보를 객체로 받음
}

export default function MissionModal({
  isOpen,
  courses,
  onClose,
  onSave,
  mission,
  course,
}: MissionModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    openDate: new Date().toISOString().slice(0, 16),
    dueDate: "",
    image: "",
    shortDesc: "",
    detailDesc: "",
    placeholder: "",
    courseId: "",
    isPublic: true,
  });

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const [subDescriptions, setSubDescriptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { deleteFile } = useFileUpload();

  useEffect(() => {
    if (isOpen) {
      if (mission) {
        setFormData({
          title: mission.title,
          openDate: mission.openDate
            ? new Date(mission.openDate).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
          dueDate: mission.dueDate
            ? new Date(mission.dueDate).toISOString().split("T")[0]
            : "",
          image: mission.image || "",
          shortDesc: mission.shortDesc,
          detailDesc: mission.detailDesc,
          placeholder: mission.placeholder || "",
          courseId: mission.courseId,
          isPublic: mission.isPublic,
        });
        setUploadedImages(mission.image ? [mission.image] : []);
        setSubDescriptions(mission.subDescriptions || []);
      } else {
        resetForm();
        // course가 있으면 자동으로 설정
        if (course) {
          setFormData((prev) => ({ ...prev, courseId: course.id }));
        }
      }
    }
  }, [isOpen, mission, course]);

  const resetForm = () => {
    const openDate = new Date();
    openDate.setHours(18, 0, 0, 0);
    setFormData({
      title: "",
      openDate: openDate.toISOString().slice(0, 16),
      dueDate: new Date().toISOString().split("T")[0],
      image: "",
      shortDesc: "",
      detailDesc: "",
      placeholder: "",
      courseId: "",
      isPublic: true,
    });
    setUploadedImages([]);
    setSubDescriptions([]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, image: imageUrl }));
    setUploadedImages([imageUrl]); // maxFiles가 1이므로 항상 하나만 저장
  };

  const handleImageDelete = async (imageUrl: string) => {
    try {
      await deleteFile(imageUrl);
      setUploadedImages([]);
      setFormData((prev) => ({ ...prev, image: "" }));
    } catch (error) {
      console.error("이미지 삭제 실패:", error);
      alert("이미지 삭제에 실패했습니다.");
    }
  };

  const addSubMission = () => {
    setSubDescriptions((prev) => [...prev, ""]);
  };

  const updateSubMission = (index: number, text: string) => {
    setSubDescriptions((prev) => prev.map((sub, i) => (i === index ? text : sub)));
  };

  const removeSubMission = (index: number) => {
    setSubDescriptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const missionData = {
        ...formData,
        openDate: new Date(formData.openDate),
        dueDate: new Date(formData.dueDate),
        subDescriptions: subDescriptions.filter((sub) => sub.trim() !== ""),
      };

      await onSave(missionData);
    } catch (error) {
      console.error("미션 저장 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-medium text-gray-900">
            {mission ? "미션 수정" : "새 미션 만들기"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="flex-1 overflow-y-scroll p-6 space-y-4 max-h-[80vh]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  미션명 *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="미션명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  과정 *
                </label>
                {course ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                    {course.name}
                  </div>
                ) : (
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">과정을 선택하세요</option>
                    {Array.isArray(courses) &&
                      courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  공개일자 *
                </label>
                <input
                  type="datetime-local"
                  name="openDate"
                  value={formData.openDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  종료일자 *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  공개여부
                </label>
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    공개로 설정
                  </label>
                </div>
              </div> */}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제목 *
              </label>
              <textarea
                name="shortDesc"
                value={formData.shortDesc}
                onChange={handleInputChange}
                required
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="미션카드에 표시될 제목입니다."
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700">
                하위 미션 설명
                <span className="text-xs text-gray-500"> (선택)</span>
              </label>

              {subDescriptions.length > 0 && (
                <div className="space-y-2 mt-2">
                  {subDescriptions.map((subMission, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={subMission}
                        onChange={(e) =>
                          updateSubMission(index, e.target.value)
                        }
                        placeholder={`하위 미션 ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeSubMission(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={addSubMission}
                className="inline-flex items-center justify-center px-2 py-1 border border-indigo-500 text-sm font-medium rounded text-indigo-500 hover:bg-indigo-50"
              >
                <PlusIcon className="h-3 w-3 mr-1" />
                추가
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상세 설명 *
              </label>
              <RichTextEditor
                key={`${mission?.id || "new"}-${isOpen}`}
                value={formData.detailDesc}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, detailDesc: value }))
                }
                placeholder="미션에 대한 상세한 설명을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
                <span className="text-xs text-gray-500"> (선택)</span>
              </label>
              <textarea
                name="placeholder"
                value={formData.placeholder}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="유저가 미션 입력 할 때 기본으로 표시되는 문구입니다. 샘플 답안을 보여주고 싶을 때만 작성하세요."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                미션 이미지
                <span className="text-xs text-gray-500"> (선택)</span>
              </label>
              <ImageUploadInput
                onUploadComplete={handleImageUpload}
                onImageDelete={handleImageDelete}
                uploadedImages={uploadedImages}
                className="mt-1"
                folder="missions"
                maxFiles={1}
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "처리 중..." : mission ? "수정" : "생성"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
