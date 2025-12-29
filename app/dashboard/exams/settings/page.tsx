'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExam } from '@/contexts/ExamContext';
import { updateExam, getExamSubjects } from '@/lib/api';
import { Settings, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExamSettingsPage() {
  const { selectedExam, setSelectedExam } = useExam();
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    exam_name: '',
    exam_level: '',
    exam_year: '',
    pass_mark: 30,
    max_mark: 100,
    is_active: true
  });

  useEffect(() => {
    if (selectedExam) {
      setSettings({
        exam_name: selectedExam.exam_name || '',
        exam_level: selectedExam.exam_level || '',
        exam_year: (selectedExam as any).exam_year?.toString() || '',
        pass_mark: (selectedExam as any).pass_mark || 30,
        max_mark: (selectedExam as any).max_mark || 100,
        is_active: (selectedExam as any).is_active ?? true
      });
      loadSubjects();
    }
  }, [selectedExam]);

  const loadSubjects = async () => {
    if (!selectedExam) return;
    try {
      const data = await getExamSubjects(selectedExam.exam_id);
      setSubjects(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    if (!selectedExam) return;
    setIsLoading(true);
    try {
      await updateExam(selectedExam.exam_id, {
        exam_name: settings.exam_name,
        exam_level: settings.exam_level,
        exam_year: parseInt(settings.exam_year),
        pass_mark: settings.pass_mark,
        max_mark: settings.max_mark,
        is_active: settings.is_active
      });
      toast.success('Exam settings saved');
      // Refresh handled by context
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Exam Settings</h1>
            <p className="text-muted-foreground">Configure exam parameters and settings (API: /exams/{'{exam_id}'})</p>
          </div>

          {!selectedExam ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select an exam to configure settings.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Basic exam configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Exam Name</Label>
                      <Input value={settings.exam_name} onChange={e => setSettings({...settings, exam_name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Exam Level</Label>
                      <Select value={settings.exam_level} onValueChange={v => setSettings({...settings, exam_level: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FTNA">FTNA (Form Two)</SelectItem>
                          <SelectItem value="CSEE">CSEE (Form Four)</SelectItem>
                          <SelectItem value="ACSEE">ACSEE (Form Six)</SelectItem>
                          <SelectItem value="PSLE">PSLE (Primary)</SelectItem>
                          <SelectItem value="SFNA">SFNA</SelectItem>
                          <SelectItem value="STNA">STNA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Exam Year</Label>
                      <Input type="number" value={settings.exam_year} onChange={e => setSettings({...settings, exam_year: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Exam ID</Label>
                      <Input value={selectedExam.exam_id} disabled />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Grading Settings</CardTitle>
                  <CardDescription>Mark thresholds and grading parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Pass Mark</Label>
                      <Input type="number" value={settings.pass_mark} onChange={e => setSettings({...settings, pass_mark: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Mark</Label>
                      <Input type="number" value={settings.max_mark} onChange={e => setSettings({...settings, max_mark: parseInt(e.target.value) || 100})} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox checked={settings.is_active} onCheckedChange={c => setSettings({...settings, is_active: !!c})} />
                    <Label>Exam is Active</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Exam Subjects</CardTitle>
                  <CardDescription>{subjects.length} subjects assigned to this exam</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {subjects.length === 0 ? (
                      <p className="text-muted-foreground">No subjects assigned</p>
                    ) : subjects.map(s => (
                      <Badge key={s.subject_code} variant="outline">{s.subject_code} - {s.subject_name}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading} size="lg">
                  {isLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
                  Save Settings
                </Button>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
