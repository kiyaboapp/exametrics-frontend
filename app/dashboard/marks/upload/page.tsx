'use client';

import { useState, useRef } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useExam } from '@/contexts/ExamContext';
import { importMarks, importMarksMultiple, importMarksZIP } from '@/lib/api';
import { FileUp, Upload, Loader2, CheckCircle, XCircle, FileSpreadsheet, Archive } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadMarksPage() {
  const { selectedExam } = useExam();
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [options, setOptions] = useState({ upload_nulls: false, use_student_id: false });
  const singleFileRef = useRef<HTMLInputElement>(null);
  const multipleFilesRef = useRef<HTMLInputElement>(null);
  const zipFileRef = useRef<HTMLInputElement>(null);

  const handleSingleUpload = async () => {
    if (!selectedExam || !singleFileRef.current?.files?.[0]) {
      toast.error('Please select an exam and a file');
      return;
    }
    setIsUploading(true);
    setResult(null);
    try {
      const data = await importMarks(singleFileRef.current.files[0], selectedExam.exam_id, options);
      setResult(data);
      toast.success('Marks uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
      setResult({ error: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleMultipleUpload = async () => {
    if (!selectedExam || !multipleFilesRef.current?.files?.length) {
      toast.error('Please select an exam and files');
      return;
    }
    setIsUploading(true);
    setResult(null);
    try {
      const files = Array.from(multipleFilesRef.current.files);
      const data = await importMarksMultiple(files, selectedExam.exam_id, options);
      setResult(data);
      toast.success('Marks uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
      setResult({ error: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleZIPUpload = async () => {
    if (!selectedExam || !zipFileRef.current?.files?.[0]) {
      toast.error('Please select an exam and a ZIP file');
      return;
    }
    setIsUploading(true);
    setResult(null);
    try {
      const data = await importMarksZIP(zipFileRef.current.files[0], selectedExam.exam_id, options);
      setResult(data);
      toast.success('Marks uploaded successfully');
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
            <h1 className="text-3xl font-bold">Upload Marks</h1>
            <p className="text-muted-foreground">Import student marks from Excel files (API: /student/subjects/import)</p>
          </div>

          {!selectedExam ? (
            <Card>
              <CardContent className="py-10 text-center">
                <FileUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select an exam to upload marks.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Upload Options</CardTitle>
                  <CardDescription>Configure how marks should be processed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted rounded-lg mb-4">
                    <p className="font-medium">Selected Exam: {selectedExam.exam_name}</p>
                    <Badge variant="outline" className="mt-1">{selectedExam.exam_level}</Badge>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <Checkbox checked={options.upload_nulls} onCheckedChange={c => setOptions({...options, upload_nulls: !!c})} />
                      <Label>Upload null values (overwrite existing)</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked={options.use_student_id} onCheckedChange={c => setOptions({...options, use_student_id: !!c})} />
                      <Label>Use student ID instead of exam number</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="single" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="single"><FileSpreadsheet className="h-4 w-4 mr-2" />Single File</TabsTrigger>
                  <TabsTrigger value="multiple"><FileUp className="h-4 w-4 mr-2" />Multiple Files</TabsTrigger>
                  <TabsTrigger value="zip"><Archive className="h-4 w-4 mr-2" />ZIP Archive</TabsTrigger>
                </TabsList>

                <TabsContent value="single">
                  <Card>
                    <CardHeader>
                      <CardTitle>Single File Upload</CardTitle>
                      <CardDescription>Upload a single Excel file (.xlsx, .xlsm)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Select Excel File</Label>
                        <Input ref={singleFileRef} type="file" accept=".xlsx,.xlsm,.xls" />
                      </div>
                      <Button onClick={handleSingleUpload} disabled={isUploading} className="w-full">
                        {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                        Upload Marks
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="multiple">
                  <Card>
                    <CardHeader>
                      <CardTitle>Multiple Files Upload</CardTitle>
                      <CardDescription>Upload multiple Excel files at once</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Select Excel Files</Label>
                        <Input ref={multipleFilesRef} type="file" accept=".xlsx,.xlsm,.xls" multiple />
                      </div>
                      <Button onClick={handleMultipleUpload} disabled={isUploading} className="w-full">
                        {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                        Upload All Files
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="zip">
                  <Card>
                    <CardHeader>
                      <CardTitle>ZIP Archive Upload</CardTitle>
                      <CardDescription>Upload a ZIP file containing multiple Excel files</CardDescription>
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
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
