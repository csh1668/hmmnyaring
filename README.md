# 🚀 Hackathon Starter

**풀스택 보일러플레이트**

Next.js 15 + tRPC + Prisma + NextAuth + TypeScript로 구축된 프로덕션 레디 템플릿입니다.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ 주요 기능

### 핵심 스택
- ⚡ **Next.js 15** - App Router, React Server Components
- 🔐 **NextAuth v5** - 즉시 사용 가능한 인증 시스템
- 🛡️ **tRPC v11** - 타입 안전한 API (TanStack React Query Integration)
- 💾 **Prisma ORM** - PostgreSQL과 완벽한 TypeScript 통합
- 🎨 **Tailwind CSS v4** - 유틸리티 기반 스타일링
- 🧩 **shadcn/ui** - 아름다운 UI 컴포넌트

### 개발 경험 (DX)
- 📝 **Zod** - 런타임 타입 검증 + 환경변수 검증
- 🔥 **React Query Devtools** - API 디버깅 도구
- 🎯 **타입 안전성** - End-to-End Type Safety
- 📦 **pnpm** - 빠른 패키지 매니저

---

## 📋 사전 요구사항

- Node.js 18+
- pnpm 8+
- PostgreSQL 데이터베이스

---

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone https://github.com/csh1668/nextjs-trpc-prisma-boilerplate
cd nextjs-trpc-prisma-boilerplate
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

**테스트 계정** (시드 데이터 생성한 경우):
- 이메일: `test@example.com`
- 비밀번호: `password123`

---

## 📁 프로젝트 구조

```
hackathon-starter/
├── prisma/
│   ├── schema.prisma          # 데이터베이스 스키마
│   └── seed.ts                # 시드 데이터
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth 엔드포인트
│   │   │   └── trpc/          # tRPC 엔드포인트
│   │   ├── login/             # 로그인 페이지
│   │   ├── register/          # 회원가입 페이지
│   │   ├── dashboard/         # 보호된 페이지 예제
│   │   ├── layout.tsx         # 루트 레이아웃
│   │   └── page.tsx           # 홈페이지
│   ├── components/
│   │   ├── auth/              # 인증 컴포넌트
│   │   ├── layouts/           # 레이아웃 컴포넌트
│   │   └── ui/                # shadcn/ui 컴포넌트
│   ├── lib/
│   │   ├── auth.ts            # NextAuth 설정
│   │   ├── utils.ts           # 유틸리티 함수
│   │   ├── schemas/           # Zod 스키마
│   │   └── trpc/
│   │       ├── client.ts      # tRPC 클라이언트
│   │       ├── provider.tsx   # tRPC Provider
│   │       └── server.ts      # 서버 사이드 클라이언트
│   └── server/
│       ├── db.ts              # Prisma 클라이언트
│       ├── trpc.ts            # tRPC 초기화
│       ├── context.ts         # tRPC 컨텍스트
│       ├── routers/
│       │   ├── _app.ts        # 메인 라우터
│       │   ├── user.ts        # 유저 라우터
│       │   └── post.ts        # 포스트 라우터 (예제)
│       └── helpers/
│           └── crud.ts        # CRUD 헬퍼
├── .vscode/                   # VSCode 설정
├── components.json            # shadcn/ui 설정
├── SETUP.md                   # 상세 설정 가이드
├── EXAMPLES.md                # 예제 코드
├── HACKATHON_CHECKLIST.md     # 해커톤 체크리스트
└── README.md
```

---

## 📚 사용 가이드

### tRPC로 API 만들기

#### 1. 라우터 생성

```typescript
// src/server/routers/product.ts
import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';

export const productRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.product.findMany();
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string(), price: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.product.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),
});
```

#### 2. 라우터 등록

```typescript
// src/server/routers/_app.ts
import { productRouter } from './product';

export const appRouter = createTRPCRouter({
  product: productRouter,
  // ...
});
```

#### 3. 클라이언트에서 사용

```typescript
'use client';
import { trpc } from '@/lib/trpc/client';

export function ProductList() {
  const { data, isLoading } = trpc.product.getAll.useQuery();
  const createMutation = trpc.product.create.useMutation();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### Prisma로 데이터 모델링

```prisma
// prisma/schema.prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  price       Int
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}
```

스키마 변경 후:
```bash
pnpm db:push  # 개발 중
# 또는
pnpm db:migrate  # 프로덕션용 마이그레이션
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

## 🔐 인증 시스템

### 보호된 페이지 만들기

```typescript
// app/protected/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  return <div>안녕하세요, {session.user.name}님!</div>;
}
```

### 클라이언트에서 세션 사용

```typescript
'use client';
import { useSession } from 'next-auth/react';

export function UserInfo() {
  const { data: session } = useSession();
  return <div>{session?.user?.email}</div>;
}
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
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (예: `https://yourapp.vercel.app`)
   - `NEXT_PUBLIC_APP_URL`
4. 자동 배포 완료!

### 데이터베이스 추천

- [Supabase](https://supabase.com) - 무료, PostgreSQL
- [Neon](https://neon.tech) - 서버리스 PostgreSQL
- [Railway](https://railway.app) - 간편한 배포
- [PlanetScale](https://planetscale.com) - MySQL (Prisma 호환)

---

## 📖 추가 문서

- [🛠️ 개발 가이드](./DEVELOPMENT_GUIDE.md) - **필독!** 개발 플로우, 수칙, 팁
- [📘 설정 가이드](./SETUP.md) - 상세한 설정 방법
- [💡 예제 코드](./EXAMPLES.md) - 자주 사용하는 패턴
- [✅ 해커톤 체크리스트](./HACKATHON_CHECKLIST.md) - 해커톤 진행 가이드
- [🔐 환경변수 설정](./ENV_SETUP.md) - 환경변수 상세 가이드

---

## 🧰 기술 스택

### 코어
- [Next.js 15](https://nextjs.org/) - React 프레임워크
- [TypeScript](https://www.typescriptlang.org/) - 타입 안전성
- [tRPC](https://trpc.io/) - End-to-End 타입 안전 API
- [Prisma](https://www.prisma.io/) - ORM

### 인증
- [NextAuth.js v5](https://authjs.dev/) - 인증 솔루션

### UI
- [Tailwind CSS v4](https://tailwindcss.com/) - 스타일링
- [shadcn/ui](https://ui.shadcn.com/) - UI 컴포넌트
- [Radix UI](https://www.radix-ui.com/) - Headless 컴포넌트

### 검증 & 상태관리
- [Zod](https://zod.dev/) - 스키마 검증
- [React Query](https://tanstack.com/query) - 서버 상태 관리

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

- Issues: [GitHub Issues](https://github.com/csh1668/nextjs-trpc-prisma-boilerplate/issues)
- Discussions: [GitHub Discussions](https://github.com/csh1668/nextjs-trpc-prisma-boilerplate/discussions)

---

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들을 기반으로 합니다:

- [T3 Stack](https://create.t3.gg/)
- [Next.js](https://nextjs.org/)
- [tRPC](https://trpc.io/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)

---
