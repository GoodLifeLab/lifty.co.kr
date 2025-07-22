import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  loading?: boolean;
}

export default function StatsCard({ title, value, icon, loading = false }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? "..." : value}
          </p>
        </div>
        <div className="text-2xl">
          {icon}
        </div>
      </div>
    </div>
  );
} 