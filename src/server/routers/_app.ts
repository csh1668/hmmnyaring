/**
 * tRPC 메인 앱 라우터
 * 
 * 모든 하위 라우터를 통합합니다.
 */

import { createTRPCRouter } from '../trpc';
import { userRouter } from './user';
import { profileRouter } from './profile';
import { guideRouter } from './guide';
import { matchingRouter } from './matching';
import { tourRequestRouter } from './tour-request';
import { chatRouter } from './chat';
import { reviewRouter } from './review';
import { translationRouter } from './translation';
import { tourCourseRouter } from './tour-course';

export const appRouter = createTRPCRouter({
  user: userRouter,
  profile: profileRouter,
  guide: guideRouter,
  matching: matchingRouter,
  tourRequest: tourRequestRouter,
  chat: chatRouter,
  review: reviewRouter,
  translation: translationRouter,
  tourCourse: tourCourseRouter,
});

// tRPC 타입 export (클라이언트에서 사용)
export type AppRouter = typeof appRouter;

