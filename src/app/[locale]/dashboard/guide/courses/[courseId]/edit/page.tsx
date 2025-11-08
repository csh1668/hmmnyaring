/**
 * 코스 수정 페이지
 */

import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/server/db';
import { getTranslations } from 'next-intl/server';
import { TourCourseEditor } from '@/components/tour-course/tour-course-editor';

type PageProps = {
  params: Promise<{ locale: string; courseId: string }>;
};

export default async function EditCoursePage({ params }: PageProps) {
  const { locale, courseId } = await params;
  const session = await auth();
  const t = await getTranslations({ locale, namespace: 'courseEditor' });

  if (!session) {
    redirect(`/${locale}/login`);
  }

  if (session.user.role !== 'GUIDE') {
    redirect(`/${locale}/dashboard`);
  }

  // 코스 데이터 불러오기
  const course = await prisma.tourCourse.findUnique({
    where: { id: courseId },
    include: {
      spots: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // 본인의 코스인지 확인
  if (course.authorId !== session.user.id) {
    redirect(`/${locale}/dashboard/guide/courses`);
  }

  // 초기 데이터 준비
  const initialData = {
    title: course.title,
    description: course.description,
    category: course.category,
    difficulty: course.difficulty,
    estimatedDuration: course.estimatedDuration,
    spots: course.spots.map((spot) => ({
      id: spot.id,
      order: spot.order,
      name: spot.name,
      description: spot.description,
      latitude: spot.latitude,
      longitude: spot.longitude,
      address: spot.address,
      placeId: spot.placeId,
      imageUrl: spot.imageUrl,
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('editTitle')}</h1>
        <p className="text-muted-foreground mt-2">
          {course.title}
        </p>
      </div>

      <TourCourseEditor
        courseId={courseId}
        initialData={initialData}
        locale={locale}
      />
    </div>
  );
}

