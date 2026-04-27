import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { CalculatorIcon, HomeIcon, LandmarkIcon, UserIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface INavItem {
  label: string;
  path: string;
  icon: typeof HomeIcon;
}

const navItems: INavItem[] = [
  {
    label: '首页',
    path: '/',
    icon: HomeIcon,
  },
  {
    label: '测算',
    path: '/estimate',
    icon: CalculatorIcon,
  },
  {
    label: '我的',
    path: '/profile',
    icon: UserIcon,
  },
];

const Layout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[hsl(28_25%_97%)] shadow-[0_0_0_1px_rgba(120,32,24,0.04)]">
        <header className="sticky top-0 z-20 border-b border-border bg-[hsl(0_0%_100%/0.92)] backdrop-blur-md">
          <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
            <NavLink
              to="/"
              className="flex min-w-0 items-center gap-3 rounded-2xl transition-all duration-200 hover:opacity-95"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(160,30,30,0.22)]">
                <LandmarkIcon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                  中国入境游B端平台
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  一站式定制中国入境游方案
                </p>
              </div>
            </NavLink>
          </div>
        </header>

        <main className="flex-1 px-4 pt-4 pb-24">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-[hsl(0_0%_100%/0.94)] backdrop-blur-xl shadow-[0_-6px_20px_rgba(60,20,20,0.08)]">
          <div className="mx-auto grid max-w-md grid-cols-3 gap-1 px-3 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-180 active:scale-[0.98]',
                      isActive
                        ? 'bg-[hsl(6_65%_95%)] text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cn(
                          'size-5 shrink-0 transition-all duration-180',
                          isActive ? '-translate-y-[1px] text-primary' : 'text-muted-foreground',
                        )}
                      />
                      <span
                        className={cn(
                          'leading-none transition-colors duration-180',
                          isActive ? 'text-primary' : 'text-muted-foreground',
                        )}
                      >
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
