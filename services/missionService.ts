import { Mission, CreateMissionData } from "@/types/Mission";

const API_BASE_URL = "/api/missions";

export const missionService = {
  // 미션 목록 조회
  async getMissions(params?: {
    courseId?: string;
    isPublic?: boolean;
  }): Promise<Mission[]> {
    const searchParams = new URLSearchParams();
    if (params?.courseId) searchParams.append("courseId", params.courseId);
    if (params?.isPublic !== undefined)
      searchParams.append("isPublic", params.isPublic.toString());

    const response = await fetch(`${API_BASE_URL}?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error("미션 목록을 조회할 수 없습니다.");
    }
    return response.json();
  },

  // 특정 미션 조회
  async getMission(id: string): Promise<Mission> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error("미션을 조회할 수 없습니다.");
    }
    return response.json();
  },

  // 미션 생성
  async createMission(data: CreateMissionData): Promise<Mission> {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "미션 생성에 실패했습니다.");
    }

    return response.json();
  },

  // 미션 수정
  async updateMission(id: string, data: CreateMissionData): Promise<Mission> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "미션 수정에 실패했습니다.");
    }

    return response.json();
  },

  // 미션 삭제
  async deleteMission(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "미션 삭제에 실패했습니다.");
    }
  },
};
