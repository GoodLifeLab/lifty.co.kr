import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  phone?: string;
  emailVerified: boolean;
  role?: "USER" | "COACH" | "SUPER_ADMIN";
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const fetchUser = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch("/api/auth/me");

      // 응답 상태 확인
      if (!response.ok) {
        if (response.status === 401) {
          // 인증되지 않은 상태는 정상적인 상황
          setAuthState({
            user: null,
            loading: false,
            error: null,
          });
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setAuthState({
          user: data.user,
          loading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: data.error || "사용자 정보를 가져올 수 없습니다.",
        });
      }
    } catch (error) {
      console.error("사용자 정보 가져오기 실패:", error);
      setAuthState({
        user: null,
        loading: false,
        error: "네트워크 오류가 발생했습니다.",
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        await fetchUser(); // 로그인 후 사용자 정보 다시 가져오기
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      return { success: false, error: "로그인 중 오류가 발생했습니다." };
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setAuthState({
        user: null,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      console.error("로그아웃 실패:", error);
      return { success: false, error: "로그아웃 중 오류가 발생했습니다." };
    }
  };

  const signup = async (email: string, phone: string, password: string) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, phone, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("회원가입 실패:", error);
      return { success: false, error: "회원가입 중 오류가 발생했습니다." };
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setAuthState({
          user: null,
          loading: false,
          error: null,
        });
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("회원탈퇴 실패:", error);
      return { success: false, error: "회원탈퇴 중 오류가 발생했습니다." };
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    logout,
    signup,
    deleteAccount,
    refetch: fetchUser,
  };
}
