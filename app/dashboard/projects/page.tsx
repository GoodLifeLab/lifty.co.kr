"use client";

import { useState } from "react";

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const projects = [
    {
      id: 1,
      name: "웹사이트 리뉴얼",
      description: "회사 웹사이트를 현대적인 디자인으로 리뉴얼하는 프로젝트",
      status: "진행 중",
      progress: 75,
      team: ["김철수", "이영희", "박민수"],
      dueDate: "2024-02-15",
      priority: "높음",
      budget: "₩50,000,000",
    },
    {
      id: 2,
      name: "모바일 앱 개발",
      description: "iOS 및 Android용 모바일 애플리케이션 개발",
      status: "계획 중",
      progress: 25,
      team: ["최지영", "정현우"],
      dueDate: "2024-03-01",
      priority: "중간",
      budget: "₩80,000,000",
    },
    {
      id: 3,
      name: "데이터 분석 프로젝트",
      description: "고객 데이터 분석 및 인사이트 도출",
      status: "완료됨",
      progress: 100,
      team: ["박서연", "김도현"],
      dueDate: "2024-01-30",
      priority: "낮음",
      budget: "₩30,000,000",
    },
    {
      id: 4,
      name: "마케팅 캠페인",
      description: "Q1 마케팅 캠페인 기획 및 실행",
      status: "진행 중",
      progress: 60,
      team: ["이미영", "송태호", "한지민"],
      dueDate: "2024-02-28",
      priority: "높음",
      budget: "₩25,000,000",
    },
    {
      id: 5,
      name: "인프라 업그레이드",
      description: "서버 인프라 현대화 및 보안 강화",
      status: "계획 중",
      progress: 10,
      team: ["박준호", "김수진"],
      dueDate: "2024-04-15",
      priority: "중간",
      budget: "₩100,000,000",
    },
  ];

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "완료됨":
        return "bg-green-100 text-green-800";
      case "진행 중":
        return "bg-blue-100 text-blue-800";
      case "계획 중":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "높음":
        return "bg-red-100 text-red-800";
      case "중간":
        return "bg-yellow-100 text-yellow-800";
      case "낮음":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">프로젝트</h1>
          <p className="text-gray-600">
            모든 프로젝트를 관리하고 진행 상황을 추적하세요
          </p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
          새 프로젝트
        </button>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="프로젝트 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">모든 상태</option>
              <option value="계획 중">계획 중</option>
              <option value="진행 중">진행 중</option>
              <option value="완료됨">완료됨</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="name">이름순</option>
              <option value="dueDate">마감일순</option>
              <option value="progress">진행률순</option>
              <option value="priority">우선순위순</option>
            </select>
          </div>
        </div>
      </div>

      {/* 프로젝트 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  프로젝트
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  진행률
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  팀
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  마감일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  우선순위
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  예산
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {project.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {project.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        project.status,
                      )}`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">
                        {project.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex -space-x-2">
                      {project.team.slice(0, 3).map((member, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                        >
                          {member.charAt(0)}
                        </div>
                      ))}
                      {project.team.length > 3 && (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                          +{project.team.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {project.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                        project.priority,
                      )}`}
                    >
                      {project.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {project.budget}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                      편집
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl mr-4">📁</div>
            <div>
              <p className="text-sm font-medium text-gray-600">총 프로젝트</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl mr-4">🔄</div>
            <div>
              <p className="text-sm font-medium text-gray-600">진행 중</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter((p) => p.status === "진행 중").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl mr-4">✅</div>
            <div>
              <p className="text-sm font-medium text-gray-600">완료됨</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter((p) => p.status === "완료됨").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl mr-4">📊</div>
            <div>
              <p className="text-sm font-medium text-gray-600">평균 진행률</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(
                  projects.reduce((acc, p) => acc + p.progress, 0) /
                    projects.length,
                )}
                %
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
