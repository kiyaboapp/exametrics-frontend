'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getUploadTrails } from '@/lib/api';
import { History, RefreshCw, Search, FileUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatNumber } from '@/lib/utils';

export default function UploadTrailsPage() {
  const [trails, setTrails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadTrails = async () => {
    setIsLoading(true);
    try {
      const data = await getUploadTrails({ limit: 200 });
      setTrails(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      toast.error('Failed to load upload trails');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadTrails(); }, []);

  const filtered = trails.filter(t =>
    t.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.upload_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <Badge variant="default">Completed</Badge>;
      case 'FAILED': return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Upload History</h1>
              <p className="text-muted-foreground">View all marks upload trails (API: /upload-trails)</p>
            </div>
            <Button variant="outline" size="icon" onClick={loadTrails} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Upload Trails</CardTitle>
              <CardDescription>Total: {filtered.length} uploads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by filename..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-sm" />
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No upload trails found</TableCell></TableRow>
                    ) : filtered.map(trail => (
                      <TableRow key={trail.upload_id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileUp className="h-4 w-4 text-muted-foreground" />
                            {trail.file_name}
                          </div>
                        </TableCell>
                        <TableCell>{trail.upload_date ? new Date(trail.upload_date).toLocaleDateString() : '—'}</TableCell>
                        <TableCell>{trail.file_size ? `${formatNumber(Math.round(trail.file_size / 1024))} KB` : '—'}</TableCell>
                        <TableCell>{trail.file_type || '—'}</TableCell>
                        <TableCell>{getStatusBadge(trail.status)}</TableCell>
                        <TableCell className="max-w-xs truncate">{trail.description || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
