'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useExam } from '@/contexts/ExamContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getExams, getExamStats } from '@/lib/api';
import { 
  BarChart3, 
  Users, 
  School, 
  TrendingUp, 
  Calendar,
  MapPin,
  Award,
  BookOpen,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatNumber } from '@/lib/utils';

const DashboardPage = () => {
  const { user } = useAuth();
  const { selectedExam, setSelectedExam } = useExam();
  const [stats, setStats] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const examsData = await getExams();
        setExams(examsData);

        if (selectedExam) {
          const examStats = await getExamStats(selectedExam.exam_id);
          setStats(examStats);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedExam]);

  const StatCard = ({ title, value, icon: Icon, description, trend, trendValue }: any) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <span>{description}</span>
          {trend && (
            <span className={`ml-2 flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {trendValue}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user?.first_name}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's what's happening with your exams today.
              </p>
            </div>
            {selectedExam && (
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {selectedExam.exam_level}
              </Badge>
            )}
          </div>

          {!selectedExam ? (
            <Card className="border-dashed">
              <CardHeader className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="text-xl">Select an Exam to Get Started</CardTitle>
                <CardDescription>
                  Choose an exam from the dropdown above to view detailed statistics and analytics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {exams.slice(0, 6).map((exam) => (
                    <Button
                      key={exam.exam_id}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start"
                      onClick={() => setSelectedExam(exam)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-medium">{exam.exam_name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(exam.start_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {exam.exam_level}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-8 bg-gray-200 rounded animate-pulse" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : stats ? (
                <>
                  {/* Stats Grid */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                      title="Total Schools"
                      value={formatNumber(stats.total_schools || 0)}
                      icon={School}
                      description="Registered schools"
                      trend="up"
                      trendValue="12%"
                    />
                    <StatCard
                      title="Average GPA"
                      value={stats.average_school_gpa?.toFixed(4) || '0.0000'}
                      icon={TrendingUp}
                      description="School performance"
                      trend="up"
                      trendValue="5%"
                    />
                    <StatCard
                      title="Total Students"
                      value={formatNumber(stats.total_students || 0)}
                      icon={Users}
                      description="Across all schools"
                      trend="up"
                      trendValue="8%"
                    />
                    <StatCard
                      title="Division I"
                      value={formatNumber(stats.division_totals?.I?.T || 0)}
                      icon={Award}
                      description="Top performers"
                      trend="down"
                      trendValue="3%"
                    />
                  </div>

                  {/* Charts Section */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          Division Distribution
                        </CardTitle>
                        <CardDescription>
                          Overall performance breakdown
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {['I', 'II', 'III', 'IV'].map((division) => {
                            const count = stats.division_totals?.[division as keyof typeof stats.division_totals]?.T || 0;
                            const total = Object.values(stats.division_totals || {}).reduce((sum: any, div: any) => sum + (div?.T || 0), 0);
                            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
                            
                            return (
                              <div key={division} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant={division === 'I' ? 'default' : 'secondary'}>
                                    Division {division}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">{count} students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 bg-secondary rounded-full h-2">
                                    <div 
                                      className="bg-primary h-2 rounded-full" 
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium w-12 text-right">{percentage}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          Top Schools
                        </CardTitle>
                        <CardDescription>
                          Best performing schools
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {stats.top_schools?.slice(0, 5).map((school: any, index: number) => (
                            <div key={school.centre_number} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                                  {index + 1}
                                </Badge>
                                <div>
                                  <p className="font-medium text-sm">{school.school_name}</p>
                                  <p className="text-xs text-muted-foreground">{school.centre_number}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{school.school_gpa?.toFixed(4)}</p>
                                <p className="text-xs text-muted-foreground">GPA</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>
                        Latest updates and notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Results processed for 50 schools</span>
                          <span className="text-xs text-muted-foreground ml-auto">2 hours ago</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">New exam registration opened</span>
                          <span className="text-xs text-muted-foreground ml-auto">5 hours ago</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-sm">Analytics report generated</span>
                          <span className="text-xs text-muted-foreground ml-auto">1 day ago</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-10 text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No statistics available for this exam.</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardPage;
