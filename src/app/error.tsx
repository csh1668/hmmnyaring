/**
 * 클라이언트 컴포넌트 에러 바운더리
 * 
 * 앱 내에서 발생하는 에러를 포착하고 표시합니다.
 */

'use client';

import { useEffect } from 'react';
import { ErrorMessage } from '@/components/ui/error-message';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 (프로덕션 환경에서는 Sentry 등으로 전송)
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <ErrorMessage
      title="페이지 오류"
      message={
        error.message || '페이지를 불러오는 중 문제가 발생했습니다.'
      }
      reset={reset}
      showStack={process.env.NODE_ENV === 'development'}
      stack={error.stack}
    />
  );
}

