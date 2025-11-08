/**
 * Tour Course Zod Schemas
 */

import { z } from 'zod';

/**
 * 난이도 Enum
 */
export const courseDifficultySchema = z.enum(['EASY', 'MODERATE', 'HARD']);

/**
 * 장소 정보 스키마
 */
export const tourSpotSchema = z.object({
  id: z.string().optional(),
  order: z.number().int().min(0),
  name: z.string().min(1, '장소명을 입력해주세요').max(100),
  description: z.string().min(1, '설명을 입력해주세요').max(1000),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().min(1, '주소를 입력해주세요'),
  placeId: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable().or(z.literal('')),
});

/**
 * 코스 생성 스키마
 */
export const createTourCourseSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100),
  description: z.string().min(1, '설명을 입력해주세요').max(2000),
  category: z.enum(['FOOD', 'CAFE', 'HISTORY', 'NATURE', 'SHOPPING', 'NIGHTLIFE']),
  difficulty: courseDifficultySchema,
  estimatedDuration: z.number().int().min(1, '소요시간을 입력해주세요').max(1440), // 최대 24시간
  spots: z.array(tourSpotSchema).min(1, '최소 1개의 장소를 추가해주세요').max(20, '최대 20개의 장소만 추가할 수 있습니다'),
});

/**
 * 코스 수정 스키마
 */
export const updateTourCourseSchema = z.object({
  id: z.string(),
  title: z.string().min(1, '제목을 입력해주세요').max(100).optional(),
  description: z.string().min(1, '설명을 입력해주세요').max(2000).optional(),
  category: z.enum(['FOOD', 'CAFE', 'HISTORY', 'NATURE', 'SHOPPING', 'NIGHTLIFE']).optional(),
  difficulty: courseDifficultySchema.optional(),
  estimatedDuration: z.number().int().min(1).max(1440).optional(),
  spots: z.array(tourSpotSchema).min(1).max(20).optional(),
});

/**
 * 코스 목록 조회 필터
 */
export const listTourCoursesSchema = z.object({
  category: z.enum(['FOOD', 'CAFE', 'HISTORY', 'NATURE', 'SHOPPING', 'NIGHTLIFE']).optional(),
  difficulty: courseDifficultySchema.optional(),
  authorId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['latest', 'popular', 'views']).default('latest'),
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().nullable().optional(), // 페이지네이션용
});

/**
 * 코스 상세 조회
 */
export const getTourCourseByIdSchema = z.object({
  id: z.string(),
});

/**
 * 좋아요 토글
 */
export const toggleCourseLikeSchema = z.object({
  courseId: z.string(),
});

/**
 * 저장 토글
 */
export const toggleCourseSaveSchema = z.object({
  courseId: z.string(),
});

/**
 * 장소 방문 완료 체크
 */
export const visitSpotSchema = z.object({
  spotId: z.string(),
  visitDate: z.date().optional(),
});

/**
 * 코스 삭제
 */
export const deleteTourCourseSchema = z.object({
  id: z.string(),
});

/**
 * 타입 추출
 */
export type CreateTourCourseInput = z.infer<typeof createTourCourseSchema>;
export type UpdateTourCourseInput = z.infer<typeof updateTourCourseSchema>;
export type ListTourCoursesInput = z.infer<typeof listTourCoursesSchema>;
export type TourSpotInput = z.infer<typeof tourSpotSchema>;
export type CourseDifficulty = z.infer<typeof courseDifficultySchema>;

