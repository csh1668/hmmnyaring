/**
 * 로그인 페이지
 */

import { LoginForm } from '@/components/auth/login-form';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await auth();

  // 이미 로그인된 경우 대시보드로 리다이렉트
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          계정이 없으신가요?{' '}
          <Link href="/register" className="font-medium underline underline-offset-4">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}

