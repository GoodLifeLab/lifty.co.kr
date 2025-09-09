import { GroupWithMembers } from "@/types/Group";
import {
  UserGroupIcon,
  GlobeAltIcon,
  LockClosedIcon,
  UserIcon,
  PlusIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

interface GroupTableProps {
  groups: GroupWithMembers[];
  loading: boolean;
  onGroupClick: (groupId: number) => void;
  onCreateNew?: () => void;
  showCreateButton?: boolean;
}

export default function GroupTable({
  groups,
  loading,
  onGroupClick,
  onCreateNew,
  showCreateButton = false,
}: GroupTableProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">그룹 목록을 불러오는 중...</p>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <UserGroupIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          아직 그룹이 없습니다
        </h3>
        <p className="text-gray-600 mb-4">첫 번째 그룹을 만들어보세요!</p>
        {showCreateButton && onCreateNew && (
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center mx-auto"
          >
            <PlusIcon className="h-4 w-4 mr-2" />새 그룹 만들기
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
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
              시작일
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              종료일
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
              onClick={() => onGroupClick(group.id)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {group.name}
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
                  {(group as any).startDate
                    ? new Date((group as any).startDate).toLocaleDateString()
                    : "미설정"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-900">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {(group as any).endDate
                    ? new Date((group as any).endDate).toLocaleDateString()
                    : "미설정"}
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
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${group.isPublic
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
    </div>
  );
}
