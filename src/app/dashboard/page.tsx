/**
 * 대시보드 페이지 (보호된 라우트)
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PostList } from '@/components/dashboard/post-list';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">안녕하세요, {session.user.name}님!</p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">📝 내 포스트</h2>
          <PostList />
        </div>
      </div>
    </div>
  );
}

