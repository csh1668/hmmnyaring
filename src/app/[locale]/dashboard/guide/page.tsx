/**
 * 가이드 대시보드
 */

import { auth } from '@/lib/auth';
import { redirect as nextRedirect } from 'next/navigation';
import { prisma } from '@/server/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, MessageSquare, Clock, Route } from 'lucide-react';
import { format } from 'date-fns';
import { TourRequestActions } from '@/components/tour/tour-request-actions';
import { TourCompleteButton } from '@/components/tour/tour-complete-button';
import { Link } from '@/i18n/routing';
import { getTranslations, getLocale } from 'next-intl/server';
import { getDateLocale } from '@/lib/date-locale';

export default async function GuideDashboardPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations('dashboard.guide');
  const tStatus = await getTranslations('status');
  const tCategory = await getTranslations('category');
  const tCommon = await getTranslations('common');
  const dateLocale = getDateLocale(locale);

  if (!session || session.user.role !== 'GUIDE') {
    nextRedirect(`/${locale}/login`);
  }

  // 가이드 프로필 및 통계
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      guideProfile: true,
      receivedRequests: {
        include: {
          traveler: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          chatRoom: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
      receivedReviews: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      },
    },
  });

  if (!user) {
    nextRedirect(`/${locale}/login`);
  }

  // 프로필이 없으면 complete 페이지로
  if (!user.guideProfile) {
    nextRedirect(`/${locale}/register/complete`);
  }

  const pendingRequests = user.receivedRequests.filter((r) => r.status === 'PENDING');
  const acceptedRequests = user.receivedRequests.filter((r) => r.status === 'ACCEPTED');
  const completedRequests = user.receivedRequests.filter((r) => r.status === 'COMPLETED');

  const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    PENDING: { label: tStatus('pending'), variant: 'secondary' },
    ACCEPTED: { label: tStatus('accepted'), variant: 'default' },
    REJECTED: { label: tStatus('rejected'), variant: 'destructive' },
    COMPLETED: { label: tStatus('completed'), variant: 'outline' },
    CANCELLED: { label: tStatus('cancelled'), variant: 'destructive' },
  };

  const CATEGORY_MAP: Record<string, string> = {
    FOOD: tCategory('food'),
    CAFE: tCategory('cafe'),
    HISTORY: tCategory('history'),
    NATURE: tCategory('nature'),
    SHOPPING: tCategory('shopping'),
    NIGHTLIFE: tCategory('nightlife'),
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{tCommon('greeting', { name: user.name || '' })}</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('averageRating')}</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.guideProfile?.averageRating.toFixed(1) || '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">{t('ratingOutOf')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalTours')}</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.guideProfile?.totalTours || 0}</div>
            <p className="text-xs text-muted-foreground">{t('completedTours')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pendingRequests')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">{t('needsResponse')}</p>
          </CardContent>
        </Card>
      </div>

      {/* 내 코스 관리 */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Route className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">{tCommon('manageCourses')}</h3>
          <p className="mb-4 text-sm text-muted-foreground text-center">
            {tCommon('manageCoursesDesc')}
          </p>
          <div className="flex gap-2">
            <Button size="lg" asChild>
              <Link href="/dashboard/guide/courses">{tCommon('myCourses')}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/courses">{tCommon('allCourses')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 투어 요청 리스트 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('tourRequestsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {user.receivedRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('noRequests')}
            </div>
          ) : (
            <div className="space-y-4">
              {user.receivedRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{request.traveler.name}</p>
                      <Badge variant={STATUS_MAP[request.status].variant}>
                        {STATUS_MAP[request.status].label}
                      </Badge>
                      <Badge variant="outline">{CATEGORY_MAP[request.category]}</Badge>
                      {request.isOnline && <Badge variant="secondary">{t('onlineTag')}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{request.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{t('requestedDate')}: {format(new Date(request.requestedDate), 'PPP', { locale: dateLocale })}</span>
                      <span>{t('createdDate')}: {format(new Date(request.createdAt), 'PPP', { locale: dateLocale })}</span>
                    </div>
                  </div>
                  {request.status === 'PENDING' && (
                    <TourRequestActions requestId={request.id} />
                  )}
                  {request.status === 'ACCEPTED' && (
                    <div className="flex gap-2">
                      <Button size="sm" asChild>
                        <Link href={`/chat/${request.chatRoom?.id}`}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          {tCommon('chat')}
                        </Link>
                      </Button>
                      <TourCompleteButton requestId={request.id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 최근 리뷰 */}
      {user.receivedReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('recentReviews')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.receivedReviews.map((review) => (
                <div key={review.id} className="space-y-2 border-b pb-4 last:border-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{review.author.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(review.createdAt), 'PPP', { locale: dateLocale })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

