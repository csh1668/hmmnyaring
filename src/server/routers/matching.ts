/**
 * Matching 라우터
 * 
 * AI 매칭 알고리즘 관련 쿼리
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { calculateMatchScore } from '../helpers/matching';

export const matchingRouter = createTRPCRouter({
  // AI 추천 가이드 (여행자 전용)
  getRecommendedGuides: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      // 여행자만 접근 가능
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        include: {
          travelerProfile: true,
        },
      });

      if (!user || user.role !== 'TRAVELER' || !user.travelerProfile) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '여행자만 접근할 수 있습니다.',
        });
      }

      // 모든 가이드 조회
      const guides = await ctx.prisma.user.findMany({
        where: {
          role: 'GUIDE',
          guideProfile: {
            isNot: null,
          },
        },
        include: {
          guideProfile: true,
          receivedReviews: {
            take: 3,
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        take: 100, // 최대 100명까지만 스코어 계산
      });

      // 각 가이드에 대해 매칭 스코어 계산
      const guidesWithScores = guides
        .map((guide) => {
          if (!guide.guideProfile) return null;

          const matchScore = calculateMatchScore(user.travelerProfile!, guide.guideProfile);

          const { password, ...guideWithoutPassword } = guide;

          return {
            ...guideWithoutPassword,
            matchScore,
          };
        })
        .filter((g) => g !== null)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, input.limit);

      return guidesWithScores;
    }),

  // 특정 가이드와의 매칭 스코어 계산
  calculateScore: protectedProcedure
    .input(
      z.object({
        guideId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // 여행자만 접근 가능
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        include: {
          travelerProfile: true,
        },
      });

      if (!user || user.role !== 'TRAVELER' || !user.travelerProfile) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '여행자만 접근할 수 있습니다.',
        });
      }

      // 가이드 조회
      const guide = await ctx.prisma.user.findUnique({
        where: { id: input.guideId, role: 'GUIDE' },
        include: {
          guideProfile: true,
        },
      });

      if (!guide || !guide.guideProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '가이드를 찾을 수 없습니다.',
        });
      }

      const matchScore = calculateMatchScore(user.travelerProfile, guide.guideProfile);

      return {
        matchScore,
        breakdown: {
          language: user.travelerProfile.preferredLanguages.some((lang) =>
            guide.guideProfile!.languages.includes(lang)
          )
            ? 40
            : 0,
          interests:
            user.travelerProfile.interests.length > 0
              ? (user.travelerProfile.interests.filter((interest) =>
                  guide.guideProfile!.categories.includes(interest)
                ).length /
                  user.travelerProfile.interests.length) *
                30
              : 0,
          rating: (guide.guideProfile.averageRating / 5) * 20,
          experience: Math.min(guide.guideProfile.totalTours / 10, 1) * 10,
        },
      };
    }),
});



