# 다국어화(i18n) 구현 가이드

## 개요

이 프로젝트는 next-intl을 사용하여 한국어(ko)와 영어(en)를 지원합니다.
URL 기반 locale 라우팅을 사용하며, 브라우저 언어를 자동으로 감지합니다.

## 프로젝트 구조

```
src/
├── i18n/
│   ├── routing.ts          # locale 라우팅 설정
│   └── request.ts          # next-intl 설정
├── lib/
│   └── date-locale.ts      # date-fns locale 유틸리티
├── components/
│   └── ui/
│       └── language-switcher.tsx  # 언어 전환 UI
├── app/
│   ├── layout.tsx          # Root layout (간소화)
│   └── [locale]/           # locale 세그먼트
│       ├── layout.tsx      # Locale layout (main)
│       ├── page.tsx        # 홈페이지
│       ├── login/
│       ├── register/
│       └── ...
└── middleware.ts           # NextAuth + next-intl 통합

messages/
├── ko.json                 # 한국어 번역
└── en.json                 # 영어 번역
```

## URL 구조

- 한국어: `/ko/dashboard`, `/ko/chat`, etc.
- 영어: `/en/dashboard`, `/en/chat`, etc.
- 루트 접근 시 브라우저 언어에 따라 자동 리다이렉트

## 사용법

### 1. Server Components에서 다국어화

```tsx
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function Page() {
  const t = await getTranslations('namespace');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <Link href="/dashboard">{t('dashboard')}</Link>
    </div>
  );
}
```

### 2. Client Components에서 다국어화

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export function MyComponent() {
  const t = useTranslations('namespace');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <Link href="/dashboard">{t('dashboard')}</Link>
    </div>
  );
}
```

### 3. 다른 네임스페이스 접근

```tsx
const t = await getTranslations('home');
const commonText = t.raw('common.login'); // 다른 네임스페이스 접근
```

### 4. 동적 값 사용

```tsx
// messages/ko.json
{
  "common": {
    "greeting": "안녕하세요, {name}님!"
  }
}

// 사용
t('greeting', { name: user.name })
```

### 5. date-fns와 locale 사용

```tsx
import { format } from 'date-fns';
import { getDateLocale } from '@/lib/date-locale';
import { useLocale } from 'next-intl';

// Client Component
const locale = useLocale();
const dateLocale = getDateLocale(locale);
format(new Date(), 'PPP', { locale: dateLocale });

// Server Component
async function Page({ params: { locale } }) {
  const dateLocale = getDateLocale(locale);
  // ...
}
```

### 6. 리다이렉트 (locale-aware)

```tsx
// ❌ 기존 방식 (locale 무시됨)
import { redirect } from 'next/navigation';
redirect('/dashboard');

// ✅ 새로운 방식 (locale 유지)
import { redirect } from '@/i18n/routing';
redirect('/dashboard'); // 자동으로 /ko/dashboard 또는 /en/dashboard로
```

### 7. Link 컴포넌트

```tsx
// ❌ 기존 방식
import Link from 'next/link';
<Link href="/dashboard">Dashboard</Link>

// ✅ 새로운 방식
import { Link } from '@/i18n/routing';
<Link href="/dashboard">Dashboard</Link>
```

### 8. useRouter, usePathname

```tsx
// ❌ 기존 방식
import { useRouter, usePathname } from 'next/navigation';

// ✅ 새로운 방식
import { useRouter, usePathname } from '@/i18n/routing';
```

## 메시지 파일 구조

`messages/ko.json` 및 `messages/en.json`:

```json
{
  "common": {
    "login": "로그인",
    "register": "시작하기",
    "dashboard": "대시보드"
  },
  "home": {
    "title": "TravelMate",
    "hero": "진짜 대전을 경험하세요"
  },
  "auth": {
    "loginTitle": "로그인",
    "email": "이메일"
  }
}
```

## 새 페이지 다국어화 체크리스트

1. [ ] Server Component인 경우 `getTranslations` import
2. [ ] Client Component인 경우 `useTranslations` import 및 `'use client'` 추가
3. [ ] `Link`는 `@/i18n/routing`에서 import
4. [ ] `redirect`는 `@/i18n/routing`에서 import
5. [ ] `useRouter`, `usePathname`은 `@/i18n/routing`에서 import
6. [ ] 모든 하드코딩된 텍스트를 `t('key')`로 변경
7. [ ] date-fns 사용 시 `getDateLocale()` 사용
8. [ ] 새 번역 키를 `messages/ko.json`과 `messages/en.json`에 추가

## 언어 전환

헤더에 `<LanguageSwitcher />` 컴포넌트가 추가되어 있습니다.
사용자가 언어를 변경하면 현재 페이지를 유지한 채 locale만 변경됩니다.

## 미들웨어 동작

1. 브라우저 언어 감지 (Accept-Language 헤더)
2. locale prefix 추가/리다이렉트
3. NextAuth 인증 체크
4. 보호된 라우트 접근 제어

## 추가 작업이 필요한 파일들

다음 파일들은 동일한 패턴으로 다국어화가 필요합니다:

### 페이지
- [ ] `src/app/[locale]/chat/page.tsx`
- [ ] `src/app/[locale]/chat/[chatRoomId]/page.tsx`
- [ ] `src/app/[locale]/dashboard/guide/page.tsx`
- [ ] `src/app/[locale]/dashboard/traveler/page.tsx`
- [ ] `src/app/[locale]/guides/page.tsx`
- [ ] `src/app/[locale]/profile/[userId]/page.tsx`
- [ ] `src/app/[locale]/profile/edit/page.tsx`
- [ ] `src/app/[locale]/tour/[tourRequestId]/review/page.tsx`

### 컴포넌트
- [ ] `src/components/auth/login-form.tsx`
- [ ] `src/components/auth/register-form.tsx`
- [ ] `src/components/auth/user-menu.tsx`
- [ ] `src/components/chat/ChatMessage.tsx`
- [ ] `src/components/tour/tour-request-actions.tsx`
- [ ] 기타 UI 컴포넌트

## 팁

1. **일관된 네임스페이스 사용**: `common`, `auth`, `dashboard`, `chat` 등
2. **중첩 구조 활용**: `dashboard.guide.title`, `dashboard.traveler.title`
3. **재사용 가능한 키**: `common` 네임스페이스에 자주 쓰이는 텍스트 저장
4. **타입 안전성**: TypeScript와 함께 사용 시 자동완성 지원됨

## 트러블슈팅

### 번역이 표시되지 않음
- 메시지 파일 경로 확인: `messages/ko.json`, `messages/en.json`
- JSON 문법 오류 확인
- 서버 재시작

### Link/redirect가 locale 없이 동작함
- `next/navigation` 대신 `@/i18n/routing`에서 import 확인

### Client Component에서 오류 발생
- `'use client'` 지시어 추가 확인
- `getTranslations` 대신 `useTranslations` 사용 확인



