/**
 * next-intl 라우팅 설정
 * locale별 URL 라우팅 정의
 */

import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // 지원하는 모든 locale
  locales: ['ko', 'en'],

  // 기본 locale (한국어)
  defaultLocale: 'ko',

  // URL에 locale prefix 항상 표시
  localePrefix: 'always',
});

// next-intl이 제공하는 타입 안전한 네비게이션 헬퍼
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);



