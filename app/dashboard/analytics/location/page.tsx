'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useExam } from '@/contexts/ExamContext';
import { getLocationAnalyses } from '@/lib/api';
import { MapPin, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function LocationAnalyticsPage() {
  const { selectedExam } = useExam();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    if (!selectedExam) return;
    setIsLoading(true);
    try {
      const result = await getLocationAnalyses(selectedExam.exam_id);
      setData(Array.isArray(result) ? result : result.items || []);
    } catch (error) {
      toast.error('Failed to load location analytics');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [selectedExam]);

  const chartData = data.slice(0, 15).map(loc => ({
    name: loc.region_name || loc.council_name || loc.ward_name || 'Unknown',
    schools: loc.total_schools || 0,
    students: loc.total_students || 0,
    gpa: loc.average_gpa || 0
  }));

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Location Analytics</h1>
              <p className="text-muted-foreground">Performance by region, council, and ward (API: /location-analyses)</p>
            </div>
            <Button variant="outline" size="icon" onClick={loadData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {!selectedExam ? (
            <Card>
              <CardContent className="py-10 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select an exam to view location analytics.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Schools by Location</CardTitle>
                    <CardDescription>Number of schools per location</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="schools" fill="#3b82f6" name="Schools" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Average GPA by Location</CardTitle>
                    <CardDescription>Performance comparison</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Bar dataKey="gpa" fill="#10b981" name="GPA" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Location Details</CardTitle>
                  <CardDescription>{data.length} locations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Location</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Schools</TableHead>
                          <TableHead>Students</TableHead>
                          <TableHead>Avg GPA</TableHead>
                          <TableHead>Div I</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.length === 0 ? (
                          <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No data available</TableCell></TableRow>
                        ) : data.map((loc, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{loc.region_name || loc.council_name || loc.ward_name || '—'}</TableCell>
                            <TableCell><Badge variant="outline">{loc.location_type || '—'}</Badge></TableCell>
                            <TableCell>{formatNumber(loc.total_schools || 0)}</TableCell>
                            <TableCell>{formatNumber(loc.total_students || 0)}</TableCell>
                            <TableCell><Badge>{loc.average_gpa?.toFixed(4) || '—'}</Badge></TableCell>
                            <TableCell className="text-green-600">{formatNumber(loc.division_i_count || 0)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
