/**
 * 새 코스 만들기 페이지
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import { TourCourseEditor } from '@/components/tour-course/tour-course-editor';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NewCoursePage({ params }: PageProps) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations({ locale, namespace: 'courseEditor' });

  if (!session) {
    redirect(`/${locale}/login`);
  }

  if (session.user.role !== 'GUIDE') {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold">{t('newTitle')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('newSubtitle')}
        </p>
      </div>

      <TourCourseEditor locale={locale} />
    </div>
  );
}

