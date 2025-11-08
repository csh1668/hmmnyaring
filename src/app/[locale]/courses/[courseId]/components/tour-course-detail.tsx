/**
 * 여행 코스 상세 컴포넌트
 */

'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useTRPC } from '@/lib/trpc/client';
import { TourCourseMap } from '@/components/tour-course/tour-course-map';
import { TourCourseActions } from './tour-course-actions';
import { TourSpotCard } from './tour-spot-card';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Clock,
  MapPin,
  Mountain,
  Eye,
  ArrowLeft,
  User,
  Star,
  Utensils,
  Coffee,
  Landmark,
  Trees,
  ShoppingBag,
  Moon,
} from 'lucide-react';

type TourCourseDetailProps = {
  courseId: string;
  locale: string;
};

const categoryIcons = {
  FOOD: Utensils,
  CAFE: Coffee,
  HISTORY: Landmark,
  NATURE: Trees,
  SHOPPING: ShoppingBag,
  NIGHTLIFE: Moon,
};

const difficultyColors = {
  EASY: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  MODERATE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  HARD: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export function TourCourseDetail({ courseId, locale }: TourCourseDetailProps) {
  const trpc = useTRPC();
  const t = useTranslations('courseDetail');
  const tCategory = useTranslations('category');
  const tDifficulty = useTranslations('difficulty');
  const tCourses = useTranslations('courses');

  const { data: course, isLoading } = useQuery(
    trpc.tourCourse.getById.queryOptions({ id: courseId })
  );

  if (isLoading) {
    return <CourseDetailSkeleton />;
  }

  if (!course) {
    notFound();
  }

  const CategoryIcon = categoryIcons[course.category];
  const sortedSpots = [...course.spots].sort((a, b) => a.order - b.order);

  const categoryLabels = {
    FOOD: tCategory('food'),
    CAFE: tCategory('cafe'),
    HISTORY: tCategory('history'),
    NATURE: tCategory('nature'),
    SHOPPING: tCategory('shopping'),
    NIGHTLIFE: tCategory('nightlife'),
  };

  const difficultyLabels = {
    EASY: tDifficulty('easy'),
    MODERATE: tDifficulty('moderate'),
    HARD: tDifficulty('hard'),
  };

  return (
    <div className="space-y-8">
      {/* 뒤로가기 버튼 */}
      <Link href={`/${locale}/courses`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('backToList')}
        </Button>
      </Link>

      {/* 헤더 */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Badge className="bg-primary text-primary-foreground">
                <CategoryIcon className="h-3 w-3 mr-1" />
                {categoryLabels[course.category]}
              </Badge>
              <Badge className={difficultyColors[course.difficulty]}>
                <Mountain className="h-3 w-3 mr-1" />
                {difficultyLabels[course.difficulty]}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-lg text-muted-foreground">{course.description}</p>

            {/* 메타 정보 */}
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{tCourses('spots', { count: sortedSpots.length })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {course.estimatedDuration >= 60
                    ? tCourses('duration', {
                      hours: Math.floor(course.estimatedDuration / 60),
                      minutes: course.estimatedDuration % 60
                    })
                    : tCourses('durationShort', { minutes: course.estimatedDuration })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{tCourses('views', { count: course.viewCount })}</span>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <TourCourseActions
            courseId={course.id}
            isLiked={course.isLiked}
            isSaved={course.isSaved}
            likeCount={course._count.likes}
            saveCount={course._count.saves}
          />
        </div>

        {/* 가이드 정보 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={course.author.image || undefined} />
                <AvatarFallback>
                  {course.author.name?.[0]?.toUpperCase() || 'G'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">
                    {course.author.name || t('guide')}
                  </h3>
                  <Badge variant="secondary">{t('guide')}</Badge>
                </div>
                {course.author.guideProfile && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{course.author.guideProfile.averageRating.toFixed(1)}</span>
                    </div>
                    <span>•</span>
                    <span>{t('toursCount', { count: course.author.guideProfile.totalTours })}</span>
                  </div>
                )}
                {course.author.guideProfile?.bio && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {course.author.guideProfile.bio}
                  </p>
                )}
              </div>
              <Link href={`/${locale}/profile/${course.author.id}`}>
                <Button variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  {t('profileView')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 지도 */}
      <div>
        <h2 className="text-2xl font-bold mb-4">{t('courseMap')}</h2>
        <TourCourseMap spots={sortedSpots} height="600px" />
      </div>

      {/* 장소 목록 */}
      <div>
        <h2 className="text-2xl font-bold mb-4">{t('spotDetail')}</h2>
        <div className="space-y-6">
          {sortedSpots.map((spot, index) => (
            <TourSpotCard
              key={spot.id}
              spot={spot}
              order={index + 1}
              locale={locale}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CourseDetailSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-32" />
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <div className="flex gap-6">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <Skeleton className="h-96 w-full rounded-lg" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

