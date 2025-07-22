interface StatusBadgeProps {
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    NOT_STARTED: { text: "시작전", color: "bg-gray-100 text-gray-800" },
    IN_PROGRESS: { text: "진행 중", color: "bg-blue-100 text-blue-800" },
    COMPLETED: { text: "완료됨", color: "bg-green-100 text-green-800" },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.text}
    </span>
  );
}
