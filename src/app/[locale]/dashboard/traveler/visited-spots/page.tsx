/**
 * 방문한 장소 페이지
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import { VisitedSpotsList } from './components/visited-spots-list';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function VisitedSpotsPage({ params }: PageProps) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations({ locale, namespace: 'visitedSpots' });

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

      <VisitedSpotsList locale={locale} />
    </div>
  );
}

