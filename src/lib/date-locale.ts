/**
 * date-fns 로케일 동적 처리 유틸리티
 */

import { ko, enUS } from 'date-fns/locale';

/**
 * locale 문자열에 따라 date-fns locale 객체 반환
 * @param locale 'ko' | 'en'
 */
export function getDateLocale(locale: string) {
  switch (locale) {
    case 'ko':
      return ko;
    case 'en':
      return enUS;
    default:
      return ko; // 기본값은 한국어
  }
}



