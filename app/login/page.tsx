'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LockKeyhole, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <Card className="w-full shadow-xl border-0 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
            <CardHeader className="p-0 space-y-1">
              <CardTitle className="text-3xl font-bold tracking-tight">Exametrics</CardTitle>
              <CardDescription className="text-indigo-100">Sign in to access your dashboard</CardDescription>
            </CardHeader>
          </div>
          <CardContent className="pt-8 pb-0">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2 animate-slide-up delay-100">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 rounded-md border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2 animate-slide-up delay-200">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 rounded-md border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-2.5 rounded-md font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-70"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center py-6 text-sm text-gray-500">
            <span>&copy; {new Date().getFullYear()} Exametrics - All Rights Reserved</span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
