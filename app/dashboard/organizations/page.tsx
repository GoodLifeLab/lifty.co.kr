"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function OrganizationsPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // SUPER_ADMIN인 경우 admin 페이지로 리다이렉트
    if (user?.role === "SUPER_ADMIN") {
      router.replace("/dashboard/admin/organizations");
    } else {
      // 일반 사용자는 접근 불가
      router.replace("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
}
