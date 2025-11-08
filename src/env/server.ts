/**
 * 서버 전용 환경변수 검증
 * 
 * Zod를 사용한 타입 안전한 환경변수 관리
 * 클라이언트에서 import 시 빌드 에러 발생
 */

import 'server-only';
import { z } from 'zod';

const serverSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),

  // Gemini API
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),

  // Uploadthing (이미지 업로드)
  UPLOADTHING_SECRET: z.string().optional(),
  UPLOADTHING_APP_ID: z.string().optional(),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Optional: Vercel, Port
  VERCEL_URL: z.string().optional(),
  PORT: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 3000)),
});

/**
 * 서버 환경변수
 * 
 * @example
 * import { serverEnv } from '@/env/server';
 * console.log(serverEnv.DATABASE_URL);
 */
export const serverEnv = serverSchema.parse(process.env);

// 타입 export
export type ServerEnv = z.infer<typeof serverSchema>;
