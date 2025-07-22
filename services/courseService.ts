interface Course {
  id: string;
  name: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  groups: Array<{
    id: number;
    name: string;
  }>;
}

interface CreateCourseData {
  name: string;
  startDate: string;
  endDate: string;
  groupIds: number[];
}

interface UpdateCourseData extends CreateCourseData {
  id: string;
}

interface PaginationResponse<T> {
  courses?: T[];
  data?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export class CourseService {
  private static baseUrl = "/api/courses";

  // 코스 목록 조회 (페이지네이션, 검색 지원)
  static async getCourses(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginationResponse<Course>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.search) searchParams.append("search", params.search);

    const response = await fetch(`${this.baseUrl}?${searchParams}`);

    if (!response.ok) {
      throw new Error("코스 목록을 조회할 수 없습니다.");
    }

    return response.json();
  }

  // 전체 코스 목록 조회 (통계용)
  static async getAllCourses(): Promise<Course[]> {
    const response = await fetch(`${this.baseUrl}?page=1&limit=1000`);

    if (!response.ok) {
      throw new Error("전체 코스 목록을 조회할 수 없습니다.");
    }

    const data = await response.json();
    return data.courses || [];
  }

  // 단일 코스 조회
  static async getCourse(id: string): Promise<Course> {
    const response = await fetch(`${this.baseUrl}/${id}`);

    if (!response.ok) {
      throw new Error("코스를 조회할 수 없습니다.");
    }

    return response.json();
  }

  // 코스 생성
  static async createCourse(data: CreateCourseData): Promise<Course> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("프로젝트를 생성할 수 없습니다.");
    }

    return response.json();
  }

  // 코스 수정
  static async updateCourse(data: UpdateCourseData): Promise<Course> {
    const response = await fetch(`${this.baseUrl}/${data.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("프로젝트를 수정할 수 없습니다.");
    }

    return response.json();
  }

  // 코스 삭제
  static async deleteCourse(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("프로젝트를 삭제할 수 없습니다.");
    }
  }
} 