export interface Mission {
  id: string;
  title: string;
  shortDesc: string;
  detailDesc: string;
  placeholder?: string;
  dueDate: Date;
  image?: string;
  isPublic: boolean;
  courseId: string;
  course?: {
    id: string;
    name: string;
  };
  subMissions?: SubMission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SubMission {
  id: string;
  missionId: string;
  text: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMissionData {
  title: string;
  shortDesc: string;
  detailDesc: string;
  placeholder?: string;
  dueDate: Date;
  image?: string;
  isPublic: boolean;
  courseId: string;
  subMissions: Omit<
    SubMission,
    "id" | "missionId" | "createdAt" | "updatedAt"
  >[];
}

// 미션 참여자 수행 관련 타입 (기존 UserMissionProgress 기반)
export interface MissionParticipant {
  id: string;
  userId: string;
  missionId: string;
  user: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
    position?: string;
    organizations: {
      organization: {
        id: string;
        name: string;
        department: string;
      };
    }[];
  };
  group: {
    id: string;
    name: string;
  };
  status: "pending" | "in_progress" | "completed" | "overdue";
  startedAt?: Date;
  completedAt?: Date;
  subMissionProgress: SubMissionProgress[];
  createdAt: Date;
  updatedAt: Date;
  hasStarted: boolean; // 미션을 시작했는지 여부
}

export interface SubMissionProgress {
  id: string;
  userId: string;
  subMissionId: string;
  isChecked: boolean;
  checkedAt?: Date;
  subMission: {
    id: string;
    text: string;
    order: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserMissionProgress {
  id: string;
  userId: string;
  missionId: string;
  contents?: string;
  images: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  mission?: Mission;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface UserSubMissionProgress {
  id: string;
  userId: string;
  subMissionId: string;
  isChecked: boolean;
  checkedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  subMission?: SubMission;
}
