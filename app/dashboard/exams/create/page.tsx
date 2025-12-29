'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createExam, getBoards, createBoard } from '@/lib/api';
import { ArrowLeft, Plus, Loader2, AlertTriangle, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateExamPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateBoardDialogOpen, setIsCreateBoardDialogOpen] = useState(false);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  
  const [formData, setFormData] = useState({
    exam_name: '',
    exam_name_swahili: '',
    exam_level: 'O_LEVEL',
    board_id: '',
    start_date: '',
    end_date: '',
    avg_style: 'GRADE_POINT_AVERAGE',
    ranking_style: 'DIVISION_BASED',
    is_active: true
  });

  const [boardFormData, setBoardFormData] = useState({
    board_name: '',
    board_code: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [boardErrors, setBoardErrors] = useState<Record<string, string>>({});

  const fetchBoards = async () => {
    try {
      setIsLoading(true);
      const data = await getBoards();
      setBoards(data);
    } catch (error) {
      console.error('Error fetching boards:', error);
      toast.error('Failed to load exam boards');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!boardFormData.board_name.trim()) {
      newErrors.board_name = 'Board name is required';
    }

    setBoardErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsCreatingBoard(true);
      const newBoard = await createBoard({
        board_name: boardFormData.board_name.trim(),
        board_code: boardFormData.board_code.trim() || undefined
      });
      
      toast.success('Exam board created successfully');
      setIsCreateBoardDialogOpen(false);
      setBoardFormData({ board_name: '', board_code: '' });
      setBoardErrors({});
      
      // Refresh boards list and select the new board
      await fetchBoards();
      setFormData({ ...formData, board_id: newBoard.board_id });
    } catch (error: any) {
      console.error('Error creating board:', error);
      toast.error(error.response?.data?.message || 'Failed to create exam board');
    } finally {
      setIsCreatingBoard(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.exam_name.trim()) {
      newErrors.exam_name = 'Exam name is required';
    }

    if (!formData.board_id) {
      newErrors.board_id = 'Exam board is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end < start) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setIsSubmitting(true);
      const exam = await createExam(formData);
      toast.success('Exam created successfully');
      router.push(`/dashboard/exams`);
    } catch (error: any) {
      console.error('Error creating exam:', error);
      toast.error(error.response?.data?.message || 'Failed to create exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Create New Exam
              </h1>
              <p className="text-muted-foreground mt-1">
                Add a new examination to the system
              </p>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
              <CardDescription>
                Fill in the information below to create a new exam
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Exam Name */}
                <div className="space-y-2">
                  <Label htmlFor="exam_name">
                    Exam Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="exam_name"
                    value={formData.exam_name}
                    onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
                    placeholder="e.g., Form Four National Examination 2024"
                    className={errors.exam_name ? 'border-destructive' : ''}
                  />
                  {errors.exam_name && (
                    <p className="text-sm text-destructive">{errors.exam_name}</p>
                  )}
                </div>

                {/* Swahili Name */}
                <div className="space-y-2">
                  <Label htmlFor="exam_name_swahili">Exam Name (Swahili)</Label>
                  <Input
                    id="exam_name_swahili"
                    value={formData.exam_name_swahili}
                    onChange={(e) => setFormData({ ...formData, exam_name_swahili: e.target.value })}
                    placeholder="e.g., Mtihani wa Taifa wa Kidato cha Nne 2024"
                  />
                </div>

                {/* Exam Level */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="exam_level">
                      Exam Level <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.exam_level}
                      onValueChange={(value) => setFormData({ ...formData, exam_level: value })}
                    >
                      <SelectTrigger id="exam_level">
                        <SelectValue placeholder="Select exam level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="O_LEVEL">O-Level</SelectItem>
                        <SelectItem value="A_LEVEL">A-Level</SelectItem>
                        <SelectItem value="PRIMARY">Primary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Exam Board */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="board_id">
                        Exam Board <span className="text-destructive">*</span>
                      </Label>
                      <Dialog open={isCreateBoardDialogOpen} onOpenChange={setIsCreateBoardDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                          >
                            <Building2 className="h-3 w-3 mr-1" />
                            Create Board
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Create New Exam Board</DialogTitle>
                            <DialogDescription>
                              Add a new examination board to the system
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleCreateBoard}>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="board_name">
                                  Board Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="board_name"
                                  value={boardFormData.board_name}
                                  onChange={(e) => setBoardFormData({ ...boardFormData, board_name: e.target.value })}
                                  placeholder="e.g., National Examinations Council"
                                  className={boardErrors.board_name ? 'border-destructive' : ''}
                                />
                                {boardErrors.board_name && (
                                  <p className="text-sm text-destructive">{boardErrors.board_name}</p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="board_code">Board Code (Optional)</Label>
                                <Input
                                  id="board_code"
                                  value={boardFormData.board_code}
                                  onChange={(e) => setBoardFormData({ ...boardFormData, board_code: e.target.value })}
                                  placeholder="e.g., NECTA"
                                  maxLength={20}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setIsCreateBoardDialogOpen(false);
                                  setBoardFormData({ board_name: '', board_code: '' });
                                  setBoardErrors({});
                                }}
                                disabled={isCreatingBoard}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" disabled={isCreatingBoard}>
                                {isCreatingBoard ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Board
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Select
                      value={formData.board_id}
                      onValueChange={(value) => setFormData({ ...formData, board_id: value })}
                    >
                      <SelectTrigger id="board_id" className={errors.board_id ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select exam board" />
                      </SelectTrigger>
                      <SelectContent>
                        {boards.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No boards available. Create one to continue.
                          </div>
                        ) : (
                          boards.map((board) => (
                            <SelectItem key={board.board_id} value={board.board_id}>
                              {board.board_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.board_id && (
                      <p className="text-sm text-destructive">{errors.board_id}</p>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">
                      Start Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className={errors.start_date ? 'border-destructive' : ''}
                    />
                    {errors.start_date && (
                      <p className="text-sm text-destructive">{errors.start_date}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">
                      End Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className={errors.end_date ? 'border-destructive' : ''}
                    />
                    {errors.end_date && (
                      <p className="text-sm text-destructive">{errors.end_date}</p>
                    )}
                  </div>
                </div>

                {/* Average Style */}
                <div className="space-y-2">
                  <Label htmlFor="avg_style">Average Style</Label>
                  <Select
                    value={formData.avg_style}
                    onValueChange={(value) => setFormData({ ...formData, avg_style: value })}
                  >
                    <SelectTrigger id="avg_style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GRADE_POINT_AVERAGE">Grade Point Average (GPA)</SelectItem>
                      <SelectItem value="MEAN_SCORE">Mean Score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ranking Style */}
                <div className="space-y-2">
                  <Label htmlFor="ranking_style">Ranking Style</Label>
                  <Select
                    value={formData.ranking_style}
                    onValueChange={(value) => setFormData({ ...formData, ranking_style: value })}
                  >
                    <SelectTrigger id="ranking_style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DIVISION_BASED">Division Based</SelectItem>
                      <SelectItem value="GRADE_BASED">Grade Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active Exam</Label>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Exam
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

