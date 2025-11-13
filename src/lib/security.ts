/**
 * 보안 유틸리티 함수
 * 
 * SSRF, XSS, 입력 검증 등 보안 관련 헬퍼 함수
 */

import { z } from 'zod';
import DOMPurify from 'dompurify';

/**
 * SSRF 방어: 안전한 URL인지 검증
 * 
 * 내부 IP, localhost, private network 차단
 */
export function isAllowedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // 허용된 프로토콜만 (https만 허용하는 것이 가장 안전)
    if (!['https:'].includes(parsed.protocol)) {
      return false;
    }
    
    const hostname = parsed.hostname.toLowerCase();
    
    // localhost, 127.0.0.0/8 차단
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
      '::ffff:127.0.0.1',
    ];
    
    if (blockedHosts.includes(hostname)) {
      return false;
    }
    
    // AWS metadata endpoint 차단
    if (hostname === '169.254.169.254') {
      return false;
    }
    
    // IPv4 private ranges 차단
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = hostname.match(ipv4Regex);
    
    if (ipMatch) {
      const octets = ipMatch.slice(1).map(Number);
      const [a, b, c, d] = octets;
      
      // Private IP ranges (RFC 1918)
      if (
        a === 10 || // 10.0.0.0/8
        (a === 172 && b! >= 16 && b! <= 31) || // 172.16.0.0/12
        (a === 192 && b === 168) || // 192.168.0.0/16
        a === 127 || // 127.0.0.0/8 (loopback)
        (a === 169 && b === 254) || // 169.254.0.0/16 (link-local)
        a === 0 || // 0.0.0.0/8 (current network)
        a! >= 224 // 224.0.0.0/4 (multicast, reserved)
      ) {
        return false;
      }
    }
    
    // IPv6 private/local addresses 차단
    if (hostname.includes(':')) {
      const ipv6Local = ['fe80:', 'fc00:', 'fd00:', '::1', 'ff00:'];
      if (ipv6Local.some(prefix => hostname.startsWith(prefix))) {
        return false;
      }
    }
    
    // 허용된 이미지 호스팅 도메인 (화이트리스트)
    const allowedDomains = [
      'lh3.googleusercontent.com', // Google 프로필
      'avatars.githubusercontent.com', // GitHub
      'platform-lookaside.fbsbx.com', // Facebook
      'pbs.twimg.com', // Twitter
      'graph.facebook.com', // Facebook Graph
      // 추가 CDN이 있다면 여기에 추가
    ];
    
    // 허용된 도메인 중 하나라면 통과
    const isAllowedDomain = allowedDomains.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
    
    if (isAllowedDomain) {
      return true;
    }
    
    // 화이트리스트에 없는 도메인은 차단 (엄격한 정책)
    // 프로덕션에서는 화이트리스트 정책 권장
    return false;
  } catch {
    return false;
  }
}

/**
 * Zod 스키마: 안전한 이미지 URL
 */
export const safeImageUrlSchema = z
  .string()
  .url('올바른 URL 형식이 아닙니다.')
  .refine(
    (url) => isAllowedImageUrl(url),
    {
      message: '허용되지 않은 이미지 URL입니다. Google, GitHub 등 공식 프로필 이미지만 사용 가능합니다.',
    }
  );

/**
 * Prompt Injection 방어: 위험한 패턴 감지
 */
export function detectPromptInjection(text: string): boolean {
  const dangerousPatterns = [
    /ignore\s+(all\s+)?previous\s+instructions?/i,
    /disregard\s+(all\s+)?previous\s+instructions?/i,
    /forget\s+(all\s+)?previous\s+instructions?/i,
    /system\s*:/i,
    /assistant\s*:/i,
    /user\s*:/i,
    /(new|updated?)\s+instructions?/i,
    /<\s*script/i,
    /<\s*iframe/i,
    /javascript\s*:/i,
    /on(load|error|click)\s*=/i,
    /\{\{.*\}\}/i, // Template injection
    /%0[ad]/i, // CRLF injection
  ];

  return dangerousPatterns.some(pattern => pattern.test(text));
}

/**
 * 텍스트 길이 제한 및 프롬프트 인젝션 검증
 */
export function validateTranslationInput(text: string): {
  isValid: boolean;
  error?: string;
} {
  // 길이 제한
  if (text.length === 0) {
    return { isValid: false, error: '번역할 텍스트를 입력해주세요.' };
  }
  
  if (text.length > 1000) {
    return { isValid: false, error: '번역할 텍스트는 1000자를 초과할 수 없습니다.' };
  }

  // 프롬프트 인젝션 감지
  if (detectPromptInjection(text)) {
    return { isValid: false, error: '유효하지 않은 입력입니다.' };
  }

  return { isValid: true };
}

/**
 * HTML 태그 제거 (XSS 방어)
 */
export function sanitizeHtml(text: string): string {
  // DOMPurify.sanitize는 안전한 HTML 문자열을 반환합니다.
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
}

/**
 * IP 주소 추출 (헤더에서)
 */
export function getClientIp(headers: Headers): string {
  // Vercel, Cloudflare 등 여러 프록시 고려
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // 첫 번째 IP가 실제 클라이언트 IP
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const cfConnectingIp = headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  return 'unknown';
}

/**
 * 안전한 리다이렉트 URL 검증
 * 
 * Open Redirect 취약점 방어
 */
export function isSafeRedirectUrl(url: string, baseUrl: string): boolean {
  try {
    // 상대 경로는 허용
    if (url.startsWith('/') && !url.startsWith('//')) {
      return true;
    }

    const parsed = new URL(url);
    const base = new URL(baseUrl);

    // 같은 origin만 허용
    return parsed.origin === base.origin;
  } catch {
    return false;
  }
}

