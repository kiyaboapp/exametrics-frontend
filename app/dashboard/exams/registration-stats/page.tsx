'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useExam } from '@/contexts/ExamContext';
import { getExamRegistrationStats } from '@/lib/api';
import { 
  Users, 
  School, 
  MapPin, 
  GraduationCap,
  TrendingUp,
  Download,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatNumber } from '@/lib/utils';

export default function RegistrationStatsPage() {
  const { selectedExam } = useExam();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedExam) return;

      setIsLoading(true);
      try {
        const data = await getExamRegistrationStats(selectedExam.exam_id);
        console.log('Registration Stats:', data); // Debug log
        setStats(data);
      } catch (error) {
        toast.error('Failed to load registration statistics');
        console.error('Error fetching registration stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [selectedExam]);

  if (!selectedExam) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Please select an exam to view registration statistics</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!stats) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">No registration statistics available</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // Prepare chart data with correct mapping
  const regionChartData = stats.by_region?.map((region: any) => ({
    name: region.region,
    schools: region.school_count || 0,
    students: region.student_count || 0
  })) || [];

  const genderChartData = stats.students?.by_gender?.map((gender: any) => ({
    name: gender.gender === 'F' ? 'Female' : 'Male',
    value: gender.count,
    percentage: ((gender.count / stats.students.total) * 100).toFixed(1)
  })) || [];

  const schoolTypeChartData = stats.school_types?.map((type: any) => ({
    name: type.type.replace('_', ' '),
    schools: type.school_count || 0,
    students: type.student_count || 0
  })) || [];

  const councilChartData = stats.by_council?.map((council: any) => ({
    name: council.council,
    schools: council.school_count || 0,
    students: council.student_count || 0
  })) || [];

  const wardChartData = stats.by_ward?.slice(0, 20).map((ward: any) => ({
    name: `${ward.ward}`,
    council: ward.council,
    schools: ward.school_count || 0,
    students: ward.student_count || 0
  })) || [];

  const subjectEnrollment = stats.subjects?.map((subject: any) => ({
    name: subject.subject_name || subject.subject_code,
    enrollment: subject.enrollment_count || 0
  })) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Calculate totals correctly
  const totalSchools = stats.by_region?.reduce((acc: number, r: any) => acc + (r.school_count || 0), 0) || 0;
  const totalStudents = stats.students?.total || 0;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Registration Statistics</h1>
              <p className="text-muted-foreground">
                {selectedExam.exam_name} - {new Date(selectedExam.start_date).getFullYear()}
              </p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(totalStudents)}</div>
                <p className="text-xs text-muted-foreground">
                  Registered candidates
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                <School className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(totalSchools)}</div>
                <p className="text-xs text-muted-foreground">
                  Participating centers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Regions</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.by_region?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Covered regions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subjects</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.subjects?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Exam subjects
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Schools by Region */}
            <Card>
              <CardHeader>
                <CardTitle>Schools by Region</CardTitle>
                <CardDescription>Distribution of participating schools</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={regionChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="schools" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gender Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
                <CardDescription>Students by gender</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genderChartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* School Types */}
          <Card>
            <CardHeader>
              <CardTitle>School Types</CardTitle>
              <CardDescription>Distribution by school type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schoolTypeChartData.map((type: any, index: number) => (
                  <div key={type.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <div>
                        <p className="font-medium capitalize">{type.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(type.schools)} schools
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatNumber(type.students)}</p>
                      <p className="text-sm text-muted-foreground">students</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Councils Table */}
          {stats.by_council && stats.by_council.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Registration by Council</CardTitle>
                <CardDescription>Detailed breakdown by council</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Region</th>
                        <th className="text-left p-2">Council</th>
                        <th className="text-right p-2">Schools</th>
                        <th className="text-right p-2">Students</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.by_council.slice(0, 20).map((council: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{council.region}</td>
                          <td className="p-2">{council.council}</td>
                          <td className="text-right p-2">{council.school_count}</td>
                          <td className="text-right p-2">{formatNumber(council.student_count)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {stats.by_council.length > 20 && (
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                      Showing 20 of {stats.by_council.length} councils
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}