import { Group, Organization, User } from "@prisma/client";

export interface UserWithOrganizations extends User {
  organizations: Array<{
    organization: Organization;
    role: string;
  }>;
  groupMemberships: Array<{
    group: Group;
    role: string;
  }>;
}

export interface Coach extends UserWithOrganizations {
  role: "COACH";
  _count: {
    groupMemberships: number;
    organizations: number;
  };
}
