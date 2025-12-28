'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ApiTestPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setResult('Testing...');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'Not set';
      setResult(`API URL: ${apiUrl}\n\n`);

      // Test with fetch
      const formData = new URLSearchParams();
      formData.append('username', 'anon@kiyabo.com');
      formData.append('password', 'anon@kiyabo.com');

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const data = await response.json();
      
      setResult(prev => prev + `Status: ${response.status}\n\nResponse:\n${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      setResult(prev => prev + `\n\nError: ${error.message}\n${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testApi} disabled={loading}>
            {loading ? 'Testing...' : 'Test API Login'}
          </Button>
          
          {result && (
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-sm">
              {result}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
