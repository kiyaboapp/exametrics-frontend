'use client';

import { useState, useEffect } from 'react';
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
  ChevronDown,
  ChevronRight,
  Upload,
  FileCheck,
  FileSpreadsheet,
  FileBarChart,
  ClipboardList,
  Calculator,
  BookOpen,
  Building2,
  UserCheck,
  Layers,
  FolderTree,
  History,
  FileSearch,
  CheckCircle2,
  PlayCircle,
  FileDown,
  FileUp,
  Archive,
  PieChart,
  Target,
  Globe,
  BookMarked,
  Shield,
  KeyRound,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string | number | null;
  children?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: 'Main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        description: 'Overview and statistics',
      },
    ],
  },
  {
    title: 'Exams',
    items: [
      {
        id: 'exams-overview',
        label: 'Exams Overview',
        href: '/dashboard/exams',
        icon: FileText,
        description: 'View all exams',
      },
      {
        id: 'exams-create',
        label: 'Create Exam',
        href: '/dashboard/exams/create',
        icon: FileCheck,
        description: 'Create new examination',
      },
      {
        id: 'exams-registration',
        label: 'Registration Statistics',
        href: '/dashboard/exams/registration-stats',
        icon: BarChart3,
        description: 'View registration data',
      },
      {
        id: 'exams-settings',
        label: 'Exam Settings',
        href: '/dashboard/exams/settings',
        icon: Settings,
        description: 'Configure exam settings',
      },
    ],
  },
  {
    title: 'Results & Processing',
    items: [
      {
        id: 'results-overview',
        label: 'Results Overview',
        href: '/dashboard/results',
        icon: Award,
        description: 'View all results',
      },
      {
        id: 'results-complete',
        label: 'Complete Processing',
        href: '/dashboard/results/complete',
        icon: CheckCircle2,
        description: 'Process complete results',
      },
      {
        id: 'results-analysis',
        label: 'School Analysis',
        href: '/dashboard/results/analysis',
        icon: PieChart,
        description: 'School performance analysis',
      },
      {
        id: 'results-progress',
        label: 'Upload Progress',
        href: '/dashboard/results/progress',
        icon: ClipboardList,
        description: 'Track marks upload progress',
      },
      {
        id: 'results-rankings',
        label: 'Rankings',
        href: '/dashboard/results/rankings',
        icon: Target,
        description: 'View school rankings',
      },
    ],
  },
  {
    title: 'Marks Management',
    items: [
      {
        id: 'marks-upload',
        label: 'Upload Marks',
        href: '/dashboard/marks/upload',
        icon: FileUp,
        description: 'Upload marks (Excel/ZIP)',
        children: [
          {
            id: 'marks-upload-single',
            label: 'Single File',
            href: '/dashboard/marks/upload/single',
            icon: FileSpreadsheet,
          },
          {
            id: 'marks-upload-multiple',
            label: 'Multiple Files',
            href: '/dashboard/marks/upload/multiple',
            icon: Archive,
          },
          {
            id: 'marks-upload-zip',
            label: 'ZIP Archive',
            href: '/dashboard/marks/upload/zip',
            icon: Archive,
          },
        ],
      },
      {
        id: 'marks-export',
        label: 'Export Marks',
        href: '/dashboard/marks/export',
        icon: FileDown,
        description: 'Export marks to Excel',
        children: [
          {
            id: 'marks-export-single',
            label: 'Single School',
            href: '/dashboard/marks/export/single',
            icon: FileSpreadsheet,
          },
          {
            id: 'marks-export-multiple',
            label: 'Multiple Schools',
            href: '/dashboard/marks/export/multiple',
            icon: Archive,
          },
        ],
      },
      {
        id: 'marks-process',
        label: 'Process Subject Data',
        href: '/dashboard/marks/process',
        icon: Calculator,
        description: 'Process and calculate marks',
      },
      {
        id: 'marks-manage',
        label: 'Manage Marks',
        href: '/dashboard/marks/manage',
        icon: Database,
        description: 'View and edit marks',
      },
    ],
  },
  {
    title: 'Schools',
    items: [
      {
        id: 'schools-overview',
        label: 'Schools List',
        href: '/dashboard/schools',
        icon: School,
        description: 'View all schools',
      },
      {
        id: 'schools-upload',
        label: 'Upload Schools',
        href: '/dashboard/schools/upload',
        icon: Upload,
        description: 'Upload school data',
        children: [
          {
            id: 'schools-upload-pdf',
            label: 'PDF Upload',
            href: '/dashboard/schools/upload/pdf',
            icon: FileText,
          },
          {
            id: 'schools-upload-bulk',
            label: 'Bulk PDF Upload',
            href: '/dashboard/schools/upload/bulk',
            icon: Archive,
          },
          {
            id: 'schools-upload-zip',
            label: 'ZIP Upload',
            href: '/dashboard/schools/upload/zip',
            icon: Archive,
          },
        ],
      },
      {
        id: 'schools-search',
        label: 'Search Schools',
        href: '/dashboard/schools/search',
        icon: FileSearch,
        description: 'Search by name or centre',
      },
      {
        id: 'schools-manage',
        label: 'Manage Schools',
        href: '/dashboard/schools/manage',
        icon: Building2,
        description: 'Edit school information',
      },
    ],
  },
  {
    title: 'Reports & Downloads',
    items: [
      {
        id: 'reports-pdf',
        label: 'Generate PDFs',
        href: '/dashboard/reports/pdf',
        icon: FileText,
        description: 'Generate result PDFs',
        children: [
          {
            id: 'reports-pdf-single',
            label: 'Single School PDF',
            href: '/dashboard/reports/pdf/single',
            icon: FileText,
          },
          {
            id: 'reports-pdf-bulk',
            label: 'Bulk PDFs (ZIP)',
            href: '/dashboard/reports/pdf/bulk',
            icon: Archive,
          },
          {
            id: 'reports-pdf-save-all',
            label: 'Save All Documents',
            href: '/dashboard/reports/pdf/save-all',
            icon: FolderTree,
          },
        ],
      },
      {
        id: 'reports-downloads',
        label: 'Download Data',
        href: '/dashboard/reports/downloads',
        icon: Download,
        description: 'Download reports and data',
        children: [
          {
            id: 'reports-download-raw',
            label: 'Raw Data Export',
            href: '/dashboard/reports/downloads/raw',
            icon: FileSpreadsheet,
          },
          {
            id: 'reports-download-stats',
            label: 'Subject Statistics',
            href: '/dashboard/reports/downloads/stats',
            icon: FileBarChart,
          },
          {
            id: 'reports-download-summary',
            label: 'Summary Statistics',
            href: '/dashboard/reports/downloads/summary',
            icon: BarChart3,
          },
        ],
      },
      {
        id: 'reports-isal',
        label: 'ISAL Generation',
        href: '/dashboard/reports/isal',
        icon: ClipboardList,
        description: 'Individual Student Attendance Lists',
      },
    ],
  },
  {
    title: 'Analytics',
    items: [
      {
        id: 'analytics-overview',
        label: 'Analytics Dashboard',
        href: '/dashboard/analytics',
        icon: TrendingUp,
        description: 'Performance analytics',
      },
      {
        id: 'analytics-school',
        label: 'School Analysis',
        href: '/dashboard/analytics/school',
        icon: PieChart,
        description: 'Detailed school analysis',
        children: [
          {
            id: 'analytics-school-full',
            label: 'Full Analysis',
            href: '/dashboard/analytics/school/full',
            icon: BarChart3,
          },
          {
            id: 'analytics-school-ranking',
            label: 'Rankings',
            href: '/dashboard/analytics/school/ranking',
            icon: Target,
          },
          {
            id: 'analytics-school-subjects',
            label: 'Subject GPAs',
            href: '/dashboard/analytics/school/subjects',
            icon: BookOpen,
          },
          {
            id: 'analytics-school-divisions',
            label: 'Division Summary',
            href: '/dashboard/analytics/school/divisions',
            icon: Layers,
          },
          {
            id: 'analytics-school-grades',
            label: 'Grade Summary',
            href: '/dashboard/analytics/school/grades',
            icon: Award,
          },
        ],
      },
      {
        id: 'analytics-location',
        label: 'Location Analysis',
        href: '/dashboard/analytics/location',
        icon: Globe,
        description: 'Regional performance analysis',
      },
      {
        id: 'analytics-subject',
        label: 'Subject Rankings',
        href: '/dashboard/analytics/subject',
        icon: BookMarked,
        description: 'Subject-wise rankings',
      },
      {
        id: 'analytics-exam-stats',
        label: 'Exam Statistics',
        href: '/dashboard/analytics/exam-stats',
        icon: BarChart3,
        description: 'Overall exam statistics',
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        id: 'admin-users',
        label: 'User Management',
        href: '/dashboard/admin/users',
        icon: Users,
        description: 'Manage system users',
      },
      {
        id: 'admin-user-exams',
        label: 'User Exam Assignments',
        href: '/dashboard/admin/user-exams',
        icon: UserCheck,
        description: 'Assign exams to users',
      },
      {
        id: 'admin-locations',
        label: 'Locations',
        href: '/dashboard/admin/locations',
        icon: MapPin,
        description: 'Manage regions/councils/wards',
        children: [
          {
            id: 'admin-locations-regions',
            label: 'Regions',
            href: '/dashboard/admin/locations/regions',
            icon: Globe,
          },
          {
            id: 'admin-locations-councils',
            label: 'Councils',
            href: '/dashboard/admin/locations/councils',
            icon: Building2,
          },
          {
            id: 'admin-locations-wards',
            label: 'Wards',
            href: '/dashboard/admin/locations/wards',
            icon: MapPin,
          },
        ],
      },
      {
        id: 'admin-subjects',
        label: 'Subjects',
        href: '/dashboard/admin/subjects',
        icon: BookOpen,
        description: 'Manage subjects',
      },
      {
        id: 'admin-exam-boards',
        label: 'Exam Boards',
        href: '/dashboard/admin/exam-boards',
        icon: Shield,
        description: 'Manage examination boards',
      },
      {
        id: 'admin-upload-trails',
        label: 'Upload History',
        href: '/dashboard/admin/upload-trails',
        icon: History,
        description: 'View upload trails',
      },
      {
        id: 'admin-settings',
        label: 'System Settings',
        href: '/dashboard/admin/settings',
        icon: Settings,
        description: 'System configuration',
      },
    ],
  },
];

interface NavItemComponentProps {
  item: NavItem;
  isActive: (href: string) => boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  level?: number;
}

function NavItemComponent({ item, isActive, isExpanded, onToggle, onNavigate, level = 0 }: NavItemComponentProps) {
  const hasChildren = item.children && item.children.length > 0;
  const active = isActive(item.href);
  const isChild = level > 0;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          !isChild && 'hover:bg-accent hover:text-accent-foreground',
          active && !isChild && 'bg-accent text-accent-foreground',
          isChild && 'pl-8 text-xs text-muted-foreground hover:text-foreground',
          active && isChild && 'text-foreground font-medium'
        )}
      >
        {hasChildren ? (
          <button
            onClick={onToggle}
            className="flex flex-1 items-center gap-3 text-left"
          >
            <item.icon className={cn('h-4 w-4 shrink-0', isChild && 'h-3 w-3')} />
            <div className="flex-1 min-w-0">
              <div className="truncate">{item.label}</div>
              {item.description && !isChild && (
                <div className="text-xs text-muted-foreground truncate">{item.description}</div>
              )}
            </div>
            {hasChildren && (
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform',
                  !isExpanded && '-rotate-90'
                )}
              />
            )}
          </button>
        ) : (
          <Link
            href={item.href}
            onClick={onNavigate}
            className="flex flex-1 items-center gap-3"
          >
            <item.icon className={cn('h-4 w-4 shrink-0', isChild && 'h-3 w-3')} />
            <div className="flex-1 min-w-0">
              <div className="truncate">{item.label}</div>
              {item.description && !isChild && (
                <div className="text-xs text-muted-foreground truncate">{item.description}</div>
              )}
            </div>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto shrink-0">
                {item.badge}
              </Badge>
            )}
          </Link>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className="ml-4 mt-1 space-y-1 border-l pl-2">
          {item.children.map((child) => (
            <NavItemComponent
              key={child.id}
              item={child}
              isActive={isActive}
              isExpanded={false}
              onToggle={() => {}}
              onNavigate={onNavigate}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
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

  const isActive = (href: string) => {
    if (pathname === href) return true;
    if (pathname.startsWith(href + '/')) return true;
    return false;
  };

  // Auto-expand parent items when child is active
  useEffect(() => {
    const shouldBeExpanded = (item: NavItem): boolean => {
      if (!item.children) return false;
      return item.children.some((child) => isActive(child.href));
    };

    const expanded = new Set<string>();
    navigation.forEach((section) => {
      section.items.forEach((item) => {
        if (shouldBeExpanded(item)) {
          expanded.add(item.id);
        }
      });
    });
    setExpandedItems(expanded);
  }, [pathname]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleNavigate = () => {
    setSidebarOpen(false);
  };

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
                      <NavItemComponent
                        key={item.id}
                        item={item}
                        isActive={isActive}
                        isExpanded={expandedItems.has(item.id)}
                        onToggle={() => toggleExpanded(item.id)}
                        onNavigate={handleNavigate}
                      />
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
                        <NavItemComponent
                          item={item}
                          isActive={isActive}
                          isExpanded={expandedItems.has(item.id)}
                          onToggle={() => toggleExpanded(item.id)}
                          onNavigate={handleNavigate}
                        />
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
