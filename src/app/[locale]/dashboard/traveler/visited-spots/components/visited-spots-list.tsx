/**
 * 방문한 장소 목록 컴포넌트
 */

'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useTRPC } from '@/lib/trpc/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';

type VisitedSpotsListProps = {
  locale: string;
};

export function VisitedSpotsList({ locale }: VisitedSpotsListProps) {
  const trpc = useTRPC();
  const t = useTranslations('visitedSpots');
  const tCategory = useTranslations('category');
  const dateLocale = locale === 'ko' ? ko : enUS;

  const { data: visitedSpots, isLoading } = useQuery(
    trpc.tourCourse.getMyVisited.queryOptions()
  );

  const categoryLabels = {
    FOOD: tCategory('food'),
    CAFE: tCategory('cafe'),
    HISTORY: tCategory('history'),
    NATURE: tCategory('nature'),
    SHOPPING: tCategory('shopping'),
    NIGHTLIFE: tCategory('nightlife'),
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!visitedSpots || visitedSpots.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title={t('noSpots')}
        description={t('noSpotsDesc')}
        action={
          <Link href={`/${locale}/courses`}>
            <Button>
              <MapPin className="h-4 w-4 mr-2" />
              {t('exploreCourses')}
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {visitedSpots.map((visit) => (
        <Card key={visit.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{visit.spot.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {visit.spot.description}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {categoryLabels[visit.spot.course.category]}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{visit.spot.address}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(visit.visitDate), 'PPP', { locale: dateLocale })}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    {t('courseTitle')}:{' '}
                    <Link
                      href={`/${locale}/courses/${visit.spot.course.id}`}
                      className="text-primary hover:underline"
                    >
                      {visit.spot.course.title}
                    </Link>
                  </p>
                </div>
              </div>

              <Link
                href={`/${locale}/courses/${visit.spot.course.id}`}
                target="_blank"
              >
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('viewCourse')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}

      {visitedSpots.length > 0 && (
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            {t('totalVisited', { count: visitedSpots.length })}
          </p>
        </div>
      )}
    </div>
  );
}

