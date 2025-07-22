"use client";

import { useState, useEffect } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ImageUploadInput from "@/components/ImageUploadInput";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

interface User {
  id: string;
  email: string;
  phone: string | null;
  createdAt: string;
  organizations: Array<{
    organization: {
      id: string;
      name: string;
      department: string;
    };
    role?: string;
  }>;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (groupData: {
    name: string;
    description: string;
    isPublic: boolean;
    image?: string;
    memberIds: string[];
  }) => Promise<void>;
  loading?: boolean;
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: CreateGroupModalProps) {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: true,
    image: "",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);

  // 사용자 목록 가져오기
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await fetch("/api/users");

      if (!response.ok) {
        throw new Error("사용자 목록을 가져오는데 실패했습니다.");
      }

      const data = await response.json();
      // 현재 사용자 제외
      const filteredUsers = data.users.filter(
        (user: User) => user.id !== currentUser?.id,
      );
      setUsers(filteredUsers || []);
    } catch (error) {
      console.error("사용자 목록 조회 오류:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  // 모달이 열릴 때 사용자 목록 가져오기
  useEffect(() => {
    if (isOpen && currentUser) {
      fetchUsers();
    }
  }, [isOpen, currentUser]);

  // 검색어에 따른 필터링된 사용자 목록
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm)),
  );

  // 사용자 선택/해제
  const toggleUserSelection = (user: User) => {
    const isSelected = selectedUsers.some((u) => u.id === user.id);

    if (isSelected) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // 선택된 사용자 제거
  const removeSelectedUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("그룹 이름을 입력해주세요.");
      return;
    }

    try {
      await onSubmit({
        ...formData,
        image: formData.image || undefined,
        memberIds: selectedUsers.map((user) => user.id),
      });
      // 성공 시 폼 초기화
      setFormData({ name: "", description: "", isPublic: true, image: "" });
      setSelectedUsers([]);
      setSearchTerm("");
    } catch (error) {
      // 에러는 onSubmit에서 처리됨
      console.error("그룹 생성 오류:", error);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: "", description: "", isPublic: true, image: "" });
      setSelectedUsers([]);
      setSearchTerm("");
      onClose();
    }
  };

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }));
  };

  const handleImageError = (error: string) => {
    alert(`이미지 업로드 오류: ${error}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          새 그룹 만들기
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              그룹 이름 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="그룹 이름을 입력하세요"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="그룹에 대한 설명을 입력하세요"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              그룹 이미지 (선택 사항)
            </label>
            {formData.image ? (
              <div className="flex items-end gap-3">
                <div className="relative w-24 h-24">
                  <Image
                    src={formData.image}
                    alt="그룹 이미지"
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, image: "" }))
                  }
                  className="bg-red-500 rounded-md px-2 py-1 text-sm text-white hover:bg-red-600 transition-colors"
                >
                  이미지 교체
                </button>
              </div>
            ) : (
              <ImageUploadInput
                onUploadComplete={handleImageUpload}
                onUploadError={handleImageError}
                maxSize={5}
                multiple={false}
                aspectRatio={1}
                placeholder="그룹 이미지를 업로드하세요"
                disabled={loading}
                hideAfterUpload={true}
                folder="groups"
              />
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) =>
                setFormData({ ...formData, isPublic: e.target.checked })
              }
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label
              htmlFor="isPublic"
              className="ml-2 block text-sm text-gray-900"
            >
              공개 그룹으로 만들기
            </label>
          </div>

          {/* 멤버 선택 섹션 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              멤버 초대
            </label>

            {/* 선택된 멤버들 */}
            {selectedUsers.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">
                  선택된 멤버 ({selectedUsers.length}명):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <span
                      key={user.id}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {user.email}
                      <button
                        type="button"
                        onClick={() => removeSelectedUser(user.id)}
                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                        disabled={loading}
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 사용자 검색 */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="사용자 검색..."
                disabled={loading || usersLoading}
              />
            </div>

            {/* 사용자 목록 테이블 */}
            <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md">
              {usersLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-1 text-sm">사용자 목록을 불러오는 중...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? "검색 결과가 없습니다." : "사용자가 없습니다."}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        선택
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        이메일
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        전화번호
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        소속기관
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        가입일
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => {
                      const isSelected = selectedUsers.some(
                        (u) => u.id === user.id,
                      );
                      return (
                        <tr
                          key={user.id}
                          className={`cursor-pointer hover:bg-gray-50 ${
                            isSelected ? "bg-indigo-50" : ""
                          }`}
                          onClick={() => toggleUserSelection(user)}
                        >
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center justify-center">
                              {isSelected ? (
                                <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              ) : (
                                <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.phone || "-"}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.organizations &&
                              user.organizations.length > 0 ? (
                                <div className="space-y-1">
                                  {user.organizations.map((org) => (
                                    <div
                                      key={org.organization.id}
                                      className="flex items-center"
                                    >
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {org.organization.name}
                                      </span>
                                      {org.role && (
                                        <span className="ml-1 text-xs text-gray-500">
                                          ({org.role})
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString()
                                : "-"}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  생성 중...
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  생성
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
