"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "../logout/action";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { deleteAccount, user } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm("정말로 회원탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다.")
    ) {
      return;
    }

    try {
      const result = await deleteAccount();
      if (result.success) {
        alert("회원탈퇴가 완료되었습니다.");
        router.push("/login");
      } else {
        alert(result.error || "회원탈퇴에 실패했습니다.");
      }
    } catch (error) {
      console.error("회원탈퇴 오류:", error);
      alert("회원탈퇴 중 오류가 발생했습니다.");
    }
  };

  const navigation = [
    { name: "대시보드", href: "/dashboard", icon: "📊" },
    { name: "프로젝트", href: "/dashboard/projects", icon: "📁" },
    { name: "그룹", href: "/dashboard/groups", icon: "👥" },
    { name: "팀", href: "/dashboard/team", icon: "👨‍💼" },
  ];

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* 모바일 사이드바 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex-shrink-0 h-screen ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full w-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900">Lifty</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">사이드바 닫기</span>✕
            </button>
          </div>

          <nav className="flex-1 mt-6 px-3 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* 사용자 메뉴 */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  U
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">사용자</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <span className="mr-3">🚪</span>
                로그아웃
              </button>
              <button
                onClick={handleDeleteAccount}
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
              >
                <span className="mr-3">🗑️</span>
                회원탈퇴
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col lg:ml-0 overflow-hidden">
        {/* 헤더 */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">사이드바 열기</span>☰
            </button>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="검색..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>

              <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md">
                <span className="sr-only">알림</span>
                🔔
              </button>
            </div>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
