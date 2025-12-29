'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useExam } from '@/contexts/ExamContext';
import { getFullSchoolAnalysis, getSchoolRanking, getSchoolSubjects, getSchoolDivisions, getSchoolGrades } from '@/lib/api';
import { PieChart, Search, Loader2, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatNumber } from '@/lib/utils';

export default function AnalysisPage() {
  const { selectedExam } = useExam();
  const [centreNumber, setCentreNumber] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!selectedExam || !centreNumber.trim()) {
      toast.error('Please select an exam and enter a centre number');
      return;
    }
    setIsLoading(true);
    setAnalysis(null);
    try {
      const data = await getFullSchoolAnalysis(selectedExam.exam_id, centreNumber.trim());
      setAnalysis(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load school analysis');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">School Analysis</h1>
            <p className="text-muted-foreground">View detailed school performance analysis (API: /school-analyses)</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Search School</CardTitle>
              <CardDescription>Enter a centre number to view detailed analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Centre Number</Label>
                  <Input 
                    placeholder="e.g. S1234" 
                    value={centreNumber} 
                    onChange={e => setCentreNumber(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSearch} disabled={isLoading || !selectedExam}>
                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {analysis && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{analysis.school_name}</CardTitle>
                  <CardDescription>
                    Centre: {analysis.centre_number} • {analysis.region_name} • {analysis.council_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">School GPA</p>
                      <p className="text-2xl font-bold">{analysis.school_gpa?.toFixed(4) || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Overall Rank</p>
                      <p className="text-2xl font-bold">
                        #{analysis.school_ranking?.overall_pos || 'N/A'}
                        {analysis.school_ranking?.overall_out_of && <span className="text-sm text-muted-foreground">/{analysis.school_ranking.overall_out_of}</span>}
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Region Rank</p>
                      <p className="text-2xl font-bold">
                        #{analysis.school_ranking?.region_pos || 'N/A'}
                        {analysis.school_ranking?.region_out_of && <span className="text-sm text-muted-foreground">/{analysis.school_ranking.region_out_of}</span>}
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Students</p>
                      <p className="text-2xl font-bold">{formatNumber(analysis.total_students || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="divisions" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="divisions">Divisions</TabsTrigger>
                  <TabsTrigger value="grades">Grades</TabsTrigger>
                  <TabsTrigger value="subjects">Subjects</TabsTrigger>
                </TabsList>

                <TabsContent value="divisions">
                  <Card>
                    <CardHeader>
                      <CardTitle>Division Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analysis.division_summary?.divisions ? (
                        <div className="grid gap-4 md:grid-cols-5">
                          {Object.entries(analysis.division_summary.divisions).map(([div, counts]: [string, any]) => (
                            <div key={div} className="p-4 border rounded-lg text-center">
                              <p className="text-lg font-bold">Division {div}</p>
                              <p className="text-3xl font-bold mt-2">{formatNumber(counts?.T || 0)}</p>
                              <div className="text-sm text-muted-foreground mt-1">
                                M: {counts?.M || 0} • F: {counts?.F || 0}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-muted-foreground">No division data available</p>}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="grades">
                  <Card>
                    <CardHeader>
                      <CardTitle>Grade Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analysis.grades_summary ? (
                        <div className="grid gap-4 md:grid-cols-7">
                          {Object.entries(analysis.grades_summary).map(([grade, count]: [string, any]) => (
                            <div key={grade} className="p-4 border rounded-lg text-center">
                              <p className="text-lg font-bold">Grade {grade}</p>
                              <p className="text-2xl font-bold mt-2">{formatNumber(count || 0)}</p>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-muted-foreground">No grade data available</p>}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="subjects">
                  <Card>
                    <CardHeader>
                      <CardTitle>Subject Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analysis.subject_gpas ? (
                        <div className="space-y-2">
                          {Object.entries(analysis.subject_gpas).map(([subject, gpa]: [string, any]) => (
                            <div key={subject} className="flex items-center justify-between p-3 border rounded-lg">
                              <span className="font-medium">{subject}</span>
                              <Badge variant="outline">{typeof gpa === 'number' ? gpa.toFixed(4) : gpa}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-muted-foreground">No subject data available</p>}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
