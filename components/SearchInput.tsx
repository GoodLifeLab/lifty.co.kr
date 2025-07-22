import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
}

export default function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "검색어를 입력하세요",
  loading = false,
  disabled = false,
}: SearchInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !disabled) {
      onSearch();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
        />
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>
      <button
        onClick={onSearch}
        disabled={disabled || loading}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            검색 중...
          </div>
        ) : (
          "검색"
        )}
      </button>
    </div>
  );
}
