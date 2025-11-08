/**
 * Tour Course tRPC Router
 * 
 * 추천 여행 코스 관련 API
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import {
  createTourCourseSchema,
  updateTourCourseSchema,
  listTourCoursesSchema,
  getTourCourseByIdSchema,
  toggleCourseLikeSchema,
  toggleCourseSaveSchema,
  visitSpotSchema,
  deleteTourCourseSchema,
} from '@/lib/schemas/tour-course';

export const tourCourseRouter = createTRPCRouter({
  /**
   * 코스 목록 조회 (공개)
   */
  list: publicProcedure
    .input(listTourCoursesSchema)
    .query(async ({ ctx, input }) => {
      const { category, difficulty, authorId, search, sortBy, limit, cursor } = input;

      const where: any = {};

      if (category) {
        where.category = category;
      }

      if (difficulty) {
        where.difficulty = difficulty;
      }

      if (authorId) {
        where.authorId = authorId;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      // 정렬
      let orderBy: any = {};
      switch (sortBy) {
        case 'popular':
          orderBy = { likeCount: 'desc' };
          break;
        case 'views':
          orderBy = { viewCount: 'desc' };
          break;
        case 'latest':
        default:
          orderBy = { createdAt: 'desc' };
          break;
      }

      // 커서 기반 페이지네이션
      const courses = await ctx.prisma.tourCourse.findMany({
        where,
        orderBy,
        take: limit + 1, // 다음 페이지 존재 여부 확인용
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
            },
          },
          spots: {
            orderBy: { order: 'asc' },
            take: 1, // 썸네일용 첫 번째 장소만
          },
          _count: {
            select: {
              likes: true,
              saves: true,
              spots: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (courses.length > limit) {
        const nextItem = courses.pop();
        nextCursor = nextItem!.id;
      }

      return {
        courses,
        nextCursor,
      };
    }),

  /**
   * 코스 상세 조회 (공개)
   */
  getById: publicProcedure
    .input(getTourCourseByIdSchema)
    .query(async ({ ctx, input }) => {
      const course = await ctx.prisma.tourCourse.findUnique({
        where: { id: input.id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
              guideProfile: {
                select: {
                  bio: true,
                  averageRating: true,
                  totalTours: true,
                },
              },
            },
          },
          spots: {
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              likes: true,
              saves: true,
            },
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '코스를 찾을 수 없습니다.',
        });
      }

      // 조회수 증가
      await ctx.prisma.tourCourse.update({
        where: { id: input.id },
        data: { viewCount: { increment: 1 } },
      });

      // 현재 사용자의 좋아요/저장 여부 확인
      let isLiked = false;
      let isSaved = false;

      if (ctx.session?.user?.id) {
        const [like, save] = await Promise.all([
          ctx.prisma.tourCourseLike.findUnique({
            where: {
              userId_courseId: {
                userId: ctx.session.user.id,
                courseId: input.id,
              },
            },
          }),
          ctx.prisma.savedTourCourse.findUnique({
            where: {
              userId_courseId: {
                userId: ctx.session.user.id,
                courseId: input.id,
              },
            },
          }),
        ]);

        isLiked = !!like;
        isSaved = !!save;
      }

      return {
        ...course,
        isLiked,
        isSaved,
      };
    }),

  /**
   * 코스 생성 (가이드만)
   */
  create: protectedProcedure
    .input(createTourCourseSchema)
    .mutation(async ({ ctx, input }) => {
      // 가이드만 생성 가능
      if (ctx.session.user.role !== 'GUIDE') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '가이드만 코스를 생성할 수 있습니다.',
        });
      }

      const { spots, ...courseData } = input;

      const course = await ctx.prisma.tourCourse.create({
        data: {
          ...courseData,
          authorId: ctx.session.user.id,
          spots: {
            create: spots.map((spot, index) => ({
              ...spot,
              order: index,
            })),
          },
        },
        include: {
          spots: {
            orderBy: { order: 'asc' },
          },
        },
      });

      return course;
    }),

  /**
   * 코스 수정 (본인만)
   */
  update: protectedProcedure
    .input(updateTourCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, spots, ...updateData } = input;

      // 코스 소유자 확인
      const existingCourse = await ctx.prisma.tourCourse.findUnique({
        where: { id },
      });

      if (!existingCourse) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '코스를 찾을 수 없습니다.',
        });
      }

      if (existingCourse.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '본인의 코스만 수정할 수 있습니다.',
        });
      }

      // 장소 업데이트가 있는 경우
      if (spots) {
        // 기존 장소 삭제 후 재생성
        await ctx.prisma.tourSpot.deleteMany({
          where: { courseId: id },
        });

        await ctx.prisma.tourSpot.createMany({
          data: spots.map((spot, index) => ({
            ...spot,
            id: undefined, // 새로 생성
            courseId: id,
            order: index,
          })),
        });
      }

      // 코스 정보 업데이트
      const updatedCourse = await ctx.prisma.tourCourse.update({
        where: { id },
        data: updateData,
        include: {
          spots: {
            orderBy: { order: 'asc' },
          },
        },
      });

      return updatedCourse;
    }),

  /**
   * 코스 삭제 (본인만)
   */
  delete: protectedProcedure
    .input(deleteTourCourseSchema)
    .mutation(async ({ ctx, input }) => {
      const course = await ctx.prisma.tourCourse.findUnique({
        where: { id: input.id },
      });

      if (!course) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '코스를 찾을 수 없습니다.',
        });
      }

      if (course.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '본인의 코스만 삭제할 수 있습니다.',
        });
      }

      await ctx.prisma.tourCourse.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * 좋아요 토글
   */
  toggleLike: protectedProcedure
    .input(toggleCourseLikeSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.tourCourseLike.findUnique({
        where: {
          userId_courseId: {
            userId: ctx.session.user.id,
            courseId: input.courseId,
          },
        },
      });

      if (existing) {
        // 좋아요 취소
        await ctx.prisma.tourCourseLike.delete({
          where: { id: existing.id },
        });

        await ctx.prisma.tourCourse.update({
          where: { id: input.courseId },
          data: { likeCount: { decrement: 1 } },
        });

        return { isLiked: false };
      } else {
        // 좋아요 추가
        await ctx.prisma.tourCourseLike.create({
          data: {
            userId: ctx.session.user.id,
            courseId: input.courseId,
          },
        });

        await ctx.prisma.tourCourse.update({
          where: { id: input.courseId },
          data: { likeCount: { increment: 1 } },
        });

        return { isLiked: true };
      }
    }),

  /**
   * 저장 토글
   */
  toggleSave: protectedProcedure
    .input(toggleCourseSaveSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.savedTourCourse.findUnique({
        where: {
          userId_courseId: {
            userId: ctx.session.user.id,
            courseId: input.courseId,
          },
        },
      });

      if (existing) {
        // 저장 취소
        await ctx.prisma.savedTourCourse.delete({
          where: { id: existing.id },
        });

        await ctx.prisma.tourCourse.update({
          where: { id: input.courseId },
          data: { saveCount: { decrement: 1 } },
        });

        return { isSaved: false };
      } else {
        // 저장 추가
        await ctx.prisma.savedTourCourse.create({
          data: {
            userId: ctx.session.user.id,
            courseId: input.courseId,
          },
        });

        await ctx.prisma.tourCourse.update({
          where: { id: input.courseId },
          data: { saveCount: { increment: 1 } },
        });

        return { isSaved: true };
      }
    }),

  /**
   * 장소 방문 완료 체크
   */
  visitSpot: protectedProcedure
    .input(visitSpotSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.visitedTourSpot.findUnique({
        where: {
          userId_spotId: {
            userId: ctx.session.user.id,
            spotId: input.spotId,
          },
        },
      });

      if (existing) {
        // 이미 방문한 경우 방문일 업데이트
        await ctx.prisma.visitedTourSpot.update({
          where: { id: existing.id },
          data: {
            visitDate: input.visitDate || new Date(),
          },
        });

        return { isVisited: true, updated: true };
      } else {
        // 새로 방문 추가
        await ctx.prisma.visitedTourSpot.create({
          data: {
            userId: ctx.session.user.id,
            spotId: input.spotId,
            visitDate: input.visitDate || new Date(),
          },
        });

        return { isVisited: true, updated: false };
      }
    }),

  /**
   * 내가 저장한 코스 목록
   */
  getMySaved: protectedProcedure.query(async ({ ctx }) => {
    const savedCourses = await ctx.prisma.savedTourCourse.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        course: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            spots: {
              orderBy: { order: 'asc' },
              take: 1,
            },
            _count: {
              select: {
                likes: true,
                saves: true,
                spots: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return savedCourses.map((sc: any) => sc.course);
  }),

  /**
   * 내가 방문한 장소 목록
   */
  getMyVisited: protectedProcedure.query(async ({ ctx }) => {
    const visitedSpots = await ctx.prisma.visitedTourSpot.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        spot: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { visitDate: 'desc' },
    });

    return visitedSpots;
  }),

  /**
   * 내가 작성한 코스 목록
   */
  getMyCourses: protectedProcedure.query(async ({ ctx }) => {
    const courses = await ctx.prisma.tourCourse.findMany({
      where: { authorId: ctx.session.user.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        spots: {
          orderBy: { order: 'asc' },
          take: 1,
        },
        _count: {
          select: {
            likes: true,
            saves: true,
            spots: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return courses;
  }),
});

