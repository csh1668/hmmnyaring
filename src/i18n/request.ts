/**
 * next-intl 설정
 * locale별 메시지 로드
 */

import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // 요청된 locale 확인
  let locale = await requestLocale;

  // 지원하지 않는 locale인 경우 기본 locale 사용
  if (!locale || !routing.locales.includes(locale as 'ko' | 'en')) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});



