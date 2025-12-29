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
import { Checkbox } from '@/components/ui/checkbox';
import { getSubjects, createSubject, deleteSubject } from '@/lib/api';
import { BookOpen, PlusCircle, RefreshCw, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({
    subject_code: '',
    subject_name: '',
    subject_short: '',
    has_practical: false,
    exclude_from_gpa: false
  });

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const data = await getSubjects({ limit: 200 });
      setSubjects(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      toast.error('Failed to load subjects');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleCreate = async () => {
    if (!newSubject.subject_code || !newSubject.subject_name) {
      toast.error('Subject code and name are required');
      return;
    }
    setIsLoading(true);
    try {
      await createSubject(newSubject);
      toast.success('Subject created');
      setIsCreateOpen(false);
      setNewSubject({ subject_code: '', subject_name: '', subject_short: '', has_practical: false, exclude_from_gpa: false });
      await loadSubjects();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create subject');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm('Delete this subject?')) return;
    try {
      await deleteSubject(code);
      toast.success('Subject deleted');
      await loadSubjects();
    } catch (error) {
      toast.error('Failed to delete subject');
    }
  };

  const filtered = subjects.filter(s =>
    s.subject_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.subject_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Subjects</h1>
              <p className="text-muted-foreground">Manage master subject list (API: /subjects)</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={loadSubjects} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button><PlusCircle className="h-4 w-4 mr-2" />Add Subject</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Subject</DialogTitle>
                    <DialogDescription>Add a new subject to the master list.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Subject Code *</Label>
                        <Input placeholder="e.g. 011" value={newSubject.subject_code} onChange={e => setNewSubject({...newSubject, subject_code: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Short Name</Label>
                        <Input placeholder="e.g. CIV" value={newSubject.subject_short} onChange={e => setNewSubject({...newSubject, subject_short: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Subject Name *</Label>
                      <Input placeholder="e.g. CIVICS" value={newSubject.subject_name} onChange={e => setNewSubject({...newSubject, subject_name: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Checkbox checked={newSubject.has_practical} onCheckedChange={c => setNewSubject({...newSubject, has_practical: !!c})} />
                        <Label>Has Practical</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={newSubject.exclude_from_gpa} onCheckedChange={c => setNewSubject({...newSubject, exclude_from_gpa: !!c})} />
                        <Label>Exclude from GPA</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={isLoading}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Subject List</CardTitle>
              <CardDescription>Total: {filtered.length} subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search subjects..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-sm" />
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Short</TableHead>
                      <TableHead>Practical</TableHead>
                      <TableHead>Exclude GPA</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No subjects found</TableCell></TableRow>
                    ) : filtered.map(subj => (
                      <TableRow key={subj.subject_code}>
                        <TableCell className="font-medium">{subj.subject_code}</TableCell>
                        <TableCell>{subj.subject_name}</TableCell>
                        <TableCell>{subj.subject_short || '—'}</TableCell>
                        <TableCell><Badge variant={subj.has_practical ? 'default' : 'secondary'}>{subj.has_practical ? 'Yes' : 'No'}</Badge></TableCell>
                        <TableCell><Badge variant={subj.exclude_from_gpa ? 'destructive' : 'secondary'}>{subj.exclude_from_gpa ? 'Yes' : 'No'}</Badge></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(subj.subject_code)}>
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
