'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useExam } from '@/contexts/ExamContext';
import { listSchoolOverviews, getFullSchoolAnalysis } from '@/lib/api';
import { School as SchoolIcon, Search, TrendingUp, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatGPA, getDivisionColor, formatNumber } from '@/lib/utils';

export default function SchoolsPage() {
  const { selectedExam } = useExam();
  const [schools, setSchools] = useState<any>(null);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [schoolAnalysis, setSchoolAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSchools = async () => {
      if (selectedExam) {
        try {
          setIsLoading(true);
          const data = await listSchoolOverviews(selectedExam.exam_id, { page: 1, limit: 100 });
          setSchools(data);
        } catch (error) {
          console.error('Error fetching schools:', error);
          toast.error('Failed to load schools');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchSchools();
  }, [selectedExam]);

  const handleSchoolSelect = async (school: any) => {
    setSelectedSchool(school);
    if (selectedExam) {
      try {
        setAnalysisLoading(true);
        const analysis = await getFullSchoolAnalysis(selectedExam.exam_id, school.centre_number);
        setSchoolAnalysis(analysis);
      } catch (error) {
        console.error('Error fetching school analysis:', error);
        toast.error('Failed to load school analysis');
      } finally {
        setAnalysisLoading(false);
      }
    }
  };

  const filteredSchools = schools?.data?.filter((school: any) =>
    school.school_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.centre_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schools</h1>
            <p className="mt-2 text-sm text-gray-600">
              View detailed school analysis, performance metrics, and comparisons.
            </p>
          </div>

          {!selectedExam ? (
            <Card>
              <CardContent className="py-10 text-center">
                <SchoolIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Please select an exam to view schools.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Schools List</CardTitle>
                    <CardDescription>Select a school to view details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search schools..."
                          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    {isLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[600px] overflow-y-auto">
                        {filteredSchools?.map((school: any) => (
                          <button
                            key={school.centre_number}
                            onClick={() => handleSchoolSelect(school)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              selectedSchool?.centre_number === school.centre_number
                                ? 'bg-indigo-50 border-indigo-500'
                                : 'hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {school.school_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{school.centre_number}</p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="outline" className="text-xs">
                                GPA: {formatGPA(school.school_gpa)}
                              </Badge>
                              {school.region_name && (
                                <span className="text-xs text-gray-500">{school.region_name}</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                {!selectedSchool ? (
                  <Card>
                    <CardContent className="py-20 text-center">
                      <SchoolIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Select a school from the list to view detailed analysis</p>
                    </CardContent>
                  </Card>
                ) : analysisLoading ? (
                  <Card>
                    <CardHeader>
                      <div className="h-8 bg-gray-200 rounded animate-pulse" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="h-32 bg-gray-200 rounded animate-pulse" />
                        <div className="h-32 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                ) : schoolAnalysis ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>{schoolAnalysis.school_name}</CardTitle>
                        <CardDescription>
                          {schoolAnalysis.centre_number} • {schoolAnalysis.region_name}, {schoolAnalysis.council_name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">School GPA</p>
                            <p className="text-3xl font-bold text-indigo-600">
                              {formatGPA(schoolAnalysis.school_gpa)}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Overall Rank</p>
                            <p className="text-3xl font-bold">
                              {schoolAnalysis.school_ranking?.overall_pos || 'N/A'}
                              {schoolAnalysis.school_ranking?.overall_out_of && (
                                <span className="text-lg text-gray-500">
                                  /{schoolAnalysis.school_ranking.overall_out_of}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">School Type</p>
                            <Badge variant="secondary" className="text-sm">
                              {schoolAnalysis.school_type || 'UNKNOWN'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Tabs defaultValue="divisions" className="space-y-4">
                      <TabsList>
                        <TabsTrigger value="divisions">Divisions</TabsTrigger>
                        <TabsTrigger value="subjects">Subjects</TabsTrigger>
                        <TabsTrigger value="rankings">Rankings</TabsTrigger>
                      </TabsList>

                      <TabsContent value="divisions" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Division Summary</CardTitle>
                            <CardDescription>Student distribution across divisions</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {schoolAnalysis.division_summary?.divisions &&
                                Object.entries(schoolAnalysis.division_summary.divisions).map(([div, counts]: [string, any]) => (
                                  <div key={div} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <Badge className={getDivisionColor(div)}>Division {div}</Badge>
                                      <span className="text-sm text-gray-600">
                                        Total: {formatNumber(counts?.T || 0)}
                                      </span>
                                    </div>
                                    <div className="flex gap-4 text-sm text-gray-600">
                                      <span>M: {formatNumber(counts?.M || 0)}</span>
                                      <span>F: {formatNumber(counts?.F || 0)}</span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="subjects" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Subject Performance</CardTitle>
                            <CardDescription>GPA and rankings by subject</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {schoolAnalysis.grades_summary?.grades &&
                                Object.entries(schoolAnalysis.grades_summary.grades)
                                  .filter(([key]) => key !== 'combined')
                                  .map(([subject, data]: [string, any]) => (
                                    <div key={subject} className="flex items-center justify-between p-3 border rounded-lg">
                                      <div>
                                        <p className="font-medium text-gray-900">{subject}</p>
                                        <p className="text-sm text-gray-500">
                                          Position: {data.position?.subject_pos || 'N/A'}
                                          {data.position?.subject_out_of && `/${data.position.subject_out_of}`}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold text-indigo-600">
                                          {formatGPA(data.subject_gpa)}
                                        </p>
                                        <p className="text-xs text-gray-500">GPA</p>
                                      </div>
                                    </div>
                                  ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="rankings" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>School Rankings</CardTitle>
                            <CardDescription>Performance rankings at different levels</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Award className="h-5 w-5 text-indigo-600" />
                                  <p className="font-medium">Overall Ranking</p>
                                </div>
                                <p className="text-2xl font-bold">
                                  {schoolAnalysis.school_ranking?.overall_pos || 'N/A'}
                                  <span className="text-lg text-gray-500">
                                    /{schoolAnalysis.school_ranking?.overall_out_of || 'N/A'}
                                  </span>
                                </p>
                              </div>

                              <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Award className="h-5 w-5 text-blue-600" />
                                  <p className="font-medium">Region Ranking</p>
                                </div>
                                <p className="text-2xl font-bold">
                                  {schoolAnalysis.school_ranking?.region_pos || 'N/A'}
                                  <span className="text-lg text-gray-500">
                                    /{schoolAnalysis.school_ranking?.region_out_of || 'N/A'}
                                  </span>
                                </p>
                              </div>

                              <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Award className="h-5 w-5 text-green-600" />
                                  <p className="font-medium">Council Ranking</p>
                                </div>
                                <p className="text-2xl font-bold">
                                  {schoolAnalysis.school_ranking?.council_pos || 'N/A'}
                                  <span className="text-lg text-gray-500">
                                    /{schoolAnalysis.school_ranking?.council_out_of || 'N/A'}
                                  </span>
                                </p>
                              </div>

                              <div className="p-4 border rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Award className="h-5 w-5 text-yellow-600" />
                                  <p className="font-medium">Ward Ranking</p>
                                </div>
                                <p className="text-2xl font-bold">
                                  {schoolAnalysis.school_ranking?.ward_pos || 'N/A'}
                                  <span className="text-lg text-gray-500">
                                    /{schoolAnalysis.school_ranking?.ward_out_of || 'N/A'}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-20 text-center">
                      <p className="text-gray-500">No analysis data available for this school.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
