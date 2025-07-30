import { UserIcon } from "@heroicons/react/24/outline";

interface User {
  id: string;
  email: string;
  name?: string;
  position?: string;
  createdAt: string;
  organizations: Array<{
    organization: {
      id: string;
      name: string;
      department: string;
    };
    role?: string;
  }>;
  groupMemberships: Array<{
    group: {
      id: number;
      name: string;
      description?: string;
    };
    role: string;
  }>;
  _count: {
    groupMemberships: number;
  };
}

interface UserTableProps {
  users: User[];
  loading: boolean;
  onUserClick: (userId: string) => void;
}

export default function UserTable({
  users,
  loading,
  onUserClick,
}: UserTableProps) {
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">사용자 목록을 불러오는 중...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <UserIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          사용자가 없습니다
        </h3>
        <p className="text-gray-600">등록된 사용자가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              사용자
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              이메일
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              소속 기관
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              등급
              <span className="text-xs text-gray-400">(소속 기관 내 직책)</span>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              소속 그룹
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              가입일
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onUserClick(user.id)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.name
                      ? user.name.charAt(0).toUpperCase()
                      : user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || "이름 없음"}
                    </div>
                    {user.position && (
                      <div className="text-xs text-gray-400">
                        {user.position}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {user.organizations.length > 0 ? (
                    <div className="space-y-1">
                      {user.organizations.map((org) => (
                        <div
                          key={org.organization.id}
                          className="flex items-center"
                        >
                          <span className="text-sm text-gray-900">
                            {org.organization.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">소속 기관 없음</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {user.organizations.length > 0 ? (
                    <div className="space-y-1">
                      {user.organizations.map((org) => (
                        <div key={org.organization.id}>
                          {org.role === "ADMIN" && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                              관리자
                            </span>
                          )}
                          {org.role === "LEADER" && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              리더
                            </span>
                          )}
                          {org.role === "MEMBER" && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                              일반
                            </span>
                          )}
                          {!org.role && (
                            <span className="text-gray-400">직책 없음</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">직책 없음</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.groupMemberships.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.groupMemberships.map((group) => (
                      <div key={group.group.id} className="flex items-center">
                        <span className="text-sm text-gray-900 bg-green-100 rounded-full px-2 py-1">
                          {group.group.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">소속 그룹 없음</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString("ko-KR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
