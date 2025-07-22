import { GroupMember } from "@prisma/client";

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

export type GroupWithMembers = Group & {
  memberships: (GroupMember & {
    user: UserWithOrganizations;
  })[];
};
