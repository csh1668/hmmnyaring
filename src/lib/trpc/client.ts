/**
 * tRPC TanStack React Query Integration
 * 
 * 새로운 tRPC v11 TanStack React Query integration 사용
 */

import { createTRPCContext } from '@trpc/tanstack-react-query';
import type { AppRouter } from '@/server/routers/_app';

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();

