'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useExam } from '@/contexts/ExamContext';
import { getExamResults } from '@/lib/api';
import { Building2, RefreshCw, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { formatNumber } from '@/lib/utils';

export default function SchoolAnalyticsPage() {
  const { selectedExam } = useExam();
  const [schools, setSchools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    if (!selectedExam) return;
    setIsLoading(true);
    try {
      const data = await getExamResults(selectedExam.exam_id);
      setSchools(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load school analytics');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [selectedExam]);

  const filtered = schools.filter(s =>
    s.centre_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.school_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topSchools = [...schools].sort((a, b) => (a.school_ranking?.school_position?.overall_pos || 999) - (b.school_ranking?.school_position?.overall_pos || 999)).slice(0, 10);
  const chartData = topSchools.map(s => ({
    name: s.school_name?.substring(0, 15) || s.centre_number,
    gpa: s.school_gpa || 0,
    students: s.total_students || 0
  }));

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">School Analytics</h1>
              <p className="text-muted-foreground">School performance analysis (API: /results/results)</p>
            </div>
            <Button variant="outline" size="icon" onClick={loadData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {!selectedExam ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select an exam to view school analytics.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Schools by GPA</CardTitle>
                  <CardDescription>Best performing schools</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Bar dataKey="gpa" fill="#10b981" name="GPA" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>All Schools</CardTitle>
                  <CardDescription>{filtered.length} schools</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search schools..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-sm" />
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Centre</TableHead>
                          <TableHead>School Name</TableHead>
                          <TableHead>GPA</TableHead>
                          <TableHead>Students</TableHead>
                          <TableHead>Div I</TableHead>
                          <TableHead>Div II</TableHead>
                          <TableHead>Div III</TableHead>
                          <TableHead>Div IV</TableHead>
                          <TableHead>Div 0</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.length === 0 ? (
                          <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground">No schools found</TableCell></TableRow>
                        ) : filtered.slice(0, 50).map(s => (
                          <TableRow key={s.centre_number}>
                            <TableCell>#{s.school_ranking?.school_position?.overall_pos || '—'}</TableCell>
                            <TableCell className="font-medium">{s.centre_number}</TableCell>
                            <TableCell>{s.school_name || '—'}</TableCell>
                            <TableCell><Badge variant="outline">{s.school_gpa?.toFixed(4) || '—'}</Badge></TableCell>
                            <TableCell>{formatNumber(s.total_students || 0)}</TableCell>
                            <TableCell className="text-green-600">{s.division_summary?.divisions?.I?.T || 0}</TableCell>
                            <TableCell>{s.division_summary?.divisions?.II?.T || 0}</TableCell>
                            <TableCell>{s.division_summary?.divisions?.III?.T || 0}</TableCell>
                            <TableCell>{s.division_summary?.divisions?.IV?.T || 0}</TableCell>
                            <TableCell className="text-red-600">{s.division_summary?.divisions?.['0']?.T || 0}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {filtered.length > 50 && <p className="text-sm text-muted-foreground mt-2">Showing 50 of {filtered.length}</p>}
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
