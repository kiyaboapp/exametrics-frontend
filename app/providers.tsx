'use client';

import { AuthProvider } from "@/contexts/AuthContext";
import { ExamProvider } from '@/contexts/ExamContext';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <ExamProvider>
          {children}
          <Toaster position="top-right" />
        </ExamProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
