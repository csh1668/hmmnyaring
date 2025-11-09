/**
 * 가이드 코스 관리 페이지
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MyCoursesList } from './components/my-courses-list';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function GuideCoursesPage({ params }: PageProps) {
  const { locale } = await params;
  const session = await auth();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  if (session.user.role !== 'GUIDE') {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">내 여행 코스</h1>
          <p className="text-muted-foreground mt-2">
            작성한 여행 코스를 관리하세요
          </p>
        </div>
        <Link href={`/${locale}/dashboard/guide/courses/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            새 코스 만들기
          </Button>
        </Link>
      </div>

      <MyCoursesList locale={locale} />
    </div>
  );
}


