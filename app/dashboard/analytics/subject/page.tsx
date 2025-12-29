'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useExam } from '@/contexts/ExamContext';
import { getExamSubjects } from '@/lib/api';
import { BookOpen, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { formatNumber } from '@/lib/utils';

export default function SubjectAnalyticsPage() {
  const { selectedExam } = useExam();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    if (!selectedExam) return;
    setIsLoading(true);
    try {
      const data = await getExamSubjects(selectedExam.exam_id);
      setSubjects(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      toast.error('Failed to load subject analytics');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [selectedExam]);

  const chartData = subjects.slice(0, 15).map(s => ({
    name: s.subject_short || s.subject_code,
    students: s.student_count || 0,
    gpa: s.average_gpa || 0
  }));

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Subject Analytics</h1>
              <p className="text-muted-foreground">Subject performance analysis (API: /exam-subjects)</p>
            </div>
            <Button variant="outline" size="icon" onClick={loadData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {!selectedExam ? (
            <Card>
              <CardContent className="py-10 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select an exam to view subject analytics.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Students per Subject</CardTitle>
                    <CardDescription>Enrollment by subject</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="students" fill="#3b82f6" name="Students" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Average GPA by Subject</CardTitle>
                    <CardDescription>Performance comparison</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Bar dataKey="gpa" fill="#10b981" name="GPA" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Subject Details</CardTitle>
                  <CardDescription>{subjects.length} subjects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Subject Name</TableHead>
                          <TableHead>Students</TableHead>
                          <TableHead>Avg GPA</TableHead>
                          <TableHead>Pass Rate</TableHead>
                          <TableHead>Grade A</TableHead>
                          <TableHead>Grade B</TableHead>
                          <TableHead>Grade C</TableHead>
                          <TableHead>Grade D</TableHead>
                          <TableHead>Grade F</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subjects.length === 0 ? (
                          <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground">No subjects found</TableCell></TableRow>
                        ) : subjects.map(s => (
                          <TableRow key={s.subject_code}>
                            <TableCell className="font-medium">{s.subject_code}</TableCell>
                            <TableCell>{s.subject_name}</TableCell>
                            <TableCell>{formatNumber(s.student_count || 0)}</TableCell>
                            <TableCell><Badge variant="outline">{s.average_gpa?.toFixed(4) || '—'}</Badge></TableCell>
                            <TableCell>{s.pass_rate ? `${(s.pass_rate * 100).toFixed(1)}%` : '—'}</TableCell>
                            <TableCell className="text-green-600">{s.grade_a_count || 0}</TableCell>
                            <TableCell>{s.grade_b_count || 0}</TableCell>
                            <TableCell>{s.grade_c_count || 0}</TableCell>
                            <TableCell>{s.grade_d_count || 0}</TableCell>
                            <TableCell className="text-red-600">{s.grade_f_count || 0}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
