/**
 * 재사용 가능한 에러 메시지 컴포넌트
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorMessageProps {
  title?: string;
  message: string;
  reset?: () => void;
  showHomeButton?: boolean;
  showStack?: boolean;
  stack?: string;
}

export function ErrorMessage({
  title = '오류가 발생했습니다',
  message,
  reset,
  showHomeButton = true,
  showStack = false,
  stack,
}: ErrorMessageProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showStack && stack && (
            <pre className="rounded-md bg-muted p-4 text-xs overflow-auto max-h-48">
              {stack}
            </pre>
          )}
          <div className="flex gap-2">
            {reset && (
              <Button onClick={reset} className="flex-1">
                다시 시도
              </Button>
            )}
            {showHomeButton && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => (window.location.href = '/')}
              >
                홈으로 이동
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

