/**
 * NextAuth + next-intl 통합 미들웨어
 * 
 * - locale 처리 (ko/en)
 * - 인증 체크
 * - 프로필 체크
 * 
 * Edge Runtime 최적화: 경량 설정 사용 (Prisma 제외)
 */

import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// next-intl 미들웨어 생성
const intlMiddleware = createMiddleware(routing);

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  // API, static 파일, 이미지는 제외
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // next-intl 미들웨어 실행 (locale 처리)
  const intlResponse = intlMiddleware(req);
  
  // locale이 포함된 경로 추출
  const localeMatch = pathname.match(/^\/(ko|en)(\/.*)?$/);
  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
  const pathWithoutLocale = localeMatch ? (localeMatch[2] || '/') : pathname;

  // /register/complete는 항상 허용 (DB에서 프로필 체크는 페이지에서 함)
  if (pathWithoutLocale === '/register/complete') {
    return intlResponse;
  }

  // 로그인된 사용자가 프로필이 없고, /register/complete가 아닌 경우
  if (session?.user) {
    const needsProfile = session.user.needsProfile;
    
    if (needsProfile && pathWithoutLocale !== '/register/complete') {
      // /register/complete로 리다이렉트
      return NextResponse.redirect(new URL(`/${locale}/register/complete`, req.url));
    }
  }

  // 보호된 라우트 체크
  const protectedRoutes = ['/dashboard', '/tours/create', '/bookings', '/chat', '/profile/edit'];
  const isProtectedRoute = protectedRoutes.some(route => pathWithoutLocale.startsWith(route));

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  return intlResponse;
});

export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청 매칭:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
