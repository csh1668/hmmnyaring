/**
 * NextAuth.js Edge-compatible 설정
 * 
 * 미들웨어용 경량 설정 (Prisma, bcrypt 등 무거운 의존성 제외)
 */

import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // locale 제거 (/ko, /en)
      const pathWithoutLocale = pathname.replace(/^\/(ko|en)(\/.*)?$/, '$2') || '/';

      // 보호된 라우트 체크
      const protectedRoutes = ['/dashboard', '/tours/create', '/bookings', '/chat', '/profile/edit'];
      const isProtectedRoute = protectedRoutes.some(route => pathWithoutLocale.startsWith(route));

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // 로그인 페이지로 리다이렉트
      }

      return true;
    },
  },
  providers: [], // 실제 provider는 auth.ts에서 설정
} satisfies NextAuthConfig;

