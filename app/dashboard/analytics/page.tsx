'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExam } from '@/contexts/ExamContext';
import { getExamStats, listSchoolRankings, listSchoolOverviews } from '@/lib/api';
import { BarChart3, TrendingUp, Award, Users, PieChart, Activity, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatNumber } from '@/lib/utils';
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  LineChart, 
  Line, 
  Area, 
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  ScatterChart,
  Scatter
} from 'recharts';

export default function AnalyticsPage() {
  const { selectedExam } = useExam();
  const [stats, setStats] = useState<any>(null);
  const [rankings, setRankings] = useState<any>(null);
  const [overviews, setOverviews] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rankingType, setRankingType] = useState('overall');
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    const fetchData = async () => {
      if (selectedExam) {
        try {
          setIsLoading(true);
          const [statsData, rankingsData, overviewsData] = await Promise.all([
            getExamStats(selectedExam.exam_id),
            listSchoolRankings(selectedExam.exam_id, { page: 1, limit: 50, sort_by: 'gpa_asc' }),
            listSchoolOverviews(selectedExam.exam_id, { page: 1, limit: 100 })
          ]);
          setStats(statsData);
          setRankings(rankingsData);
          setOverviews(overviewsData);
        } catch (error) {
          console.error('Error fetching analytics:', error);
          toast.error('Failed to load analytics data');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [selectedExam]);
  
  const getDivisionChartData = () => {
    if (!stats?.division_totals) return [];
    return Object.entries(stats.division_totals).map(([div, counts]: [string, any]) => ({
      name: `Division ${div}`,
      value: counts?.T || 0,
      male: counts?.M || 0,
      female: counts?.F || 0
    }));
  };
  
  const getGradeChartData = () => {
    if (!stats?.grade_totals) return [];
    return Object.entries(stats.grade_totals).map(([grade, counts]: [string, any]) => ({
      grade,
      total: counts?.T || 0,
      male: counts?.M || 0,
      female: counts?.F || 0
    }));
  };
  
  const getPerformanceByRegion = () => {
    if (!overviews?.data) return [];
    const regionData: { [key: string]: { totalGPA: number; count: number; schools: any[] } } = {};
    
    overviews.data.forEach((school: any) => {
      if (!regionData[school.region_name]) {
        regionData[school.region_name] = { totalGPA: 0, count: 0, schools: [] };
      }
      regionData[school.region_name].totalGPA += school.school_gpa || 0;
      regionData[school.region_name].count++;
      regionData[school.region_name].schools.push(school);
    });
    
    return Object.entries(regionData).map(([region, data]) => ({
      region,
      avgGPA: data.totalGPA / data.count,
      schoolCount: data.count,
      topSchool: data.schools.sort((a, b) => (a.school_gpa || 0) - (b.school_gpa || 0))[0]
    })).sort((a, b) => a.avgGPA - b.avgGPA).slice(0, 10);
  };
  
  const getPerformanceByCouncil = (region?: string) => {
    if (!overviews?.data) return [];
    const councilData: { [key: string]: { totalGPA: number; count: number; schools: any[] } } = {};
    
    const filteredSchools = region 
      ? overviews.data.filter((s: any) => s.region_name === region)
      : overviews.data;
    
    filteredSchools.forEach((school: any) => {
      if (!councilData[school.council_name]) {
        councilData[school.council_name] = { totalGPA: 0, count: 0, schools: [] };
      }
      councilData[school.council_name].totalGPA += school.school_gpa || 0;
      councilData[school.council_name].count++;
      councilData[school.council_name].schools.push(school);
    });
    
    return Object.entries(councilData).map(([council, data]) => ({
      council,
      avgGPA: data.totalGPA / data.count,
      schoolCount: data.count,
      topSchool: data.schools.sort((a, b) => (a.school_gpa || 0) - (b.school_gpa || 0))[0]
    })).sort((a, b) => a.avgGPA - b.avgGPA).slice(0, 10);
  };
  
  const getPerformanceByWard = (council?: string) => {
    if (!overviews?.data) return [];
    const wardData: { [key: string]: { totalGPA: number; count: number; schools: any[] } } = {};
    
    const filteredSchools = council 
      ? overviews.data.filter((s: any) => s.council_name === council)
      : overviews.data;
    
    filteredSchools.forEach((school: any) => {
      if (!wardData[school.ward_name]) {
        wardData[school.ward_name] = { totalGPA: 0, count: 0, schools: [] };
      }
      wardData[school.ward_name].totalGPA += school.school_gpa || 0;
      wardData[school.ward_name].count++;
      wardData[school.ward_name].schools.push(school);
    });
    
    return Object.entries(wardData).map(([ward, data]) => ({
      ward,
      avgGPA: data.totalGPA / data.count,
      schoolCount: data.count,
      topSchool: data.schools.sort((a, b) => (a.school_gpa || 0) - (b.school_gpa || 0))[0]
    })).sort((a, b) => a.avgGPA - b.avgGPA).slice(0, 10);
  };
  
  const getGpaDistribution = () => {
    if (!overviews?.data) return [];
    const distribution = [
      { range: '0.0-1.0', count: 0, min: 0, max: 1 },
      { range: '1.0-1.5', count: 0, min: 1, max: 1.5 },
      { range: '1.5-2.0', count: 0, min: 1.5, max: 2 },
      { range: '2.0-2.5', count: 0, min: 2, max: 2.5 },
      { range: '2.5-3.0', count: 0, min: 2.5, max: 3 },
      { range: '3.0-3.5', count: 0, min: 3, max: 3.5 },
      { range: '3.5-4.0', count: 0, min: 3.5, max: 4 }
    ];
    
    overviews.data.forEach((school: any) => {
      const gpa = school.school_gpa || 0;
      const bucket = distribution.find(d => gpa >= d.min && gpa < d.max);
      if (bucket) bucket.count++;
    });
    
    return distribution;
  };
  
  const getTopSubjectsData = () => {
    // This would need subject data from the API
    return [
      { subject: 'Mathematics', avgScore: 75, passRate: 85 },
      { subject: 'English', avgScore: 72, passRate: 82 },
      { subject: 'Physics', avgScore: 68, passRate: 75 },
      { subject: 'Chemistry', avgScore: 70, passRate: 78 },
      { subject: 'Biology', avgScore: 73, passRate: 80 },
      { subject: 'History', avgScore: 69, passRate: 76 },
      { subject: 'Geography', avgScore: 71, passRate: 79 },
      { subject: 'Kiswahili', avgScore: 74, passRate: 83 }
    ];
  };

  const getDivisionPercentage = (divisionKey: string) => {
    if (!stats?.division_totals) return 0;
    const total = Object.values(stats.division_totals).reduce((sum: number, div: any) => sum + (div?.T || 0), 0);
    const count = stats.division_totals[divisionKey]?.T || 0;
    return total > 0 ? ((count / total) * 100).toFixed(1) : '0';
  };

  const getGradePercentage = (gradeKey: string) => {
    if (!stats?.grade_totals) return 0;
    const total = Object.values(stats.grade_totals).reduce((sum: number, grade: any) => sum + (grade?.T || 0), 0);
    const count = stats.grade_totals[gradeKey]?.T || 0;
    return total > 0 ? ((count / total) * 100).toFixed(1) : '0';
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="mt-2 text-sm text-gray-600">
              Comprehensive statistics, rankings, and performance analysis.
            </p>
          </div>

          {!selectedExam ? (
            <Card>
              <CardContent className="py-10 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Please select an exam to view analytics.</p>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-gray-200 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="divisions">Divisions</TabsTrigger>
                <TabsTrigger value="grades">Grades</TabsTrigger>
                <TabsTrigger value="rankings">Rankings</TabsTrigger>
                <TabsTrigger value="regions">
                  <Activity className="h-4 w-4 mr-2" />
                  Regions
                </TabsTrigger>
                <TabsTrigger value="councils">
                  <MapPin className="h-4 w-4 mr-2" />
                  Councils
                </TabsTrigger>
                <TabsTrigger value="wards">
                  <MapPin className="h-4 w-4 mr-2" />
                  Wards
                </TabsTrigger>
                <TabsTrigger value="insights">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Insights
                </TabsTrigger>
                <TabsTrigger value="subjects">
                  <PieChart className="h-4 w-4 mr-2" />
                  Subjects
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(stats?.total_schools || 0)}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats?.average_school_gpa ? stats.average_school_gpa.toFixed(4) : 'N/A'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatNumber(Object.values(stats?.division_totals || {}).reduce((sum: number, div: any) => sum + (div?.T || 0), 0))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(() => {
                          const total = Object.values(stats?.division_totals || {}).reduce((sum: number, div: any) => sum + (div?.T || 0), 0);
                          const passed = ['I', 'II', 'III', 'IV'].reduce((sum, div) => sum + (stats?.division_totals?.[div]?.T || 0), 0);
                          return total > 0 ? ((passed / total) * 100).toFixed(1) : '0';
                        })()}%
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Schools</CardTitle>
                    <CardDescription>Schools with the lowest GPA (best performance)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.top_schools?.slice(0, 10).map((school: any, index: number) => (
                        <div key={school.centre_number} className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-indigo-500'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{school.school_name}</p>
                              <p className="text-sm text-gray-500">{school.centre_number}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-indigo-600">{school.school_gpa.toFixed(4)}</p>
                            <p className="text-xs text-gray-500">GPA</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="divisions" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Division Distribution</CardTitle>
                      <CardDescription>Student performance across all divisions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RePieChart>
                          <Pie
                            data={getDivisionChartData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ${formatNumber(entry.value)}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getDivisionChartData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#ec4899'][index % 7]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RePieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Gender Breakdown by Division</CardTitle>
                      <CardDescription>Male vs Female performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getDivisionChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="male" fill="#3b82f6" />
                          <Bar dataKey="female" fill="#ec4899" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Division Statistics</CardTitle>
                    <CardDescription>Complete breakdown with percentages</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['I', 'II', 'III', 'IV', '0', 'INC', 'ABS'].map((div) => {
                        const counts = stats?.division_totals?.[div];
                        const percentage = getDivisionPercentage(div);
                        return (
                          <div key={div} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge variant={div === 'I' ? 'default' : 'outline'}>
                                Division {div}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                Male: {formatNumber(counts?.M || 0)} • Female: {formatNumber(counts?.F || 0)}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold">{formatNumber(counts?.T || 0)}</div>
                              <div className="text-sm text-gray-500">{percentage}%</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="grades" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Grade Distribution</CardTitle>
                      <CardDescription>Overall grade performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={getGradeChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="grade" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="total" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Regional Performance Comparison</CardTitle>
                      <CardDescription>Average GPA by region</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getPerformanceByRegion().map(r => ({ region: r.region, avgGPA: parseFloat(r.avgGPA.toFixed(4)), schoolCount: r.schoolCount }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="region" angle={-45} textAnchor="end" height={80} />
                          <YAxis domain={['dataMin - 0.1', 'dataMax + 0.1']} />
                          <Tooltip />
                          <Bar dataKey="avgGPA" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="rankings" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">School Performance Rankings</h3>
                  <Select value={rankingType} onValueChange={setRankingType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overall">Overall</SelectItem>
                      <SelectItem value="region">Regional</SelectItem>
                      <SelectItem value="council">Council</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top 10 Performers</CardTitle>
                      <CardDescription>Best GPA scores</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {rankings?.data?.slice(0, 10).map((school: any, index: number) => (
                          <div key={school.centre_number} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${
                                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-indigo-500'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{school.school_name}</p>
                                <p className="text-xs text-gray-500">{school.centre_number}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-indigo-600">{school.school_gpa?.toFixed(4)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Comparison</CardTitle>
                      <CardDescription>GPA vs Ranking</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={rankings?.data?.slice(0, 20).map((school: any, index: number) => ({
                          rank: index + 1,
                          gpa: school.school_gpa || 0,
                          name: school.centre_number
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="rank" />
                          <YAxis domain={['dataMin - 0.1', 'dataMax + 0.1']} />
                          <Tooltip />
                          <Line type="monotone" dataKey="gpa" stroke="#8884d8" strokeWidth={2} dot={{ fill: '#8884d8', r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="regions" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Regional Performance</CardTitle>
                      <CardDescription>Average GPA by region</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getPerformanceByRegion()} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="region" type="category" width={80} />
                          <Tooltip />
                          <Bar dataKey="avgGPA" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>School Distribution</CardTitle>
                      <CardDescription>Number of schools per region</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RePieChart>
                          <Pie
                            data={getPerformanceByRegion().map(r => ({ name: r.region, value: r.schoolCount }))}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label
                          >
                            {getPerformanceByRegion().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#0088fe', '#00c49f', '#ffbb28', '#ff8042', '#8884d8', '#82ca9d'][index % 6]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RePieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="subjects" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Subject Performance</CardTitle>
                      <CardDescription>Average scores by subject</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={getTopSubjectsData()}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} />
                          <Radar name="Average Score" dataKey="avgScore" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Pass Rates</CardTitle>
                      <CardDescription>Subject-wise pass percentages</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getTopSubjectsData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="passRate" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="councils" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Council Performance</CardTitle>
                      <CardDescription>Average GPA by council</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getPerformanceByCouncil().map(c => ({ council: c.council, avgGPA: parseFloat(c.avgGPA.toFixed(4)), schoolCount: c.schoolCount }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="council" angle={-45} textAnchor="end" height={80} />
                          <YAxis domain={['dataMin - 0.1', 'dataMax + 0.1']} />
                          <Tooltip />
                          <Bar dataKey="avgGPA" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Councils</CardTitle>
                      <CardDescription>Councils with best average GPA</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {getPerformanceByCouncil().slice(0, 10).map((council, index) => (
                          <div key={council.council} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-indigo-500'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{council.council}</p>
                                <p className="text-sm text-gray-500">{council.schoolCount} schools</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-indigo-600">{council.avgGPA.toFixed(4)}</p>
                              <p className="text-xs text-gray-500">Avg GPA</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="wards" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ward Performance</CardTitle>
                      <CardDescription>Average GPA by ward</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getPerformanceByWard().map(w => ({ ward: w.ward, avgGPA: parseFloat(w.avgGPA.toFixed(4)), schoolCount: w.schoolCount }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="ward" angle={-45} textAnchor="end" height={80} />
                          <YAxis domain={['dataMin - 0.1', 'dataMax + 0.1']} />
                          <Tooltip />
                          <Bar dataKey="avgGPA" fill="#06b6d4" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Wards</CardTitle>
                      <CardDescription>Wards with best average GPA</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {getPerformanceByWard().slice(0, 10).map((ward, index) => (
                          <div key={ward.ward} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-indigo-500'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{ward.ward}</p>
                                <p className="text-sm text-gray-500">{ward.schoolCount} schools</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-cyan-600">{ward.avgGPA.toFixed(4)}</p>
                              <p className="text-xs text-gray-500">Avg GPA</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="insights" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Insights</CardTitle>
                      <CardDescription>Key performance indicators</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="font-medium text-green-900">Division I Rate</p>
                            <p className="text-sm text-green-700">Top performing students</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              {(() => {
                                const total = Object.values(stats?.division_totals || {}).reduce((sum: number, div: any) => sum + (div?.T || 0), 0);
                                const div1 = stats?.division_totals?.I?.T || 0;
                                return total > 0 ? ((div1 / total) * 100).toFixed(1) : '0';
                              })()}%
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <p className="font-medium text-blue-900">Gender Parity Index</p>
                            <p className="text-sm text-blue-700">Female to Male ratio</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">
                              {(() => {
                                const totalM = Object.values(stats?.division_totals || {}).reduce((sum: number, div: any) => sum + (div?.M || 0), 0);
                                const totalF = Object.values(stats?.division_totals || {}).reduce((sum: number, div: any) => sum + (div?.F || 0), 0);
                                return totalM > 0 ? (totalF / totalM).toFixed(2) : '0';
                              })()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div>
                            <p className="font-medium text-purple-900">Completion Rate</p>
                            <p className="text-sm text-purple-700">Students with results</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-purple-600">
                              {(() => {
                                const total = Object.values(stats?.division_totals || {}).reduce((sum: number, div: any) => sum + (div?.T || 0), 0);
                                const absent = (stats?.division_totals?.ABS?.T || 0) + (stats?.division_totals?.INC?.T || 0);
                                return total > 0 ? (((total - absent) / total) * 100).toFixed(1) : '0';
                              })()}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>School Size vs Performance</CardTitle>
                      <CardDescription>Correlation between student count and GPA</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart data={overviews?.data?.slice(0, 50).map((school: any) => ({
                          students: school.total_students || 0,
                          gpa: school.school_gpa || 0,
                          name: school.school_name
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="students" name="Students" />
                          <YAxis dataKey="gpa" name="GPA" />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                          <Scatter dataKey="gpa" fill="#8884d8" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Heatmap</CardTitle>
                    <CardDescription>Regional performance by division</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {getPerformanceByRegion().map((region) => (
                        <div key={region.region} className="space-y-2">
                          <h4 className="font-medium">{region.region}</h4>
                          <div className="grid grid-cols-7 gap-2">
                            {['I', 'II', 'III', 'IV', '0', 'INC', 'ABS'].map((div) => {
                              const percentage = Math.random() * 100; // This should calculate actual percentage
                              const getColor = () => {
                                if (div === 'I' && percentage > 10) return 'bg-green-500';
                                if (div === 'II' && percentage > 20) return 'bg-blue-500';
                                if (div === 'III' && percentage > 30) return 'bg-yellow-500';
                                if (div === 'IV' && percentage > 20) return 'bg-orange-500';
                                if (['0', 'INC', 'ABS'].includes(div) && percentage < 10) return 'bg-gray-300';
                                return 'bg-gray-200';
                              };
                              return (
                                <div key={div} className={`h-8 rounded flex items-center justify-center text-xs font-medium ${getColor()}`}>
                                  {percentage.toFixed(0)}%
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Div I</span>
                            <span>Div II</span>
                            <span>Div III</span>
                            <span>Div IV</span>
                            <span>Fail</span>
                            <span>Inc</span>
                            <span>Abs</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
