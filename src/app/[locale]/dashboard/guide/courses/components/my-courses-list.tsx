/**
 * 내 코스 목록 컴포넌트
 */

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useTRPC } from '@/lib/trpc/client';
import { TourCourseCard } from '@/components/tour-course/tour-course-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MapPin, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type MyCoursesListProps = {
  locale: string;
};

export function MyCoursesList({ locale }: MyCoursesListProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const t = useTranslations('myCourses');
  const { data: courses, isLoading } = useQuery(
    trpc.tourCourse.getMyCourses.queryOptions()
  );

  const deleteMutation = useMutation({
    ...trpc.tourCourse.delete.mutationOptions(),
    onSuccess: () => {
      toast.success(t('deleteSuccess'));
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.message || t('deleteError'));
    },
  });

  const handleDelete = (courseId: string) => {
    deleteMutation.mutateAsync({ id: courseId });
  };

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
        icon={MapPin}
        title={t('noCourses')}
        description={t('noCoursesDesc')}
        action={
          <Link href={`/${locale}/dashboard/guide/courses/new`}>
            <Button>
              <MapPin className="h-4 w-4 mr-2" />
              {t('createCourse')}
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <div key={course.id} className="relative group">
          <TourCourseCard course={course} locale={locale} />

          {/* 관리 버튼 오버레이 */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <Link href={`/${locale}/dashboard/guide/courses/${course.id}/edit`}>
              <Button size="sm" variant="secondary">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('deleteDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('deleteCancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(course.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('deleteConfirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
}

