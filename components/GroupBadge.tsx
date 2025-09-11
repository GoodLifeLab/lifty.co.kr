import { XMarkIcon } from "@heroicons/react/24/outline";

interface GroupBadgeProps {
  groupId: number;
  groupName: string;
  onRemove?: (groupId: number, groupName: string) => void;
  showRemoveButton?: boolean;
}

export default function GroupBadge({
  groupId,
  groupName,
  onRemove,
  showRemoveButton = false,
}: GroupBadgeProps) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 group">
      {groupName}
      {showRemoveButton && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(groupId, groupName);
          }}
          className="ml-2 p-0.5 text-green-600 hover:text-green-800 hover:bg-green-200 rounded-full transition-colors"
          title={`${groupName} 그룹에서 제거`}
        >
          <XMarkIcon className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
