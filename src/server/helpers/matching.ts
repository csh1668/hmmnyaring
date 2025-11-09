/**
 * AI 매칭 알고리즘 헬퍼
 */

import { Language, TourCategory } from '@prisma/client';

type TravelerProfile = {
  preferredLanguages: Language[];
  interests: TourCategory[];
};

type GuideProfile = {
  languages: Language[];
  categories: TourCategory[];
  averageRating: number;
  totalTours: number;
};

/**
 * 여행자와 가이드 간의 매칭 스코어 계산
 * 
 * @param traveler 여행자 프로필
 * @param guide 가이드 프로필
 * @returns 0-100 사이의 매칭 스코어
 */
export function calculateMatchScore(
  traveler: TravelerProfile,
  guide: GuideProfile
): number {
  let score = 0;

  // 1. 언어 매칭 (40점)
  const languageMatch = traveler.preferredLanguages.some((lang) =>
    guide.languages.includes(lang)
  );
  if (languageMatch) {
    // 완전 일치하는 언어 개수에 비례
    const matchCount = traveler.preferredLanguages.filter((lang) =>
      guide.languages.includes(lang)
    ).length;
    score += Math.min((matchCount / traveler.preferredLanguages.length) * 40, 40);
  }

  // 2. 관심사 매칭 (30점)
  if (traveler.interests.length > 0) {
    const interestOverlap = traveler.interests.filter((interest) =>
      guide.categories.includes(interest)
    ).length;
    score += (interestOverlap / traveler.interests.length) * 30;
  }

  // 3. 평점 보너스 (20점)
  score += (guide.averageRating / 5) * 20;

  // 4. 투어 경험 보너스 (10점)
  // 10회 투어를 기준으로 최대 10점
  score += Math.min(guide.totalTours / 10, 1) * 10;

  return Math.round(score);
}

/**
 * 매칭 스코어를 기준으로 가이드 리스트 정렬
 */
export function sortGuidesByMatchScore<T extends { matchScore?: number }>(
  guides: T[]
): T[] {
  return [...guides].sort((a, b) => {
    const scoreA = a.matchScore ?? 0;
    const scoreB = b.matchScore ?? 0;
    return scoreB - scoreA;
  });
}

/**
 * 매칭 스코어에 따른 등급 반환
 */
export function getMatchGrade(score: number): {
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  label: string;
  color: string;
} {
  if (score >= 90) {
    return { grade: 'S', label: '완벽한 매칭', color: 'text-purple-500' };
  } else if (score >= 80) {
    return { grade: 'A', label: '매우 좋음', color: 'text-blue-500' };
  } else if (score >= 70) {
    return { grade: 'B', label: '좋음', color: 'text-green-500' };
  } else if (score >= 60) {
    return { grade: 'C', label: '보통', color: 'text-yellow-500' };
  } else {
    return { grade: 'D', label: '낮음', color: 'text-gray-500' };
  }
}



