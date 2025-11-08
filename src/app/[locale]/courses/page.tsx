/**
 * 추천 여행 코스 목록 페이지
 */

import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { TourCourseList } from './components/tour-course-list';
import { Skeleton } from '@/components/ui/skeleton';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'courses' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function CoursesPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: 'courses' });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <Suspense fallback={<CourseListSkeleton />}>
        <TourCourseList locale={locale} searchParams={search} />
      </Suspense>
    </div>
  );
}

function CourseListSkeleton() {
  return (
    <div className="space-y-6">
      {/* 필터 영역 스켈레톤 */}
      <div className="flex gap-4 flex-wrap">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* 카드 그리드 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

