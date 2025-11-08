/**
 * 여행자 프로필 카드 컴포넌트
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Globe, Heart, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

type TravelerProfileCardProps = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    travelerProfile: {
      nationality: string | null;
      interests: string[];
      preferredLanguages: string[];
      visitStartDate: Date | null;
      visitEndDate: Date | null;
    } | null;
  };
};

const LANGUAGE_MAP: Record<string, string> = {
  KOREAN: '한국어',
  ENGLISH: '영어',
  JAPANESE: '일본어',
  CHINESE: '중국어',
  SPANISH: '스페인어',
  FRENCH: '프랑스어',
};

const CATEGORY_MAP: Record<string, string> = {
  FOOD: '맛집',
  CAFE: '카페',
  HISTORY: '역사/문화',
  NATURE: '자연',
  SHOPPING: '쇼핑',
  NIGHTLIFE: '나이트라이프',
};

export function TravelerProfileCard({ user }: TravelerProfileCardProps) {
  const profile = user.travelerProfile;

  if (!profile) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.image || undefined} alt={user.name || ''} />
            <AvatarFallback>{user.name?.charAt(0) || 'T'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            {profile.nationality && (
              <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>{profile.nationality}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(profile.visitStartDate || profile.visitEndDate) && (
          <>
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">방문 기간</p>
                <p className="text-sm text-muted-foreground">
                  {profile.visitStartDate &&
                    format(new Date(profile.visitStartDate), 'PPP', { locale: ko })}{' '}
                  ~{' '}
                  {profile.visitEndDate &&
                    format(new Date(profile.visitEndDate), 'PPP', { locale: ko })}
                </p>
              </div>
            </div>
            <Separator />
          </>
        )}

        <div className="space-y-3">
          {profile.preferredLanguages.length > 0 && (
            <div className="flex items-start gap-2">
              <Globe className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">선호 언어</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {profile.preferredLanguages.map((lang) => (
                    <Badge key={lang} variant="secondary">
                      {LANGUAGE_MAP[lang] || lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {profile.interests.length > 0 && (
            <div className="flex items-start gap-2">
              <Heart className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">관심 분야</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="outline">
                      {CATEGORY_MAP[interest] || interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


