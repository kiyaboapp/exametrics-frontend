'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getBoards, createBoard, deleteBoard, updateBoard } from '@/lib/api';
import { PlusCircle, Shield, RefreshCw, Trash2, Pencil, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExamBoard {
  board_id: string;
  name: string;
  location?: string;
  chairman?: string;
  secretary?: string;
}

export default function ExamBoardsPage() {
  const [boards, setBoards] = useState<ExamBoard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [chairman, setChairman] = useState('');
  const [secretary, setSecretary] = useState('');

  const loadBoards = async () => {
    setIsLoading(true);
    try {
      const data = await getBoards();
      setBoards(data || []);
    } catch (error) {
      toast.error('Failed to load exam boards');
      console.error('getBoards error', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Board name is required');
      return;
    }
    setIsLoading(true);
    try {
      await createBoard({ name: name.trim(), location: location.trim() || undefined, chairman: chairman.trim() || undefined, secretary: secretary.trim() || undefined });
      toast.success('Exam board created successfully');
      setName('');
      setLocation('');
      setChairman('');
      setSecretary('');
      await loadBoards();
    } catch (error: any) {
      toast.error(error?.data?.detail || 'Failed to create exam board');
      console.error('createBoard error', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (boardId: string, boardName: string) => {
    if (!confirm(`Are you sure you want to delete "${boardName}"? This cannot be undone.`)) return;
    setIsLoading(true);
    try {
      await deleteBoard(boardId);
      toast.success('Exam board deleted');
      await loadBoards();
    } catch (error: any) {
      toast.error(error?.data?.detail || 'Failed to delete exam board');
      console.error('deleteBoard error', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Exam Boards</h1>
              <p className="text-muted-foreground">
                Manage examination boards that own exams. Data is pulled directly from the backend API.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={loadBoards} disabled={isLoading}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Add Exam Board
              </CardTitle>
              <CardDescription>Create a new exam board as defined in the API documentation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="board-name">Board Name</Label>
                  <Input
                    id="board-name"
                    placeholder="e.g. NECTA"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="board-location">Location (optional)</Label>
                  <Input
                    id="board-location"
                    placeholder="e.g. Dar es Salaam"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="board-chairman">Chairman (optional)</Label>
                  <Input
                    id="board-chairman"
                    placeholder="e.g. John Doe"
                    value={chairman}
                    onChange={(e) => setChairman(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="board-secretary">Secretary (optional)</Label>
                  <Input
                    id="board-secretary"
                    placeholder="e.g. Jane Doe"
                    value={secretary}
                    onChange={(e) => setSecretary(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleCreate} disabled={isLoading}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Board
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Boards</CardTitle>
              <CardDescription>Live data from /exam-boards endpoint.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Badge variant="secondary">{boards.length} boards</Badge>
                {isLoading && <span>Refreshing…</span>}
              </div>
              <Separator />
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Chairman</TableHead>
                      <TableHead>Secretary</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {boards.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No exam boards found.
                        </TableCell>
                      </TableRow>
                    )}
                    {boards.map((board) => (
                      <TableRow key={board.board_id}>
                        <TableCell className="font-medium">{board.name}</TableCell>
                        <TableCell>{board.location || '—'}</TableCell>
                        <TableCell>{board.chairman || '—'}</TableCell>
                        <TableCell>{board.secretary || '—'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(board.board_id, board.name)} disabled={isLoading}>
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