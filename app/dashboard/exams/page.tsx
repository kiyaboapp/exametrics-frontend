'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { getExams, getExamRegistrationStats, createExam, updateExam, deleteExam, reprocessExam, getBoards } from '@/lib/api';
import { useExam } from '@/contexts/ExamContext';
import { Calendar, MapPin, Users, School as SchoolIcon, Plus, Edit, Trash2, RefreshCw, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate, formatNumber } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function ExamsPage() {
  const { selectedExam, setSelectedExam } = useExam();
  const [exams, setExams] = useState<any[]>([]);
  const [registrationStats, setRegistrationStats] = useState<any>(null);
  const [boards, setBoards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState<string | null>(null);
  
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

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setIsLoading(true);
        const data = await getExams();
        setExams(data);
      } catch (error) {
        console.error('Error fetching exams:', error);
        toast.error('Failed to load exams');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchBoards = async () => {
      try {
        const data = await getBoards();
        setBoards(data);
      } catch (error) {
        console.error('Error fetching boards:', error);
        toast.error('Failed to load boards');
      }
    };

    fetchExams();
    fetchBoards();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (selectedExam) {
        try {
          setStatsLoading(true);
          const stats = await getExamRegistrationStats(selectedExam.exam_id);
          setRegistrationStats(stats);
        } catch (error) {
          console.error('Error fetching registration stats:', error);
          toast.error('Failed to load registration statistics');
        } finally {
          setStatsLoading(false);
        }
      }
    };

    fetchStats();
  }, [selectedExam]);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const newExam = await createExam(formData);
      setExams([...exams, newExam]);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Exam created successfully');
    } catch (error) {
      console.error('Error creating exam:', error);
      toast.error('Failed to create exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam) return;

    try {
      setIsSubmitting(true);
      const updatedExam = await updateExam(editingExam.exam_id, formData);
      setExams(exams.map(exam => exam.exam_id === editingExam.exam_id ? updatedExam : exam));
      setIsEditDialogOpen(false);
      resetForm();
      setEditingExam(null);
      toast.success('Exam updated successfully');
    } catch (error) {
      console.error('Error updating exam:', error);
      toast.error('Failed to update exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteExam(examId);
      setExams(exams.filter(exam => exam.exam_id !== examId));
      if (selectedExam?.exam_id === examId) {
        setSelectedExam(null);
      }
      toast.success('Exam deleted successfully');
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error('Failed to delete exam');
    }
  };

  const handleReprocessExam = async (examId: string) => {
    try {
      setIsReprocessing(examId);
      const result = await reprocessExam(examId);
      toast.success(result.message || 'Exam reprocessing started successfully');
    } catch (error) {
      console.error('Error reprocessing exam:', error);
      toast.error('Failed to reprocess exam');
    } finally {
      setIsReprocessing(null);
    }
  };

  const resetForm = () => {
    setFormData({
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
  };

  const openEditDialog = (exam: any) => {
    setEditingExam(exam);
    setFormData({
      exam_name: exam.exam_name,
      exam_name_swahili: exam.exam_name_swahili || '',
      exam_level: exam.exam_level,
      board_id: exam.board_id,
      start_date: exam.start_date,
      end_date: exam.end_date,
      avg_style: exam.avg_style,
      ranking_style: exam.ranking_style,
      is_active: exam.is_active
    });
    setIsEditDialogOpen(true);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Exams</h1>
              <p className="mt-2 text-sm text-gray-600">
                View and manage exam information, registration statistics, and details.
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Exam
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Exam</DialogTitle>
                  <DialogDescription>
                    Create a new examination. Fill in all the required details.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateExam}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="exam_name" className="text-right">
                        Exam Name
                      </Label>
                      <Input
                        id="exam_name"
                        value={formData.exam_name}
                        onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="exam_name_swahili" className="text-right">
                        Swahili Name
                      </Label>
                      <Input
                        id="exam_name_swahili"
                        value={formData.exam_name_swahili}
                        onChange={(e) => setFormData({ ...formData, exam_name_swahili: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="exam_level" className="text-right">
                        Level
                      </Label>
                      <Select value={formData.exam_level} onValueChange={(value) => setFormData({ ...formData, exam_level: value })}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="O_LEVEL">O Level</SelectItem>
                          <SelectItem value="A_LEVEL">A Level</SelectItem>
                          <SelectItem value="PRIMARY">Primary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="board_id" className="text-right">
                        Board
                      </Label>
                      <Select value={formData.board_id} onValueChange={(value) => setFormData({ ...formData, board_id: value })}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a board" />
                        </SelectTrigger>
                        <SelectContent>
                          {boards.map((board) => (
                            <SelectItem key={board.board_id} value={board.board_id}>
                              {board.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="start_date" className="text-right">
                        Start Date
                      </Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="end_date" className="text-right">
                        End Date
                      </Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="avg_style" className="text-right">
                        Average Style
                      </Label>
                      <Select value={formData.avg_style} onValueChange={(value) => setFormData({ ...formData, avg_style: value })}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GRADE_POINT_AVERAGE">Grade Point Average</SelectItem>
                          <SelectItem value="WEIGHTED_AVERAGE">Weighted Average</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="ranking_style" className="text-right">
                        Ranking Style
                      </Label>
                      <Select value={formData.ranking_style} onValueChange={(value) => setFormData({ ...formData, ranking_style: value })}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DIVISION_BASED">Division Based</SelectItem>
                          <SelectItem value="POINTS_BASED">Points Based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="is_active" className="text-right">
                        Active
                      </Label>
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Creating...' : 'Create Exam'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">All Exams</TabsTrigger>
              <TabsTrigger value="registration" disabled={!selectedExam}>
                Registration Stats
              </TabsTrigger>
              <TabsTrigger value="analytics" disabled={!selectedExam}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <div className="h-6 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse mt-2" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {exams.map((exam) => (
                    <Card
                      key={exam.exam_id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedExam?.exam_id === exam.exam_id ? 'ring-2 ring-indigo-500' : ''
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1" onClick={() => setSelectedExam(exam)}>
                            <CardTitle className="text-lg">{exam.exam_name}</CardTitle>
                            <CardDescription>{exam.exam_name_swahili || exam.exam_level}</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={exam.is_active ? 'default' : 'secondary'}>
                              {exam.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{formatDate(exam.start_date)} - {formatDate(exam.end_date)}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Badge variant="outline" className="text-xs">
                              {exam.exam_level}
                            </Badge>
                            <Badge variant="outline" className="text-xs ml-2">
                              {exam.avg_style}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(exam);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReprocessExam(exam.exam_id);
                            }}
                            disabled={isReprocessing === exam.exam_id}
                          >
                            <RefreshCw className={`h-4 w-4 ${isReprocessing === exam.exam_id ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteExam(exam.exam_id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="registration" className="space-y-4">
              {!selectedExam ? (
                <Card>
                  <CardContent className="py-10 text-center">
                    <p className="text-gray-500">Please select an exam to view registration statistics.</p>
                  </CardContent>
                </Card>
              ) : statsLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <div className="h-6 bg-gray-200 rounded animate-pulse" />
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : registrationStats ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(registrationStats.students?.total || 0)}</div>
                        <div className="flex gap-2 mt-2 text-xs text-gray-600">
                          <span>M: {formatNumber(registrationStats.students?.by_gender?.find((g: any) => g.gender === 'M')?.count || 0)}</span>
                          <span>F: {formatNumber(registrationStats.students?.by_gender?.find((g: any) => g.gender === 'F')?.count || 0)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Regions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{registrationStats.by_region?.length || 0}</div>
                        <p className="text-xs text-gray-600 mt-2">Participating regions</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Councils</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{registrationStats.by_council?.length || 0}</div>
                        <p className="text-xs text-gray-600 mt-2">Participating councils</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {registrationStats.by_region?.reduce((sum: number, r: any) => sum + r.school_count, 0) || 0}
                        </div>
                        <p className="text-xs text-gray-600 mt-2">Registered schools</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Schools by Region</CardTitle>
                        <CardDescription>Distribution of schools across regions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {registrationStats.by_region?.map((region: any) => (
                            <div key={region.region} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium">{region.region}</span>
                              </div>
                              <Badge variant="secondary">{region.school_count} schools</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Schools by Council</CardTitle>
                        <CardDescription>Distribution of schools across councils</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {registrationStats.by_council?.slice(0, 20).map((council: any) => (
                            <div key={council.council} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium">{council.council}</span>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="secondary">{council.school_count} schools</Badge>
                                <Badge variant="outline">{council.student_count} students</Badge>
                              </div>
                            </div>
                          ))}
                          {registrationStats.by_council?.length > 20 && (
                            <p className="text-xs text-gray-500 text-center pt-2">
                              Showing top 20 of {registrationStats.by_council.length} councils
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>School Types</CardTitle>
                        <CardDescription>Distribution by school type</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {registrationStats.school_types?.map((type: any) => (
                            <div key={type.type} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <SchoolIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium">{type.type || 'UNKNOWN'}</span>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="outline">{type.school_count} schools</Badge>
                                <Badge variant="secondary">{type.student_count} students</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Top Councils by Performance</CardTitle>
                        <CardDescription>Councils with highest student registration</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {registrationStats.by_council?.sort((a: any, b: any) => b.student_count - a.student_count).slice(0, 10).map((council: any, index: number) => (
                            <div key={council.council} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-indigo-500'
                                }`}>
                                  {index + 1}
                                </div>
                                <span className="text-sm font-medium">{council.council}</span>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">{formatNumber(council.student_count)}</p>
                                <p className="text-xs text-gray-500">{council.school_count} schools</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Subject Enrollment</CardTitle>
                      <CardDescription>Number of students enrolled in each subject</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {registrationStats.subjects?.map((subject: any) => (
                          <div key={subject.subject_code} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="text-sm font-medium">{subject.subject_name}</p>
                              <p className="text-xs text-gray-500">{subject.subject_code}</p>
                            </div>
                            <Badge>{subject.enrollment_count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-10 text-center">
                    <p className="text-gray-500">No registration statistics available.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4">
              {!selectedExam ? (
                <Card>
                  <CardContent className="py-10 text-center">
                    <p className="text-gray-500">Please select an exam to view analytics.</p>
                  </CardContent>
                </Card>
              ) : statsLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <div className="h-6 bg-gray-200 rounded animate-pulse" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 bg-gray-200 rounded animate-pulse" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : registrationStats ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Gender Distribution</CardTitle>
                        <CardDescription>Student gender breakdown</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={registrationStats.students?.by_gender?.map((g: any) => ({
                                name: g.gender === 'M' ? 'Male' : 'Female',
                                value: g.count
                              })) || []}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry) => `${entry.name}: ${entry.value}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              <Cell fill="#8884d8" />
                              <Cell fill="#82ca9d" />
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>School Types</CardTitle>
                        <CardDescription>Distribution by school type</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={registrationStats.school_types || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="type" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="school_count" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Regional Distribution</CardTitle>
                        <CardDescription>Schools distribution across regions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={registrationStats.by_region || []} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="region" type="category" width={100} />
                            <Tooltip />
                            <Bar dataKey="school_count" fill="#82ca9d" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Council Distribution</CardTitle>
                        <CardDescription>Top 20 councils by student count</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={registrationStats.by_council?.slice(0, 20).sort((a: any, b: any) => b.student_count - a.student_count) || []} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="council" type="category" width={100} />
                            <Tooltip />
                            <Bar dataKey="student_count" fill="#8b5cf6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Council Performance Overview</CardTitle>
                      <CardDescription>Detailed council statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 font-medium text-sm">
                          <div>Council</div>
                          <div className="text-center">Schools</div>
                          <div className="text-center">Students</div>
                          <div className="text-center">Avg Students/School</div>
                          <div className="text-center">Region</div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {registrationStats.by_council?.sort((a: any, b: any) => b.student_count - a.student_count).map((council: any) => (
                            <div key={council.council} className="grid grid-cols-5 gap-4 p-4 border-b hover:bg-gray-50">
                              <div className="font-medium">{council.council}</div>
                              <div className="text-center">{council.school_count}</div>
                              <div className="text-center">{formatNumber(council.student_count)}</div>
                              <div className="text-center">
                                {council.school_count > 0 ? Math.round(council.student_count / council.school_count) : 0}
                              </div>
                              <div className="text-center text-sm text-gray-500">{council.region || '-'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-10 text-center">
                    <p className="text-gray-500">No analytics data available.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Exam</DialogTitle>
              <DialogDescription>
                Update exam details. Make necessary changes and save.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateExam}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="exam_name_edit" className="text-right">
                    Exam Name
                  </Label>
                  <Input
                    id="exam_name_edit"
                    value={formData.exam_name}
                    onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="exam_name_swahili_edit" className="text-right">
                    Swahili Name
                  </Label>
                  <Input
                    id="exam_name_swahili_edit"
                    value={formData.exam_name_swahili}
                    onChange={(e) => setFormData({ ...formData, exam_name_swahili: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="exam_level_edit" className="text-right">
                    Level
                  </Label>
                  <Select value={formData.exam_level} onValueChange={(value) => setFormData({ ...formData, exam_level: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="O_LEVEL">O Level</SelectItem>
                      <SelectItem value="A_LEVEL">A Level</SelectItem>
                      <SelectItem value="PRIMARY">Primary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="board_id_edit" className="text-right">
                    Board
                  </Label>
                  <Select value={formData.board_id} onValueChange={(value) => setFormData({ ...formData, board_id: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a board" />
                    </SelectTrigger>
                    <SelectContent>
                      {boards.map((board) => (
                        <SelectItem key={board.board_id} value={board.board_id}>
                          {board.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start_date_edit" className="text-right">
                    Start Date
                  </Label>
                  <Input
                    id="start_date_edit"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="end_date_edit" className="text-right">
                    End Date
                  </Label>
                  <Input
                    id="end_date_edit"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="avg_style_edit" className="text-right">
                    Average Style
                  </Label>
                  <Select value={formData.avg_style} onValueChange={(value) => setFormData({ ...formData, avg_style: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GRADE_POINT_AVERAGE">Grade Point Average</SelectItem>
                      <SelectItem value="WEIGHTED_AVERAGE">Weighted Average</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ranking_style_edit" className="text-right">
                    Ranking Style
                  </Label>
                  <Select value={formData.ranking_style} onValueChange={(value) => setFormData({ ...formData, ranking_style: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DIVISION_BASED">Division Based</SelectItem>
                      <SelectItem value="POINTS_BASED">Points Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="is_active_edit" className="text-right">
                    Active
                  </Label>
                  <Switch
                    id="is_active_edit"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Exam'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
