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
import { generateSchoolPDF, generateBulkPDFs, saveAllExamDocuments } from '@/lib/api';
import { FileText, Download, Loader2, Archive, FolderDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GeneratePDFPage() {
  const { selectedExam } = useExam();
  const [isGenerating, setIsGenerating] = useState(false);
  const [centreNumber, setCentreNumber] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleSinglePDF = async () => {
    if (!selectedExam || !centreNumber.trim()) {
      toast.error('Please select an exam and enter a centre number');
      return;
    }
    setIsGenerating(true);
    try {
      const blob = await generateSchoolPDF(selectedExam.exam_id, centreNumber.trim());
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `results_${centreNumber.trim()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF downloaded');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkPDFs = async () => {
    if (!selectedExam) {
      toast.error('Please select an exam');
      return;
    }
    setIsGenerating(true);
    try {
      const blob = await generateBulkPDFs(selectedExam.exam_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `results_all_schools.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('ZIP downloaded');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate PDFs');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAll = async () => {
    if (!selectedExam) {
      toast.error('Please select an exam');
      return;
    }
    setIsGenerating(true);
    setResult(null);
    try {
      const data = await saveAllExamDocuments(selectedExam.exam_id);
      setResult(data);
      toast.success('Documents saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save documents');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Generate PDFs</h1>
            <p className="text-muted-foreground">Generate result PDFs for schools (API: /results/results/pdf)</p>
          </div>

          {!selectedExam ? (
            <Card>
              <CardContent className="py-10 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select an exam to generate PDFs.</p>
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

              <Tabs defaultValue="single" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="single"><FileText className="h-4 w-4 mr-2" />Single School</TabsTrigger>
                  <TabsTrigger value="bulk"><Archive className="h-4 w-4 mr-2" />Bulk (ZIP)</TabsTrigger>
                  <TabsTrigger value="save"><FolderDown className="h-4 w-4 mr-2" />Save All</TabsTrigger>
                </TabsList>

                <TabsContent value="single">
                  <Card>
                    <CardHeader>
                      <CardTitle>Single School PDF</CardTitle>
                      <CardDescription>Generate result PDF for one school</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Centre Number</Label>
                        <Input placeholder="e.g. S1234" value={centreNumber} onChange={e => setCentreNumber(e.target.value)} />
                      </div>
                      <Button onClick={handleSinglePDF} disabled={isGenerating} className="w-full">
                        {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                        Generate & Download PDF
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="bulk">
                  <Card>
                    <CardHeader>
                      <CardTitle>Bulk PDFs (ZIP)</CardTitle>
                      <CardDescription>Generate PDFs for all schools as a ZIP archive</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        This will generate result PDFs for all schools in the selected exam and package them in a ZIP file.
                      </p>
                      <Button onClick={handleBulkPDFs} disabled={isGenerating} className="w-full">
                        {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                        Generate & Download ZIP
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="save">
                  <Card>
                    <CardHeader>
                      <CardTitle>Save All Documents</CardTitle>
                      <CardDescription>Save all exam documents to the server</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        This will generate and save all result documents for this exam on the server.
                      </p>
                      <Button onClick={handleSaveAll} disabled={isGenerating} className="w-full">
                        {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FolderDown className="h-4 w-4 mr-2" />}
                        Save All Documents
                      </Button>
                      {result && (
                        <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto max-h-40">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      )}
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
