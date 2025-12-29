'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExam } from '@/contexts/ExamContext';
import { listSchoolRankings } from '@/lib/api';
import { Target, RefreshCw, Search, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatNumber } from '@/lib/utils';

export default function RankingsPage() {
  const { selectedExam } = useExam();
  const [rankings, setRankings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('overall_pos');

  const loadRankings = async () => {
    if (!selectedExam) return;
    setIsLoading(true);
    try {
      const data = await listSchoolRankings(selectedExam.exam_id, { limit: 200, sort_by: 'gpa_desc' });
      setRankings(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      toast.error('Failed to load rankings');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadRankings(); }, [selectedExam]);

  const filtered = rankings.filter(r =>
    r.centre_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.school_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'overall_pos': return (a.overall_pos || 999) - (b.overall_pos || 999);
      case 'region_pos': return (a.region_pos || 999) - (b.region_pos || 999);
      case 'council_pos': return (a.council_pos || 999) - (b.council_pos || 999);
      case 'gpa': return (b.school_gpa || 0) - (a.school_gpa || 0);
      default: return 0;
    }
  });

  const getMedal = (pos: number) => {
    if (pos === 1) return '🥇';
    if (pos === 2) return '🥈';
    if (pos === 3) return '🥉';
    return '';
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">School Rankings</h1>
              <p className="text-muted-foreground">View school rankings by region, council, and overall (API: /school-analyses/rankings)</p>
            </div>
            <Button variant="outline" size="icon" onClick={loadRankings} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {!selectedExam ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">Please select an exam to view rankings.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" />Rankings</CardTitle>
                <CardDescription>{sorted.length} schools ranked</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex items-center gap-2 flex-1">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search schools..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overall_pos">Overall Rank</SelectItem>
                      <SelectItem value="region_pos">Region Rank</SelectItem>
                      <SelectItem value="council_pos">Council Rank</SelectItem>
                      <SelectItem value="gpa">GPA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Overall</TableHead>
                        <TableHead>School</TableHead>
                        <TableHead>Centre</TableHead>
                        <TableHead>GPA</TableHead>
                        <TableHead>Region Rank</TableHead>
                        <TableHead>Council Rank</TableHead>
                        <TableHead>Ward Rank</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sorted.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No rankings found</TableCell></TableRow>
                      ) : sorted.map(r => (
                        <TableRow key={r.centre_number}>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-bold">#{r.overall_pos || '—'}</span>
                              <span>{getMedal(r.overall_pos)}</span>
                            </div>
                            {r.overall_out_of && <span className="text-xs text-muted-foreground">/{r.overall_out_of}</span>}
                          </TableCell>
                          <TableCell className="font-medium">{r.school_name || '—'}</TableCell>
                          <TableCell>{r.centre_number}</TableCell>
                          <TableCell><Badge variant="outline">{r.school_gpa?.toFixed(4) || '—'}</Badge></TableCell>
                          <TableCell>
                            #{r.region_pos || '—'}
                            {r.region_out_of && <span className="text-xs text-muted-foreground">/{r.region_out_of}</span>}
                          </TableCell>
                          <TableCell>
                            #{r.council_pos || '—'}
                            {r.council_out_of && <span className="text-xs text-muted-foreground">/{r.council_out_of}</span>}
                          </TableCell>
                          <TableCell>
                            #{r.ward_pos || '—'}
                            {r.ward_out_of && <span className="text-xs text-muted-foreground">/{r.ward_out_of}</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
