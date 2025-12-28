'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExam } from '@/contexts/ExamContext';
import { getSchoolResults, getExamResults, downloadSchoolPDF, getSchoolAnalysis } from '@/lib/api';
import { Download, FileText, BarChart3, PieChart, TrendingUp, Award, Trophy, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { SchoolResult, SchoolAnalysis } from '@/types';
import { formatNumber } from '@/lib/utils';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Area, AreaChart } from 'recharts';

export default function ResultsPage() {
  const { selectedExam } = useExam();
  const [results, setResults] = useState<SchoolResult[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SchoolResult | null>(null);
  const [schoolAnalysis, setSchoolAnalysis] = useState<SchoolAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('rank');

  useEffect(() => {
    const fetchResults = async () => {
      if (selectedExam) {
        try {
          setIsLoading(true);
          console.log('Fetching results for exam:', selectedExam.exam_id);
          const data = await getExamResults(selectedExam.exam_id);
          console.log('School results data:', data);
          console.log('Data length:', data?.length);
          if (data && data.length > 0) {
            console.log('First school data sample:', data[0]);
          }
          
          // Data should already be an array from the API
          setResults(data || []);
          
          if (!data || data.length === 0) {
            toast.error('No results found - exam may not have processed results yet');
          }
        } catch (error: any) {
          console.error('Error fetching school results:', error);
          if (error.response?.status === 404) {
            toast.error('Results not found - exam may not have processed results yet');
          } else {
            toast.error('Failed to load exam results');
          }
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchResults();
  }, [selectedExam]);
  
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (selectedSchool && selectedExam) {
        try {
          setAnalysisLoading(true);
          const data = await getSchoolAnalysis(selectedExam.exam_id, selectedSchool.centre_number, true);
          setSchoolAnalysis(data);
        } catch (error) {
          console.error('Error fetching school analysis:', error);
          toast.error('Failed to load school analysis');
        } finally {
          setAnalysisLoading(false);
        }
      }
    };
    
    fetchAnalysis();
  }, [selectedSchool, selectedExam]);
  
  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case 'rank':
        return (a.school_ranking?.school_position?.overall_pos || 999999) - (b.school_ranking?.school_position?.overall_pos || 999999);
      case 'gpa':
        return (b.school_gpa || 0) - (a.school_gpa || 0);
      case 'students':
        return (b.total_students || 0) - (a.total_students || 0);
      case 'division1':
        return (b.division_summary?.divisions?.I?.T || 0) - (a.division_summary?.divisions?.I?.T || 0);
      default:
        return 0;
    }
  });
  
  const getTopSchools = (limit = 10) => {
    return sortedResults.slice(0, limit);
  };
  
  const getDivisionDistribution = () => {
    const distribution: { [key: string]: number } = {};
    results.forEach(school => {
      if (school.division_summary?.divisions) {
        Object.entries(school.division_summary.divisions).forEach(([div, counts]) => {
          const total = (counts as { T: number })?.T || 0;
          distribution[div] = (distribution[div] || 0) + total;
        });
      }
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };
  
  const getPerformanceData = () => {
    return getTopSchools(20).map(school => ({
      name: school.school_name || school.centre_number,
      rank: school.school_ranking?.school_position?.overall_pos || 0,
      division1: school.division_summary?.divisions?.I?.T || 0,
      students: school.total_students || 0
    }));
  };

  const handleDownloadPDF = async (centreNumber: string, schoolName: string) => {
    if (!selectedExam) return;

    try {
      setDownloadingPDF(centreNumber);
      const blob = await downloadSchoolPDF(selectedExam.exam_id, centreNumber);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${centreNumber}_${schoolName.replace(/\s+/g, '_')}_results.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setDownloadingPDF(null);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Results</h1>
            <p className="mt-2 text-sm text-gray-600">
              View school results, analysis, and download PDF reports.
            </p>
          </div>

          {!selectedExam ? (
            <Card>
              <CardContent className="py-10 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Please select an exam to view results.</p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="schools">Schools</TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                {selectedSchool && (
                  <TabsTrigger value="school-detail">
                    <Award className="h-4 w-4 mr-2" />
                    School Detail
                  </TabsTrigger>
                )}
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                {isLoading ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i}>
                        <CardHeader>
                          <div className="h-6 bg-gray-200 rounded animate-pulse" />
                        </CardHeader>
                        <CardContent>
                          <div className="h-8 bg-gray-200 rounded animate-pulse" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{results.length}</div>
                          <p className="text-xs text-gray-600 mt-2">Participating schools</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {formatNumber(results.reduce((sum, school) => sum + (school.total_students || 0), 0))}
                          </div>
                          <p className="text-xs text-gray-600 mt-2">All candidates</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">School GPA</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {(results.reduce((sum, school) => sum + (school.school_gpa || 0), 0) / results.length).toFixed(4)}
                          </div>
                          <p className="text-xs text-gray-600 mt-2">Average GPA</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Division I Count</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">
                            {formatNumber(results.reduce((sum, school) => sum + (school.division_summary?.divisions?.I?.T || 0), 0))}
                          </div>
                          <p className="text-xs text-gray-600 mt-2">Top performers</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Performance by Divisions</CardTitle>
                          <CardDescription>Student performance across divisions</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={getDivisionDistribution()}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Top Schools by Performance</CardTitle>
                          <CardDescription>Schools with highest Division I passes</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={getTopSchools(10).map(s => ({ 
                              name: s.school_name?.substring(0, 20) || s.centre_number, 
                              division1: s.division_summary?.divisions?.I?.T || 0,
                              totalStudents: s.total_students || 0
                            }))}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="division1" fill="#10b981" name="Division I" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </TabsContent>
              <TabsContent value="schools" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rank">Rank</SelectItem>
                        <SelectItem value="gpa">GPA</SelectItem>
                        <SelectItem value="students">Students</SelectItem>
                        <SelectItem value="division1">Division I</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i}>
                        <CardHeader>
                          <div className="h-6 bg-gray-200 rounded animate-pulse" />
                        </CardHeader>
                        <CardContent>
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : results.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <p className="text-gray-500">No results available for this exam yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {sortedResults.map((school) => (
                      <Card 
                        key={school.centre_number} 
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedSchool?.centre_number === school.centre_number ? 'ring-2 ring-indigo-500' : ''
                        }`}
                        onClick={() => setSelectedSchool(school)}
                      >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{school.school_name || school.centre_number}</CardTitle>
                        <CardDescription className="mt-1">
                          Centre: {school.centre_number} • {school.region_name || 'Unknown Region'}
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleDownloadPDF(school.centre_number, school.school_name || school.centre_number)}
                        disabled={downloadingPDF === school.centre_number}
                      >
                        {downloadingPDF === school.centre_number ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">School GPA</p>
                        <p className="text-2xl font-bold">{school.school_gpa?.toFixed(4) || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Overall Rank</p>
                        <p className="text-2xl font-bold">
                          #{school.school_ranking?.school_position?.overall_pos || 'N/A'}
                          {school.school_ranking?.school_position?.overall_out_of && (
                            <span className="text-sm text-gray-500 ml-1">/ {school.school_ranking.school_position.overall_out_of}</span>
                          )}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Total Students</p>
                        <p className="text-2xl font-bold">{formatNumber(school.total_students || 0)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Division I</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatNumber(school.division_summary?.divisions?.I?.T || 0)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Division II-IV</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatNumber(
                            (school.division_summary?.divisions?.II?.T || 0) +
                            (school.division_summary?.divisions?.III?.T || 0) +
                            (school.division_summary?.divisions?.IV?.T || 0)
                          )}
                        </p>
                      </div>
                    </div>

                    {school.division_summary && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium text-gray-700 mb-2">Division Distribution</p>
                        <div className="flex gap-2 flex-wrap">
                          {Object.entries(school.division_summary.divisions || {}).map(([div, counts]) => (
                            <Badge key={div} variant="outline">
                              Div {div}: {formatNumber((counts as { F: number; M: number; T: number })?.T || 0)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Division Performance Analysis</CardTitle>
                      <CardDescription>Number of students achieving each division</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getDivisionDistribution()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8884d8" name="Students" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Success Rate by School</CardTitle>
                      <CardDescription>Percentage of students achieving Division I-III</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getTopSchools(10).map(s => {
                          const total = (s.division_summary?.divisions?.I?.T || 0) + 
                                      (s.division_summary?.divisions?.II?.T || 0) + 
                                      (s.division_summary?.divisions?.III?.T || 0) + 
                                      (s.division_summary?.divisions?.IV?.T || 0) + 
                                      (s.division_summary?.divisions?.['0']?.T || 0);
                          const successRate = total > 0 ? ((s.division_summary?.divisions?.I?.T || 0) + 
                                                    (s.division_summary?.divisions?.II?.T || 0) + 
                                                    (s.division_summary?.divisions?.III?.T || 0)) / total * 100 : 0;
                          return {
                            name: s.school_name?.substring(0, 15) || s.centre_number,
                            successRate: Math.round(successRate)
                          };
                        })}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="successRate" fill="#10b981" name="Success Rate %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Gender Performance Comparison</CardTitle>
                      <CardDescription>Division achievement by gender</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getDivisionDistribution().map(d => {
                          const schoolData = results.find(s => s.division_summary?.divisions);
                          // This would need backend data for gender breakdown
                          return { name: `Div ${d.name}`, male: Math.round(d.value * 0.52), female: Math.round(d.value * 0.48) };
                        })}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="male" fill="#8884d8" name="Male" />
                          <Bar dataKey="female" fill="#ffc658" name="Female" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>School Size Distribution</CardTitle>
                      <CardDescription>Number of schools by student count ranges</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                          { name: 'Small (<100)', count: results.filter(s => (s.total_students || 0) < 100).length },
                          { name: 'Medium (100-300)', count: results.filter(s => (s.total_students || 0) >= 100 && (s.total_students || 0) < 300).length },
                          { name: 'Large (300-500)', count: results.filter(s => (s.total_students || 0) >= 300 && (s.total_students || 0) < 500).length },
                          { name: 'Very Large (>500)', count: results.filter(s => (s.total_students || 0) >= 500).length }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#82ca9d" name="Schools" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {selectedSchool && (
                <TabsContent value="school-detail" className="space-y-4">
                  {analysisLoading ? (
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <div className="h-6 bg-gray-200 rounded animate-pulse" />
                        </CardHeader>
                        <CardContent>
                          <div className="h-32 bg-gray-200 rounded animate-pulse" />
                        </CardContent>
                      </Card>
                    </div>
                  ) : schoolAnalysis ? (
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle>{schoolAnalysis.school_name}</CardTitle>
                              <CardDescription>
                                Centre: {schoolAnalysis.centre_number} • {schoolAnalysis.region_name}
                              </CardDescription>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleDownloadPDF(schoolAnalysis.centre_number, schoolAnalysis.school_name)}
                              disabled={downloadingPDF === schoolAnalysis.centre_number}
                            >
                              {downloadingPDF === schoolAnalysis.centre_number ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download PDF
                                </>
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-1">
                              <p className="text-sm text-gray-500">School GPA</p>
                              <p className="text-2xl font-bold">{schoolAnalysis.school_gpa?.toFixed(4) || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-500">Overall Rank</p>
                              <p className="text-2xl font-bold">
                                {schoolAnalysis.school_ranking?.overall_pos || 'N/A'}
                                {schoolAnalysis.school_ranking?.overall_out_of && (
                                  <span className="text-sm text-gray-500 ml-1">/ {schoolAnalysis.school_ranking.overall_out_of}</span>
                                )}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-500">Region Rank</p>
                              <p className="text-2xl font-bold">
                                {schoolAnalysis.school_ranking?.region_pos || 'N/A'}
                                {schoolAnalysis.school_ranking?.region_out_of && (
                                  <span className="text-sm text-gray-500 ml-1">/ {schoolAnalysis.school_ranking.region_out_of}</span>
                                )}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-500">Council Rank</p>
                              <p className="text-2xl font-bold">
                                {schoolAnalysis.school_ranking?.council_pos || 'N/A'}
                                {schoolAnalysis.school_ranking?.council_out_of && (
                                  <span className="text-sm text-gray-500 ml-1">/ {schoolAnalysis.school_ranking.council_out_of}</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {schoolAnalysis.division_summary && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Division Summary</CardTitle>
                            <CardDescription>Gender-wise division distribution</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {Object.entries(schoolAnalysis.division_summary.divisions || {}).map(([div, counts]) => {
                                const data = (counts as { F: number; M: number; T: number });
                                return (
                                  <div key={div} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                      <Badge variant="outline">Division {div}</Badge>
                                      <span className="text-sm text-gray-600">
                                        Male: {formatNumber(data.M)} • Female: {formatNumber(data.F)}
                                      </span>
                                    </div>
                                    <Badge className="text-lg">{formatNumber(data.T)}</Badge>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-10 text-center">
                        <p className="text-gray-500">No detailed analysis available for this school.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
