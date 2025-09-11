"use client";

import { Coach } from "@/types/User";
import { useState } from "react";

interface CoachTableProps {
  coaches: Coach[];
  loading: boolean;
  onCoachClick?: (coachId: string) => void;
}

// 상태 배지 컴포넌트
const StatusBadge = ({ isActive }: { isActive: boolean }) => {
  const config = isActive
    ? { text: "활성", color: "bg-green-100 text-green-800" }
    : { text: "비활성화", color: "bg-red-100 text-red-800" };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.text}
    </span>
  );
};

export default function CoachTable({
  coaches,
  loading,
  onCoachClick,
}: CoachTableProps) {
  const [sortField, setSortField] = useState<keyof Coach>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof Coach) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "COACH":
        return "코치";
      case "SUPER_ADMIN":
        return "슈퍼 관리자";
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "COACH":
        return "bg-blue-100 text-blue-800";
      case "SUPER_ADMIN":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  if (coaches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg font-medium mb-2">
          코치가 없습니다
        </div>
        <p className="text-gray-400">새로운 코치를 추가해보세요.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("name")}
            >
              이름
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("email")}
            >
              이메일
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              담당 그룹
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("phone")}
            >
              전화번호
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              상태
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {coaches.map((coach) => (
            <tr
              key={coach.id}
              className={`hover:bg-gray-50 ${
                onCoachClick ? "cursor-pointer" : ""
              }`}
              onClick={() => onCoachClick?.(coach.id)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {coach.name || "이름 없음"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{coach.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {coach.groupMemberships.length > 0
                    ? coach.groupMemberships
                        .map((membership) => membership.group.name)
                        .join(", ")
                    : "-"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {coach.phone || "-"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge isActive={!coach.disabled} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
