import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API 경로는 항상 공개 (인증 불필요)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 공개 경로 (인증 불필요)
  const publicPaths = [
    '/login',
    '/signup',
    '/error',
    '/terms',
  ];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // 인증 토큰 확인
  const token = request.cookies.get('auth-token')?.value;
  const isAuthenticated = token && verifyToken(token);

  // 로그인/회원가입 페이지에 이미 인증된 사용자가 접근하는 경우
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 보호된 경로에 인증되지 않은 사용자가 접근하는 경우
  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
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
