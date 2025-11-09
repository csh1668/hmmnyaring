/**
 * 유저 메뉴 컴포넌트
 */

'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const t = useTranslations('common');

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm">
        <p className="font-medium">{user.name}</p>
        <p className="text-muted-foreground">{user.email}</p>
      </div>
      <Button onClick={handleSignOut} variant="outline" size="sm">
        {t('logout')}
      </Button>
    </div>
  );
}

