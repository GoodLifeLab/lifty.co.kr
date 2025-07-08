import { GroupMember } from "@prisma/client";

import { Group } from "@prisma/client";

import { User } from "@prisma/client";

export type GroupWithMembers = Group & {
  memberships: (GroupMember & {
    user: User;
  })[];
};
