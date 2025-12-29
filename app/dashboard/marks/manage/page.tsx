'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useExam } from '@/contexts/ExamContext';
import { getStudentSubjects, updateStudentSubject } from '@/lib/api';
import { Database, Search, RefreshCw, Edit, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageMarksPage() {
  const { selectedExam } = useExam();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [centreNumber, setCentreNumber] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  const loadSubjects = async () => {
    if (!selectedExam || !centreNumber.trim()) return;
    setIsLoading(true);
    try {
      const data = await getStudentSubjects({ exam_id: selectedExam.exam_id, centre_number: centreNumber.trim(), limit: 500 });
      setSubjects(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      toast.error('Failed to load marks');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (subject: any) => {
    setEditingId(subject.student_subject_id);
    setEditValues({
      theory_marks: subject.theory_marks,
      practical_marks: subject.practical_marks
    });
  };

  const handleSave = async (subjectId: string) => {
    try {
      await updateStudentSubject(subjectId, editValues);
      toast.success('Marks updated');
      setEditingId(null);
      await loadSubjects();
    } catch (error) {
      toast.error('Failed to update marks');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Manage Marks</h1>
            <p className="text-muted-foreground">View and edit student subject marks (API: /student/subjects)</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Search School Marks</CardTitle>
              <CardDescription>Enter a centre number to view and edit marks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Centre Number</Label>
                  <Input 
                    placeholder="e.g. S1234" 
                    value={centreNumber} 
                    onChange={e => setCentreNumber(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && loadSubjects()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={loadSubjects} disabled={isLoading || !selectedExam}>
                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {subjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" />Student Marks</CardTitle>
                <CardDescription>{subjects.length} records found</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam No</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Theory</TableHead>
                        <TableHead>Practical</TableHead>
                        <TableHead>Overall</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map(s => (
                        <TableRow key={s.student_subject_id}>
                          <TableCell className="font-medium">{s.exam_number}</TableCell>
                          <TableCell>{s.student_name || '—'}</TableCell>
                          <TableCell>{s.subject_code} - {s.subject_name}</TableCell>
                          <TableCell>
                            {editingId === s.student_subject_id ? (
                              <Input 
                                type="number" 
                                value={editValues.theory_marks || ''} 
                                onChange={e => setEditValues({...editValues, theory_marks: e.target.value ? parseFloat(e.target.value) : null})}
                                className="w-20"
                              />
                            ) : s.theory_marks ?? '—'}
                          </TableCell>
                          <TableCell>
                            {editingId === s.student_subject_id ? (
                              <Input 
                                type="number" 
                                value={editValues.practical_marks || ''} 
                                onChange={e => setEditValues({...editValues, practical_marks: e.target.value ? parseFloat(e.target.value) : null})}
                                className="w-20"
                              />
                            ) : s.practical_marks ?? '—'}
                          </TableCell>
                          <TableCell><Badge variant="outline">{s.overall_marks ?? '—'}</Badge></TableCell>
                          <TableCell><Badge>{s.subject_grade || '—'}</Badge></TableCell>
                          <TableCell>
                            {editingId === s.student_subject_id ? (
                              <Button size="sm" onClick={() => handleSave(s.student_subject_id)}>
                                <Save className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(s)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
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
