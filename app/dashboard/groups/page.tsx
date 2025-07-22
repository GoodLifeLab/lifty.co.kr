"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserGroupIcon,
  GlobeAltIcon,
  LockClosedIcon,
  UserIcon,
  PlusIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import CreateGroupModal from "@/app/components/CreateGroupModal";
import { Group } from "@prisma/client";
import { GroupWithMembers } from "@/types/Group";

export default function GroupsPage() {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  // 그룹 목록 가져오기
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/groups");

      if (!response.ok) {
        throw new Error("그룹 목록을 가져오는데 실패했습니다.");
      }

      const data = await response.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error("그룹 목록 조회 오류:", error);
      alert("그룹 목록을 가져오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 새 그룹 생성
  const handleCreateGroup = async (groupData: {
    name: string;
    description: string;
    isPublic: boolean;
    image?: string;
    memberIds: string[];
  }) => {
    try {
      setCreating(true);
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(groupData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "그룹 생성에 실패했습니다.");
      }

      const data = await response.json();
      alert(data.message || "그룹이 성공적으로 생성되었습니다.");

      // 그룹 목록 새로고침
      await fetchGroups();

      // 모달 닫기
      setShowCreateGroup(false);
    } catch (error) {
      console.error("그룹 생성 오류:", error);
      alert(
        error instanceof Error ? error.message : "그룹 생성에 실패했습니다.",
      );
      throw error; // 모달에서 에러 처리할 수 있도록 다시 던짐
    } finally {
      setCreating(false);
    }
  };

  // 컴포넌트 마운트 시 그룹 목록 가져오기
  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">그룹 관리</h1>
          <p className="text-gray-600">
            팀과 그룹을 관리하고 구성원을 초대하세요
          </p>
        </div>
        <button
          onClick={() => setShowCreateGroup(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />새 그룹 만들기
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 그룹</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "..." : groups.length}
              </p>
            </div>
            <div className="text-2xl">
              <UserGroupIcon className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">공개 그룹</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "..." : groups.filter((g) => g.isPublic).length}
              </p>
            </div>
            <div className="text-2xl">
              <GlobeAltIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">비공개 그룹</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "..." : groups.filter((g) => !g.isPublic).length}
              </p>
            </div>
            <div className="text-2xl">
              <LockClosedIcon className="h-8 w-8 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 그룹 목록 테이블 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">내 그룹</h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">그룹 목록을 불러오는 중...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                아직 그룹이 없습니다
              </h3>
              <p className="text-gray-600 mb-4">첫 번째 그룹을 만들어보세요!</p>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center mx-auto"
              >
                <PlusIcon className="h-4 w-4 mr-2" />새 그룹 만들기
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    그룹
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    설명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    소속 인원 수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    생성일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    그룹 공개 여부
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groups.map((group) => (
                  <tr
                    key={group.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/dashboard/groups/${group.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {group.image ? (
                          <img
                            src={group.image}
                            alt={group.name}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              target.nextElementSibling?.classList.remove(
                                "hidden",
                              );
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3 ${group.image ? "hidden" : ""}`}
                        >
                          <UserGroupIcon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {group.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {group.description || "설명이 없습니다."}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <UserIcon className="h-4 w-4 mr-1" />
                        {group.memberships
                          ? group.memberships.length.toLocaleString()
                          : 0}
                        명
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(group.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          group.isPublic
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {group.isPublic ? (
                          <GlobeAltIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <LockClosedIcon className="h-3 w-3 mr-1" />
                        )}
                        {group.isPublic ? "공개" : "비공개"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 그룹 생성 모달 */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onSubmit={handleCreateGroup}
        loading={creating}
      />
    </div>
  );
}
