"use client";

import { useState, useEffect } from "react";
import { MissionParticipant } from "@/types/Mission";
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface MissionParticipantsListProps {
  missionId: string;
}

interface ParticipantsData {
  participants: MissionParticipant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    pending: number;
    in_progress: number;
    completed: number;
    overdue: number;
  };
}

const statusConfig = {
  pending: {
    label: "대기중",
    color: "bg-gray-300 text-gray-800",
    icon: ClockIcon,
  },
  completed: {
    label: "완료",
    color: "bg-green-100 text-green-800",
    icon: CheckCircleIcon,
  },
  overdue: {
    label: "기한 초과",
    color: "bg-red-100 text-red-800",
    icon: ExclamationTriangleIcon,
  },
};

export default function MissionParticipantsList({
  missionId,
}: MissionParticipantsListProps) {
  const [data, setData] = useState<ParticipantsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  useEffect(() => {
    fetchParticipants();
  }, [missionId, currentPage, selectedStatus]);

  const fetchParticipants = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(selectedStatus && { status: selectedStatus }),
      });

      const response = await fetch(
        `/api/missions/${missionId}/participants?${params}`,
      );
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("참여자 목록 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR");
  };

  const handleViewAnswer = (participant: MissionParticipant) => {
    // TODO: 답변 보기 모달 또는 페이지로 이동
    console.log("답변 보기:", participant);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500 text-center">
          참여자 정보를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            미션 참여자 ({data.pagination.total}명)
          </h3>

          {/* 상태 필터 */}
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedStatus("")}
              className={`px-3 py-1 text-sm rounded-full ${
                selectedStatus === ""
                  ? "bg-indigo-100 text-indigo-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              전체
            </button>
            {Object.entries(statusConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedStatus(key)}
                className={`px-3 py-1 text-sm rounded-full flex items-center space-x-1 ${
                  selectedStatus === key
                    ? config.color
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <config.icon className="h-4 w-4" />
                <span>{config.label}</span>
                <span className="ml-1">
                  ({data.stats[key as keyof typeof data.stats]})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                소속
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                그룹
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                완료일자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                글 작성 일자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                내용
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.participants.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">
                  <UserIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">아직 참여자가 없습니다.</p>
                </td>
              </tr>
            ) : (
              data.participants.map((participant) => {
                return (
                  <tr key={participant.id} className="hover:bg-gray-50">
                    {/* 이름 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {participant.user.name}
                      </div>
                    </td>

                    {/* 소속 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {participant.user.organizations &&
                      participant.user.organizations.length > 0 ? (
                        <div className="font-medium text-gray-900">
                          {participant.user.organizations[0].organization.name}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>

                    {/* 그룹 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {participant.group.name}
                    </td>

                    {/* 수행일자 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {participant.progress.createdAt ? (
                        formatDate(participant.progress.createdAt)
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>

                    {/* 글 작성 일자 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {participant.progress.contentsDate ? (
                        formatDate(participant.progress.contentsDate)
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>

                    {/* 답변 보기 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {participant.progress.status === "completed" ? (
                        <button
                          onClick={() => handleViewAnswer(participant)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          답변 보기
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {data.pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              이전
            </button>

            <span className="text-sm text-gray-700">
              {currentPage} / {data.pagination.totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(data.pagination.totalPages, prev + 1),
                )
              }
              disabled={currentPage === data.pagination.totalPages}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
