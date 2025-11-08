# 🌏 TravelMate Daejeon

**대전을 아는 로컬 가이드가 외국인에게 진짜 대전을 보여주는 P2P 매칭 플랫폼**

Next.js 16 + tRPC + Prisma + NextAuth + TypeScript + Gemini AI로 구축된 프로덕션 레디 애플리케이션입니다.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ 주요 기능

### 🌟 핵심 기능
- 🤝 **AI 가이드 매칭** - 언어, 관심사, 평점 기반 스마트 매칭 (100점 만점 스코어)
- 💬 **실시간 채팅** - 가이드와 여행자 간 실시간 소통 (Polling 방식)
- 🗺️ **Kakao Map 연동** - 투어 위치 표시 및 경로 공유
- 🤖 **Gemini AI 번역** - 실시간 채팅 메시지 자동 번역 (Rate Limiting 적용)
- 🌐 **다국어 지원** - 한국어/영어 (next-intl)
- ⭐ **리뷰 시스템** - 투어 완료 후 별점 및 리뷰 작성
- 🎫 **투어 요청 관리** - 요청/수락/거절/완료 플로우
- 🔒 **완벽한 보안** - Rate Limiting, SSRF 방어, Prompt Injection 차단

### 💻 기술 스택
- ⚡ **Next.js 16** - App Router, React Server Components, React 19 Compiler
- 🔐 **NextAuth v5** - Credentials Provider + Session Management
- 🛡️ **tRPC v11** - End-to-End Type Safety + TanStack Query
- 💾 **Prisma ORM 6.19** - PostgreSQL, Connection Pooling
- 🤖 **Google Gemini AI** - 실시간 번역
- 🗺️ **Kakao Maps API** - 위치 기반 서비스
- 🎨 **Tailwind CSS v4** - 여행 테마 디자인
- 🧩 **shadcn/ui** - Radix UI 기반 컴포넌트

### 🛡️ 보안 기능
- 🚦 **Rate Limiting** - API 남용 방지 (번역 1분당 10회, 채팅 10초당 5회)
- 🔐 **SSRF 방어** - 이미지 URL 화이트리스트 검증
- 🤖 **Prompt Injection 차단** - AI 프롬프트 입력 검증
- 🔒 **CSRF 보호** - NextAuth 세션 기반
- 🛡️ **XSS 방지** - CSP 헤더, Zod 입력 검증
- 🔑 **비밀번호 해싱** - bcryptjs

---

## 📋 사전 요구사항

- Node.js 18+
- pnpm 8+
- PostgreSQL 데이터베이스

---

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone https://github.com/csh1668/hmmnyaring
cd hmmnyaring
```

### 2. 패키지 설치

```bash
pnpm install
```

### 3. 환경변수 설정

`.env.local` 파일을 프로젝트 루트에 생성:

```env
# Database (Supabase, Railway, Neon 등)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# NextAuth Secret (터미널에서 생성: openssl rand -base64 32)
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google Gemini API (번역 기능)
GEMINI_API_KEY="your-gemini-api-key"
# 발급: https://aistudio.google.com/app/apikey

# Kakao Maps API (지도 기능)
NEXT_PUBLIC_KAKAO_MAPS_APP_KEY="your-kakao-maps-key"
# 발급: https://developers.kakao.com/
```

### 4. 데이터베이스 설정

```bash
# Prisma Client 생성
pnpm db:generate

# 데이터베이스 스키마 적용
pnpm db:push

# (선택) 시드 데이터 생성
pnpm db:seed
```

### 5. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

---

## 📁 프로젝트 구조

```
hmmnyaring/
├── prisma/
│   ├── schema.prisma          # 데이터베이스 스키마 (User, GuideProfile, TourRequest 등)
│   └── seed.ts                # 시드 데이터 (가이드 10명, 여행자 5명, 투어 15개)
├── src/
│   ├── app/
│   │   ├── [locale]/          # 다국어 라우팅 (ko/en)
│   │   │   ├── page.tsx       # 홈페이지 (Hero, Features, CTA)
│   │   │   ├── guides/        # 가이드 검색 페이지
│   │   │   ├── profile/       # 프로필 페이지 (조회/수정)
│   │   │   ├── dashboard/     # 대시보드 (가이드/여행자)
│   │   │   ├── chat/          # 채팅 (목록/채팅방)
│   │   │   ├── tour/          # 투어 관리 (리뷰 작성)
│   │   │   ├── login/         # 로그인
│   │   │   └── register/      # 회원가입
│   │   └── api/
│   │       ├── auth/          # NextAuth 엔드포인트
│   │       ├── trpc/          # tRPC 엔드포인트
│   │       └── chat/stream/   # 채팅 스트림 (Polling)
│   ├── components/
│   │   ├── auth/              # 로그인, 회원가입, 프로필 완성
│   │   ├── chat/              # ChatMessage, ShareLocationModal
│   │   ├── map/               # KakaoMap, PlaceSearch, RouteMap
│   │   ├── profile/           # GuideProfileCard, ProfileEditForm
│   │   ├── review/            # ReviewCard, StarRating
│   │   ├── tour/              # TourRequestModal, TourRequestActions
│   │   ├── layouts/           # Header
│   │   ├── providers/         # SessionProvider, ThemeProvider
│   │   └── ui/                # shadcn/ui 컴포넌트
│   ├── lib/
│   │   ├── auth.ts            # NextAuth 설정
│   │   ├── gemini.ts          # Gemini AI 번역
│   │   ├── kakao-map.ts       # Kakao Map 유틸리티
│   │   ├── security.ts        # SSRF 방어, Prompt Injection 차단
│   │   ├── simple-rate-limit.ts # Rate Limiting 엔진
│   │   ├── validators.ts      # 입력 검증
│   │   ├── schemas/           # Zod 스키마
│   │   └── trpc/              # tRPC 클라이언트
│   ├── server/
│   │   ├── db.ts              # Prisma 클라이언트
│   │   ├── trpc.ts            # tRPC 초기화
│   │   ├── context.ts         # tRPC 컨텍스트
│   │   ├── routers/
│   │   │   ├── _app.ts        # 메인 라우터
│   │   │   ├── user.ts        # 유저 라우터
│   │   │   ├── profile.ts     # 프로필 라우터
│   │   │   ├── guide.ts       # 가이드 검색
│   │   │   ├── tour-request.ts # 투어 요청 관리
│   │   │   ├── chat.ts        # 채팅
│   │   │   ├── review.ts      # 리뷰
│   │   │   ├── matching.ts    # AI 매칭
│   │   │   └── translation.ts # Gemini 번역
│   │   └── helpers/
│   │       ├── crud.ts        # CRUD 헬퍼
│   │       └── matching.ts    # 매칭 알고리즘
│   ├── i18n/                  # next-intl 설정
│   ├── env/                   # 환경변수 검증
│   ├── types/                 # TypeScript 타입 정의
│   └── middleware.ts          # next-intl 미들웨어
├── messages/                  # 다국어 메시지 (ko.json, en.json)
├── DEVELOPMENT_GUIDE.md       # 개발 가이드
├── SECURITY_COMPLETE.md       # 보안 완성 문서
├── IMPLEMENTATION_SUMMARY.md  # 구현 요약
├── KAKAO_MAP_IMPLEMENTATION_COMPLETE.md # 카카오맵 구현
└── I18N_IMPLEMENTATION.md     # 다국어 구현
```

---

## 📚 사용 가이드

### 🎯 주요 사용 시나리오

#### 1. 여행자 플로우

1. **회원가입 및 프로필 설정**

```typescript
// 회원가입 후 여행자 프로필 완성
const profile = await trpc.profile.complete.mutate({
  role: 'TRAVELER',
  nationality: 'Japan',
  preferredLanguages: ['JAPANESE', 'ENGLISH'],
  interests: ['맛집 투어', '카페 탐방'],
});
```

2. **가이드 검색 및 매칭**

```typescript
// AI 매칭 스코어 기반 가이드 검색
const guides = await trpc.guide.getAll.query({
  languages: ['JAPANESE'],
  categories: ['FOOD'],
  sortBy: 'matching', // AI 매칭 스코어 순
});
```

3. **투어 요청**

```typescript
// 가이드에게 투어 요청
const request = await trpc.tourRequest.create.mutate({
  guideId: 'guide-123',
  category: 'FOOD',
  preferredDate: new Date('2025-11-15'),
  message: '성심당과 은행동 카페거리를 가보고 싶어요!',
  isOnline: false,
});
```

4. **채팅 및 실시간 번역**

```typescript
// 메시지 전송 + 자동 번역
const message = await trpc.chat.sendMessage.mutate({
  chatRoomId: 'room-123',
  content: 'こんにちは！',
});

// 메시지 자동 번역 (Gemini AI)
const translated = await trpc.translation.translate.mutate({
  text: 'こんにちは！',
  targetLanguage: 'ko',
});
```

5. **리뷰 작성**

```typescript
// 투어 완료 후 리뷰 작성
const review = await trpc.review.create.mutate({
  tourRequestId: 'tour-123',
  rating: 5,
  comment: '정말 좋은 경험이었어요! 숨은 맛집을 많이 알게 됐습니다.',
});
```

#### 2. 가이드 플로우

1. **가이드 프로필 설정**

```typescript
// 가이드 프로필 완성
const profile = await trpc.profile.complete.mutate({
  role: 'GUIDE',
  bio: '대전 토박이 가이드입니다. 맛집과 카페를 전문으로 안내합니다.',
  languages: ['KOREAN', 'JAPANESE'],
  categories: ['FOOD', 'CAFE'],
  experienceYears: 3,
});
```

2. **투어 요청 관리**

```typescript
// 받은 투어 요청 조회
const requests = await trpc.tourRequest.getReceivedRequests.query({
  status: 'PENDING',
});

// 투어 요청 수락 (자동으로 채팅방 생성)
await trpc.tourRequest.accept.mutate({
  id: 'request-123',
});
```

3. **투어 완료 처리**

```typescript
// 투어 완료
await trpc.tourRequest.complete.mutate({
  id: 'tour-123',
});
// → 여행자가 리뷰 작성 가능
// → 가이드 통계 자동 업데이트 (평균 평점, 총 투어 수)
```

### 🗺️ Kakao Map 사용

```typescript
'use client';
import { KakaoMap } from '@/components/map/KakaoMap';

export function TourLocationMap() {
  return (
    <KakaoMap
      initialCenter={{ lat: 36.3504, lng: 127.3845 }} // 대전역
      markers={[
        { position: { lat: 36.3504, lng: 127.3845 }, title: '대전역' },
        { position: { lat: 36.3271, lng: 127.4269 }, title: '성심당' },
      ]}
      height="400px"
    />
  );
}
```

### 🔒 보안 기능 활용

```typescript
// Rate Limiting (자동 적용)
// - 번역 API: 1분당 10회
// - 채팅 메시지: 10초당 5회
// - 투어 요청: 1시간당 5회

// SSRF 방어 (자동 검증)
await trpc.profile.update.mutate({
  image: 'https://example.com/avatar.jpg', // ✅ 허용
  // image: 'http://localhost:3000/admin', // ❌ 차단
  // image: 'http://169.254.169.254/', // ❌ 차단 (AWS metadata)
});

// Prompt Injection 차단 (자동 필터링)
await trpc.translation.translate.mutate({
  text: 'Hello', // ✅ 허용
  // text: 'Ignore previous instructions', // ❌ 차단
});
```

---

## 🛠️ 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 시작 (http://localhost:3000) |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 프로덕션 서버 실행 |
| `pnpm lint` | ESLint 실행 |
| `pnpm db:generate` | Prisma Client 생성 |
| `pnpm db:push` | 스키마를 DB에 빠르게 반영 (개발용) |
| `pnpm db:migrate` | 마이그레이션 생성 및 실행 |
| `pnpm db:studio` | Prisma Studio 실행 (DB GUI) |
| `pnpm db:seed` | 시드 데이터 생성 |

---

## 🎯 핵심 알고리즘

### AI 가이드 매칭 (100점 만점)

```typescript
// src/server/helpers/matching.ts
export function calculateMatchScore(guide: Guide, traveler: Traveler) {
  let score = 0;

  // 1. 언어 매칭 (40점)
  const languageMatch = guide.languages.some(lang => 
    traveler.preferredLanguages.includes(lang)
  );
  if (languageMatch) score += 40;

  // 2. 관심사 매칭 (30점)
  const interestOverlap = guide.categories.filter(cat =>
    traveler.interests.includes(cat)
  ).length;
  score += Math.min(30, interestOverlap * 15);

  // 3. 평점 보너스 (20점)
  score += (guide.averageRating / 5) * 20;

  // 4. 경험 보너스 (10점)
  score += Math.min(10, guide.totalTours / 10);

  return Math.round(score);
}
```

### Rate Limiting 엔진

```typescript
// src/lib/simple-rate-limit.ts
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<{ success: boolean; remaining: number }> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  
  // 시간 윈도우 내의 요청 횟수 확인
  const requests = await getRequests(key, now - windowMs);
  
  if (requests.length >= limit) {
    return { success: false, remaining: 0 };
  }
  
  await addRequest(key, now);
  return { success: true, remaining: limit - requests.length - 1 };
}
```

### 실시간 채팅 (Polling)

```typescript
// TanStack Query의 refetchInterval 사용
const { data: messages } = trpc.chat.getMessages.useQuery(
  { chatRoomId },
  {
    refetchInterval: 5000, // 5초마다 자동 갱신
    refetchOnWindowFocus: true,
  }
);
```

---

## 🎨 UI 컴포넌트 추가

```bash
# shadcn/ui 컴포넌트 추가
pnpm dlx shadcn@latest add [component-name]

# 예시
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add table
```

[사용 가능한 컴포넌트 목록](https://ui.shadcn.com/docs/components)

---

## 🚢 배포

### Vercel (추천)

1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com)에서 Import
3. 환경변수 설정:
   - `DATABASE_URL` - PostgreSQL 연결 문자열
   - `NEXTAUTH_SECRET` - 인증 시크릿
   - `NEXTAUTH_URL` - 배포 URL
   - `NEXT_PUBLIC_APP_URL` - 클라이언트 URL
   - `GEMINI_API_KEY` - Google Gemini AI 키
   - `NEXT_PUBLIC_KAKAO_MAPS_APP_KEY` - Kakao Maps 키
4. 자동 배포 완료!

### 데이터베이스 추천

| 서비스 | 특징 | 무료 플랜 |
|--------|------|-----------|
| [Supabase](https://supabase.com) | PostgreSQL + Realtime | ✅ 500MB |
| [Neon](https://neon.tech) | 서버리스 PostgreSQL | ✅ 3GB |
| [Railway](https://railway.app) | 간편한 배포 | ✅ $5/월 크레딧 |
| [Vercel Postgres](https://vercel.com/storage/postgres) | Vercel 네이티브 | ✅ 256MB |

### 필수 API 키 발급

1. **Google Gemini AI**: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   - 번역 기능에 필요
   - 무료 플랜: 분당 60회 요청
   
2. **Kakao Maps**: [https://developers.kakao.com/](https://developers.kakao.com/)
   - 지도 및 위치 검색 기능에 필요
   - JavaScript 키 발급 후 `NEXT_PUBLIC_KAKAO_MAPS_APP_KEY`에 설정

---

## 📖 추가 문서

### 개발 가이드
- [🛠️ DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - **필독!** 개발 플로우, 수칙, 팁
- [📘 SETUP.md](./SETUP.md) - 상세한 설정 방법
- [💡 EXAMPLES.md](./EXAMPLES.md) - 자주 사용하는 패턴
- [✅ HACKATHON_CHECKLIST.md](./HACKATHON_CHECKLIST.md) - 해커톤 체크리스트
- [🔐 ENV_SETUP.md](./ENV_SETUP.md) - 환경변수 상세 가이드

### 구현 문서
- [🎯 IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - 전체 구현 요약
- [🛡️ SECURITY_COMPLETE.md](./SECURITY_COMPLETE.md) - 보안 완성 문서 (10/10 점수)
- [🗺️ KAKAO_MAP_IMPLEMENTATION_COMPLETE.md](./KAKAO_MAP_IMPLEMENTATION_COMPLETE.md) - 카카오맵 구현
- [🌐 I18N_IMPLEMENTATION.md](./I18N_IMPLEMENTATION.md) - 다국어 구현 (next-intl)
- [📋 PLAN.md](./PLAN.md) - 프로젝트 기획안
- [💡 IDEA.md](./IDEA.md) - 초기 아이디어 및 컨셉

---

## 🧰 기술 스택

### 🎯 코어 프레임워크
| 기술 | 버전 | 용도 |
|------|------|------|
| [Next.js](https://nextjs.org/) | 16.0.1 | App Router, RSC, React 19 Compiler |
| [React](https://react.dev/) | 19.2.0 | UI 라이브러리 |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | 타입 안전성 |
| [tRPC](https://trpc.io/) | 11.7.1 | End-to-End Type Safety |

### 🗄️ 데이터베이스 & ORM
| 기술 | 용도 |
|------|------|
| [Prisma](https://www.prisma.io/) | PostgreSQL ORM |
| PostgreSQL | 관계형 데이터베이스 |

### 🔐 인증 & 보안
| 기술 | 용도 |
|------|------|
| [NextAuth.js v5](https://authjs.dev/) | 세션 기반 인증 |
| bcryptjs | 비밀번호 해싱 |
| Custom Rate Limiting | API 남용 방지 |
| Zod | 입력 검증 |

### 🤖 AI & API
| 기술 | 용도 |
|------|------|
| [Google Gemini AI](https://ai.google.dev/) | 실시간 번역 |
| [Kakao Maps API](https://apis.map.kakao.com/) | 지도 및 위치 검색 |

### 🎨 UI & 스타일링
| 기술 | 용도 |
|------|------|
| [Tailwind CSS v4](https://tailwindcss.com/) | 유틸리티 기반 CSS |
| [shadcn/ui](https://ui.shadcn.com/) | 컴포넌트 라이브러리 |
| [Radix UI](https://www.radix-ui.com/) | Headless 컴포넌트 |
| [Lucide Icons](https://lucide.dev/) | 아이콘 |
| [next-themes](https://github.com/pacocoursey/next-themes) | 다크모드 |

### 📡 상태 관리 & 데이터 페칭
| 기술 | 용도 |
|------|------|
| [TanStack Query v5](https://tanstack.com/query) | 서버 상태 관리 |
| [React Hook Form](https://react-hook-form.com/) | 폼 관리 |
| [Zod](https://zod.dev/) | 스키마 검증 |

### 🌐 국제화
| 기술 | 용도 |
|------|------|
| [next-intl](https://next-intl-docs.vercel.app/) | 다국어 지원 (한국어/영어) |
| [date-fns](https://date-fns.org/) | 날짜 포맷팅 |

### 🛠️ 개발 도구
| 기술 | 용도 |
|------|------|
| ESLint | 코드 린팅 |
| Prettier (내장) | 코드 포맷팅 |
| pnpm | 패키지 매니저 |
| tsx | TypeScript 실행 |

---

## 🤝 기여

기여는 언제나 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 라이선스

MIT License - 자유롭게 사용하세요!

---

## 💬 문의 및 지원

- Issues: [GitHub Issues](https://github.com/csh1668/hmmnyaring/issues)
- Discussions: [GitHub Discussions](https://github.com/csh1668/hmmnyaring/discussions)

---

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들을 기반으로 합니다:

- [T3 Stack](https://create.t3.gg/)
- [Next.js](https://nextjs.org/)
- [tRPC](https://trpc.io/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)

---
