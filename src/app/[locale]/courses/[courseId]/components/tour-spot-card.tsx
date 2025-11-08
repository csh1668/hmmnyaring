/**
 * 장소 카드 컴포넌트
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useTRPC } from '@/lib/trpc/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

type TourSpotCardProps = {
  spot: {
    id: string;
    order: number;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    address: string;
    imageUrl: string | null;
  };
  order: number;
  locale: string;
};

export function TourSpotCard({ spot, order, locale }: TourSpotCardProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const t = useTranslations('courseDetail');
  const [isVisited, setIsVisited] = useState(false);

  const visitMutation = useMutation({
    ...trpc.tourCourse.visitSpot.mutationOptions(),
    onSuccess: () => {
      setIsVisited(true);
      toast.success(t('visitSuccess'));
      router.refresh();
    },
    onError: (error: any) => {
      if (error.message.includes('UNAUTHORIZED')) {
        toast.error(t('loginRequired'));
        router.push(`/${locale}/login`);
      } else {
        toast.error(t('error'));
      }
    },
  });

  const handleVisit = () => {
    visitMutation.mutateAsync({ spotId: spot.id });
  };

  const handleOpenMap = () => {
    // 카카오맵 앱/웹으로 연결
    const url = `https://map.kakao.com/link/map/${encodeURIComponent(spot.name)},${spot.latitude},${spot.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* 이미지 또는 순서 번호 */}
        <div className="relative md:w-64 h-48 md:h-auto bg-muted flex items-center justify-center">
          {spot.imageUrl ? (
            <img
              src={spot.imageUrl}
              alt={spot.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl font-bold text-muted-foreground/20">
              {order}
            </div>
          )}

          {/* 순서 배지 */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">
              {order}
            </Badge>
          </div>
        </div>

        {/* 내용 */}
        <CardContent className="flex-1 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">{spot.name}</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {spot.description}
              </p>
            </div>

            {!isVisited && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleVisit}
                disabled={visitMutation.isPending}
                className="shrink-0"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t('visitComplete')}
              </Button>
            )}

            {isVisited && (
              <Badge variant="secondary" className="shrink-0">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {t('visited')}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 pt-4 border-t">
            <div className="flex items-start gap-2 text-sm text-muted-foreground flex-1">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{spot.address}</span>
            </div>

            <Button variant="outline" size="sm" onClick={handleOpenMap}>
              {t('viewOnMap')}
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

