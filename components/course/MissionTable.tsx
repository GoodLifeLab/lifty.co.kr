import { useState } from "react";
import { useRouter } from "next/navigation";
import MissionModal from "../MissionModal";
import Pagination from "../Pagination";
import { usePagination } from "@/hooks/usePagination";
import { MissionWithUserProgressCount } from "@/types/Mission";

export default function MissionTable({
  id,
  course,
}: {
  id: string;
  course?: { id: string; name: string };
}) {
  const router = useRouter();

  const {
    data: missions,
    loading,
    currentPage,
    totalPages,
    totalItems,
    hasMore,
    searchTerm,
    setSearchTerm,
    executeSearch,
    goToPage,
    goToNextPage,
    goToPrevPage,
    refresh,
  } = usePagination<MissionWithUserProgressCount>(
    `/api/courses/${id}/missions`,
    { limit: 10 },
  );

  // 미션 모달 관련 상태
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [editingMission, setEditingMission] = useState<any>(null);

  // 미션 저장
  const handleMissionSave = async (missionData: any) => {
    try {
      const url = editingMission
        ? `/api/missions/${editingMission.id}`
        : "/api/missions";
      const method = editingMission ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...missionData,
          courseId: id, // 현재 과정 ID로 설정
        }),
      });

      if (response.ok) {
        setShowMissionModal(false);
        setEditingMission(null);
        refresh(); // 미션 목록 새로고침
      } else {
        const error = await response.json();
        alert(error.message || "미션 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("미션 저장 오류:", error);
      alert("미션 저장에 실패했습니다.");
    }
  };

  return (
    <>
      {/* 미션 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">미션 목록</h3>
            <p className="text-sm text-gray-600">
              프로젝트의 모든 미션을 확인할 수 있습니다.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingMission(null);
              setShowMissionModal(true);
            }}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            미션 등록
          </button>
        </div>

        {/* 검색 */}
        <div className="mb-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                검색
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="미션제목으로 검색..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      executeSearch();
                    }
                  }}
                />
                <button
                  onClick={executeSearch}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  검색
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 미션 테이블 */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">미션 목록을 불러오는 중...</p>
          </div>
        ) : missions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    미션제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수행 일자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    공개 상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    응답자 수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수행률
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {missions.map((mission) => (
                  <tr
                    key={mission.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/missions/${mission.id}`)
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {mission.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(mission.dueDate).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {mission.isPublic ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          공개
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          비공개
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mission.totalParticipants}명
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{
                              width: `${mission.totalParticipants > 0 ? (mission.completedCount / mission.totalParticipants) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {mission.totalParticipants > 0
                            ? Math.round(
                                (mission.completedCount /
                                  mission.totalParticipants) *
                                  100,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500">등록된 미션이 없습니다.</p>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              hasMore={false}
              onPageChange={goToPage}
            />
          </div>
        )}
      </div>

      {/* 미션 모달 */}
      <MissionModal
        isOpen={showMissionModal}
        onClose={() => {
          setShowMissionModal(false);
          setEditingMission(null);
        }}
        onSave={handleMissionSave}
        mission={editingMission}
        course={course}
      />
    </>
  );
}
