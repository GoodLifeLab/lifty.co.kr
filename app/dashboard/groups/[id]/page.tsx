"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  UserGroupIcon,
  GlobeAltIcon,
  LockClosedIcon,
  UserIcon,
  CalendarIcon,
  CogIcon,
  PlusIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Group, User } from "@prisma/client";
import InviteMembersModal from "@/app/components/InviteMembersModal";
import GroupSettingsModal from "@/app/components/GroupSettingsModal";

type GroupWithMembers = Group & {
  members: Pick<User, "id" | "email">[];
};

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<GroupWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // 현재 사용자 정보 가져오기
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCurrentUser(data.user);
        }
      }
    } catch (error) {
      console.error("현재 사용자 정보 조회 오류:", error);
    }
  };

  // 그룹 상세 정보 가져오기
  const fetchGroupDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/groups/${groupId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("그룹을 찾을 수 없습니다.");
        }
        throw new Error("그룹 정보를 가져오는데 실패했습니다.");
      }

      const data = await response.json();
      setGroup(data.group);
    } catch (error) {
      console.error("그룹 상세 정보 조회 오류:", error);
      setError(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  // 멤버 방출
  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("정말로 이 멤버를 방출하시겠습니까?")) {
      return;
    }

    try {
      setRemovingMember(memberId);
      const response = await fetch(
        `/api/groups/${groupId}/members/${memberId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "멤버 방출에 실패했습니다.");
      }

      // 그룹 정보 새로고침
      await fetchGroupDetail();
      alert("멤버가 성공적으로 방출되었습니다.");
    } catch (error) {
      console.error("멤버 방출 오류:", error);
      alert(
        error instanceof Error ? error.message : "멤버 방출에 실패했습니다.",
      );
    } finally {
      setRemovingMember(null);
    }
  };

  // 멤버 초대
  const handleInviteMembers = async (memberIds: string[]) => {
    try {
      setInviting(true);
      const response = await fetch(`/api/groups/${groupId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "멤버 초대에 실패했습니다.");
      }

      const data = await response.json();
      alert(data.message);

      // 그룹 정보 새로고침
      await fetchGroupDetail();
      setInviteModalOpen(false);
    } catch (error) {
      console.error("멤버 초대 오류:", error);
      alert(
        error instanceof Error ? error.message : "멤버 초대에 실패했습니다.",
      );
    } finally {
      setInviting(false);
    }
  };

  // 그룹 설정 업데이트
  const handleUpdateSettings = async (data: {
    name: string;
    description: string;
    isPublic: boolean;
  }) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "그룹 설정 업데이트에 실패했습니다.");
      }

      const result = await response.json();
      alert(result.message);

      // 그룹 정보 새로고침
      await fetchGroupDetail();
      setSettingsModalOpen(false);
    } catch (error) {
      console.error("그룹 설정 업데이트 오류:", error);
      alert(
        error instanceof Error ? error.message : "그룹 설정 업데이트에 실패했습니다.",
      );
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupDetail();
      fetchCurrentUser();
    }
  }, [groupId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">그룹 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">그룹 상세</h1>
        </div>
        <div className="text-center py-12">
          <UserGroupIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error || "그룹을 찾을 수 없습니다"}
          </h3>
          <p className="text-gray-600 mb-4">
            그룹이 존재하지 않거나 접근 권한이 없습니다.
          </p>
          <button
            onClick={() => router.push("/dashboard/groups")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            그룹 목록으로 돌아가기
          </button>
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
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
            <p className="text-gray-600">그룹 상세 정보</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setSettingsModalOpen(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
          >
            <CogIcon className="h-4 w-4 mr-2" />
            설정
          </button>
          <button
            onClick={() => setInviteModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            멤버 초대
          </button>
        </div>
      </div>

      {/* 그룹 정보 카드 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <UserGroupIcon className="h-10 w-10 text-indigo-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {group.name}
              </h2>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${group.isPublic
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
                  }`}
              >
                {group.isPublic ? (
                  <>
                    <GlobeAltIcon className="h-4 w-4 inline mr-1" />
                    공개
                  </>
                ) : (
                  <>
                    <LockClosedIcon className="h-4 w-4 inline mr-1" />
                    비공개
                  </>
                )}
              </span>
            </div>
            <p className="text-gray-600 mb-4">
              {group.description || "설명이 없습니다."}
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                생성일: {new Date(group.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                멤버 {group.members ? group.members.length : 0}명
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 멤버 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">멤버 목록</h3>
        </div>
        <div className="p-6">
          {group.members && group.members.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      멤버
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      이메일
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      조치
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {group.members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                            <UserIcon className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {member.email}
                              {currentUser?.id === member.id && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  나
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">멤버</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {currentUser?.id !== member.id && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={removingMember === member.id}
                            className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                            title="멤버 방출"
                          >
                            {removingMember === member.id ? (
                              <svg
                                className="animate-spin h-5 w-5 text-red-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            ) : (
                              <TrashIcon className="h-5 w-5" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <UserIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">아직 멤버가 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 멤버 초대 모달 */}
      <InviteMembersModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSubmit={handleInviteMembers}
        loading={inviting}
        groupId={groupId}
        existingMembers={group?.members || []}
      />

      {/* 그룹 설정 모달 */}
      <GroupSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onSubmit={handleUpdateSettings}
        loading={updating}
        group={group}
      />
    </div>
  );
}
