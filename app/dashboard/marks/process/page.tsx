'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useExam } from '@/contexts/ExamContext';
import { processSubjectData } from '@/lib/api';
import { Calculator, PlayCircle, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProcessMarksPage() {
  const { selectedExam } = useExam();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleProcess = async () => {
    if (!selectedExam) {
      toast.error('Please select an exam');
      return;
    }
    setIsProcessing(true);
    setResult(null);
    try {
      const data = await processSubjectData(selectedExam.exam_id);
      setResult(data);
      toast.success('Subject data processed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Process Subject Data</h1>
            <p className="text-muted-foreground">Calculate grades and rankings for uploaded marks (API: /student/subjects/process)</p>
          </div>

          {!selectedExam ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select an exam to process.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Process Subject Data</CardTitle>
                  <CardDescription>This will calculate overall marks, grades, and subject rankings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium">Selected Exam: {selectedExam.exam_name}</p>
                    <Badge variant="outline" className="mt-1">{selectedExam.exam_level}</Badge>
                  </div>
                  <div className="p-4 border rounded-lg space-y-2">
                    <p className="font-medium">Processing will:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>Calculate overall marks (theory + practical)</li>
                      <li>Assign subject grades based on marks</li>
                      <li>Calculate theory rankings</li>
                      <li>Calculate practical rankings</li>
                      <li>Calculate overall subject rankings</li>
                    </ul>
                  </div>
                  <Button onClick={handleProcess} disabled={isProcessing} size="lg" className="w-full">
                    {isProcessing ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <PlayCircle className="h-5 w-5 mr-2" />}
                    Start Processing
                  </Button>
                </CardContent>
              </Card>

              {result && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Processing Complete
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto max-h-64">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
