/**
 * Uploadthing API 라우트
 * 
 * Next.js App Router용 API 엔드포인트
 */

import { createRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from './core';

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});

