"use client";

import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import OrganizationTable from "@/components/OrganizationTable";
import OrganizationModal from "@/components/OrganizationModal";
import { OrganizationService } from "@/services/organizationService";

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

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const data = await OrganizationService.getOrganizations();
      setOrganizations(data);
    } catch (error) {
      console.error("기관 목록 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

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
        await OrganizationService.updateOrganization(editingOrg.id, formData);
        alert("기관이 수정되었습니다.");
      } else {
        await OrganizationService.createOrganization(formData);
        alert("기관이 추가되었습니다.");
      }

      setShowModal(false);
      setEditingOrg(null);
      fetchOrganizations();
    } catch (error) {
      console.error("기관 저장 오류:", error);
      alert(
        error instanceof Error ? error.message : "작업 중 오류가 발생했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm("정말로 이 기관을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.")
    ) {
      return;
    }

    try {
      await OrganizationService.deleteOrganization(id);
      fetchOrganizations();
      alert("기관이 삭제되었습니다.");
    } catch (error) {
      console.error("기관 삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const openModal = () => {
    setEditingOrg(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOrg(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">기관관리</h1>
          <p className="text-gray-600">등록된 기관들을 관리합니다.</p>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          기관 추가
        </button>
      </div>

      {/* 기관 목록 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <OrganizationTable
          organizations={organizations}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateNew={openModal}
          showCreateButton={true}
        />
      </div>

      {/* 조직 모달 */}
      <OrganizationModal
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editingOrg}
        loading={submitting}
      />
    </div>
  );
}
