/**
 * 저장한 코스 목록 컴포넌트
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useTRPC } from '@/lib/trpc/client';
import { TourCourseCard } from '@/components/tour-course/tour-course-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Bookmark } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type SavedCoursesListProps = {
  locale: string;
};

export function SavedCoursesList({ locale }: SavedCoursesListProps) {
  const trpc = useTRPC();
  const t = useTranslations('savedCourses');
  const { data: courses, isLoading } = useQuery(
    trpc.tourCourse.getMySaved.queryOptions()
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        title={t('noCourses')}
        description={t('noCoursesDesc')}
        action={
          <Link href={`/${locale}/courses`}>
            <Button>
              <Bookmark className="h-4 w-4 mr-2" />
              {t('exploreCourses')}
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <TourCourseCard key={course.id} course={course} locale={locale} />
      ))}
    </div>
  );
}

