'use client';

/**
 * 테마 프로바이더 컴포넌트
 * next-themes를 사용하여 다크모드를 지원합니다
 */

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}


