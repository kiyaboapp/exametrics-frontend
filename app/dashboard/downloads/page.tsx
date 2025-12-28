'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExam } from '@/contexts/ExamContext';
import api from '@/lib/api';
import { 
  Download, 
  FileText, 
  Users, 
  School, 
  CheckSquare, 
  Archive,
  Filter,
  List
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatNumber } from '@/lib/utils';

export default function DownloadsPage() {
  const { selectedExam } = useExam();
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [regions, setRegions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [councils, setCouncils] = useState<string[]>([]);
  const [selectedCouncil, setSelectedCouncil] = useState<string>('all');
  const [wards, setWards] = useState<string[]>([]);
  const [selectedWard, setSelectedWard] = useState<string>('all');

  useEffect(() => {
    const fetchSchools = async () => {
      if (selectedExam) {
        try {
          setIsLoading(true);
          const response = await api.get(`/school-analyses/exams/${selectedExam.exam_id}/schools/rankings`, {
            params: { page: 1, limit: 1000, sort_by: 'gpa_asc' }
          });
          setSchools(response.data.data || []);
          
          // Extract unique regions, councils, and wards
          const uniqueRegions = [...new Set(response.data.data?.map((s: any) => s.region_name) || [])];
          setRegions(uniqueRegions);
          
          const uniqueCouncils = [...new Set(response.data.data?.map((s: any) => s.council_name) || [])];
          setCouncils(uniqueCouncils);
          
          const uniqueWards = [...new Set(response.data.data?.map((s: any) => s.ward_name) || [])];
          setWards(uniqueWards);
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

  // Reset dependent filters when parent filter changes
  useEffect(() => {
    if (selectedRegion !== 'all') {
      const regionCouncils = [...new Set(schools
        .filter(s => s.region_name === selectedRegion)
        .map(s => s.council_name))];
      setCouncils(regionCouncils);
      setSelectedCouncil('all');
      setSelectedWard('all');
    } else {
      const allCouncils = [...new Set(schools.map(s => s.council_name))];
      setCouncils(allCouncils);
      setSelectedCouncil('all');
      setSelectedWard('all');
    }
  }, [selectedRegion, schools]);

  useEffect(() => {
    if (selectedCouncil !== 'all') {
      const councilWards = [...new Set(schools
        .filter(s => s.council_name === selectedCouncil)
        .map(s => s.ward_name))];
      setWards(councilWards);
      setSelectedWard('all');
    } else if (selectedRegion !== 'all') {
      const regionWards = [...new Set(schools
        .filter(s => s.region_name === selectedRegion)
        .map(s => s.ward_name))];
      setWards(regionWards);
      setSelectedWard('all');
    } else {
      const allWards = [...new Set(schools.map(s => s.ward_name))];
      setWards(allWards);
      setSelectedWard('all');
    }
  }, [selectedCouncil, selectedRegion, schools]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredSchools = getFilteredSchools();
      setSelectedSchools(filteredSchools.map(s => s.centre_number));
    } else {
      setSelectedSchools([]);
    }
  };

  const handleSelectSchool = (centreNumber: string, checked: boolean) => {
    if (checked) {
      setSelectedSchools([...selectedSchools, centreNumber]);
    } else {
      setSelectedSchools(selectedSchools.filter(id => id !== centreNumber));
    }
  };

  const getFilteredSchools = () => {
    let filtered = schools;
    
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(s => s.region_name === selectedRegion);
    }
    
    if (selectedCouncil !== 'all') {
      filtered = filtered.filter(s => s.council_name === selectedCouncil);
    }
    
    if (selectedWard !== 'all') {
      filtered = filtered.filter(s => s.ward_name === selectedWard);
    }
    
    return filtered;
  };

  const downloadSinglePDF = async (centreNumber: string, schoolName: string) => {
    if (!selectedExam) return;

    try {
      setDownloading(centreNumber);
      const response = await api.get(`/school-analyses/exams/${selectedExam.exam_id}/schools/${centreNumber}/analysis/full`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${centreNumber}_${schoolName.replace(/\s+/g, '_')}_analysis.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setDownloading(null);
    }
  };

  const downloadMultiplePDFs = async () => {
    if (!selectedExam || selectedSchools.length === 0) {
      toast.error('Please select at least one school');
      return;
    }

    try {
      setDownloading('multiple');
      const response = await api.post(`/downloads/bulk-pdfs`, {
        exam_id: selectedExam.exam_id,
        centre_numbers: selectedSchools
      }, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedExam.exam_id}_selected_schools.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('ZIP file downloaded successfully');
    } catch (error) {
      console.error('Error downloading bulk PDFs:', error);
      toast.error('Failed to download bulk PDFs');
    } finally {
      setDownloading(null);
    }
  };

  const downloadISAL = async (format: 'pdf' | 'zip') => {
    if (!selectedExam) return;

    try {
      setDownloading('isal');
      const response = await api.get(`/isals/generate-attendance-pdf`, {
        params: {
          exam_id: selectedExam.exam_id,
          zip_output: format === 'zip',
          include_score: true,
          underscore_mode: true
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedExam.exam_id}_attendance_list.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`${format.toUpperCase()} downloaded successfully`);
    } catch (error) {
      console.error('Error downloading ISAL:', error);
      toast.error('Failed to download ISAL');
    } finally {
      setDownloading(null);
    }
  };

  const downloadResultsCSV = async () => {
    if (!selectedExam) return;

    try {
      setDownloading('csv');
      const response = await api.get(`/school-analyses/exams/${selectedExam.exam_id}/schools/rankings`, {
        params: { format: 'csv', page: 1, limit: 1000 },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedExam.exam_id}_results.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('CSV downloaded successfully');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      toast.error('Failed to download CSV');
    } finally {
      setDownloading(null);
    }
  };

  const filteredSchools = getFilteredSchools();
  const allSelected = filteredSchools.length > 0 && selectedSchools.length === filteredSchools.length;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Downloads</h1>
            <p className="mt-2 text-sm text-gray-600">
              Download PDF reports, attendance lists, and export data.
            </p>
          </div>

          {!selectedExam ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Please select an exam to view downloads.</p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="school-pdfs" className="space-y-4">
              <TabsList>
                <TabsTrigger value="school-pdfs">School PDFs</TabsTrigger>
                <TabsTrigger value="attendance">Attendance Lists</TabsTrigger>
                <TabsTrigger value="exports">Data Exports</TabsTrigger>
              </TabsList>

              <TabsContent value="school-pdfs" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>School Analysis Reports</span>
                      <div className="flex items-center gap-2">
                        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by region" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Regions</SelectItem>
                            {regions.map(region => (
                              <SelectItem key={region} value={region}>{region}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedCouncil} onValueChange={setSelectedCouncil}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by council" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Councils</SelectItem>
                            {councils.map(council => (
                              <SelectItem key={council} value={council}>{council}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedWard} onValueChange={setSelectedWard}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by ward" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Wards</SelectItem>
                            {wards.map(ward => (
                              <SelectItem key={ward} value={ward}>{ward}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedSchools.length > 0 && (
                          <Button onClick={downloadMultiplePDFs} disabled={downloading === 'multiple'}>
                            {downloading === 'multiple' ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Archive className="h-4 w-4 mr-2" />
                                Download Selected ({selectedSchools.length})
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Download detailed analysis reports for individual schools
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 border-b">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={handleSelectAll}
                        />
                        <span className="text-sm font-medium">Select All ({filteredSchools.length})</span>
                      </div>
                      {isLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        </div>
                      ) : (
                        <div className="max-h-96 overflow-y-auto">
                          {filteredSchools.map((school) => (
                            <div key={school.centre_number} className="flex items-center justify-between p-2 hover:bg-gray-50">
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  checked={selectedSchools.includes(school.centre_number)}
                                  onCheckedChange={(checked) => handleSelectSchool(school.centre_number, checked as boolean)}
                                />
                                <div>
                                  <p className="text-sm font-medium">{school.school_name}</p>
                                  <p className="text-xs text-gray-500">{school.centre_number} • {school.region_name} • {school.council_name} • {school.ward_name}</p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadSinglePDF(school.centre_number, school.school_name)}
                                disabled={downloading === school.centre_number}
                              >
                                {downloading === school.centre_number ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attendance" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Individual Attendance Lists</CardTitle>
                      <CardDescription>
                        Download ISAL forms for student attendance tracking
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button
                        onClick={() => downloadISAL('pdf')}
                        disabled={downloading === 'isal'}
                        className="w-full"
                      >
                        {downloading === 'isal' ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Download as PDF
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => downloadISAL('zip')}
                        disabled={downloading === 'isal'}
                        variant="outline"
                        className="w-full"
                      >
                        {downloading === 'isal' ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Archive className="h-4 w-4 mr-2" />
                            Download All Schools (ZIP)
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Attendance Options</CardTitle>
                      <CardDescription>
                        Customize attendance list format
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Include Scores</span>
                        <Badge variant="secondary">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Signature Mode</span>
                        <Badge variant="secondary">Underscore</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Separator Every</span>
                        <Badge variant="secondary">10 Students</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="exports" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Results Export</CardTitle>
                      <CardDescription>
                        Export exam results in various formats
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button
                        onClick={downloadResultsCSV}
                        disabled={downloading === 'csv'}
                        className="w-full"
                      >
                        {downloading === 'csv' ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Exporting...
                          </>
                        ) : (
                          <>
                            <List className="h-4 w-4 mr-2" />
                            Export as CSV
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-gray-500">
                        Includes all schools with rankings and GPA data
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Statistics Summary</CardTitle>
                      <CardDescription>
                        Download comprehensive statistics report
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button variant="outline" className="w-full" disabled>
                        <FileText className="h-4 w-4 mr-2" />
                        Export Summary (Coming Soon)
                      </Button>
                      <p className="text-xs text-gray-500">
                        Division and grade distributions, top performers
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
