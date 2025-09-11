import { useState, useEffect, useCallback } from "react";

interface PaginationData<T> {
  courses?: T[];
  users?: T[];
  groups?: T[];
  data?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

interface UsePaginationOptions {
  limit?: number;
  initialSearch?: string;
  initialFilter?: Record<string, string>;
}

interface UsePaginationReturn<T> {
  data: T[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
  searchTerm: string;
  activeFilter: Record<string, string>;
  setActiveFilter: (filter: Record<string, string>) => void;
  setSearchTerm: (term: string) => void;
  executeSearch: () => void;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  refresh: () => void;
}

export function usePagination<T>(
  apiUrl: string,
  options: UsePaginationOptions = {},
): UsePaginationReturn<T> {
  const { limit = 10, initialSearch = "", initialFilter = {} } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeSearchTerm, setActiveSearchTerm] = useState(initialSearch);
  const [activeFilter, setActiveFilter] = useState(initialFilter);

  const fetchData = async (
    page: number,
    search: string,
    append: boolean = false,
  ) => {
    try {
      if (page === 1) {
        setLoading(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(Object.keys(activeFilter).length > 0 && { ...activeFilter }),
      });

      const response = await fetch(`${apiUrl}?${params}`);

      if (response.ok) {
        const result: PaginationData<T> = await response.json();

        // API 응답 구조에 따라 데이터 추출
        const responseData = result.users || result.groups || result.data || [];

        if (append) {
          setData((prev) => [...prev, ...responseData]);
        } else {
          setData(responseData);
        }

        setCurrentPage(result.pagination.page);
        setTotalPages(result.pagination.totalPages);
        setTotalItems(result.pagination.total);
        setHasMore(result.pagination.hasMore);
      }
    } catch (error) {
      console.error("데이터 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchData(page, searchTerm);
    }
  };

  const goToNextPage = () => {
    if (hasMore) {
      fetchData(currentPage + 1, searchTerm);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      fetchData(currentPage - 1, searchTerm);
    }
  };

  const refresh = () => {
    fetchData(1, activeSearchTerm);
  };

  const executeSearch = () => {
    setActiveSearchTerm(searchTerm);
  };

  // 활성 검색어가 변경될 때 첫 페이지부터 다시 로드
  useEffect(() => {
    fetchData(1, activeSearchTerm);
  }, [activeSearchTerm]);

  // 초기 로드
  useEffect(() => {
    fetchData(1, initialSearch);
  }, []);

  return {
    data,
    loading,
    currentPage,
    totalPages,
    totalItems,
    hasMore,
    searchTerm,
    activeFilter,
    setActiveFilter,
    setSearchTerm,
    executeSearch,
    goToPage,
    goToNextPage,
    goToPrevPage,
    refresh,
  };
}
