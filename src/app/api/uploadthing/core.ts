/**
 * Uploadthing 업로드 설정
 * 
 * 이미지 업로드를 위한 핵심 설정
 */

import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '@/lib/auth';

const f = createUploadthing({
  errorFormatter: (err) => {
    console.error('Uploadthing error:', err);
    return {
      message: err.message,
    };
  },
});

/**
 * 파일 라우터 정의
 * 
 * - imageUploader: 투어 코스 스팟 이미지 업로드
 */
export const ourFileRouter = {
  /**
   * 이미지 업로더
   * - 로그인한 사용자만 업로드 가능
   * - jpg, png, webp만 허용
   * - 최대 5MB 제한
   */
  imageUploader: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      // 로그인 체크
      const session = await auth();

      if (!session?.user) {
        throw new UploadThingError('Unauthorized');
      }

      // 메타데이터에 사용자 정보 포함
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // 업로드 완료 로그
      console.log('Upload complete for userId:', metadata.userId);
      console.log('File URL:', file.url);

      // 파일 URL 반환
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

