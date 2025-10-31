# 🛠️ 개발 가이드

해커톤 보일러플레이트 사용 시 반드시 숙지해야 할 개발 수칙과 플로우입니다.

---

## 📁 폴더 구조 규칙

### **반드시 지켜야 할 구조**

```
src/
├── app/                    # Next.js App Router (페이지, 레이아웃)
│   ├── (auth)/            # 라우트 그룹: 인증 필요 페이지
│   ├── (public)/          # 라우트 그룹: 퍼블릭 페이지
│   └── api/               # API 라우트 (tRPC, NextAuth)
│
├── server/                 # 🔴 서버 전용 코드 (클라이언트에서 절대 import 금지)
│   ├── routers/           # tRPC 라우터
│   ├── helpers/           # 서버 유틸리티
│   ├── db.ts              # Prisma 클라이언트
│   ├── trpc.ts            # tRPC 설정
│   └── context.ts         # tRPC 컨텍스트
│
├── lib/                    # 공유 라이브러리
│   ├── trpc/              # tRPC 클라이언트 설정
│   ├── schemas/           # Zod 스키마 (공유)
│   ├── auth.ts            # NextAuth 설정
│   └── utils.ts           # 공통 유틸리티
│
├── components/             # React 컴포넌트
│   ├── ui/                # shadcn/ui 기본 컴포넌트
│   ├── auth/              # 인증 관련 컴포넌트
│   ├── layouts/           # 레이아웃 컴포넌트
│   └── [feature]/         # 기능별 컴포넌트 그룹
│
└── env/                    # 🔴 환경변수 검증
    ├── server.ts          # 서버 전용 (server-only)
    └── client.ts          # 클라이언트 공개
```

### **⚠️ 중요 규칙**

1. **`src/server/`는 절대 클라이언트에서 import 금지**
   ```typescript
   // ❌ 클라이언트 컴포넌트에서
   'use client';
   import { prisma } from '@/server/db';  // 빌드 에러!
   
   // ✅ 서버 컴포넌트나 API 라우트에서만
   import { prisma } from '@/server/db';
   ```

2. **환경변수는 반드시 `src/env/`를 통해서만 접근**
   ```typescript
   // ❌ 직접 접근
   const url = process.env.DATABASE_URL;
   
   // ✅ env 파일 사용
   import { serverEnv } from '@/env/server';
   const url = serverEnv.DATABASE_URL;
   ```

3. **Prisma는 항상 `@/server/db`에서 import**
   ```typescript
   // ❌ 직접 import
   import { PrismaClient } from '@prisma/client';
   const prisma = new PrismaClient();
   
   // ✅ 싱글톤 사용
   import { prisma } from '@/server/db';
   ```

---

## 🚀 새 기능 추가 플로우

### **1. 데이터 모델 추가하기**

#### Step 1: Prisma 스키마 정의
```prisma
// prisma/schema.prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  description String?  @db.Text
  price       Int
  stock       Int      @default(0)
  
  // Relations
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Indexes
  @@index([userId])
  @@index([createdAt])
}

// User 모델에 relation 추가
model User {
  // ... 기존 필드
  products Product[]
}
```

**체크리스트:**
- [ ] `createdAt`, `updatedAt` 필수 추가
- [ ] User 관계 설정 (userId)
- [ ] `onDelete: Cascade` 설정
- [ ] 자주 쿼리하는 필드에 `@@index` 추가

#### Step 2: 스키마 반영
```bash
# 개발 중: 빠른 반영
pnpm db:push

# 프로덕션: 마이그레이션 생성
pnpm db:migrate
```

#### Step 3: Prisma Studio로 확인
```bash
pnpm db:studio
```

---

### **2. tRPC 라우터 추가하기**

#### Step 1: Zod 스키마 정의
```typescript
// src/lib/schemas/product.ts
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, '상품명을 입력해주세요.'),
  description: z.string().optional(),
  price: z.number().min(0, '가격은 0 이상이어야 합니다.'),
  stock: z.number().int().min(0).default(0),
});

export const updateProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
```

#### Step 2: tRPC 라우터 작성
```typescript
// src/server/routers/product.ts
import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { createProductSchema, updateProductSchema } from '@/lib/schemas/product';

export const productRouter = createTRPCRouter({
  // 공개 API: 모든 상품 조회
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      
      const products = await ctx.prisma.product.findMany({
        take: limit + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      });

      let nextCursor: string | undefined;
      if (products.length > limit) {
        const nextItem = products.pop();
        nextCursor = nextItem!.id;
      }

      return {
        products,
        nextCursor,
      };
    }),

  // 보호된 API: 상품 생성
  create: protectedProcedure
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.product.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  // 보호된 API: 상품 수정 (본인만)
  update: protectedProcedure
    .input(updateProductSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // 권한 체크
      const product = await ctx.prisma.product.findUnique({ where: { id } });
      if (!product || product.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: '권한이 없습니다.' });
      }

      return ctx.prisma.product.update({
        where: { id },
        data,
      });
    }),

  // 보호된 API: 상품 삭제
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.id },
      });

      if (!product || product.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return ctx.prisma.product.delete({ where: { id: input.id } });
    }),
});
```

#### Step 3: 라우터 등록
```typescript
// src/server/routers/_app.ts
import { createTRPCRouter } from '../trpc';
import { userRouter } from './user';
import { postRouter } from './post';
import { productRouter } from './product';  // 추가

export const appRouter = createTRPCRouter({
  user: userRouter,
  post: postRouter,
  product: productRouter,  // 등록
});

export type AppRouter = typeof appRouter;
```

---

### **3. 클라이언트에서 사용하기**

#### 클라이언트 컴포넌트
```typescript
'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/lib/trpc/client';
import { toast } from 'sonner';

export function ProductList() {
  const trpc = useTRPC();

  // 쿼리
  const { data, isLoading } = useQuery(
    trpc.product.getAll.queryOptions({ limit: 20 })
  );

  // 뮤테이션
  const createMutation = useMutation(trpc.product.create.mutationOptions());

  const handleCreate = () => {
    createMutation.mutate(
      { name: '새 상품', price: 10000 },
      {
        onSuccess: () => {
          toast.success('상품이 생성되었습니다.');
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  if (isLoading) return <ProductSkeleton />;

  return (
    <div>
      {data?.products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

#### 서버 컴포넌트
```typescript
// app/products/page.tsx
import { createServerCaller } from '@/lib/trpc/server';

export default async function ProductsPage() {
  const caller = await createServerCaller();
  const { products } = await caller.product.getAll({ limit: 10 });

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

---

## 🎯 개발 수칙 (Must Follow)

### **1. 타입 안전성**
```typescript
// ❌ any 사용 금지
const data: any = await fetch();

// ✅ 명시적 타입
const data: Product[] = await fetch();

// ✅ Zod로 런타임 검증
const productSchema = z.object({ name: z.string() });
const data = productSchema.parse(input);
```

### **2. 에러 처리**
```typescript
// ❌ 에러 무시
await trpc.product.create.mutate(data);

// ✅ 항상 에러 처리
mutation.mutate(data, {
  onError: (error) => {
    toast.error(error.message);
    // 필요시 Sentry 등으로 로깅
  },
});
```

### **3. 권한 체크**
```typescript
// ❌ 권한 체크 없이 수정
update: protectedProcedure.mutation(async ({ ctx, input }) => {
  return ctx.prisma.product.update({ where: { id: input.id }, data });
});

// ✅ 본인 데이터만 수정 가능하도록
update: protectedProcedure.mutation(async ({ ctx, input }) => {
  const product = await ctx.prisma.product.findUnique({ where: { id: input.id } });
  
  if (!product || product.userId !== ctx.session.user.id) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  
  return ctx.prisma.product.update({ where: { id: input.id }, data });
});
```

### **4. 인덱스 최적화**
```prisma
// ❌ 인덱스 없이 자주 쿼리
model Post {
  authorId String
  createdAt DateTime
}

// ✅ 자주 쿼리하는 필드에 인덱스
model Post {
  authorId String
  createdAt DateTime
  
  @@index([authorId])        // WHERE authorId = ?
  @@index([createdAt])       // ORDER BY createdAt
  @@index([authorId, createdAt])  // 복합 쿼리 최적화
}
```

### **5. N+1 쿼리 방지**
```typescript
// ❌ N+1 쿼리 문제
const posts = await prisma.post.findMany();
for (const post of posts) {
  const author = await prisma.user.findUnique({ where: { id: post.authorId } });
}

// ✅ include/select로 한 번에
const posts = await prisma.post.findMany({
  include: {
    author: {
      select: { id: true, name: true },
    },
  },
});
```

---

## 💡 개발 플로우

### **기능 추가 순서**

```
1. 기획
   └─ 필요한 데이터 엔티티 파악
   └─ API 엔드포인트 설계
   └─ 페이지/컴포넌트 구조 결정

2. 백엔드 (30분)
   └─ Prisma 스키마 작성
   └─ pnpm db:push
   └─ Zod 스키마 정의 (src/lib/schemas/)
   └─ tRPC 라우터 작성 (src/server/routers/)
   └─ _app.ts에 라우터 등록

3. 프론트엔드 (1시간)
   └─ 페이지 파일 생성 (src/app/)
   └─ 컴포넌트 작성 (src/components/)
   └─ tRPC 쿼리/뮤테이션 연결
   └─ UI 컴포넌트 추가 (shadcn/ui)

4. 테스트 (15분)
   └─ 브라우저에서 기능 테스트
   └─ 에러 케이스 확인
   └─ 권한 체크 검증

5. 최적화 (선택)
   └─ Skeleton 로딩 추가
   └─ Optimistic Updates
   └─ 에러 메시지 개선
```

---

## 🔥 자주 하는 실수와 해결법

### **1. tRPC 타입 에러**

**문제:**
```typescript
// Property 'product' does not exist on type 'AppRouter'
trpc.product.getAll.useQuery();
```

**해결:**
```bash
# 서버 재시작 (타입 재생성)
Ctrl+C
pnpm dev
```

**원인:** tRPC 라우터를 추가했지만 타입이 자동 생성되지 않음

---

### **2. Prisma Client 에러**

**문제:**
```
PrismaClient is unable to run in this browser environment
```

**해결:**
```typescript
// ❌ 클라이언트에서 Prisma import
'use client';
import { prisma } from '@/server/db';  // 이게 문제!

// ✅ tRPC로 서버에 요청
'use client';
const { data } = useQuery(trpc.product.getAll.queryOptions());
```

---

### **3. 환경변수가 undefined**

**문제:**
```typescript
console.log(process.env.NEXT_PUBLIC_API_URL);  // undefined
```

**해결:**
```typescript
// 1. .env 파일 확인 (NEXT_PUBLIC_ 접두사 필수)
NEXT_PUBLIC_API_URL="http://localhost:3000"

// 2. 서버 재시작
pnpm dev

// 3. env 파일 사용
import { clientEnv } from '@/env/client';
console.log(clientEnv.NEXT_PUBLIC_APP_URL);
```

---

### **4. Session null 문제**

**문제:**
```typescript
const session = await auth();
console.log(session);  // null
```

**해결:**
```bash
# 1. 브라우저 쿠키 삭제
# 2. 다시 로그인

# 3. NEXTAUTH_SECRET 확인
# .env
NEXTAUTH_SECRET="올바른-32자-이상-시크릿"
```

---

## 🎨 UI 컴포넌트 추가

### **shadcn/ui 컴포넌트 검색**

```bash
# 필요한 컴포넌트 확인
pnpm dlx shadcn@latest

# 컴포넌트 추가
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add table
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add select
```

### **자주 사용하는 컴포넌트**

| 기능 | 컴포넌트 | 명령어 |
|------|----------|--------|
| 모달 | Dialog | `add dialog` |
| 테이블 | Table | `add table` |
| 드롭다운 | Dropdown Menu | `add dropdown-menu` |
| 선택 | Select | `add select` |
| 텍스트 영역 | Textarea | `add textarea` |
| 체크박스 | Checkbox | `add checkbox` |
| 라디오 | Radio Group | `add radio-group` |
| 날짜 선택 | Date Picker | `add calendar` |

---

## ⚡ 성능 최적화 팁

### **1. React Query 캐싱**
```typescript
// 자주 변하지 않는 데이터
const { data } = useQuery({
  ...trpc.product.getAll.queryOptions(),
  staleTime: 5 * 60 * 1000,  // 5분간 신선하다고 간주
});

// 실시간 데이터
const { data } = useQuery({
  ...trpc.dashboard.stats.queryOptions(),
  refetchInterval: 10000,  // 10초마다 자동 갱신
});
```

### **2. Optimistic Updates**
```typescript
const deleteMutation = useMutation({
  ...trpc.product.delete.mutationOptions(),
  onMutate: async (deletedId) => {
    // 낙관적 업데이트: UI 먼저 변경
    await queryClient.cancelQueries({ queryKey: ['product'] });
    
    const previousProducts = queryClient.getQueryData(['product', 'getAll']);
    
    queryClient.setQueryData(['product', 'getAll'], (old: any) =>
      old?.filter((p: any) => p.id !== deletedId)
    );
    
    return { previousProducts };
  },
  onError: (err, deletedId, context) => {
    // 에러 시 롤백
    queryClient.setQueryData(['product', 'getAll'], context?.previousProducts);
  },
});
```

### **3. 이미지 최적화**
```typescript
// ❌ img 태그
<img src="/logo.png" alt="Logo" />

// ✅ Next.js Image
import Image from 'next/image';
<Image src="/logo.png" alt="Logo" width={200} height={50} priority />
```

### **4. 컴포넌트 코드 분할**
```typescript
// 큰 컴포넌트는 동적 import
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/charts/heavy-chart'), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false,  // 클라이언트에서만 렌더링
});
```

---

## 🧪 디버깅 팁

### **1. React Query Devtools 활용**
```typescript
// 이미 포함되어 있음 (개발 환경에서만)
// 브라우저 왼쪽 하단의 React Query 아이콘 클릭

// 확인 가능한 것:
- 모든 쿼리 상태 (fresh, stale, fetching)
- 캐시된 데이터
- 쿼리 실행 시간
- 에러 상태
```

### **2. Prisma Studio**
```bash
pnpm db:studio

# 브라우저에서 http://localhost:5555 열림
# DB 데이터 직접 확인/수정 가능
```

### **3. tRPC 에러 디버깅**
```typescript
// 서버 측 에러 로깅
export const productRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      console.log('[Product Create] Input:', input);
      console.log('[Product Create] User:', ctx.session.user.id);
      
      try {
        const result = await ctx.prisma.product.create({ data: input });
        console.log('[Product Create] Success:', result.id);
        return result;
      } catch (error) {
        console.error('[Product Create] Error:', error);
        throw error;
      }
    }),
});
```

---

## 📝 코딩 컨벤션

### **파일명**
- 파일: `kebab-case.tsx` (예: `product-list.tsx`)
- 컴포넌트: `PascalCase` (예: `ProductList`)
- 함수/변수: `camelCase` (예: `getProductById`)
- 상수: `UPPER_SNAKE_CASE` (예: `MAX_PRODUCTS`)
- 타입: `PascalCase` (예: `ProductInput`)

### **Import 순서**
```typescript
// 1. React 및 Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. 외부 라이브러리
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// 3. 내부 라이브러리
import { useTRPC } from '@/lib/trpc/client';
import { serverEnv } from '@/env/server';

// 4. 컴포넌트
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/product-card';

// 5. 타입
import type { Product } from '@prisma/client';
```

### **use client 지시어**
```typescript
// ❌ 모든 파일에 use client
'use client';
export function StaticComponent() { ... }

// ✅ 필요한 경우만 (useState, useEffect, onClick 등)
'use client';
export function InteractiveComponent() {
  const [state, setState] = useState();
  return <button onClick={() => {}}>Click</button>;
}

// ✅ 서버 컴포넌트는 지시어 불필요
export async function ServerComponent() {
  const data = await fetch();
  return <div>{data}</div>;
}
```

---

## 🚦 Git Workflow

### **커밋 메시지 컨벤션**
```bash
# 기능 추가
git commit -m "feat: 상품 CRUD 기능 추가"

# 버그 수정
git commit -m "fix: 포스트 삭제 권한 체크 추가"

# 스타일링
git commit -m "style: 대시보드 레이아웃 개선"

# 리팩토링
git commit -m "refactor: tRPC 라우터 구조 개선"

# 문서
git commit -m "docs: README 환경 설정 가이드 추가"
```

### **브랜치 전략**
```bash
# 기능 개발
git checkout -b feature/product-management

# 버그 수정
git checkout -b fix/auth-redirect

# 작업 완료 후
git push origin feature/product-management
# PR 생성
```

---

## 🎯 해커톤 빠른 개발 팁

### **1. 코드 재사용**
```typescript
// 유사한 CRUD는 기존 라우터 복사
cp src/server/routers/post.ts src/server/routers/product.ts
# 내용만 수정
```

### **2. Prisma Studio 활용**
```bash
# 시드 데이터 대신 직접 데이터 입력
pnpm db:studio
# GUI로 데이터 추가/수정/삭제
```

### **3. AI 코드 생성 활용**
```
# ChatGPT/Copilot에게 요청
"Prisma schema for Product model with name, price, stock"
"tRPC router for Product CRUD with authorization"
"React component for product list with search and filter"
```

### **4. 빠른 프로토타이핑**
```bash
# 마이그레이션 파일 생성 없이 빠르게
pnpm db:push

# 나중에 정리
pnpm db:migrate
```

### **5. 컴포넌트 복사**
```bash
# 기존 컴포넌트 기반으로 빠르게 제작
cp src/components/dashboard/post-list.tsx src/components/product/product-list.tsx
# 내용만 수정
```

---

## 🐛 트러블슈팅 체크리스트

### **빌드 에러**
- [ ] `pnpm install` 실행
- [ ] `pnpm db:generate` 실행
- [ ] 서버 재시작
- [ ] `.next` 폴더 삭제 후 재빌드

### **tRPC 에러**
- [ ] 라우터가 `_app.ts`에 등록되었는지 확인
- [ ] Zod 스키마가 올바른지 확인
- [ ] 서버 터미널 에러 로그 확인
- [ ] 브라우저 콘솔 에러 확인

### **데이터베이스 에러**
- [ ] `DATABASE_URL` 환경변수 확인
- [ ] 데이터베이스 서버 실행 상태 확인
- [ ] `pnpm db:push` 실행 (스키마 동기화)
- [ ] Prisma Studio로 데이터 확인

### **인증 에러**
- [ ] `NEXTAUTH_SECRET` 설정 확인
- [ ] 브라우저 쿠키 삭제 후 재로그인
- [ ] `NEXTAUTH_URL` 확인
- [ ] 세션 만료 시간 확인

---

## 📚 추천 개발 순서 (해커톤 12시간 기준)

### **Hour 1-2: 기획 & 설계**
- 핵심 기능 정의 (MVP)
- 데이터 모델 설계
- API 엔드포인트 설계
- 페이지 구조 스케치

### **Hour 3-5: 백엔드**
- Prisma 스키마 작성
- tRPC 라우터 구현
- 인증/권한 로직
- 기본 CRUD 완성

### **Hour 6-9: 프론트엔드**
- 주요 페이지 구현
- UI 컴포넌트 조합
- 폼 처리
- 에러 처리

### **Hour 10-11: 통합 & 테스트**
- 엔드-투-엔드 테스트
- 버그 수정
- UI/UX 개선

### **Hour 12: 배포 & 발표 준비**
- Vercel 배포
- 시연 데이터 준비
- 발표 자료 작성

---

## 🎁 보너스 팁

### **환경변수 관리**
```bash
# 로컬 개발
.env.local

# 팀 공유 (기본값)
.env.example

# 프로덕션
Vercel 환경변수 설정
```

### **타입스크립트 strictness**
```typescript
// tsconfig.json - 이미 설정되어 있음
{
  "strict": true,  // 엄격한 타입 체크
  "noUncheckedIndexedAccess": true,  // 배열 접근 안전성
}
```

### **VSCode 확장 프로그램** (`.vscode/extensions.json`)
- Prisma (Syntax Highlighting)
- ESLint (코드 린팅)
- Tailwind CSS IntelliSense
- Error Lens (에러 인라인 표시)

---

## 📖 더 읽어보기

- [tRPC 공식 문서](https://trpc.io/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [NextAuth 가이드](https://authjs.dev/getting-started)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com/docs/components)
- [React Query 가이드](https://tanstack.com/query/latest/docs/framework/react/guides)

---

**Happy Hacking! 🚀**

