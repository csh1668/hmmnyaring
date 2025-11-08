/**
 * 여행자 대시보드
 */

import { auth } from '@/lib/auth';
import { redirect as nextRedirect } from 'next/navigation';
import { prisma } from '@/server/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, MessageSquare, Clock, CheckCircle, Route, Bookmark, MapPin as MapPinIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from '@/i18n/routing';
import { getTranslations, getLocale } from 'next-intl/server';
import { getDateLocale } from '@/lib/date-locale';

export default async function TravelerDashboardPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations('dashboard.traveler');
  const tStatus = await getTranslations('status');
  const tCategory = await getTranslations('category');
  const tCommon = await getTranslations('common');
  const dateLocale = getDateLocale(locale);

  if (!session || session.user.role !== 'TRAVELER') {
    nextRedirect(`/${locale}/login`);
  }

  // 여행자 프로필 및 투어 요청
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      travelerProfile: true,
      sentRequests: {
        include: {
          guide: {
            select: {
              id: true,
              name: true,
              image: true,
              guideProfile: {
                select: {
                  averageRating: true,
                  totalTours: true,
                },
              },
            },
          },
          chatRoom: true,
          review: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
      sentReviews: {
        include: {
          receiver: {
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
  if (!user.travelerProfile) {
    nextRedirect(`/${locale}/register/complete`);
  }

  const pendingRequests = user.sentRequests.filter((r) => r.status === 'PENDING');
  const acceptedRequests = user.sentRequests.filter((r) => r.status === 'ACCEPTED');
  const completedRequests = user.sentRequests.filter((r) => r.status === 'COMPLETED');

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
            <CardTitle className="text-sm font-medium">{t('pending')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">{t('waitingResponse')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('upcoming')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptedRequests.length}</div>
            <p className="text-xs text-muted-foreground">{t('upcomingDesc')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('completed')}</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedRequests.length}</div>
            <p className="text-xs text-muted-foreground">{t('totalTours')}</p>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 액션 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Search className="mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="mb-1 text-base font-semibold">{t('findGuide')}</h3>
            <p className="mb-3 text-xs text-muted-foreground text-center">
              {t('findGuideDesc')}
            </p>
            <Button size="sm" asChild>
              <Link href="/guides">{t('findGuideButton')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Route className="mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="mb-1 text-base font-semibold">{tCommon('recommendedCourses')}</h3>
            <p className="mb-3 text-xs text-muted-foreground text-center">
              {tCommon('recommendedCoursesDesc')}
            </p>
            <Button size="sm" asChild>
              <Link href="/courses">{tCommon('exploreCourses')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Bookmark className="mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="mb-1 text-base font-semibold">{tCommon('myTravel')}</h3>
            <p className="mb-3 text-xs text-muted-foreground text-center">
              {tCommon('myTravelDesc')}
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href="/dashboard/traveler/saved-courses">{tCommon('saved')}</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/dashboard/traveler/visited-spots">{tCommon('visited')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 투어 요청 리스트 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('myRequests')}</CardTitle>
        </CardHeader>
        <CardContent>
          {user.sentRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('noRequests')}
              <br />
              <Button className="mt-4" asChild>
                <Link href="/guides">{t('findGuidesLink')}</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {user.sentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={request.guide.image || undefined} />
                      <AvatarFallback>{request.guide.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${request.guide.id}`}
                          className="font-medium hover:underline"
                        >
                          {request.guide.name}
                        </Link>
                        <Badge variant={STATUS_MAP[request.status].variant}>
                          {STATUS_MAP[request.status].label}
                        </Badge>
                        <Badge variant="outline">{CATEGORY_MAP[request.category]}</Badge>
                        {request.isOnline && <Badge variant="secondary">{t('onlineTag')}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{request.message}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {t('tourDate')}: {format(new Date(request.requestedDate), 'PPP', { locale: dateLocale })}
                        </span>
                        <span>
                          {t('requestDate')}: {format(new Date(request.createdAt), 'PPP', { locale: dateLocale })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {request.status === 'ACCEPTED' && request.chatRoom && (
                      <Button size="sm" asChild>
                        <Link href={`/chat/${request.chatRoom.id}`}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          {tCommon('chat')}
                        </Link>
                      </Button>
                    )}
                    {request.status === 'COMPLETED' && !request.review && (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/tour/${request.id}/review`}>{t('writeReview')}</Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 내가 작성한 리뷰 */}
      {user.sentReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('myReviews')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.sentReviews.map((review) => (
                <div key={review.id} className="space-y-2 border-b pb-4 last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={review.receiver.image || undefined} />
                        <AvatarFallback>{review.receiver.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          href={`/profile/${review.receiver.id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {review.receiver.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(review.createdAt), 'PPP', { locale: dateLocale })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{review.rating}.0</span>
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

