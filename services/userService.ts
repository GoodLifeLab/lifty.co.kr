interface User {
  id: string;
  email: string;
  name?: string;
  position?: string;
  createdAt: string;
  organizations: Array<{
    organization: {
      id: string;
      name: string;
      department: string;
    };
    role?: string;
  }>;
  groupMemberships: Array<{
    group: {
      id: number;
      name: string;
      description?: string;
    };
    role: string;
  }>;
  _count: {
    groupMemberships: number;
  };
}

interface PaginationResponse<T> {
  users: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class UserService {
  private static baseUrl = "/api/users";

  // 사용자 목록 조회 (페이지네이션, 검색 지원)
  static async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginationResponse<User>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.search) searchParams.append("search", params.search);

    const response = await fetch(`${this.baseUrl}?${searchParams}`);

    if (!response.ok) {
      throw new Error("사용자 목록을 조회할 수 없습니다.");
    }

    return response.json();
  }

  // 단일 사용자 조회
  static async getUser(id: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${id}`);

    if (!response.ok) {
      throw new Error("사용자를 조회할 수 없습니다.");
    }

    return response.json();
  }

  // 사용자 생성
  static async createUser(data: {
    email: string;
    name?: string;
    position?: string;
  }): Promise<User> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("사용자를 생성할 수 없습니다.");
    }

    return response.json();
  }

  // 사용자 수정
  static async updateUser(
    id: string,
    data: {
      name?: string;
      position?: string;
    },
  ): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("사용자를 수정할 수 없습니다.");
    }

    return response.json();
  }

  // 사용자 삭제
  static async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("사용자를 삭제할 수 없습니다.");
    }
  }
}
