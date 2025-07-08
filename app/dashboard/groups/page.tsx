"use client";

import { useState } from "react";
import {
  UserGroupIcon,
  GlobeAltIcon,
  LockClosedIcon,
  UserIcon,
  PlusIcon,
  CogIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

export default function GroupsPage() {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    isPublic: true,
  });

  // 임시 그룹 데이터
  const groups = [
    {
      id: 1,
      name: "개발팀",
      description: "웹 개발 및 모바일 앱 개발 담당",
      memberCount: 8,
      isPublic: true,
      image: null,
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      name: "디자인팀",
      description: "UI/UX 디자인 및 브랜딩 담당",
      memberCount: 5,
      isPublic: true,
      image: null,
      createdAt: "2024-01-20",
    },
    {
      id: 3,
      name: "마케팅팀",
      description: "디지털 마케팅 및 콘텐츠 제작",
      memberCount: 4,
      isPublic: false,
      image: null,
      createdAt: "2024-02-01",
    },
    {
      id: 4,
      name: "기획팀",
      description: "서비스 기획 및 전략 수립",
      memberCount: 3,
      isPublic: true,
      image: null,
      createdAt: "2024-02-10",
    },
    {
      id: 5,
      name: "QA팀",
      description: "품질 보증 및 테스트 담당",
      memberCount: 6,
      isPublic: false,
      image: null,
      createdAt: "2024-02-15",
    },
  ];

  const handleCreateGroup = () => {
    // TODO: API 호출로 그룹 생성
    console.log("새 그룹 생성:", newGroup);
    setShowCreateGroup(false);
    setNewGroup({ name: "", description: "", isPublic: true });
  };

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
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateGroup(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />새 그룹 만들기
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center">
            <UserGroupIcon className="h-4 w-4 mr-2" />
            그룹 가입
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 그룹</p>
              <p className="text-2xl font-bold text-gray-900">
                {groups.length}
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
                {groups.filter((g) => g.isPublic).length}
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
                {groups.filter((g) => !g.isPublic).length}
              </p>
            </div>
            <div className="text-2xl">
              <LockClosedIcon className="h-8 w-8 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 멤버</p>
              <p className="text-2xl font-bold text-gray-900">
                {groups.reduce((sum, group) => sum + group.memberCount, 0)}
              </p>
            </div>
            <div className="text-2xl">
              <UserIcon className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 그룹 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">내 그룹</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <UserGroupIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        group.isPublic
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {group.isPublic ? (
                        <GlobeAltIcon className="h-3 w-3 inline mr-1" />
                      ) : (
                        <LockClosedIcon className="h-3 w-3 inline mr-1" />
                      )}
                      {group.isPublic ? "공개" : "비공개"}
                    </span>
                  </div>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {group.name}
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  {group.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    멤버 {group.memberCount}명
                  </span>
                  <span className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {group.createdAt}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center">
                    <CogIcon className="h-4 w-4 mr-1" />
                    관리
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center">
                    <PlusIcon className="h-4 w-4 mr-1" />
                    초대
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 그룹 생성 모달 */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              새 그룹 만들기
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  그룹 이름
                </label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="그룹 이름을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="그룹에 대한 설명을 입력하세요"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newGroup.isPublic}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, isPublic: e.target.checked })
                  }
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isPublic"
                  className="ml-2 block text-sm text-gray-900"
                >
                  공개 그룹으로 만들기
                </label>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateGroup(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!newGroup.name.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
