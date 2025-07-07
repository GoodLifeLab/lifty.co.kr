"use client";

import { useState } from "react";

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const teamMembers = [
    {
      id: 1,
      name: "김철수",
      email: "kim@example.com",
      role: "프로젝트 매니저",
      department: "개발팀",
      avatar: "김",
      status: "온라인",
      projects: ["웹사이트 리뉴얼", "모바일 앱 개발"],
      skills: ["React", "Node.js", "프로젝트 관리"],
      performance: 95,
      joinDate: "2023-01-15",
    },
    {
      id: 2,
      name: "이영희",
      email: "lee@example.com",
      role: "프론트엔드 개발자",
      department: "개발팀",
      avatar: "이",
      status: "오프라인",
      projects: ["웹사이트 리뉴얼"],
      skills: ["React", "TypeScript", "CSS"],
      performance: 88,
      joinDate: "2023-03-20",
    },
    {
      id: 3,
      name: "박민수",
      email: "park@example.com",
      role: "백엔드 개발자",
      department: "개발팀",
      avatar: "박",
      status: "온라인",
      projects: ["웹사이트 리뉴얼", "데이터 분석 프로젝트"],
      skills: ["Node.js", "Python", "데이터베이스"],
      performance: 92,
      joinDate: "2022-11-10",
    },
    {
      id: 4,
      name: "최지영",
      email: "choi@example.com",
      role: "UI/UX 디자이너",
      department: "디자인팀",
      avatar: "최",
      status: "온라인",
      projects: ["모바일 앱 개발"],
      skills: ["Figma", "Adobe XD", "프로토타이핑"],
      performance: 90,
      joinDate: "2023-06-05",
    },
    {
      id: 5,
      name: "정현우",
      email: "jung@example.com",
      role: "모바일 개발자",
      department: "개발팀",
      avatar: "정",
      status: "자리비움",
      projects: ["모바일 앱 개발"],
      skills: ["React Native", "iOS", "Android"],
      performance: 87,
      joinDate: "2023-04-12",
    },
    {
      id: 6,
      name: "박서연",
      email: "seoyeon@example.com",
      role: "데이터 분석가",
      department: "데이터팀",
      avatar: "박",
      status: "온라인",
      projects: ["데이터 분석 프로젝트"],
      skills: ["Python", "SQL", "머신러닝"],
      performance: 94,
      joinDate: "2022-09-01",
    },
  ];

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesDepartment =
      departmentFilter === "all" || member.department === departmentFilter;
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "온라인":
        return "bg-green-100 text-green-800";
      case "오프라인":
        return "bg-gray-100 text-gray-800";
      case "자리비움":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600";
    if (performance >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">팀</h1>
          <p className="text-gray-600">
            팀원들을 관리하고 협업 현황을 확인하세요
          </p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
          팀원 초대
        </button>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="팀원 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">모든 역할</option>
              <option value="프로젝트 매니저">프로젝트 매니저</option>
              <option value="프론트엔드 개발자">프론트엔드 개발자</option>
              <option value="백엔드 개발자">백엔드 개발자</option>
              <option value="UI/UX 디자이너">UI/UX 디자이너</option>
              <option value="모바일 개발자">모바일 개발자</option>
              <option value="데이터 분석가">데이터 분석가</option>
            </select>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">모든 부서</option>
              <option value="개발팀">개발팀</option>
              <option value="디자인팀">디자인팀</option>
              <option value="데이터팀">데이터팀</option>
            </select>
          </div>
        </div>
      </div>

      {/* 팀원 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white text-lg font-medium mr-4">
                  {member.avatar}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                  member.status,
                )}`}
              >
                {member.status}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">역할</p>
                <p className="text-sm text-gray-900">{member.role}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">부서</p>
                <p className="text-sm text-gray-900">{member.department}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">
                  참여 프로젝트
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {member.projects.map((project, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full"
                    >
                      {project}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">주요 기술</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {member.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {member.skills.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                      +{member.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-700">성과</p>
                  <p
                    className={`text-lg font-bold ${getPerformanceColor(
                      member.performance,
                    )}`}
                  >
                    {member.performance}%
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                    💬
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                    📧
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                    ⚙️
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 팀 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl mr-4">👥</div>
            <div>
              <p className="text-sm font-medium text-gray-600">총 팀원</p>
              <p className="text-2xl font-bold text-gray-900">
                {teamMembers.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl mr-4">🟢</div>
            <div>
              <p className="text-sm font-medium text-gray-600">온라인</p>
              <p className="text-2xl font-bold text-gray-900">
                {teamMembers.filter((m) => m.status === "온라인").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl mr-4">📊</div>
            <div>
              <p className="text-sm font-medium text-gray-600">평균 성과</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(
                  teamMembers.reduce((acc, m) => acc + m.performance, 0) /
                    teamMembers.length,
                )}
                %
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl mr-4">📁</div>
            <div>
              <p className="text-sm font-medium text-gray-600">활성 프로젝트</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(teamMembers.flatMap((m) => m.projects)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 부서별 분포 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">부서별 분포</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["개발팀", "디자인팀", "데이터팀"].map((dept) => (
            <div key={dept} className="text-center">
              <div className="text-3xl mb-2">
                {dept === "개발팀" && "💻"}
                {dept === "디자인팀" && "🎨"}
                {dept === "데이터팀" && "📊"}
              </div>
              <h4 className="font-medium text-gray-900">{dept}</h4>
              <p className="text-2xl font-bold text-indigo-600">
                {teamMembers.filter((m) => m.department === dept).length}
              </p>
              <p className="text-sm text-gray-500">명</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
