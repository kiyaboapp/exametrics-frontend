'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Exam } from '@/lib/api';

type ExamContextType = {
  selectedExam: Exam | null;
  setSelectedExam: (exam: Exam | null) => void;
  clearSelectedExam: () => void;
};

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider = ({ children }: { children: ReactNode }) => {
  const [selectedExam, setSelectedExamState] = useState<Exam | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedExam = localStorage.getItem('selectedExam');
      if (savedExam) {
        try {
          setSelectedExamState(JSON.parse(savedExam));
        } catch (error) {
          console.error('Error parsing saved exam:', error);
          localStorage.removeItem('selectedExam');
        }
      }
    }
  }, []);

  const setSelectedExam = (exam: Exam | null) => {
    setSelectedExamState(exam);
    if (typeof window !== 'undefined') {
      if (exam) {
        localStorage.setItem('selectedExam', JSON.stringify(exam));
      } else {
        localStorage.removeItem('selectedExam');
      }
    }
  };

  const clearSelectedExam = () => {
    setSelectedExamState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedExam');
    }
  };

  return (
    <ExamContext.Provider value={{ selectedExam, setSelectedExam, clearSelectedExam }}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = (): ExamContextType => {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};
