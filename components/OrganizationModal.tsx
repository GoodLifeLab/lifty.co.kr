import { Organization } from "@prisma/client";
import { useState, useEffect } from "react";

interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    emailDomain?: string;
  }) => void;
  initialData?: Organization | null;
  loading?: boolean;
}

export default function OrganizationModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}: OrganizationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    contactEmail: "",
    contactName: "",
    contactPhone: "",
    emailDomain: "",
  });

  // 초기 데이터 설정
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        contactEmail: initialData.contactEmail || "",
        contactName: initialData.contactName || "",
        contactPhone: initialData.contactPhone || "",
        emailDomain: initialData.emailDomain || "",
      });
    } else {
      setFormData({
        name: "",
        contactEmail: "",
        contactName: "",
        contactPhone: "",
        emailDomain: "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      contactEmail: formData.contactEmail || undefined,
      contactName: formData.contactName || undefined,
      contactPhone: formData.contactPhone || undefined,
      emailDomain: formData.emailDomain || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {initialData ? "기관 수정" : "기관 추가"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                기관명 *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                기관 담당자 이름
              </label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) =>
                  setFormData({ ...formData, contactName: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                기관 담당자 연락처
              </label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) =>
                  setFormData({ ...formData, contactPhone: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                기관 담당자 이메일
              </label>
              <input
                type="text"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                기관 이메일 도메인
              </label>
              <input
                type="text"
                placeholder="예: goodlifelab.kr"
                value={formData.emailDomain}
                onChange={(e) =>
                  setFormData({ ...formData, emailDomain: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "처리 중..." : initialData ? "수정" : "추가"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
