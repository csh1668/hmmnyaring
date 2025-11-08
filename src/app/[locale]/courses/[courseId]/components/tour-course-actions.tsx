/**
 * 여행 코스 액션 버튼 (좋아요, 저장)
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useTRPC } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Heart, Bookmark } from 'lucide-react';
import { toast } from 'sonner';

type TourCourseActionsProps = {
  courseId: string;
  isLiked: boolean;
  isSaved: boolean;
  likeCount: number;
  saveCount: number;
};

export function TourCourseActions({
  courseId,
  isLiked: initialIsLiked,
  isSaved: initialIsSaved,
  likeCount: initialLikeCount,
  saveCount: initialSaveCount,
}: TourCourseActionsProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const t = useTranslations('courseDetail');
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [saveCount, setSaveCount] = useState(initialSaveCount);

  const toggleLikeMutation = useMutation({
    ...trpc.tourCourse.toggleLike.mutationOptions(),
    onSuccess: (data) => {
      setIsLiked(data.isLiked);
      setLikeCount((prev) => (data.isLiked ? prev + 1 : prev - 1));
      toast.success(data.isLiked ? t('likeSuccess') : t('likeCancel'));
      router.refresh();
    },
    onError: (error: any) => {
      if (error.message.includes('UNAUTHORIZED')) {
        toast.error(t('loginRequired'));
        router.push('/login');
      } else {
        toast.error(t('error'));
      }
    },
  });

  const toggleSaveMutation = useMutation({
    ...trpc.tourCourse.toggleSave.mutationOptions(),
    onSuccess: (data) => {
      setIsSaved(data.isSaved);
      setSaveCount((prev) => (data.isSaved ? prev + 1 : prev - 1));
      toast.success(data.isSaved ? t('saveSuccess') : t('saveCancel'));
      router.refresh();
    },
    onError: (error: any) => {
      if (error.message.includes('UNAUTHORIZED')) {
        toast.error(t('loginRequired'));
        router.push('/login');
      } else {
        toast.error(t('error'));
      }
    },
  });

  const handleLike = () => {
    toggleLikeMutation.mutateAsync({ courseId });
  };

  const handleSave = () => {
    toggleSaveMutation.mutateAsync({ courseId });
  };

  return (
    <div className="flex gap-2">
      <Button
        variant={isLiked ? 'default' : 'outline'}
        onClick={handleLike}
        disabled={toggleLikeMutation.isPending}
        className="gap-2"
      >
        <Heart
          className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
        />
        <span>{likeCount}</span>
      </Button>

      <Button
        variant={isSaved ? 'default' : 'outline'}
        onClick={handleSave}
        disabled={toggleSaveMutation.isPending}
        className="gap-2"
      >
        <Bookmark
          className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`}
        />
        <span>{saveCount}</span>
      </Button>
    </div>
  );
}

