interface Organization {
  id: string;
  name: string;
  department: string;
  contactName?: string;
  contactPhone?: string;
  code: string;
  emailDomain?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateOrganizationData {
  name: string;
  department: string;
  contactName?: string;
  contactPhone?: string;
  emailDomain?: string;
}

interface UpdateOrganizationData extends CreateOrganizationData {}

export class OrganizationService {
  private static baseUrl = "/api/organizations";

  // 조직 목록 조회
  static async getOrganizations(): Promise<Organization[]> {
    const response = await fetch(this.baseUrl);

    if (!response.ok) {
      throw new Error("조직 목록을 조회할 수 없습니다.");
    }

    return response.json();
  }

  // 단일 조직 조회
  static async getOrganization(id: string): Promise<Organization> {
    const response = await fetch(`${this.baseUrl}/${id}`);

    if (!response.ok) {
      throw new Error("조직을 조회할 수 없습니다.");
    }

    return response.json();
  }

  // 조직 생성
  static async createOrganization(
    data: CreateOrganizationData,
  ): Promise<Organization> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "조직을 생성할 수 없습니다.");
    }

    return response.json();
  }

  // 조직 수정
  static async updateOrganization(
    id: string,
    data: UpdateOrganizationData,
  ): Promise<Organization> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "조직을 수정할 수 없습니다.");
    }

    return response.json();
  }

  // 조직 삭제
  static async deleteOrganization(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("조직을 삭제할 수 없습니다.");
    }
  }

  // 조직 가입
  static async joinOrganization(code: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "조직 가입에 실패했습니다.");
    }
  }

  // 조직 탈퇴
  static async leaveOrganization(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/leave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ organizationId: id }),
    });

    if (!response.ok) {
      throw new Error("조직 탈퇴에 실패했습니다.");
    }
  }
}
