"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";
import { User, Group, Course, Organization } from "@prisma/client";

type StudentWithDetails = User & {
  organizations: Array<{
    organization: Pick<Organization, "id" | "name">;
  }>;
  groupMemberships: Array<{
    group: Group & {
      courses: Array<{
        course: Pick<Course, "id" | "name" | "startDate" | "endDate">;
      }>;
    };
  }>;
};

interface CoachStudentsListProps {
  coachId: string;
}

export default function CoachStudentsList({ coachId }: CoachStudentsListProps) {
  const router = useRouter();
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [itemsPerPage] = useState(10);

  const fetchStudents = async (searchTermParam = "", pageParam = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTermParam) params.append("search", searchTermParam);
      if (pageParam > 1) params.append("page", pageParam.toString());
      params.append("limit", itemsPerPage.toString());

      const response = await fetch(
        `/api/admin/coaches/${coachId}/students?${params}`,
      );

      if (response.ok) {
        const data = await response.json();
        setStudents(data.data);
        if (data.pagination) {
          setCurrentPage(data.pagination.page);
          setTotalPages(data.pagination.totalPages);
          setTotalStudents(data.pagination.total);
        }
      } else {
        setError("학생 목록을 불러올 수 없습니다.");
      }
    } catch (error) {
      setError("학생 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 초기 로딩
  useEffect(() => {
    fetchStudents("", 1);
  }, [coachId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchStudents(searchTerm, page);
  };

  const handleSearch = () => {
    fetchStudents(searchTerm, 1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              소속 학생 목록
            </h3>
          </div>
        </div>
        <div className="px-6 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            소속 학생 목록
          </h3>
        </div>
        <div className="px-6 py-8 text-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            소속 학생 목록
          </h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="학생 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              검색
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-hidden">
        {students.length > 0 ? (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이메일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    전화번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    소속 기관
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    소속 그룹
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    참여 과정
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((user) => (
                  <tr
                    key={`user-${user.id}`}
                    onClick={() => {
                      router.push(`/dashboard/users/${user.id}`);
                    }}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name || "사용자 프로필"}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-700">
                                {user.name?.charAt(0) ||
                                  user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || "이름 없음"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.phone || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.organizations.length > 0
                          ? user.organizations
                            .map((org) => org.organization.name)
                            .join(", ")
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.groupMemberships.map((membership) => (
                          <span
                            key={`membership-group-${membership.group.id}`}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            {membership.group.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.groupMemberships.map((membership) =>
                          membership.group.courses.map((course) => (
                            <span
                              key={course.course.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {course.course.name}
                            </span>
                          )),
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalStudents}
                hasMore={currentPage < totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
              />
            )}
          </>
        ) : (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-500">
              {searchTerm
                ? "검색 결과가 없습니다."
                : "담당 과정에 참여하는 사용자가 없습니다."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
