'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { getUserExams, createUserExam, deleteUserExam, getUsers, getExams } from '@/lib/api';
import { UserCheck, PlusCircle, RefreshCw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EXAM_ROLES = ['VIEWER', 'UPLOADER', 'EXAM_ADMIN'];

export default function UserExamsPage() {
  const [userExams, setUserExams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    user_id: '',
    exam_id: '',
    role: 'VIEWER',
    permissions: { edit: false, view: true, upload_results: false, download_analysis: true, view_progress: true, manage_users: false }
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ueData, usersData, examsData] = await Promise.all([
        getUserExams({ limit: 200 }),
        getUsers({ limit: 200 }),
        getExams(0, 200)
      ]);
      setUserExams(Array.isArray(ueData) ? ueData : ueData.items || []);
      setUsers(Array.isArray(usersData) ? usersData : usersData.items || []);
      setExams(Array.isArray(examsData) ? examsData : []);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    if (!newAssignment.user_id || !newAssignment.exam_id) {
      toast.error('User and Exam are required');
      return;
    }
    setIsLoading(true);
    try {
      await createUserExam(newAssignment);
      toast.success('User-Exam assignment created');
      setIsCreateOpen(false);
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create assignment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string, examId: string) => {
    if (!confirm('Remove this assignment?')) return;
    try {
      await deleteUserExam(userId, examId);
      toast.success('Assignment removed');
      await loadData();
    } catch (error) {
      toast.error('Failed to remove assignment');
    }
  };

  const getUserName = (id: string) => {
    const u = users.find(u => u.id === id);
    return u ? `${u.username} (${u.first_name || ''})` : id;
  };

  const getExamName = (id: string) => {
    const e = exams.find(e => e.exam_id === id);
    return e ? e.exam_name : id;
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">User Exam Assignments</h1>
              <p className="text-muted-foreground">Assign users to exams with specific roles and permissions (API: /user-exams)</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={loadData} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button><PlusCircle className="h-4 w-4 mr-2" />Assign User</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Assign User to Exam</DialogTitle>
                    <DialogDescription>Create a new user-exam assignment with permissions.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>User *</Label>
                      <Select value={newAssignment.user_id} onValueChange={v => setNewAssignment({...newAssignment, user_id: v})}>
                        <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                        <SelectContent>
                          {users.map(u => <SelectItem key={u.id} value={u.id}>{u.username} ({u.email})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Exam *</Label>
                      <Select value={newAssignment.exam_id} onValueChange={v => setNewAssignment({...newAssignment, exam_id: v})}>
                        <SelectTrigger><SelectValue placeholder="Select exam" /></SelectTrigger>
                        <SelectContent>
                          {exams.map(e => <SelectItem key={e.exam_id} value={e.exam_id}>{e.exam_name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={newAssignment.role} onValueChange={v => setNewAssignment({...newAssignment, role: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {EXAM_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Permissions</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(newAssignment.permissions).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-2">
                            <Checkbox checked={val} onCheckedChange={c => setNewAssignment({
                              ...newAssignment,
                              permissions: {...newAssignment.permissions, [key]: !!c}
                            })} />
                            <Label className="text-sm">{key.replace(/_/g, ' ')}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={isLoading}>Assign</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5" />Assignments</CardTitle>
              <CardDescription>Total: {userExams.length} assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userExams.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No assignments found</TableCell></TableRow>
                    ) : userExams.map((ue, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{getUserName(ue.user_id)}</TableCell>
                        <TableCell>{getExamName(ue.exam_id)}</TableCell>
                        <TableCell><Badge variant="outline">{ue.role}</Badge></TableCell>
                        <TableCell className="text-xs">
                          {ue.permissions && Object.entries(ue.permissions).filter(([,v]) => v).map(([k]) => k).join(', ') || '—'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(ue.user_id, ue.exam_id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
