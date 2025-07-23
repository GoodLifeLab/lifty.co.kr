"use client";

import { FlagIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Mission } from "@/types/Mission";
import { useRouter } from "next/navigation";

interface MissionTableProps {
  missions: Mission[];
  onCreateNew?: () => void;
  showCreateButton?: boolean;
}

export default function MissionTable({
  missions,
  onCreateNew,
  showCreateButton = false,
}: MissionTableProps) {
  const router = useRouter();
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR");
  };

  if (missions.length === 0) {
    return (
      <div className="text-center py-12">
        <FlagIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          아직 미션이 없습니다
        </h3>
        <p className="text-gray-600 mb-4">첫 번째 미션을 만들어보세요!</p>
        {showCreateButton && onCreateNew && (
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center mx-auto"
          >
            <PlusIcon className="h-4 w-4 mr-2" />새 미션 만들기
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
            미션명
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            과정
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            수행일자
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            공개여부
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            하위미션
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            생성일
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {missions.map((mission) => (
          <tr
            key={mission.id}
            className="hover:bg-gray-50 cursor-pointer"
            onClick={() => router.push(`/dashboard/missions/${mission.id}`)}
          >
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                {mission.image && (
                  <img
                    src={mission.image}
                    alt={mission.title}
                    className="h-10 w-10 rounded-lg object-cover mr-4"
                  />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {mission.title}
                  </div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {mission.shortDesc}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {mission.course?.name || "연결된 과정 없음"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {formatDate(mission.dueDate)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  mission.isPublic
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {mission.isPublic ? "공개" : "비공개"}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {mission.subMissions?.length || 0}개
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {formatDate(mission.createdAt)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
