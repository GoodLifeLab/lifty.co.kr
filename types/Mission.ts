import { Prisma } from "@prisma/client";

// Prisma에서 생성되는 타입 사용
export type Mission = Prisma.MissionGetPayload<{
  include: {
    course: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}> & {
  totalParticipants?: number;
  completedCount?: number;
};

// 미션 생성용 타입
export type CreateMissionData = {
  title: string;
  shortDesc: string;
  detailDesc: string;
  placeholder?: string;
  dueDate: Date;
  image?: string;
  isPublic: boolean;
  courseId: string;
  subMissions: string[];
};

// 미션 참여자 수행 관련 타입
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
  progress: {
    id: string;
    status: "pending" | "completed" | "overdue";
    createdAt: Date;
    contentsDate?: Date;
    checkedAt?: Date;
  };
}

// Prisma에서 생성되는 UserMissionProgress 타입 사용
export type UserMissionProgress = Prisma.UserMissionProgressGetPayload<{
  include: {
    mission: true;
    user: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;
