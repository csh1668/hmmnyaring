/**
 * 헤더 컴포넌트
 * 여행 앱 스타일의 글래스모피즘 헤더
 */

import { auth } from '@/lib/auth';
import { UserMenu } from '@/components/auth/user-menu';
import { Button } from '@/components/ui/button';
import { Compass, Map, Users, MapPin } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { getTranslations } from 'next-intl/server';

export async function Header() {
  const session = await auth();
  const t = await getTranslations('common');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 glass">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-10 w-10 rounded-full gradient-travel flex items-center justify-center transform transition-transform group-hover:rotate-12">
            <Compass className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-gradient-travel">TravelMate</span>
            <span className="block text-[10px] text-muted-foreground -mt-1">Daejeon</span>
          </div>
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-4">
          {session?.user ? (
            <>
              <Link
                href="/guides"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                <Map className="h-4 w-4" />
                <span>{t('guides')}</span>
              </Link>
              <Link
                href="/courses"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                <MapPin className="h-4 w-4" />
                <span>코스</span>
              </Link>
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>{t('dashboard')}</span>
              </Link>
              <LanguageSwitcher />
              <UserMenu user={session.user} />
            </>
          ) : (
            <>
              <Link
                href="/courses"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                <MapPin className="h-4 w-4" />
                <span>{t('courses')}</span>
              </Link>
              <LanguageSwitcher />
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">
                  {t('login')}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="gradient-travel text-white border-0 hover:opacity-90">
                  {t('register')}
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

