import { Course, GroupMember } from "@prisma/client";

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

export type GroupWithMembers = Group & {
  memberships: (GroupMember & {
    user: UserWithOrganizations;
  })[];
};
