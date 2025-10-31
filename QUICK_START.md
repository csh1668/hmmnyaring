# ⚡ 5분 빠른 시작

해커톤 시작 5분 전에 이것만 보세요!

---

## 🚀 즉시 시작하기

### 1. 환경변수 설정 (1분)

`.env` 파일 생성:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
NEXTAUTH_SECRET="openssl-rand-base64-32로-생성한-값"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. 설치 및 실행 (2분)

```bash
pnpm install
pnpm db:push
pnpm db:seed      # 선택: 테스트 계정 생성
pnpm dev
```

### 3. 브라우저 확인 (1분)

http://localhost:3000 접속

**테스트 계정:**
- 이메일: `test@example.com`
- 비밀번호: `password123`

---

## 📝 새 기능 추가 (30분 패턴)

### 1단계: 데이터 모델 (5분)
```prisma
// prisma/schema.prisma
model NewModel {
  id        String   @id @default(cuid())
  name      String
  userId    String
  user      User     @relation(...)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([userId])
}
```
```bash
pnpm db:push
```

### 2단계: Zod 스키마 (5분)
```typescript
// src/lib/schemas/new-model.ts
export const createSchema = z.object({
  name: z.string().min(1),
});
```

### 3단계: tRPC 라우터 (10분)
```typescript
// src/server/routers/new-model.ts
export const newModelRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => ctx.prisma.newModel.findMany()),
  create: protectedProcedure.input(createSchema).mutation(...),
});

// src/server/routers/_app.ts
export const appRouter = createTRPCRouter({
  newModel: newModelRouter,  // 등록
});
```

### 4단계: 프론트엔드 (10분)
```typescript
'use client';
const trpc = useTRPC();
const { data } = useQuery(trpc.newModel.getAll.queryOptions());
const create = useMutation(trpc.newModel.create.mutationOptions());
```

**완료! 🎉**

---

## 🔥 자주 쓰는 명령어

```bash
pnpm dev              # 개발 서버
pnpm db:push          # 스키마 빠른 반영
pnpm db:studio        # DB GUI
pnpm db:seed          # 테스트 데이터
pnpm build            # 빌드 테스트
```

---

## 🐛 문제 발생 시

1. **타입 에러** → 서버 재시작 (`Ctrl+C`, `pnpm dev`)
2. **DB 에러** → `pnpm db:push`
3. **Prisma 에러** → `pnpm db:generate`
4. **빌드 에러** → `.next` 폴더 삭제 후 재빌드

---

## 📚 자세한 내용

- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - 상세 개발 가이드
- [EXAMPLES.md](./EXAMPLES.md) - 코드 예제
- [HACKATHON_CHECKLIST.md](./HACKATHON_CHECKLIST.md) - 체크리스트

**Good Luck! 🚀**

