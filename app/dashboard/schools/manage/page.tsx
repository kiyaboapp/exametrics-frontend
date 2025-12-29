'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getSchools, deleteSchool } from '@/lib/api';
import { Building2, RefreshCw, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageSchoolsPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadSchools = async () => {
    setIsLoading(true);
    try {
      const data = await getSchools({ limit: 200 });
      setSchools(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      toast.error('Failed to load schools');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadSchools(); }, []);

  const handleDelete = async (centreNumber: string) => {
    if (!confirm('Are you sure you want to delete this school?')) return;
    try {
      await deleteSchool(centreNumber);
      toast.success('School deleted');
      await loadSchools();
    } catch (error) {
      toast.error('Failed to delete school');
    }
  };

  const filtered = schools.filter(s =>
    s.centre_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.school_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Manage Schools</h1>
              <p className="text-muted-foreground">View and manage school records (API: /schools)</p>
            </div>
            <Button variant="outline" size="icon" onClick={loadSchools} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Schools</CardTitle>
              <CardDescription>{filtered.length} schools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search schools..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-sm" />
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Centre</TableHead>
                      <TableHead>School Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Council</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No schools found</TableCell></TableRow>
                    ) : filtered.slice(0, 100).map(school => (
                      <TableRow key={school.centre_number}>
                        <TableCell className="font-medium">{school.centre_number}</TableCell>
                        <TableCell>{school.school_name}</TableCell>
                        <TableCell><Badge variant="outline">{school.school_type || '—'}</Badge></TableCell>
                        <TableCell>{school.region_name || '—'}</TableCell>
                        <TableCell>{school.council_name || '—'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(school.centre_number)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filtered.length > 100 && <p className="text-sm text-muted-foreground mt-2">Showing 100 of {filtered.length}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
