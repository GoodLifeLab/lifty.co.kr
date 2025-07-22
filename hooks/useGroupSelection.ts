import { useState, useEffect } from "react";

interface Group {
  id: number;
  name: string;
}

interface UseGroupSelectionReturn {
  groups: Group[];
  selectedGroups: Group[];
  groupsLoading: boolean;
  groupSearchLoading: boolean;
  groupSearchTerm: string;
  groupPage: number;
  hasMoreGroups: boolean;
  setSelectedGroups: (groups: Group[]) => void;
  setGroupSearchTerm: (term: string) => void;
  toggleGroupSelection: (group: Group) => void;
  removeSelectedGroup: (groupId: number) => void;
  handleGroupSearch: (searchTerm: string) => void;
  loadMoreGroups: () => void;
  fetchGroups: (page?: number, search?: string, append?: boolean) => void;
}

export function useGroupSelection(): UseGroupSelectionReturn {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupSearchTerm, setGroupSearchTerm] = useState("");
  const [groupPage, setGroupPage] = useState(1);
  const [hasMoreGroups, setHasMoreGroups] = useState(true);
  const [groupSearchLoading, setGroupSearchLoading] = useState(false);

  const fetchGroups = async (page = 1, search = "", append = false) => {
    try {
      if (page === 1) {
        setGroupsLoading(true);
      } else {
        setGroupSearchLoading(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
      });

      const response = await fetch(`/api/groups?${params}`);
      if (response.ok) {
        const data = await response.json();

        if (append) {
          setGroups((prev) => [...prev, ...data.groups]);
        } else {
          setGroups(data.groups || []);
        }

        setHasMoreGroups(data.pagination?.hasMore || false);
        setGroupPage(page);
      }
    } catch (error) {
      console.error("그룹 목록 조회 실패:", error);
    } finally {
      setGroupsLoading(false);
      setGroupSearchLoading(false);
    }
  };

  const handleGroupSearch = async (searchTerm: string) => {
    setGroupSearchTerm(searchTerm);
    await fetchGroups(1, searchTerm, false);
  };

  const loadMoreGroups = async () => {
    await fetchGroups(groupPage + 1, groupSearchTerm, true);
  };

  const toggleGroupSelection = (group: Group) => {
    const isSelected = selectedGroups.some((g) => g.id === group.id);
    if (isSelected) {
      setSelectedGroups(selectedGroups.filter((g) => g.id !== group.id));
    } else {
      setSelectedGroups([...selectedGroups, group]);
    }
  };

  const removeSelectedGroup = (groupId: number) => {
    setSelectedGroups(selectedGroups.filter((g) => g.id !== groupId));
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return {
    groups,
    selectedGroups,
    groupsLoading,
    groupSearchLoading,
    groupSearchTerm,
    groupPage,
    hasMoreGroups,
    setSelectedGroups,
    setGroupSearchTerm,
    toggleGroupSelection,
    removeSelectedGroup,
    handleGroupSearch,
    loadMoreGroups,
    fetchGroups,
  };
}
