'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getRegions, getCouncils, getWards } from '@/lib/api';
import { MapPin, Globe, Building2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LocationsPage() {
  const [regions, setRegions] = useState<any[]>([]);
  const [councils, setCouncils] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [r, c, w] = await Promise.all([
        getRegions({ limit: 100 }),
        getCouncils({ limit: 500 }),
        getWards({ limit: 1000 })
      ]);
      setRegions(Array.isArray(r) ? r : r.items || []);
      setCouncils(Array.isArray(c) ? c : c.items || []);
      setWards(Array.isArray(w) ? w : w.items || []);
    } catch (error) {
      toast.error('Failed to load locations');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Location Management</h1>
              <p className="text-muted-foreground">Manage regions, councils and wards (API: /regions, /councils, /wards)</p>
            </div>
            <Button variant="outline" size="icon" onClick={loadData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2"><Globe className="h-4 w-4" />Regions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{regions.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2"><Building2 className="h-4 w-4" />Councils</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{councils.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2"><MapPin className="h-4 w-4" />Wards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{wards.length}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="regions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="regions">Regions</TabsTrigger>
              <TabsTrigger value="councils">Councils</TabsTrigger>
              <TabsTrigger value="wards">Wards</TabsTrigger>
            </TabsList>

            <TabsContent value="regions">
              <Card>
                <CardHeader>
                  <CardTitle>Regions</CardTitle>
                  <CardDescription>All registered regions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Region Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {regions.map(r => (
                        <TableRow key={r.region_id}>
                          <TableCell>{r.region_id}</TableCell>
                          <TableCell className="font-medium">{r.region_name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="councils">
              <Card>
                <CardHeader>
                  <CardTitle>Councils</CardTitle>
                  <CardDescription>All registered councils</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Council Name</TableHead>
                        <TableHead>Region ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {councils.slice(0, 100).map(c => (
                        <TableRow key={c.council_id}>
                          <TableCell>{c.council_id}</TableCell>
                          <TableCell className="font-medium">{c.council_name}</TableCell>
                          <TableCell>{c.region_id}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {councils.length > 100 && <p className="text-sm text-muted-foreground mt-2">Showing 100 of {councils.length}</p>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wards">
              <Card>
                <CardHeader>
                  <CardTitle>Wards</CardTitle>
                  <CardDescription>All registered wards</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Ward Name</TableHead>
                        <TableHead>Council ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wards.slice(0, 100).map(w => (
                        <TableRow key={w.ward_id}>
                          <TableCell>{w.ward_id}</TableCell>
                          <TableCell className="font-medium">{w.ward_name}</TableCell>
                          <TableCell>{w.council_id}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {wards.length > 100 && <p className="text-sm text-muted-foreground mt-2">Showing 100 of {wards.length}</p>}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
