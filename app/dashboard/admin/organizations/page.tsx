"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePagination } from "@/hooks/usePagination";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import OrganizationTable from "@/components/OrganizationTable";
import OrganizationModal from "@/components/OrganizationModal";

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

export default function AdminOrganizationsPage() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 페이지네이션 훅 사용
  const {
    data: organizations,
    loading,
    currentPage,
    totalPages,
    totalItems: totalOrganizations,
    hasMore,
    searchTerm,
    setSearchTerm,
    executeSearch,
    goToPage,
    refresh,
  } = usePagination<Organization>("/api/admin/organizations", {
    limit: 10,
  });

  // 기관 상세 페이지로 이동
  const handleOrganizationClick = (orgId: string) => {
    router.push(`/dashboard/admin/organizations/${orgId}`);
  };

  // 기관 수정
  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setShowCreateModal(true);
  };

  // 기관 삭제
  const handleDelete = async (id: string) => {
    if (
      !confirm("정말로 이 기관을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.")
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/organizations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        refresh();
        alert("기관이 삭제되었습니다.");
      } else {
        const error = await response.json();
        alert(error.error || "삭제 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("기관 삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 기관 생성/수정 제출
  const handleSubmit = async (formData: {
    name: string;
    department: string;
    contactName?: string;
    contactPhone?: string;
    emailDomain?: string;
  }) => {
    try {
      setSubmitting(true);

      if (editingOrg) {
        // 기관 수정
        const response = await fetch(
          `/api/admin/organizations/${editingOrg.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          },
        );

        if (response.ok) {
          alert("기관이 수정되었습니다.");
        } else {
          const error = await response.json();
          alert(error.error || "수정 중 오류가 발생했습니다.");
        }
      } else {
        // 기관 생성
        const response = await fetch("/api/admin/organizations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          alert("기관이 추가되었습니다.");
        } else {
          const error = await response.json();
          alert(error.error || "생성 중 오류가 발생했습니다.");
        }
      }

      setShowCreateModal(false);
      setEditingOrg(null);
      refresh();
    } catch (error) {
      console.error("기관 저장 오류:", error);
      alert("작업 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = () => {
    setEditingOrg(null);
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingOrg(null);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">기관 관리</h1>
          <p className="text-gray-600">등록된 기관들을 관리합니다.</p>
        </div>
        <button
          onClick={openModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          기관 추가
        </button>
      </div>

      {/* 검색 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          onSearch={executeSearch}
          placeholder="기관명, 부서, 담당자로 검색..."
          loading={loading}
        />
      </div>

      {/* 기관 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">기관 목록</h2>
        </div>

        <OrganizationTable
          organizations={organizations}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateNew={openModal}
          showCreateButton={false}
        />

        {/* 페이지네이션 */}
        {organizations.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalOrganizations}
            hasMore={hasMore}
            onPageChange={goToPage}
          />
        )}
      </div>

      {/* 기관 생성/수정 모달 */}
      <OrganizationModal
        isOpen={showCreateModal}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editingOrg}
        loading={submitting}
      />
    </div>
  );
}
