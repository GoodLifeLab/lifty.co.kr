import {
  Course,
  GroupMember,
  Mission,
  UserMissionProgress,
} from "@prisma/client";

import { Group } from "@prisma/client";

import { User } from "@prisma/client";

type UserWithOrganizations = User & {
  organizations: Array<{
    organization: {
      id: string;
      name: string;
      department: string;
    };
    role?: string;
  }>;
};

export interface CourseWithGroups extends Course {
  groups: Group[];
}

export interface CourseWithGroupsAndMissions extends Course {
  groups: (Group & {
    totalMembers: number;
  })[];
  missions: (Mission & {
    userProgress: UserMissionProgress[];
  })[];
}

export type GroupWithMembers = Group & {
  memberships: (GroupMember & {
    user: UserWithOrganizations;
  })[];
};
