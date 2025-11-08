/**
 * 여행 코스 카드 컴포넌트
 * 
 * 코스 목록에서 사용되는 카드
 */

'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  Clock,
  Heart,
  Bookmark,
  Eye,
  TrendingUp,
  Mountain,
  Utensils,
  Coffee,
  Landmark,
  Trees,
  ShoppingBag,
  Moon,
} from 'lucide-react';

type TourCourseCardProps = {
  course: {
    id: string;
    title: string;
    description: string;
    category: 'FOOD' | 'CAFE' | 'HISTORY' | 'NATURE' | 'SHOPPING' | 'NIGHTLIFE';
    difficulty: 'EASY' | 'MODERATE' | 'HARD';
    estimatedDuration: number;
    viewCount: number;
    likeCount: number;
    saveCount: number;
    author: {
      id: string;
      name: string | null;
      image: string | null;
    };
    spots: Array<{
      id: string;
      name: string;
      imageUrl: string | null;
    }>;
    _count?: {
      spots: number;
      likes: number;
      saves: number;
    };
  };
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

export function TourCourseCard({ course, locale }: TourCourseCardProps) {
  const tCategory = useTranslations('category');
  const tDifficulty = useTranslations('difficulty');
  const t = useTranslations('courses');

  const CategoryIcon = categoryIcons[course.category];
  const thumbnailImage = course.spots[0]?.imageUrl;
  const spotCount = course._count?.spots || course.spots.length;

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
    <Link href={`/${locale}/courses/${course.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        {/* 썸네일 이미지 */}
        <div className="relative h-48 bg-muted overflow-hidden">
          {thumbnailImage ? (
            <img
              src={thumbnailImage}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CategoryIcon className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}

          {/* 카테고리 배지 */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/90 text-gray-900 hover:bg-white/90">
              <CategoryIcon className="h-3 w-3 mr-1" />
              {categoryLabels[course.category]}
            </Badge>
          </div>

          {/* 난이도 배지 */}
          <div className="absolute top-3 right-3">
            <Badge className={difficultyColors[course.difficulty]}>
              <Mountain className="h-3 w-3 mr-1" />
              {difficultyLabels[course.difficulty]}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-3">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {course.description}
          </p>
        </CardHeader>

        <CardContent className="pb-3 space-y-3">
          {/* 통계 정보 */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{t('spots', { count: spotCount })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {course.estimatedDuration >= 60
                  ? t('duration', {
                    hours: Math.floor(course.estimatedDuration / 60),
                    minutes: course.estimatedDuration % 60
                  })
                  : t('durationShort', { minutes: course.estimatedDuration })}
              </span>
            </div>
          </div>

          {/* 인기도 지표 */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{course.likeCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bookmark className="h-4 w-4" />
              <span>{course.saveCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{course.viewCount}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t">
          <div className="flex items-center gap-2 w-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={course.author.image || undefined} />
              <AvatarFallback>
                {course.author.name?.[0]?.toUpperCase() || 'G'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {course.author.name || '익명 가이드'}
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

