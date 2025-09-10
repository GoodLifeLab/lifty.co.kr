import Link from "next/link";
import {
  AcademicCapIcon,
  CalendarIcon,
  UserGroupIcon,
  EyeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import StatusBadge from "./StatusBadge";
import { getCourseStatus } from "@/utils/courseUtils";
import { CourseWithGroups } from "@/types/Group";

interface CourseTableProps {
  courses: CourseWithGroups[];
  loading: boolean;
  onCreateNew?: () => void;
  showCreateButton?: boolean;
}

export default function CourseTable({
  courses,
  loading,
  onCreateNew,
  showCreateButton = false,
}: CourseTableProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">프로젝트 목록을 불러오는 중...</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <AcademicCapIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          아직 프로젝트가 없습니다
        </h3>
        <p className="text-gray-600 mb-4">첫 번째 프로젝트를 만들어보세요!</p>
        {showCreateButton && onCreateNew && (
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center mx-auto"
          >
            <PlusIcon className="h-4 w-4 mr-2" />새 프로젝트 만들기
          </button>
        )}
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            과정명
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            시작일
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            마감일
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            참여그룹
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            상태
          </th>
          <th className="relative px-6 py-3">
            <span className="sr-only">상세보기</span>
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {courses.map((course) => (
          <tr
            key={course.id}
            className="hover:bg-gray-50 cursor-pointer"
            onClick={() =>
              (window.location.href = `/dashboard/courses/${course.id}`)
            }
          >
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <AcademicCapIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {course.name}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center text-sm text-gray-900">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {new Date(course.startDate).toLocaleDateString()}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center text-sm text-gray-900">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {new Date(course.endDate).toLocaleDateString()}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex flex-wrap gap-1">
                {course.groups.length > 0 ? (
                  course.groups.map((group) => (
                    <span
                      key={group.id}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {group.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">참여 그룹 없음</span>
                )}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <StatusBadge
                status={getCourseStatus(course.startDate, course.endDate)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
