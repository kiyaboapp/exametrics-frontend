'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useExam } from '@/contexts/ExamContext';
import { getSchoolProgress, updateSchoolProgress } from '@/lib/api';
import { RefreshCw, Search, ClipboardList, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatNumber } from '@/lib/utils';

export default function ProgressPage() {
  const { selectedExam } = useExam();
  const [progress, setProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadProgress = async () => {
    if (!selectedExam) return;
    setIsLoading(true);
    try {
      const data = await getSchoolProgress(selectedExam.exam_id);
      setProgress(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      toast.error('Failed to load progress data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadProgress(); }, [selectedExam]);

  const handleUpdateProgress = async () => {
    if (!selectedExam) return;
    setIsUpdating(true);
    try {
      await updateSchoolProgress(selectedExam.exam_id);
      toast.success('Progress updated successfully');
      await loadProgress();
    } catch (error) {
      toast.error('Failed to update progress');
    } finally {
      setIsUpdating(false);
    }
  };

  const filtered = progress.filter(p =>
    p.centre_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.school_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProgressPercent = (p: any) => {
    if (!p.total_subjects || p.total_subjects === 0) return 0;
    return Math.round((p.uploaded_subjects || 0) / p.total_subjects * 100);
  };

  const getStatusBadge = (percent: number) => {
    if (percent === 100) return <Badge variant="default">Complete</Badge>;
    if (percent >= 50) return <Badge variant="secondary">In Progress</Badge>;
    if (percent > 0) return <Badge variant="outline">Started</Badge>;
    return <Badge variant="destructive">Not Started</Badge>;
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Upload Progress</h1>
              <p className="text-muted-foreground">Track marks upload progress for each school (API: /results/progress)</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={loadProgress} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={handleUpdateProgress} disabled={isUpdating || !selectedExam}>
                {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ClipboardList className="h-4 w-4 mr-2" />}
                Update Progress
              </Button>
            </div>
          </div>

          {!selectedExam ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">Please select an exam to view progress.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>School Progress</CardTitle>
                <CardDescription>
                  {filtered.length} schools • 
                  {filtered.filter(p => getProgressPercent(p) === 100).length} complete
                </CardDescription>
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
                        <TableHead>Centre</TableHead>
                        <TableHead>School Name</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No progress data found</TableCell></TableRow>
                      ) : filtered.map(p => {
                        const percent = getProgressPercent(p);
                        return (
                          <TableRow key={p.centre_number}>
                            <TableCell className="font-medium">{p.centre_number}</TableCell>
                            <TableCell>{p.school_name || '—'}</TableCell>
                            <TableCell>{formatNumber(p.uploaded_subjects || 0)}</TableCell>
                            <TableCell>{formatNumber(p.total_subjects || 0)}</TableCell>
                            <TableCell className="w-40">
                              <div className="flex items-center gap-2">
                                <Progress value={percent} className="h-2" />
                                <span className="text-xs w-10">{percent}%</span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(percent)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
