'use client';

/**
 * 다크모드 토글 버튼 컴포넌트
 * 우측 하단에 고정되는 원형 버튼
 */

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from './button';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // 하이드레이션 이슈 방지
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="h-14 w-14 rounded-full bg-card shadow-lg" />
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        variant="outline"
        size="icon-lg"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="h-14 w-14 rounded-full shadow-lg transition-all hover:scale-110 border-2 glass"
        aria-label="테마 전환"
      >
        {isDark ? (
          <Sun className="h-6 w-6 text-accent transition-transform rotate-0 scale-100" />
        ) : (
          <Moon className="h-6 w-6 text-primary transition-transform rotate-0 scale-100" />
        )}
      </Button>
    </div>
  );
}


