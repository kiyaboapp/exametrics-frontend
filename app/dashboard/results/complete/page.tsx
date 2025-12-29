'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useExam } from '@/contexts/ExamContext';
import { completeResultsProcessing } from '@/lib/api';
import { CheckCircle2, PlayCircle, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CompleteProcessingPage() {
  const { selectedExam } = useExam();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [options, setOptions] = useState({
    delete_theory: false,
    delete_practical: false,
    delete_overall: true
  });

  const handleProcess = async () => {
    if (!selectedExam) {
      toast.error('Please select an exam first');
      return;
    }

    setIsProcessing(true);
    setResult(null);
    try {
      const data = await completeResultsProcessing(selectedExam.exam_id, options);
      setResult(data);
      toast.success('Results processing completed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to process results');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Complete Results Processing</h1>
            <p className="text-muted-foreground">
              Trigger full results processing including rankings, divisions, and analysis (API: /results/results/complete)
            </p>
          </div>

          {!selectedExam ? (
            <Card>
              <CardContent className="py-10 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select an exam to process results.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Processing Options</CardTitle>
                  <CardDescription>Configure what to recalculate during processing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium">Selected Exam</p>
                    <p className="text-lg">{selectedExam.exam_name}</p>
                    <Badge variant="outline" className="mt-2">{selectedExam.exam_level}</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={options.delete_theory} onCheckedChange={c => setOptions({...options, delete_theory: !!c})} />
                      <Label>Delete & recalculate theory rankings</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox checked={options.delete_practical} onCheckedChange={c => setOptions({...options, delete_practical: !!c})} />
                      <Label>Delete & recalculate practical rankings</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox checked={options.delete_overall} onCheckedChange={c => setOptions({...options, delete_overall: !!c})} />
                      <Label>Delete & recalculate overall rankings</Label>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleProcess} disabled={isProcessing} size="lg" className="w-full">
                      {isProcessing ? (
                        <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Processing...</>
                      ) : (
                        <><PlayCircle className="h-5 w-5 mr-2" />Start Complete Processing</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {result && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Processing Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {result.subject_ranking && (
                        <div className="p-4 border rounded-lg">
                          <p className="font-medium">Subject Ranking</p>
                          <p className="text-sm text-muted-foreground">Completed</p>
                        </div>
                      )}
                      {result.division_processing && (
                        <div className="p-4 border rounded-lg">
                          <p className="font-medium">Division Processing</p>
                          <p className="text-sm text-muted-foreground">Completed</p>
                        </div>
                      )}
                      {result.sex_wise_ranking && (
                        <div className="p-4 border rounded-lg">
                          <p className="font-medium">Sex-wise Ranking</p>
                          <p className="text-sm text-muted-foreground">Completed</p>
                        </div>
                      )}
                      {result.schools_subjects_ranking && (
                        <div className="p-4 border rounded-lg">
                          <p className="font-medium">Schools & Subjects Ranking</p>
                          <p className="text-sm text-muted-foreground">Completed</p>
                        </div>
                      )}
                      {result.location_ranking && (
                        <div className="p-4 border rounded-lg">
                          <p className="font-medium">Location Ranking</p>
                          <p className="text-sm text-muted-foreground">Completed</p>
                        </div>
                      )}
                    </div>
                    <pre className="mt-4 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-64">
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
