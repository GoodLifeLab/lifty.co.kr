"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";
import MissionModal from "@/components/MissionModal";
import { Mission, CreateMissionData } from "@/types/Mission";
import { missionService } from "@/services/missionService";
import RichTextViewer from "@/components/RichTextViewer";
import MissionParticipantsList from "@/components/MissionParticipantsList";

interface MissionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function MissionDetailPage({ params }: MissionDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchMission();
  }, [id]);

  const fetchMission = async () => {
    try {
      setIsLoading(true);
      const missionData = await missionService.getMission(id);
      setMission(missionData);
    } catch (error) {
      console.error("미션 조회 오류:", error);
      alert("미션을 불러오는데 실패했습니다.");
      router.push("/dashboard/missions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!mission) return;

    if (!confirm("정말로 이 미션을 삭제하시겠습니까?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await missionService.deleteMission(mission.id);
      alert("미션이 삭제되었습니다.");
      router.push("/dashboard/missions");
    } catch (error) {
      console.error("미션 삭제 오류:", error);
      alert("미션 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMissionSave = async (missionData: CreateMissionData) => {
    if (!mission) return;

    try {
      const updatedMission = await missionService.updateMission(
        mission.id,
        missionData,
      );
      setMission(updatedMission);
      setIsModalOpen(false);
      alert("미션이 수정되었습니다.");
    } catch (error) {
      console.error("미션 수정 오류:", error);
      alert("미션 수정에 실패했습니다.");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="text-center py-12">
        <FlagIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          미션을 찾을 수 없습니다
        </h3>
        <p className="text-gray-600 mb-4">
          요청하신 미션이 존재하지 않거나 삭제되었습니다.
        </p>
        <button
          onClick={() => router.push("/dashboard/missions")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          미션 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/dashboard/missions")}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mission.title}
            </h1>
            <p className="text-gray-600">미션 상세 정보</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            수정
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            {isDeleting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>

      {/* 미션 정보 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽: 기본 정보 */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                기본 정보
              </h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">미션명</dt>
                  <dd className="text-sm text-gray-900">{mission.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">과정</dt>
                  <dd className="text-sm text-gray-900">
                    {mission.course?.name || "연결된 과정 없음"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    수행일자
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {formatDate(mission.dueDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    공개여부
                  </dt>
                  <dd className="text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${mission.isPublic
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {mission.isPublic ? "공개" : "비공개"}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">설명</h3>
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    간략 설명
                  </dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {mission.shortDesc}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    상세 설명
                  </dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    <RichTextViewer content={mission.detailDesc} />
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 이미지 및 하위 미션 */}
          <div className="space-y-4">
            {/* 미션 이미지 */}
            {mission.image && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  미션 이미지
                </h3>
                <div className="relative">
                  <img
                    src={mission.image}
                    alt={mission.title}
                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              </div>
            )}

            {/* 하위 미션 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                하위 미션 ({mission.subMissions?.length || 0}개)
              </h3>
              {mission.subMissions && mission.subMissions.length > 0 ? (
                <div className="space-y-2">
                  {mission.subMissions.map((subMission, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {subMission}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">하위 미션이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 미션 참여자 목록 */}
      <MissionParticipantsList missionId={id} />

      {/* 수정 모달 */}
      <MissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleMissionSave}
        mission={mission}
      />
    </div>
  );
}
