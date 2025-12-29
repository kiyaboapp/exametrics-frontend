'use client';

import { useState, useRef } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useExam } from '@/contexts/ExamContext';
import { uploadSchoolPDF, uploadSchoolPDFsBulk, uploadSchoolPDFsZIP } from '@/lib/api';
import { FileUp, Upload, Loader2, CheckCircle, XCircle, FileText, Archive } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadSchoolsPage() {
  const { selectedExam } = useExam();
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const singleFileRef = useRef<HTMLInputElement>(null);
  const multipleFilesRef = useRef<HTMLInputElement>(null);
  const zipFileRef = useRef<HTMLInputElement>(null);

  const handleSingleUpload = async () => {
    if (!singleFileRef.current?.files?.[0]) {
      toast.error('Please select a PDF file');
      return;
    }
    setIsUploading(true);
    setResult(null);
    try {
      const data = await uploadSchoolPDF(singleFileRef.current.files[0], selectedExam?.exam_id);
      setResult(data);
      toast.success('School PDF uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
      setResult({ error: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!multipleFilesRef.current?.files?.length) {
      toast.error('Please select PDF files');
      return;
    }
    setIsUploading(true);
    setResult(null);
    try {
      const files = Array.from(multipleFilesRef.current.files);
      const data = await uploadSchoolPDFsBulk(files, selectedExam?.exam_id);
      setResult(data);
      toast.success('School PDFs uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
      setResult({ error: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleZIPUpload = async () => {
    if (!zipFileRef.current?.files?.[0]) {
      toast.error('Please select a ZIP file');
      return;
    }
    setIsUploading(true);
    setResult(null);
    try {
      const data = await uploadSchoolPDFsZIP(zipFileRef.current.files[0], selectedExam?.exam_id);
      setResult(data);
      toast.success('ZIP uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
      setResult({ error: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Upload Schools</h1>
            <p className="text-muted-foreground">Upload school registration PDFs to extract school and student data (API: /schools/upload)</p>
          </div>

          {selectedExam && (
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Selected Exam:</span>
                  <Badge>{selectedExam.exam_name}</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="single" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="single"><FileText className="h-4 w-4 mr-2" />Single PDF</TabsTrigger>
              <TabsTrigger value="bulk"><FileUp className="h-4 w-4 mr-2" />Bulk PDFs</TabsTrigger>
              <TabsTrigger value="zip"><Archive className="h-4 w-4 mr-2" />ZIP Archive</TabsTrigger>
            </TabsList>

            <TabsContent value="single">
              <Card>
                <CardHeader>
                  <CardTitle>Single PDF Upload</CardTitle>
                  <CardDescription>Upload a single school registration PDF</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select PDF File</Label>
                    <Input ref={singleFileRef} type="file" accept=".pdf" />
                  </div>
                  <Button onClick={handleSingleUpload} disabled={isUploading} className="w-full">
                    {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    Upload PDF
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bulk">
              <Card>
                <CardHeader>
                  <CardTitle>Bulk PDF Upload</CardTitle>
                  <CardDescription>Upload multiple school registration PDFs at once</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select PDF Files</Label>
                    <Input ref={multipleFilesRef} type="file" accept=".pdf" multiple />
                  </div>
                  <Button onClick={handleBulkUpload} disabled={isUploading} className="w-full">
                    {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    Upload All PDFs
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="zip">
              <Card>
                <CardHeader>
                  <CardTitle>ZIP Archive Upload</CardTitle>
                  <CardDescription>Upload a ZIP file containing multiple school PDFs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select ZIP File</Label>
                    <Input ref={zipFileRef} type="file" accept=".zip" />
                  </div>
                  <Button onClick={handleZIPUpload} disabled={isUploading} className="w-full">
                    {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    Upload ZIP
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.error ? <XCircle className="h-5 w-5 text-destructive" /> : <CheckCircle className="h-5 w-5 text-green-500" />}
                  Upload Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto max-h-64">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
