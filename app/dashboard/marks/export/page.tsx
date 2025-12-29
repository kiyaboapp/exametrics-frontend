'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useExam } from '@/contexts/ExamContext';
import { exportStudentSubjects, exportStudentSubjectsMultiple } from '@/lib/api';
import { FileDown, Download, Loader2, FileSpreadsheet, Archive } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExportMarksPage() {
  const { selectedExam } = useExam();
  const [isExporting, setIsExporting] = useState(false);
  const [centreNumber, setCentreNumber] = useState('');

  const handleSingleExport = async () => {
    if (!selectedExam || !centreNumber.trim()) {
      toast.error('Please select an exam and enter a centre number');
      return;
    }
    setIsExporting(true);
    try {
      const blob = await exportStudentSubjects({ exam_id: selectedExam.exam_id, centre_number: centreNumber.trim() });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `marks_${centreNumber.trim()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Marks exported successfully');
    } catch (error: any) {
      toast.error(error.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleMultipleExport = async () => {
    if (!selectedExam) {
      toast.error('Please select an exam');
      return;
    }
    setIsExporting(true);
    try {
      const blob = await exportStudentSubjectsMultiple(selectedExam.exam_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `marks_all_schools.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('All marks exported successfully');
    } catch (error: any) {
      toast.error(error.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Export Marks</h1>
            <p className="text-muted-foreground">Export student marks to Excel files (API: /student/subjects/export)</p>
          </div>

          {!selectedExam ? (
            <Card>
              <CardContent className="py-10 text-center">
                <FileDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select an exam to export marks.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Selected Exam</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium">{selectedExam.exam_name}</p>
                    <Badge variant="outline" className="mt-1">{selectedExam.exam_level}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="single" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single"><FileSpreadsheet className="h-4 w-4 mr-2" />Single School</TabsTrigger>
                  <TabsTrigger value="multiple"><Archive className="h-4 w-4 mr-2" />All Schools (ZIP)</TabsTrigger>
                </TabsList>

                <TabsContent value="single">
                  <Card>
                    <CardHeader>
                      <CardTitle>Export Single School</CardTitle>
                      <CardDescription>Export marks for one school as Excel file</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Centre Number</Label>
                        <Input placeholder="e.g. S1234" value={centreNumber} onChange={e => setCentreNumber(e.target.value)} />
                      </div>
                      <Button onClick={handleSingleExport} disabled={isExporting} className="w-full">
                        {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                        Export Marks
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="multiple">
                  <Card>
                    <CardHeader>
                      <CardTitle>Export All Schools</CardTitle>
                      <CardDescription>Export marks for all schools as a ZIP archive</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        This will export marks for all schools in the selected exam. The download may take some time for large exams.
                      </p>
                      <Button onClick={handleMultipleExport} disabled={isExporting} className="w-full">
                        {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                        Export All Schools
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
