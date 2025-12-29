'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useExam } from '@/contexts/ExamContext';
import { downloadRawData, downloadSchoolSubjectStats, downloadSchoolSummaryStats } from '@/lib/api';
import { Download, FileSpreadsheet, BarChart3, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DownloadsPage() {
  const { selectedExam } = useExam();
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (type: string) => {
    if (!selectedExam) {
      toast.error('Please select an exam');
      return;
    }
    setDownloading(type);
    try {
      let blob: Blob;
      let filename: string;
      
      switch (type) {
        case 'raw':
          blob = await downloadRawData({ exam_id: selectedExam.exam_id });
          filename = `raw_data_${selectedExam.exam_id}.xlsx`;
          break;
        case 'subject-stats':
          blob = await downloadSchoolSubjectStats({ exam_id: selectedExam.exam_id });
          filename = `subject_stats_${selectedExam.exam_id}.xlsx`;
          break;
        case 'summary':
          blob = await downloadSchoolSummaryStats({ exam_id: selectedExam.exam_id });
          filename = `summary_stats_${selectedExam.exam_id}.xlsx`;
          break;
        default:
          return;
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started');
    } catch (error: any) {
      toast.error(error.message || 'Download failed');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Download Data</h1>
            <p className="text-muted-foreground">Download exam data and statistics (API: /results/download)</p>
          </div>

          {!selectedExam ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select an exam to download data.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Selected Exam:</span>
                    <Badge>{selectedExam.exam_name}</Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5" />Raw Data Export</CardTitle>
                    <CardDescription>Export raw student marks and results data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Contains all student subject entries with marks, grades, and rankings.
                    </p>
                    <Button onClick={() => handleDownload('raw')} disabled={downloading === 'raw'} className="w-full">
                      {downloading === 'raw' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                      Download Raw Data
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Subject Statistics</CardTitle>
                    <CardDescription>School-level subject performance statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Contains subject GPAs, pass rates, and grade distributions per school.
                    </p>
                    <Button onClick={() => handleDownload('subject-stats')} disabled={downloading === 'subject-stats'} className="w-full">
                      {downloading === 'subject-stats' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                      Download Subject Stats
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Summary Statistics</CardTitle>
                    <CardDescription>Overall school summary statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Contains school GPA, division counts, rankings, and totals.
                    </p>
                    <Button onClick={() => handleDownload('summary')} disabled={downloading === 'summary'} className="w-full">
                      {downloading === 'summary' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                      Download Summary Stats
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
