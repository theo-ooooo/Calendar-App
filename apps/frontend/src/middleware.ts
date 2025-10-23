import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key-here"
);

console.log("JWT_SECRET configured:", !!process.env.JWT_SECRET);

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 인증이 필요한 경로들
  const protectedRoutes = ["/"];
  const authRoutes = ["/login", "/register"];

  // 쿠키에서 토큰 확인
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  console.log("Middleware - Tokens:", { 
    hasAccessToken: !!accessToken, 
    hasRefreshToken: !!refreshToken,
    pathname 
  });

  let isAuthenticated = false;

  // Access Token이 있으면 유효성 검증
  if (accessToken) {
    isAuthenticated = await verifyToken(accessToken);
    console.log("Access token verification:", isAuthenticated);
  }
  // Access Token이 없거나 만료된 경우 Refresh Token 확인
  else if (refreshToken) {
    isAuthenticated = await verifyToken(refreshToken);
    console.log("Refresh token verification:", isAuthenticated);
  }

  console.log("Final authentication status:", isAuthenticated);

  // 인증이 필요한 페이지에 비인증 사용자 접근
  if (protectedRoutes.some((route) => pathname === route) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 인증된 사용자가 로그인/회원가입 페이지 접근
  if (
    authRoutes.some((route) => pathname.startsWith(route)) &&
    isAuthenticated
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
