import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <div className="mx-auto w-full max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          🚀 Hackathon Starter
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Next.js 15 + tRPC + Prisma + NextAuth로 만든 풀스택 보일러플레이트.
          <br />
          해커톤에서 바로 사용할 수 있도록 모든 기본 기능이 준비되어 있습니다.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          {session ? (
            <Link href="/dashboard">
              <Button size="lg">대시보드로 이동</Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg">시작하기</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  로그인
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <div className="text-4xl font-bold">⚡</div>
            <h3 className="mt-4 font-semibold">빠른 개발</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              tRPC로 타입 안전한 API를 빠르게 구축
            </p>
          </div>
          <div>
            <div className="text-4xl font-bold">🔒</div>
            <h3 className="mt-4 font-semibold">인증 내장</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              NextAuth로 즉시 사용 가능한 인증 시스템
            </p>
          </div>
          <div>
            <div className="text-4xl font-bold">💾</div>
            <h3 className="mt-4 font-semibold">데이터베이스</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Prisma ORM으로 간편한 DB 관리
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
