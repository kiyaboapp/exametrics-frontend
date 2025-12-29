'use client';

import { useEffect, useState } from 'react';
import { useExam } from '@/contexts/ExamContext';
import { getExams, Exam } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ExamSelector() {
  const { selectedExam, setSelectedExam } = useExam();
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await getExams();
        setExams(data);
      } catch (error) {
        console.error('Error fetching exams:', error);
        toast.error('Failed to load exams');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, []);

  const handleExamChange = (examId: string) => {
    const exam = exams.find(e => e.exam_id === examId);
    if (exam) {
      setSelectedExam(exam);
      toast.success(`Selected: ${exam.exam_name}`);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-xs">
        <div className="h-9 bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <Select value={selectedExam?.exam_id || ''} onValueChange={handleExamChange}>
      <SelectTrigger className="w-full max-w-xs text-sm">
        <SelectValue placeholder="Select an exam" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {exams.length === 0 ? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            No exams available
          </div>
        ) : (
          exams.map((exam) => (
            <SelectItem key={exam.exam_id} value={exam.exam_id} className="py-2">
              <div className="flex flex-col">
                <span className="font-medium text-sm">{exam.exam_name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(exam.start_date)} - {formatDate(exam.end_date)}
                </span>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
