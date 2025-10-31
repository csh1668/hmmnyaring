/**
 * 회원가입 페이지
 */

import { RegisterForm } from '@/components/auth/register-form';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
  const session = await auth();

  // 이미 로그인된 경우 대시보드로 리다이렉트
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="font-medium underline underline-offset-4">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}

