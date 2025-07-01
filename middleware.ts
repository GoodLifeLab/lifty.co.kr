import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";
import { decodeJwt } from "jose";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API 경로는 항상 공개 (인증 불필요)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 공개 경로 (인증 불필요)
  const publicPaths = ["/login", "/signup", "/error", "/terms"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // 인증 토큰 확인
  const token = request.cookies.get("auth-token")?.value;

  if (token) {
    try {
      const decoded = decodeJwt(token);
      console.log("미들웨어 - 토큰 디코드 결과:", decoded);
    } catch (error) {
      console.log("미들웨어 - 토큰 디코드 실패:", error);
    }
  }

  const isAuthenticated = token && (await verifyToken(token));

  // 로그인/회원가입 페이지에 이미 인증된 사용자가 접근하는 경우
  if (isAuthenticated && isPublicPath) {
    console.log(
      "미들웨어 - 인증된 사용자가 공개 페이지 접근, 홈으로 리다이렉트",
    );
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 보호된 경로에 인증되지 않은 사용자가 접근하는 경우
  if (!isAuthenticated && !isPublicPath) {
    console.log(
      "미들웨어 - 인증되지 않은 사용자가 보호된 페이지 접근, 로그인으로 리다이렉트",
    );
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
