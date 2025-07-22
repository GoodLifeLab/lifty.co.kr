"use client";

import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
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

interface InviteMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (memberIds: string[], endDate?: Date) => Promise<void>;
  loading?: boolean;
  groupId: string;
  existingMembers?: Array<{ id: string; email: string }>;
}

export default function InviteMembersModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  existingMembers = [],
}: InviteMembersModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [endDate, setEndDate] = useState<string>("");

  // 사용자 목록 가져오기
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await fetch("/api/users");

      if (!response.ok) {
        throw new Error("사용자 목록을 가져오는데 실패했습니다.");
      }

      const data = await response.json();
      // 이미 그룹 멤버인 사용자 제외
      const availableUsers = data.users.filter(
        (user: User) =>
          !existingMembers.some((member) => member.id === user.id),
      );
      setUsers(availableUsers || []);
    } catch (error) {
      console.error("사용자 목록 조회 오류:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  // 모달이 열릴 때 사용자 목록 가져오기
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

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

    if (selectedUsers.length === 0) {
      alert("초대할 멤버를 선택해주세요.");
      return;
    }

    try {
      const memberIds = selectedUsers.map((user) => user.id);
      const endDateValue = endDate ? new Date(endDate) : undefined;

      await onSubmit(memberIds, endDateValue);
      // 성공 시 폼 초기화
      setSelectedUsers([]);
      setSearchTerm("");
      setEndDate("");
    } catch (error) {
      // 에러는 onSubmit에서 처리됨
      console.error("멤버 초대 오류:", error);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedUsers([]);
      setSearchTerm("");
      setEndDate("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">멤버 초대</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 선택된 멤버들 */}
          {selectedUsers.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">
                초대할 멤버 ({selectedUsers.length}명):
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

          {/* 종료일 설정 */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">종료일 (선택사항):</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              min={new Date().toISOString().split("T")[0]}
              disabled={loading}
            />
            {endDate && (
              <button
                type="button"
                onClick={() => setEndDate("")}
                className="text-xs text-red-600 hover:text-red-800"
                disabled={loading}
              >
                제거
              </button>
            )}
          </div>

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
                {searchTerm
                  ? "검색 결과가 없습니다."
                  : "초대할 수 있는 사용자가 없습니다."}
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
              disabled={selectedUsers.length === 0 || loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  초대 중...
                </>
              ) : (
                <>
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  초대
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
