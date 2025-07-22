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

interface CreateGroupData {
  name: string;
  description: string;
  isPublic: boolean;
  image?: string;
  memberIds: string[];
}

interface UpdateGroupData {
  name?: string;
  description?: string;
  isPublic?: boolean;
  image?: string;
}

export class GroupService {
  private static baseUrl = "/api/groups";

  // 그룹 목록 조회
  static async getGroups(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ groups: Group[]; pagination?: any }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);

    const url = searchParams.toString()
      ? `${this.baseUrl}?${searchParams}`
      : this.baseUrl;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("그룹 목록을 조회할 수 없습니다.");
    }

    return response.json();
  }

  // 단일 그룹 조회
  static async getGroup(id: number): Promise<Group> {
    const response = await fetch(`${this.baseUrl}/${id}`);

    if (!response.ok) {
      throw new Error("그룹을 조회할 수 없습니다.");
    }

    return response.json();
  }

  // 그룹 생성
  static async createGroup(data: CreateGroupData): Promise<Group> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "그룹을 생성할 수 없습니다.");
    }

    return response.json();
  }

  // 그룹 수정
  static async updateGroup(id: number, data: UpdateGroupData): Promise<Group> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("그룹을 수정할 수 없습니다.");
    }

    return response.json();
  }

  // 그룹 삭제
  static async deleteGroup(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("그룹을 삭제할 수 없습니다.");
    }
  }

  // 그룹 멤버 초대
  static async inviteMembers(
    groupId: number,
    memberIds: string[],
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${groupId}/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memberIds }),
    });

    if (!response.ok) {
      throw new Error("멤버 초대에 실패했습니다.");
    }
  }

  // 그룹 멤버 제거
  static async removeMember(groupId: number, memberId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/${groupId}/members/${memberId}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      throw new Error("멤버 제거에 실패했습니다.");
    }
  }
}
