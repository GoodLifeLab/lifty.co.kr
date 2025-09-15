"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UsersIcon, BookOpenIcon, FlagIcon } from "@heroicons/react/24/outline";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import StatsCard from "@/components/StatsCard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export default function DashboardPage() {
  const [stats, setStats] = useState({
    dailyActiveUsers: 0,
    totalUsers: 0,
    totalProjects: 0,
    activeMissions: 0,
    dailyData: [] as Array<{
      date: string;
      activeUsers: number;
    }>,
    monthlyData: [] as Array<{
      month: string;
      activeUsers: number;
    }>,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // 통계 데이터 가져오기
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch("/api/admin/stats/dashboard");

      if (!response.ok) {
        throw new Error("통계 데이터를 가져오는데 실패했습니다.");
      }

      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error("통계 데이터 조회 오류:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  // 일별 차트 데이터 준비
  const dailyLabels = stats.dailyData.map((item) => {
    const date = new Date(item.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const dauChartData = {
    labels: dailyLabels,
    datasets: [
      {
        label: "DAU",
        data: stats.dailyData.map((item) => item.activeUsers),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  // 월별 차트 데이터 준비
  const monthlyLabels = stats.monthlyData.map((item) => {
    const [year, month] = item.month.split("-");
    return `${year}/${month}`;
  });

  const monthlyDauChartData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: "MAU",
        data: stats.monthlyData.map((item) => item.activeUsers),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // 통계 데이터 가져오기
  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600">7일간의 활동 현황을 확인하세요</p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="총 유저"
          value={stats.totalUsers}
          icon={<UsersIcon className="h-8 w-8 text-blue-600" />}
          loading={statsLoading}
        />
        <StatsCard
          title="진행 중 과정"
          value={stats.totalProjects}
          icon={<BookOpenIcon className="h-8 w-8 text-green-600" />}
          loading={statsLoading}
        />
        <StatsCard
          title="진행 중 미션"
          value={stats.activeMissions}
          icon={<FlagIcon className="h-8 w-8 text-purple-600" />}
          loading={statsLoading}
        />
      </div>

      {/* 개별 차트들 */}
      <div className="space-y-6">
        {/* DAU 차트 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Daily Active Users (DAU)
            </h3>
            <p className="text-gray-600">최근 7일간의 일일 활성 사용자 수</p>
          </div>
          {statsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="h-80">
              <Line data={dauChartData} options={chartOptions} />
            </div>
          )}
        </div>

        {/* 월별 MAU 차트 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Monthly Active Users (MAU)
            </h3>
            <p className="text-gray-600">최근 12개월간의 월별 활성 사용자 수</p>
          </div>
          {statsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="h-80">
              <Line data={monthlyDauChartData} options={chartOptions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
