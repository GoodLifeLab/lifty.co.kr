"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserGroupIcon,
  GlobeAltIcon,
  LockClosedIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import CreateGroupModal from "@/app/components/CreateGroupModal";
import StatsCard from "@/components/StatsCard";
import GroupTable from "@/components/GroupTable";
import { GroupService } from "@/services/groupService";

interface Group {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  image?: string;
  createdAt: string;
  memberships?: Array<{
    id: number;
    userId: string;
    role: string;
    user: {
      id: string;
      name?: string;
      email: string;
    };
  }>;
}

export default function GroupsPage() {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  // 그룹 목록 가져오기
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await GroupService.getGroups();
      setGroups(data.groups || []);
    } catch (error) {
      console.error("그룹 목록 조회 오류:", error);
      alert("그룹 목록을 가져오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 새 그룹 생성
  const handleCreateGroup = async (groupData: {
    name: string;
    description: string;
    isPublic: boolean;
    image?: string;
    memberIds: string[];
  }) => {
    try {
      setCreating(true);
      await GroupService.createGroup(groupData);
      alert("그룹이 성공적으로 생성되었습니다.");

      // 그룹 목록 새로고침
      await fetchGroups();

      // 모달 닫기
      setShowCreateGroup(false);
    } catch (error) {
      console.error("그룹 생성 오류:", error);
      alert(
        error instanceof Error ? error.message : "그룹 생성에 실패했습니다.",
      );
      throw error; // 모달에서 에러 처리할 수 있도록 다시 던짐
    } finally {
      setCreating(false);
    }
  };

  // 그룹 클릭 처리
  const handleGroupClick = (groupId: number) => {
    router.push(`/dashboard/groups/${groupId}`);
  };

  // 컴포넌트 마운트 시 그룹 목록 가져오기
  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">그룹 관리</h1>
          <p className="text-gray-600">
            팀과 그룹을 관리하고 구성원을 초대하세요
          </p>
        </div>
        <button
          onClick={() => setShowCreateGroup(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />새 그룹 만들기
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="총 그룹"
          value={loading ? "..." : groups.length}
          icon={<UserGroupIcon className="h-8 w-8 text-indigo-600" />}
          loading={loading}
        />
        <StatsCard
          title="공개 그룹"
          value={loading ? "..." : groups.filter((g) => g.isPublic).length}
          icon={<GlobeAltIcon className="h-8 w-8 text-green-600" />}
          loading={loading}
        />
        <StatsCard
          title="비공개 그룹"
          value={loading ? "..." : groups.filter((g) => !g.isPublic).length}
          icon={<LockClosedIcon className="h-8 w-8 text-gray-600" />}
          loading={loading}
        />
      </div>

      {/* 그룹 목록 테이블 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">내 그룹</h3>
        </div>
        <GroupTable
          groups={groups}
          loading={loading}
          onGroupClick={handleGroupClick}
          onCreateNew={() => setShowCreateGroup(true)}
          showCreateButton={true}
        />
      </div>

      {/* 그룹 생성 모달 */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onSubmit={handleCreateGroup}
        loading={creating}
      />
    </div>
  );
}
