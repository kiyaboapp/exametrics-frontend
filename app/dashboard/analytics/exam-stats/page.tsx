'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useExam } from '@/contexts/ExamContext';
import { getExamStats } from '@/lib/api';
import { BarChart3, Users, School, Award, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import { formatNumber } from '@/lib/utils';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'];

export default function ExamStatsPage() {
  const { selectedExam } = useExam();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!selectedExam) return;
      setIsLoading(true);
      try {
        const data = await getExamStats(selectedExam.exam_id);
        setStats(data);
      } catch (error) {
        toast.error('Failed to load exam statistics');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedExam]);

  const divisionData = stats?.division_totals ? Object.entries(stats.division_totals).map(([name, val]: [string, any]) => ({
    name: `Div ${name}`,
    value: val?.T || 0
  })) : [];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Exam Statistics</h1>
            <p className="text-muted-foreground">Overall exam performance statistics (API: /exams/{'{exam_id}'}/stats)</p>
          </div>

          {!selectedExam ? (
            <Card>
              <CardContent className="py-10 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select an exam to view statistics.</p>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="grid gap-4 md:grid-cols-4">
              {[1,2,3,4].map(i => (
                <Card key={i}><CardContent className="py-8"><div className="h-8 bg-muted rounded animate-pulse" /></CardContent></Card>
              ))}
            </div>
          ) : stats ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2"><School className="h-4 w-4" />Total Schools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(stats.total_schools || 0)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="h-4 w-4" />Total Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(stats.total_students || 0)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2"><TrendingUp className="h-4 w-4" />Average GPA</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.average_school_gpa?.toFixed(4) || '—'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2"><Award className="h-4 w-4" />Division I</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatNumber(stats.division_totals?.I?.T || 0)}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Division Distribution</CardTitle>
                    <CardDescription>Students by division</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={divisionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Division Breakdown</CardTitle>
                    <CardDescription>Percentage distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={divisionData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, value}: any) => `${name}: ${value}`}>
                          {divisionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {stats.top_schools && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top 10 Schools</CardTitle>
                    <CardDescription>Best performing schools by GPA</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.top_schools.slice(0, 10).map((school: any, i: number) => (
                        <div key={school.centre_number} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">{i + 1}</Badge>
                            <div>
                              <p className="font-medium">{school.school_name}</p>
                              <p className="text-xs text-muted-foreground">{school.centre_number}</p>
                            </div>
                          </div>
                          <Badge>{school.school_gpa?.toFixed(4)}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No statistics available for this exam.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
