/**
 * Prisma Client 싱글톤 인스턴스
 * 개발 환경에서 HMR로 인한 다중 인스턴스 생성 방지
 */

import { PrismaClient } from '@prisma/client';
import { serverEnv } from '@/env/server';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      serverEnv.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (serverEnv.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

