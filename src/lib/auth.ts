/**
 * NextAuth.js 설정
 * 
 * Credentials Provider: 이메일/비밀번호 로그인
 * Prisma Adapter: 세션 및 계정 정보 DB 저장
 */

import NextAuth, { type DefaultSession } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/server/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { serverEnv } from '@/env/server';
import { authConfig } from './auth.config';

// NextAuth 타입 확장
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      needsProfile?: boolean;
    } & DefaultSession['user'];
  }
  
  interface User {
    role?: string;
    needsProfile?: boolean;
  }
}


export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GoogleProvider({
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: '이메일', type: 'email' },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        // 입력값 검증
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        // 유저 조회
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        // 비밀번호 확인
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Google 로그인인 경우 - 항상 true를 반환하여 로그인 완료
      if (account?.provider === 'google') {
        // 사용자 프로필 확인
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            guideProfile: true,
            travelerProfile: true,
          },
        });

        // 프로필 상태를 user 객체에 추가 (jwt 콜백에서 사용)
        if (dbUser && !dbUser.guideProfile && !dbUser.travelerProfile) {
          user.needsProfile = true;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        // Google 로그인 시 프로필 필요 여부 저장
        if ('needsProfile' in user) {
          token.needsProfile = user.needsProfile;
        }
      }
      
      // update trigger일 때만 DB 확인 (서버 사이드에서 호출됨, Edge가 아님)
      if (trigger === 'update' && token.id && token.needsProfile) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              role: true,
              guideProfile: true,
              travelerProfile: true,
            },
          });
          
          if (dbUser && (dbUser.guideProfile || dbUser.travelerProfile)) {
            token.needsProfile = false;
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error('[Auth JWT] Error checking profile:', error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.needsProfile = token.needsProfile as boolean | undefined;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 로그인 후 리다이렉트 처리
      // callbackUrl이 있으면 그것을 사용
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // 상대 경로인 경우
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // 기본값
      return baseUrl;
    },
  },
});

