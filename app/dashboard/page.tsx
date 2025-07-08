"use client";

import { useState, useEffect } from "react";
import {
  FolderIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  UserGroupIcon,
  PlusIcon,
  ChartBarIcon,
  UserIcon,
  UsersIcon,
  GlobeAltIcon,
  LockClosedIcon,
  CalendarIcon,
  CogIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import CreateGroupModal from "@/app/components/CreateGroupModal";

interface Group {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  isPublic: boolean;
  memberCount: number;
  createdAt: string;
  members?: Array<{
    id: string;
    email: string;
  }>;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // 이번 달에 생성된 그룹 수 계산
  const getThisMonthGroups = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    return groups.filter((group) => {
      const groupDate = new Date(group.createdAt);
      return (
        groupDate.getMonth() === thisMonth &&
        groupDate.getFullYear() === thisYear
      );
    }).length;
  };

  const stats = [
    {
      name: "총 프로젝트",
      value: "12",
      change: "+2.5%",
      changeType: "positive",
      icon: FolderIcon,
    },
    {
      name: "진행 중",
      value: "8",
      change: "+1.2%",
      changeType: "positive",
      icon: ArrowPathIcon,
    },
    {
      name: "완료됨",
      value: "4",
      change: "+0.8%",
      changeType: "positive",
      icon: CheckCircleIcon,
    },
    {
      name: "그룹",
      value: loading ? "..." : groups.length.toString(),
      change: loading
        ? "..."
        : getThisMonthGroups() > 0
          ? `+${getThisMonthGroups()}`
          : "0",
      changeType: "positive",
      icon: UserGroupIcon,
    },
  ];

  const recentProjects = [
    {
      id: 1,
      name: "웹사이트 리뉴얼",
      status: "진행 중",
      progress: 75,
      team: ["김철수", "이영희", "박민수"],
      dueDate: "2024-02-15",
    },
    {
      id: 2,
      name: "모바일 앱 개발",
      status: "계획 중",
      progress: 25,
      team: ["최지영", "정현우"],
      dueDate: "2024-03-01",
    },
    {
      id: 3,
      name: "데이터 분석 프로젝트",
      status: "완료됨",
      progress: 100,
      team: ["박서연", "김도현"],
      dueDate: "2024-01-30",
    },
  ];

  const activities = [
    {
      id: 1,
      type: "프로젝트 생성",
      description: "새로운 프로젝트 '웹사이트 리뉴얼'이 생성되었습니다.",
      time: "2시간 전",
      user: "김철수",
    },
    {
      id: 2,
      type: "작업 완료",
      description: "홈페이지 디자인 작업이 완료되었습니다.",
      time: "4시간 전",
      user: "이영희",
    },
    {
      id: 3,
      type: "댓글",
      description: "프로젝트 '모바일 앱 개발'에 새 댓글이 추가되었습니다.",
      time: "6시간 전",
      user: "박민수",
    },
  ];

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
    } finally {
      setLoading(false);
    }
  };

  // 새 그룹 생성
  const handleCreateGroup = async (groupData: {
    name: string;
    description: string;
    isPublic: boolean;
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
      throw error;
    } finally {
      setCreating(false);
    }
  };

  // 그룹 목록 가져오기
  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600">
            프로젝트 현황과 최근 활동을 확인하세요
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center">
            <PlusIcon className="h-4 w-4 mr-2" />새 프로젝트
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center">
            <ChartBarIcon className="h-4 w-4 mr-2" />
            보고서
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="text-2xl">
                <stat.icon className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span
                className={`text-sm font-medium ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">지난 달 대비</span>
            </div>
          </div>
        ))}
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {["overview", "projects", "groups", "team", "analytics"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab === "overview" && "개요"}
                  {tab === "projects" && "프로젝트"}
                  {tab === "groups" && "그룹"}
                  {tab === "team" && "팀"}
                  {tab === "analytics" && "분석"}
                </button>
              ),
            )}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 최근 프로젝트 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  최근 프로젝트
                </h3>
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {project.name}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            project.status === "완료됨"
                              ? "bg-green-100 text-green-800"
                              : project.status === "진행 중"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>진행률</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>팀: {project.team.join(", ")}</span>
                        <span>마감: {project.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 최근 활동 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  최근 활동
                </h3>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <EnvelopeIcon className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.type}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.description}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <span>{activity.user}</span>
                          <span className="mx-1">•</span>
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">
                <FolderIcon className="h-16 w-16 mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                프로젝트 관리
              </h3>
              <p className="text-gray-600">
                프로젝트 목록과 상세 정보를 확인하세요
              </p>
            </div>
          )}

          {activeTab === "groups" && (
            <div className="space-y-6">
              {/* 그룹 헤더 */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    그룹 관리
                  </h3>
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

              {/* 그룹 목록 */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">
                    그룹 목록을 불러오는 중...
                  </p>
                </div>
              ) : groups.length === 0 ? (
                <div className="text-center py-12">
                  <UserGroupIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    아직 그룹이 없습니다
                  </h3>
                  <p className="text-gray-600 mb-4">
                    첫 번째 그룹을 만들어보세요!
                  </p>
                  <button
                    onClick={() => setShowCreateGroup(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center mx-auto"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />새 그룹 만들기
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
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
                        {group.description || "설명이 없습니다."}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          멤버 {group.members ? group.members.length : 0}명
                        </span>
                        <span className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {group.createdAt}
                        </span>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <button className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center">
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
              )}
            </div>
          )}

          {activeTab === "team" && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">
                <UsersIcon className="h-16 w-16 mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                팀 관리
              </h3>
              <p className="text-gray-600">팀원들과 협업 현황을 확인하세요</p>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">
                <ChartBarIcon className="h-16 w-16 mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                데이터 분석
              </h3>
              <p className="text-gray-600">프로젝트 성과와 통계를 확인하세요</p>
            </div>
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
