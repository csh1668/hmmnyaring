/**
 * 여행 코스 목록 컴포넌트
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useTRPC } from '@/lib/trpc/client';
import { TourCourseCard } from '@/components/tour-course/tour-course-card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, MapPin } from 'lucide-react';

type TourCourseListProps = {
  locale: string;
  searchParams: { [key: string]: string | string[] | undefined };
};

export function TourCourseList({ locale, searchParams }: TourCourseListProps) {
  const router = useRouter();
  const t = useTranslations('courses');
  const tCategory = useTranslations('category');
  const tDifficulty = useTranslations('difficulty');
  const [searchTerm, setSearchTerm] = useState(
    (searchParams.search as string) || ''
  );
  const [category, setCategory] = useState<string | undefined>(
    (searchParams.category as string) || undefined
  );
  const [difficulty, setDifficulty] = useState<string | undefined>(
    (searchParams.difficulty as string) || undefined
  );
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'views'>(
    (searchParams.sortBy as any) || 'latest'
  );

  const trpc = useTRPC();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      ...trpc.tourCourse.list.infiniteQueryOptions({
        category: category as any,
        difficulty: difficulty as any,
        search: searchTerm || undefined,
        sortBy,
        limit: 12,
      }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialPageParam: null,
    });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // URL 업데이트 (선택사항)
  };

  const courses = data?.pages.flatMap((page) => page.courses) || [];

  return (
    <div className="space-y-6">
      {/* 필터 및 검색 */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* 검색 */}
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {/* 카테고리 필터 */}
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder={t('filterCategory')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filterAll')}</SelectItem>
            <SelectItem value="FOOD">{tCategory('food')}</SelectItem>
            <SelectItem value="CAFE">{tCategory('cafe')}</SelectItem>
            <SelectItem value="HISTORY">{tCategory('history')}</SelectItem>
            <SelectItem value="NATURE">{tCategory('nature')}</SelectItem>
            <SelectItem value="SHOPPING">{tCategory('shopping')}</SelectItem>
            <SelectItem value="NIGHTLIFE">{tCategory('nightlife')}</SelectItem>
          </SelectContent>
        </Select>

        {/* 난이도 필터 */}
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-full md:w-32">
            <SelectValue placeholder={t('filterDifficulty')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filterAll')}</SelectItem>
            <SelectItem value="EASY">{tDifficulty('easy')}</SelectItem>
            <SelectItem value="MODERATE">{tDifficulty('moderate')}</SelectItem>
            <SelectItem value="HARD">{tDifficulty('hard')}</SelectItem>
          </SelectContent>
        </Select>

        {/* 정렬 */}
        <Select
          value={sortBy}
          onValueChange={(value: any) => setSortBy(value)}
        >
          <SelectTrigger className="w-full md:w-32">
            <SelectValue placeholder={t('sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">{t('sortLatest')}</SelectItem>
            <SelectItem value="popular">{t('sortPopular')}</SelectItem>
            <SelectItem value="views">{t('sortViews')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 결과 */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title={t('noCourses')}
          description={t('noCoursesDesc')}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <TourCourseCard key={course.id} course={course} locale={locale} />
            ))}
          </div>

          {/* 더 보기 버튼 */}
          {hasNextPage && (
            <div className="flex justify-center pt-8">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                size="lg"
              >
                {isFetchingNextPage ? t('loading') : t('loadMore')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

