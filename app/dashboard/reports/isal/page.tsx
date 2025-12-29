'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useExam } from '@/contexts/ExamContext';
import { generateAttendancePDF } from '@/lib/api';
import { ClipboardList, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ISALPage() {
  const { selectedExam } = useExam();
  const [isGenerating, setIsGenerating] = useState(false);
  const [centreNumber, setCentreNumber] = useState('');

  const handleGenerate = async () => {
    if (!selectedExam) {
      toast.error('Please select an exam');
      return;
    }
    setIsGenerating(true);
    try {
      const params: any = { exam_id: selectedExam.exam_id };
      if (centreNumber.trim()) params.centre_number = centreNumber.trim();
      
      const blob = await generateAttendancePDF(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `isal_${centreNumber.trim() || 'all'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('ISAL PDF downloaded');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate ISAL');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">ISAL Generation</h1>
            <p className="text-muted-foreground">Generate Individual Student Attendance Lists (API: /isals)</p>
          </div>

          {!selectedExam ? (
            <Card>
              <CardContent className="py-10 text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select an exam to generate ISALs.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Generate Attendance PDF</CardTitle>
                <CardDescription>Create student attendance lists for exam sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Selected Exam:</span>
                    <Badge>{selectedExam.exam_name}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Centre Number (optional)</Label>
                  <Input 
                    placeholder="Leave empty for all schools" 
                    value={centreNumber} 
                    onChange={e => setCentreNumber(e.target.value)} 
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a specific centre number or leave empty to generate for all schools
                  </p>
                </div>

                <div className="p-4 border rounded-lg space-y-2">
                  <p className="font-medium">ISAL Document includes:</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Student exam numbers and names</li>
                    <li>Subject registration details</li>
                    <li>Attendance signature spaces</li>
                    <li>Session-wise layout for invigilators</li>
                  </ul>
                </div>

                <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="w-full">
                  {isGenerating ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Download className="h-5 w-5 mr-2" />}
                  Generate ISAL PDF
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
