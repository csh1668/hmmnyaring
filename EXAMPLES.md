# 📚 예제 코드 모음

자주 사용하는 패턴과 예제 코드입니다.

---

## 🔧 tRPC 사용법

### 1. 새 라우터 만들기

```typescript
// src/server/routers/example.ts
import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';

export const exampleRouter = createTRPCRouter({
  // 퍼블릭 쿼리
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return { message: `안녕하세요, ${input.name}님!` };
    }),

  // 보호된 뮤테이션 (로그인 필요)
  createItem: protectedProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.item.create({
        data: {
          title: input.title,
          userId: ctx.session.user.id,
        },
      });
    }),
});
```

### 2. 라우터 등록

```typescript
// src/server/routers/_app.ts
import { exampleRouter } from './example';

export const appRouter = createTRPCRouter({
  example: exampleRouter,
  // ... 다른 라우터들
});
```

### 3. 클라이언트에서 사용

```typescript
'use client';

import { trpc } from '@/lib/trpc/client';

export function ExampleComponent() {
  // 쿼리
  const { data, isLoading } = trpc.example.hello.useQuery({ name: '홍길동' });

  // 뮤테이션
  const createMutation = trpc.example.createItem.useMutation({
    onSuccess: () => {
      console.log('생성 완료!');
    },
  });

  const handleCreate = () => {
    createMutation.mutate({ title: '새 아이템' });
  };

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div>
      <p>{data?.message}</p>
      <button onClick={handleCreate}>아이템 생성</button>
    </div>
  );
}
```

### 4. 서버 컴포넌트에서 사용

```typescript
// app/page.tsx (Server Component)
import { serverTrpc } from '@/lib/trpc/server';

export default async function Page() {
  const data = await serverTrpc.example.hello({ name: '서버' });

  return <div>{data.message}</div>;
}
```

---

## 🗄️ Prisma 사용법

### 1. 새 모델 추가

```prisma
// prisma/schema.prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  description String?  @db.Text
  price       Int
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

// User 모델에 relation 추가
model User {
  // ... 기존 필드들
  products Product[]
}
```

스키마 변경 후:
```bash
pnpm db:push  # 빠른 반영
# 또는
pnpm db:migrate  # 마이그레이션 파일 생성
```

### 2. CRUD 작업

```typescript
// 생성
const product = await prisma.product.create({
  data: {
    name: '상품명',
    price: 10000,
    userId: user.id,
  },
});

// 조회
const products = await prisma.product.findMany({
  where: { userId: user.id },
  include: { user: true },  // 관계 포함
  orderBy: { createdAt: 'desc' },
});

// 하나 조회
const product = await prisma.product.findUnique({
  where: { id: productId },
});

// 업데이트
const updated = await prisma.product.update({
  where: { id: productId },
  data: { price: 15000 },
});

// 삭제
await prisma.product.delete({
  where: { id: productId },
});

// 여러 개 삭제
await prisma.product.deleteMany({
  where: { userId: user.id },
});

// 카운트
const count = await prisma.product.count({
  where: { price: { gte: 10000 } },
});
```

### 3. 트랜잭션

```typescript
const result = await prisma.$transaction(async (tx) => {
  // 재고 감소
  await tx.product.update({
    where: { id: productId },
    data: { stock: { decrement: 1 } },
  });

  // 주문 생성
  return tx.order.create({
    data: {
      productId,
      userId: user.id,
    },
  });
});
```

---

## 🔐 인증 패턴

### 1. 로그인 상태 확인

```typescript
// 서버 컴포넌트
import { auth } from '@/lib/auth';

export default async function ProtectedPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <div>환영합니다, {session.user.name}님!</div>;
}
```

### 2. 클라이언트에서 세션 사용

```typescript
'use client';

import { useSession } from 'next-auth/react';

export function UserInfo() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>로딩...</div>;
  if (!session) return <div>로그인하세요</div>;

  return <div>{session.user.email}</div>;
}
```

### 3. 프로그래밍 방식 로그인/로그아웃

```typescript
import { signIn, signOut } from 'next-auth/react';

// 로그인
await signIn('credentials', {
  email: 'user@example.com',
  password: 'password',
  redirect: false,
});

// 로그아웃
await signOut({ redirect: false });
```

---

## 🎨 UI 컴포넌트

### 1. 폼 처리

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function MyForm() {
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData);

      // API 호출
      await fetch('/api/endpoint', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      toast.success('성공!');
    } catch (error) {
      toast.error('실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input name="title" placeholder="제목" required />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? '처리 중...' : '제출'}
      </Button>
    </form>
  );
}
```

### 2. 토스트 알림

```typescript
import { toast } from 'sonner';

// 성공
toast.success('저장 완료!');

// 에러
toast.error('오류가 발생했습니다.');

// 정보
toast.info('알림 메시지');

// 커스텀
toast('커스텀 메시지', {
  description: '상세 설명',
  action: {
    label: '실행취소',
    onClick: () => console.log('실행취소'),
  },
});
```

---

## 🚀 배포

### Vercel 배포

1. GitHub에 푸시
2. [Vercel](https://vercel.com) 접속
3. "Import Project" 클릭
4. 환경변수 설정:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (예: https://yourapp.vercel.app)

### 환경변수 (Vercel)

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://yourapp.vercel.app
NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app
```

---

## 💡 유용한 팁

### 1. Prisma Studio로 DB 확인

```bash
pnpm db:studio
```

### 2. 타입 자동완성 활용

```typescript
// tRPC는 완벽한 타입 안전성 제공
trpc.post.getAll.useQuery();  // 반환 타입 자동 추론
```

### 3. Zod로 입력값 검증

```typescript
const schema = z.object({
  email: z.string().email(),
  age: z.number().min(1).max(120),
});

const result = schema.safeParse(input);
if (!result.success) {
  console.log(result.error.flatten());
}
```

### 4. 에러 처리

```typescript
// tRPC 뮤테이션
mutation.mutate(data, {
  onError: (error) => {
    if (error.data?.zodError) {
      // Zod 검증 에러
      console.log(error.data.zodError);
    }
    toast.error(error.message);
  },
});
```

---

## 📖 더 알아보기

- [tRPC 공식 문서](https://trpc.io)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [NextAuth 공식 문서](https://authjs.dev)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com)

