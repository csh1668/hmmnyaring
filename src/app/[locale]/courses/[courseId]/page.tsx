/**
 * 여행 코스 상세 페이지
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { TourCourseDetail } from './components/tour-course-detail';
import { Skeleton } from '@/components/ui/skeleton';

type PageProps = {
  params: Promise<{ locale: string; courseId: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale, courseId } = await params;
  const t = await getTranslations({ locale, namespace: 'courseDetail' });

  return {
    title: t('courseMap'),
    description: t('spotDetail'),
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { locale, courseId } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<CourseDetailSkeleton />}>
        <TourCourseDetail courseId={courseId} locale={locale} />
      </Suspense>
    </div>
  );
}

function CourseDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      {/* 지도 */}
      <Skeleton className="h-96 w-full rounded-lg" />

      {/* 장소 목록 */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

