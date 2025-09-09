"use client";

import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  UserPlusIcon,
  DocumentArrowUpIcon,
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
  groupId,
  existingMembers = [],
}: InviteMembersModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [endDate, setEndDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"individual" | "excel">(
    "individual",
  );
  const [excelPreview, setExcelPreview] = useState<any>(null);
  const [excelLoading, setExcelLoading] = useState(false);

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

  // 엑셀 파일 업로드 핸들러
  const handleExcelFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setExcelPreview(null); // 이전 미리보기 초기화

      // 파일 선택 시 자동으로 미리보기 생성
      await generateExcelPreview(file);
    }
  };

  // 엑셀 파일 미리보기 생성
  const generateExcelPreview = async (file: File) => {
    try {
      setExcelLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/groups/${groupId}/invite-excel`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "엑셀 파일 분석에 실패했습니다.");
      }

      const data = await response.json();
      setExcelPreview(data);
      setSelectedUsers(data.summary.foundUsers);
    } catch (error) {
      console.error("엑셀 미리보기 오류:", error);
      alert(
        error instanceof Error
          ? error.message
          : "엑셀 파일 분석에 실패했습니다.",
      );
    } finally {
      setExcelLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedUsers([]);
      setSearchTerm("");
      setEndDate("");
      setActiveTab("individual");
      setExcelPreview(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">멤버 초대</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex space-x-1 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("individual")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "individual"
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
            disabled={loading}
          >
            <UserPlusIcon className="h-4 w-4 inline mr-2" />
            개별 초대
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("excel")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "excel"
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
            disabled={loading}
          >
            <DocumentArrowUpIcon className="h-4 w-4 inline mr-2" />
            엑셀 업로드
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 선택된 멤버들 */}
          {selectedUsers.length > 0 && activeTab === "individual" && (
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

          {/* 엑셀 업로드 탭 */}
          {activeTab === "excel" && (
            <div className="space-y-4">
              {/* 파일 업로드 */}
              {!excelPreview && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    엑셀 파일 업로드 *
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="excel-file"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>파일 선택</span>
                          <input
                            id="excel-file"
                            name="excel-file"
                            type="file"
                            accept=".xlsx,.xls"
                            className="sr-only"
                            onChange={handleExcelFileChange}
                            disabled={loading}
                          />
                        </label>
                        <p className="pl-1">또는 드래그 앤 드롭</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        .xlsx, .xls 파일만 지원됩니다
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 엑셀 파일 형식 안내 */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  📋 엑셀 파일 형식 안내
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 첫 번째 행은 헤더로 사용됩니다</li>
                  <li>
                    • &apos;email&apos; 또는 &apos;이메일&apos; 컬럼이
                    포함되어야 합니다
                  </li>
                  <li>
                    • 이메일 주소는 users.email 또는
                    userOrganization.organizationEmail과 매칭됩니다
                  </li>
                  <li>• 중복된 이메일은 자동으로 제거됩니다</li>
                  <li>
                    • 업로드 후 즉시 상세한 처리 결과를 확인할 수 있습니다
                  </li>
                </ul>
                <div className="mt-3 p-3 bg-blue-100 rounded-md">
                  <p className="text-xs text-blue-800 font-medium">💡 예시:</p>
                  <div className="text-xs text-blue-700 mt-1 font-mono">
                    | email | name |<br />
                    | user1@example.com | 홍길동 |<br />| user2@company.com |
                    김철수 |
                  </div>
                </div>
              </div>

              {/* 로딩 상태 */}
              {excelLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    엑셀 파일을 분석하는 중...
                  </span>
                </div>
              )}

              {/* 미리보기 결과 */}
              {excelPreview && !excelLoading && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    📋 미리보기 결과
                  </h4>

                  {/* 요약 정보 */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-xs text-blue-600 font-medium">
                        총 이메일
                      </p>
                      <p className="text-lg font-bold text-blue-900">
                        {excelPreview.summary.totalEmails}
                      </p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <p className="text-xs text-green-600 font-medium">
                        초대 가능
                      </p>
                      <p className="text-lg font-bold text-green-900">
                        {excelPreview.summary.foundUsers.length}
                      </p>
                    </div>
                  </div>

                  {/* 새로 초대될 멤버 목록 */}
                  {excelPreview.newMembers &&
                    excelPreview.newMembers.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          새로 초대될 멤버 ({excelPreview.summary.newMembers}명)
                        </h5>
                        <div className="max-h-32 overflow-y-auto border border-gray-200 rounded">
                          {excelPreview.newMembers
                            .slice(0, 10)
                            .map((member: any, index: number) => (
                              <div
                                key={member.id}
                                className="flex items-center p-2 border-b border-gray-100 last:border-b-0"
                              >
                                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                                  {index + 1}
                                </span>
                                <span className="text-sm text-gray-900">
                                  {member.email}
                                </span>
                              </div>
                            ))}
                          {excelPreview.newMembers.length > 10 && (
                            <div className="p-2 text-center text-xs text-gray-500">
                              ... 외 {excelPreview.newMembers.length - 10}명
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {/* 문제가 있는 이메일들 */}
                  {(excelPreview.summary.notFoundEmails.length > 0 ||
                    excelPreview.summary.alreadyMemberEmails.length > 0) && (
                    <div className="space-y-2">
                      {excelPreview.summary.notFoundEmails.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <p className="text-xs text-red-600 font-medium">
                            ❌ 찾을 수 없는 이메일 (
                            {excelPreview.summary.notFoundEmails.length}개)
                          </p>
                          <p className="text-xs text-red-700 mt-1">
                            {excelPreview.summary.notFoundEmails
                              .slice(0, 3)
                              .join(", ")}
                            {excelPreview.summary.notFoundEmails.length > 3 &&
                              "..."}
                          </p>
                        </div>
                      )}
                      {excelPreview.summary.alreadyMemberEmails.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                          <p className="text-xs text-yellow-600 font-medium">
                            ⚠️ 이미 멤버인 사용자 (
                            {excelPreview.summary.alreadyMemberEmails.length}명)
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            {excelPreview.summary.alreadyMemberEmails
                              .slice(0, 3)
                              .join(", ")}
                            {excelPreview.summary.alreadyMemberEmails.length >
                              3 && "..."}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 개별 초대 탭 */}
          {activeTab === "individual" && (
            <>
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
                                  <span className="text-gray-400 text-xs">
                                    -
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {user.createdAt
                                  ? new Date(
                                      user.createdAt,
                                    ).toLocaleDateString()
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
            </>
          )}

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
