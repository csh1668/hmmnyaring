/**
 * CRUD 헬퍼 함수 및 유틸리티
 * 
 * tRPC 라우터 작성 시 자주 사용하는 패턴들
 */

import { TRPCError } from '@trpc/server';
import type { Context } from '../context';

/**
 * 데이터 소유권 확인 헬퍼
 * 
 * @example
 * ```ts
 * await ensureOwnership(ctx, 'post', postId, userId);
 * ```
 */
export async function ensureOwnership(
  ctx: Context,
  modelName: 'tourRequest' | 'user',
  id: string,
  userId: string
) {
   
  const record = await (ctx.prisma[modelName] as any).findUnique({
    where: { id },
    select: { authorId: true, id: true },
  });

  if (!record) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: '데이터를 찾을 수 없습니다.',
    });
  }

  if (record.authorId !== userId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '권한이 없습니다.',
    });
  }

  return record;
}

/**
 * 페이지네이션 헬퍼
 * 
 * @example
 * ```ts
 * const pagination = getPagination(page, pageSize);
 * const posts = await prisma.post.findMany(pagination);
 * ```
 */
export function getPagination(page = 1, pageSize = 10) {
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return {
    skip,
    take,
  };
}

/**
 * 검색 쿼리 헬퍼
 * 
 * @example
 * ```ts
 * const where = getSearchQuery(search, ['title', 'content']);
 * ```
 */
export function getSearchQuery(query: string | undefined, fields: string[]) {
  if (!query) return {};

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: query,
        mode: 'insensitive' as const,
      },
    })),
  };
}

