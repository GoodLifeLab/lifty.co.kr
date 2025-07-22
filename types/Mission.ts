export interface Mission {
  id: string;
  title: string;
  dueDate: Date;
  image?: string;
  shortDesc: string;
  detailDesc: string;
  placeholder?: string;
  courseId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  subMissions?: SubMission[];
  course?: {
    id: string;
    name: string;
  };
}

export interface CreateMissionData {
  title: string;
  dueDate: Date;
  image?: string;
  shortDesc: string;
  detailDesc: string;
  placeholder?: string;
  courseId: string;
  isPublic: boolean;
  subMissions?: Omit<
    SubMission,
    "id" | "missionId" | "createdAt" | "updatedAt"
  >[];
}

export interface SubMission {
  id: string;
  text: string;
  missionId: string;
  order: number;
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
