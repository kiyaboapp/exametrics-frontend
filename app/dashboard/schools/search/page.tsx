'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { searchSchools } from '@/lib/api';
import { Search, Loader2, School, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SearchSchoolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term');
      return;
    }
    setIsLoading(true);
    try {
      const data = await searchSchools(searchTerm.trim(), { limit: 100 });
      setResults(Array.isArray(data) ? data : data.items || []);
      if (data.length === 0) toast('No schools found');
    } catch (error) {
      toast.error('Search failed');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Search Schools</h1>
            <p className="text-muted-foreground">Search schools by name or centre number (API: /schools/search)</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Search</CardTitle>
              <CardDescription>Enter school name or centre number</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input 
                    placeholder="e.g. Secondary School or S1234" 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><School className="h-5 w-5" />Search Results</CardTitle>
                <CardDescription>{results.length} schools found</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Centre</TableHead>
                        <TableHead>School Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map(school => (
                        <TableRow key={school.centre_number}>
                          <TableCell className="font-medium">{school.centre_number}</TableCell>
                          <TableCell>{school.school_name}</TableCell>
                          <TableCell><Badge variant="outline">{school.school_type || '—'}</Badge></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {school.region_name || '—'}, {school.council_name || '—'}
                            </div>
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
