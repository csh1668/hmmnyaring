/**
 * 저장한 코스 페이지
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import { SavedCoursesList } from './components/saved-courses-list';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SavedCoursesPage({ params }: PageProps) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations({ locale, namespace: 'savedCourses' });

  if (!session) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('subtitle')}
        </p>
      </div>

      <SavedCoursesList locale={locale} />
    </div>
  );
}

