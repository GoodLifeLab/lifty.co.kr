"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  XMarkIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface User {
  id: string;
  email: string;
  name?: string;
  position?: string;
  phone?: string;
  createdAt: string;
  organizations: Array<{
    organization: {
      id: string;
      name: string;
      department: string;
    };
    role?: string;
  }>;
  groupMemberships: Array<{
    group: {
      id: number;
      name: string;
      description?: string;
    };
    role: string;
  }>;
}

interface Organization {
  id: string;
  name: string;
  department: string;
}

interface Group {
  id: number;
  name: string;
  description?: string;
}

type GroupMemberRole = "ADMIN" | "MODERATOR" | "MEMBER";

interface UserDetailPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const router = useRouter();
  const { userId } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [addingOrg, setAddingOrg] = useState(false);
  const [addingGroup, setAddingGroup] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    phone: "",
  });

  // 사용자 정보 로드
  useEffect(() => {
    fetchUserData();
    fetchOrganizations();
    fetchGroups();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setFormData({
          name: data.user.name || "",
          position: data.user.position || "",
          phone: data.user.phone || "",
        });
      } else {
        alert("사용자 정보를 불러오는데 실패했습니다.");
        router.push("/dashboard/users");
      }
    } catch (error) {
      console.error("사용자 정보 로드 오류:", error);
      alert("사용자 정보를 불러오는데 실패했습니다.");
      router.push("/dashboard/users");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/organizations");
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      }
    } catch (error) {
      console.error("기관 목록 로드 오류:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups");
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups);
      }
    } catch (error) {
      console.error("그룹 목록 로드 오류:", error);
    }
  };

  // 폼 데이터 변경 처리
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 모달 열기
  const openEditModal = () => {
    setFormData({
      name: user?.name || "",
      position: user?.position || "",
      phone: user?.phone || "",
    });
    setShowEditModal(true);
  };

  // 모달 닫기
  const closeEditModal = () => {
    setShowEditModal(false);
  };

  // 기관 추가 모달 열기
  const openOrgModal = () => {
    setSelectedOrg("");
    setShowOrgModal(true);
  };

  // 기관 추가 모달 닫기
  const closeOrgModal = () => {
    setShowOrgModal(false);
  };

  // 그룹 추가 모달 열기
  const openGroupModal = () => {
    setSelectedGroup("");
    setShowGroupModal(true);
  };

  // 그룹 추가 모달 닫기
  const closeGroupModal = () => {
    setShowGroupModal(false);
  };

  // 기관 추가
  const handleAddOrganization = async () => {
    if (!selectedOrg) {
      alert("기관을 선택해주세요.");
      return;
    }

    try {
      setAddingOrg(true);
      const response = await fetch("/api/users/add-organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          organizationId: selectedOrg,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        closeOrgModal();
        fetchUserData();
      } else {
        const error = await response.json();
        alert(error.message || "기관 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("기관 추가 오류:", error);
      alert("기관 추가에 실패했습니다.");
    } finally {
      setAddingOrg(false);
    }
  };

  // 그룹 추가
  const handleAddGroup = async () => {
    if (!selectedGroup) {
      alert("그룹을 선택해주세요.");
      return;
    }

    try {
      setAddingGroup(true);
      const response = await fetch("/api/users/add-group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          groupId: parseInt(selectedGroup),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        closeGroupModal();
        fetchUserData();
      } else {
        const error = await response.json();
        alert(error.message || "그룹 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("그룹 추가 오류:", error);
      alert("그룹 추가에 실패했습니다.");
    } finally {
      setAddingGroup(false);
    }
  };

  // 사용자 정보 저장
  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          name: formData.name,
          position: formData.position,
          phone: formData.phone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setShowEditModal(false);
        fetchUserData(); // 업데이트된 정보 다시 로드
      } else {
        const error = await response.json();
        alert(error.message || "사용자 정보 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("사용자 정보 저장 오류:", error);
      alert("사용자 정보 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // 사용자 삭제
  const handleDeleteUser = async () => {
    if (!user) return;

    if (
      !confirm(
        `정말로 ${user.name || user.email} 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/users?userId=${user.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        router.push("/dashboard/users");
      } else {
        const error = await response.json();
        alert(error.message || "사용자 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("사용자 삭제 오류:", error);
      alert("사용자 삭제에 실패했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  // 비밀번호 초기화
  const handleResetPassword = async () => {
    if (!user) return;

    if (
      !confirm(
        `${user.name || user.email} 사용자의 비밀번호를 초기화하시겠습니까?`,
      )
    ) {
      return;
    }

    try {
      setResettingPassword(true);
      const response = await fetch("/api/users/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
      } else {
        const error = await response.json();
        alert(error.message || "비밀번호 초기화에 실패했습니다.");
      }
    } catch (error) {
      console.error("비밀번호 초기화 오류:", error);
      alert("비밀번호 초기화에 실패했습니다.");
    } finally {
      setResettingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/dashboard/users")}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">사용자 상세</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/dashboard/users")}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">사용자 상세</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-600">사용자를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/dashboard/users")}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">사용자 상세</h1>
            <p className="text-gray-600">
              사용자 정보를 확인하고 수정할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* 사용자 기본 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start space-x-6 mb-6">
            {/* 프로필 이미지 */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-medium">
                {user.name
                  ? user.name.charAt(0).toUpperCase()
                  : user.email.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="flex-1">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                {user.name || "이름 없음"}
              </h2>
              <p className="text-sm text-gray-500 mb-1">{user.email}</p>
              {user.position && (
                <p className="text-sm text-gray-400 mb-3">{user.position}</p>
              )}

              {/* 소속 기관 뱃지 */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs font-medium text-gray-700">소속 기관</p>
                  <button
                    onClick={openOrgModal}
                    className="p-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                {user.organizations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.organizations.map((org) => (
                      <span
                        key={org.organization.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {org.organization.name}
                        {org.role && (
                          <span className="ml-1 text-indigo-600">
                            ({org.role})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">소속 기관이 없습니다.</p>
                )}
              </div>

              {/* 소속 그룹 뱃지 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs font-medium text-gray-700">소속 그룹</p>
                  <button
                    onClick={openGroupModal}
                    className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                {user.groupMemberships.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.groupMemberships.map((group) => (
                      <span
                        key={group.group.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {group.group.name}
                        <span className="ml-1 text-green-600">
                          ({group.role})
                        </span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">소속 그룹이 없습니다.</p>
                )}
              </div>
            </div>

            {/* 작업 버튼들 */}
            <div className="flex-shrink-0">
              <div className="flex flex-col space-y-2">
                <button
                  onClick={openEditModal}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors whitespace-nowrap flex items-center justify-center"
                >
                  정보 수정
                </button>

                <button
                  onClick={handleResetPassword}
                  disabled={resettingPassword}
                  className="px-4 py-2 text-sm font-medium text-yellow-600 bg-white border border-yellow-600 rounded-md hover:bg-yellow-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap"
                >
                  {resettingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                      초기화 중...
                    </>
                  ) : (
                    "비밀번호 초기화"
                  )}
                </button>

                <button
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                      삭제 중...
                    </>
                  ) : (
                    "사용자 삭제"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 상세 정보 */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-md font-medium text-gray-900 mb-4">
              상세 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  직책
                </label>
                <p className="text-sm text-gray-900">
                  {user.position || "직책 없음"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호
                </label>
                <p className="text-sm text-gray-900">
                  {user.phone || "전화번호 없음"}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                가입일
              </label>
              <p className="text-sm text-gray-900">
                {new Date(user.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 수정 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-1/2 -translate-y-1/2 mx-auto p-5 w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  사용자 정보 수정
                </h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="이름을 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    이메일은 수정할 수 없습니다.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    직책
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) =>
                      handleInputChange("position", e.target.value)
                    }
                    placeholder="직책을 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="전화번호를 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      저장 중...
                    </>
                  ) : (
                    "저장"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 기관 추가 모달 */}
      {showOrgModal && (
        <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-1/2 -translate-y-1/2 mx-auto p-5 w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">기관 추가</h3>
                <button
                  onClick={closeOrgModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    기관 선택
                  </label>
                  <select
                    value={selectedOrg}
                    onChange={(e) => setSelectedOrg(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">기관을 선택하세요</option>
                    {(organizations || [])
                      .filter(
                        (org) =>
                          !user.organizations.some(
                            (userOrg) => userOrg.organization.id === org.id,
                          ),
                      )
                      .map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeOrgModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleAddOrganization}
                  disabled={addingOrg || !selectedOrg}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {addingOrg ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      추가 중...
                    </>
                  ) : (
                    "추가"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 그룹 추가 모달 */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-1/2 -translate-y-1/2 mx-auto p-5 w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">그룹 추가</h3>
                <button
                  onClick={closeGroupModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    그룹 선택
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">그룹을 선택하세요</option>
                    {(groups || [])
                      .filter(
                        (group) =>
                          !user.groupMemberships.some(
                            (userGroup) => userGroup.group.id === group.id,
                          ),
                      )
                      .map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeGroupModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleAddGroup}
                  disabled={addingGroup || !selectedGroup}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {addingGroup ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      추가 중...
                    </>
                  ) : (
                    "추가"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
