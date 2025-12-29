'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileBarChart, 
  Users, 
  School,
  Calendar,
  MapPin,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useExam } from '@/contexts/ExamContext';
import { toast } from 'react-hot-toast';

interface ExamActionsPanelProps {
  className?: string;
}

export function ExamActionsPanel({ className }: ExamActionsPanelProps) {
  const { selectedExam } = useExam();
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handleDownload = async (type: string) => {
    if (!selectedExam) {
      toast.error('Please select an exam first');
      return;
    }

    setIsDownloading(type);
    try {
      // Simulate download action
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`${type} downloaded successfully`);
    } catch (error) {
      toast.error(`Failed to download ${type}`);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    if (!selectedExam) {
      toast.error('Please select an exam first');
      return;
    }

    setIsDownloading(`export-${format}`);
    try {
      // Simulate export action
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to export data`);
    } finally {
      setIsDownloading(null);
    }
  };

  if (!selectedExam) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Exam Actions
          </CardTitle>
          <CardDescription>
            Select an exam to view available actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mr-2" />
            No exam selected
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Exam Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{selectedExam.name}</CardTitle>
              <CardDescription className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedExam.date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {selectedExam.location || 'Not specified'}
                </span>
              </CardDescription>
            </div>
            <Badge variant={selectedExam.status === 'completed' ? 'default' : 'secondary'}>
              {selectedExam.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => handleDownload('results')}
              disabled={isDownloading === 'results'}
            >
              <Download className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Download Results</div>
                <div className="text-sm text-muted-foreground">Get complete exam results</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => handleDownload('reports')}
              disabled={isDownloading === 'reports'}
            >
              <FileBarChart className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Analytics Report</div>
                <div className="text-sm text-muted-foreground">Performance analytics</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => handleDownload('schools')}
              disabled={isDownloading === 'schools'}
            >
              <School className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">School Reports</div>
                <div className="text-sm text-muted-foreground">Per-school performance</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => handleDownload('rankings')}
              disabled={isDownloading === 'rankings'}
            >
              <Users className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Rankings</div>
                <div className="text-sm text-muted-foreground">Top performers</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Export exam data in various formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => handleExport('excel')}
              disabled={isDownloading === 'export-excel'}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleExport('pdf')}
              disabled={isDownloading === 'export-pdf'}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleExport('csv')}
              disabled={isDownloading === 'export-csv'}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Upload marks or corrections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Upload className="h-4 w-4 mr-2" />
              Upload Marks
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Upload className="h-4 w-4 mr-2" />
              Upload Corrections
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}