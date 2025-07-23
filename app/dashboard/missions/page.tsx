"use client";

import { useState, useEffect } from "react";
import { PlusIcon, FlagIcon } from "@heroicons/react/24/outline";
import MissionModal from "@/components/MissionModal";
import MissionTable from "@/components/MissionTable";
import StatsCard from "@/components/StatsCard";
import { Mission, CreateMissionData } from "@/types/Mission";
import { missionService } from "@/services/missionService";

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const data = await missionService.getMissions();
      setMissions(data);
    } catch (error) {
      console.error("미션 목록 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMission = () => {
    setSelectedMission(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMission(null);
  };

  const handleMissionSave = async (missionData: CreateMissionData) => {
    try {
      if (selectedMission) {
        await missionService.updateMission(selectedMission.id, missionData);
        alert("미션이 수정되었습니다.");
      } else {
        await missionService.createMission(missionData);
        alert("미션이 생성되었습니다.");
      }

      await fetchMissions();
      handleModalClose();
    } catch (error) {
      console.error("미션 저장 오류:", error);
      alert(
        error instanceof Error
          ? error.message
          : "미션 저장 중 오류가 발생했습니다.",
      );
    }
  };

  // 통계 계산
  const stats = {
    total: missions.length,
    public: missions.filter((m) => m.isPublic).length,
    private: missions.filter((m) => !m.isPublic).length,
    withSubMissions: missions.filter((m) => (m.subMissions?.length || 0) > 0)
      .length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">미션 관리</h1>
          <p className="text-gray-600">
            과정별 미션을 생성하고 관리할 수 있습니다
          </p>
        </div>
        <button
          onClick={handleCreateMission}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          미션 생성
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="전체 미션"
          value={stats.total}
          icon={<FlagIcon className="h-8 w-8 text-indigo-600" />}
        />
        <StatsCard
          title="공개 미션"
          value={stats.public}
          icon={
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <FlagIcon className="h-4 w-4 text-green-600" />
            </div>
          }
        />
        <StatsCard
          title="비공개 미션"
          value={stats.private}
          icon={
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <FlagIcon className="h-4 w-4 text-yellow-600" />
            </div>
          }
        />
        <StatsCard
          title="하위미션 포함"
          value={stats.withSubMissions}
          icon={
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <FlagIcon className="h-4 w-4 text-purple-600" />
            </div>
          }
        />
      </div>

      {/* 미션 테이블 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <MissionTable
          missions={missions}
          onCreateNew={handleCreateMission}
          showCreateButton={true}
        />
      </div>

      <MissionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleMissionSave}
        mission={selectedMission}
      />
    </div>
  );
}
