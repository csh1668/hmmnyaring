/**
 * 전역 에러 바운더리
 * 
 * 루트 레이아웃을 포함한 모든 에러를 포착합니다.
 */

'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error boundary caught:', error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-red-600">
              치명적인 오류가 발생했습니다
            </h1>
            <p className="text-muted-foreground">
              {error.message || '애플리케이션을 불러올 수 없습니다.'}
            </p>
            {process.env.NODE_ENV === 'development' && error.stack && (
              <pre className="mt-4 rounded-md bg-gray-100 p-4 text-left text-xs overflow-auto max-w-2xl">
                {error.stack}
              </pre>
            )}
            <div className="flex gap-2 justify-center mt-6">
              <button
                onClick={reset}
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                다시 시도
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100"
              >
                홈으로 이동
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

