"use client";

import { useState, useEffect } from "react";
import {
  PlusIcon,
  FlagIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import MissionModal from "@/components/MissionModal";
import MissionTable from "@/components/MissionTable";
import StatsCard from "@/components/StatsCard";
import { Mission, CreateMissionData } from "@/types/Mission";
import { missionService } from "@/services/missionService";

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [filteredMissions, setFilteredMissions] = useState<Mission[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const data = await missionService.getMissions();
      setMissions(data);
      setFilteredMissions(data);
    } catch (error) {
      console.error("미션 목록 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색 기능
  const handleSearch = () => {
    let filtered = missions;

    // 텍스트 검색
    if (appliedSearchTerm.trim()) {
      filtered = filtered.filter((mission) => {
        const titleMatch = mission.title
          .toLowerCase()
          .includes(appliedSearchTerm.toLowerCase());
        const courseMatch = mission.course?.name
          ?.toLowerCase()
          .includes(appliedSearchTerm.toLowerCase());
        return titleMatch || courseMatch;
      });
    }

    // 상태 필터
    if (selectedStatus) {
      filtered = filtered.filter((mission) => {
        if (selectedStatus === "public") {
          return mission.isPublic;
        } else if (selectedStatus === "private") {
          return !mission.isPublic;
        }
        return true;
      });
    }

    setFilteredMissions(filtered);
  };

  // 검색 버튼 클릭 시 검색어 적용
  const handleSearchButtonClick = () => {
    setAppliedSearchTerm(searchTerm);
  };

  // 상태 변경 시 자동 검색
  useEffect(() => {
    handleSearch();
  }, [appliedSearchTerm, selectedStatus, missions]);

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
    total: filteredMissions.length,
    public: filteredMissions.filter((m) => m.isPublic).length,
    private: filteredMissions.filter((m) => !m.isPublic).length,
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>

      {/* 검색 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                placeholder="미션 제목 또는 과정명으로 검색..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearchButtonClick();
                  }
                }}
              />
              <button
                onClick={handleSearchButtonClick}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                검색
              </button>
            </div>
          </div>
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              공개 여부
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">전체</option>
              <option value="public">공개</option>
              <option value="private">비공개</option>
            </select>
          </div>
        </div>
      </div>

      {/* 미션 테이블 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <MissionTable
          missions={filteredMissions}
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
