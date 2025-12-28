'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ExamSelector from '@/components/ExamSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useExam } from '@/contexts/ExamContext';
import {
  BarChart3,
  Menu,
  LogOut,
  User,
  Home,
  FileText,
  TrendingUp,
  School,
  Settings,
  Bell,
  Users,
  MapPin,
  Award,
  Download,
  Database,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    title: 'Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        description: 'Overview and statistics',
        badge: null,
      },
      {
        id: 'exams',
        label: 'Exams',
        href: '/dashboard/exams',
        icon: FileText,
        description: 'Manage examinations',
        badge: null,
      },
      {
        id: 'results',
        label: 'Results',
        href: '/dashboard/results',
        icon: Award,
        description: 'View results and analysis',
        badge: null,
      },
    ],
  },
  {
    title: 'Analytics',
    items: [
      {
        id: 'analytics',
        label: 'Analytics',
        href: '/dashboard/analytics',
        icon: TrendingUp,
        description: 'Performance analytics',
        badge: null,
      },
      {
        id: 'schools',
        label: 'Schools',
        href: '/dashboard/schools',
        icon: School,
        description: 'School management',
        badge: null,
      },
      {
        id: 'students',
        label: 'Students',
        href: '/dashboard/students',
        icon: Users,
        description: 'Student records',
        badge: null,
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        id: 'locations',
        label: 'Locations',
        href: '/dashboard/locations',
        icon: MapPin,
        description: 'Region/Council/Ward',
        badge: null,
      },
      {
        id: 'reports',
        label: 'Downloads',
        href: '/dashboard/downloads',
        icon: Download,
        description: 'Download PDFs and exports',
        badge: null,
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
        description: 'System settings',
        badge: null,
      },
    ],
  },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { selectedExam } = useExam();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">Exametrics</span>
              </div>
            </div>
            <Separator />
            <ScrollArea className="flex-1 px-4">
              <div className="py-4">
                <ExamSelector />
              </div>
              {navigation.map((section) => (
                <div key={section.title} className="mb-6">
                  <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                          isActive(item.href) && 'bg-accent text-accent-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <div className="flex-1">
                          <div>{item.label}</div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </div>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </ScrollArea>
            <div className="border-t p-4">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.first_name} {user?.surname}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card border-r px-6">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Exametrics</span>
            </div>
          </div>
          <Separator />
          <div className="py-4">
            <ExamSelector />
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-4">
              {navigation.map((section) => (
                <li key={section.title}>
                  <div className="mb-2 px-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {section.title}
                    </h3>
                  </div>
                  <ul role="list" className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                            isActive(item.href) && 'bg-accent text-accent-foreground'
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="truncate">{item.label}</div>
                            <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                          </div>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto shrink-0">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t py-4">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.first_name} {user?.surname}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="shrink-0">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
          </Sheet>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-foreground">
                {selectedExam ? selectedExam.exam_name : 'Select an exam'}
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <ThemeToggle />
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
