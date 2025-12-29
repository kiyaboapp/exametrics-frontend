'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useExam } from '@/contexts/ExamContext';
import { getExams, Exam } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar, 
  MapPin, 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Loader2
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ExamSelectionPaneProps {
  onSelect?: (exam: Exam) => void;
}

export default function ExamSelectionPane({ onSelect }: ExamSelectionPaneProps) {
  const router = useRouter();
  const { setSelectedExam } = useExam();
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setIsLoading(true);
        const data = await getExams();
        // Sort by start_date descending (latest first)
        const sorted = data.sort((a, b) => 
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        );
        setExams(sorted);
      } catch (error) {
        console.error('Error fetching exams:', error);
        toast.error('Failed to load exams');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, []);

  // Filter exams based on search query
  const filteredExams = useMemo(() => {
    if (!searchQuery.trim()) return exams;
    
    const query = searchQuery.toLowerCase();
    return exams.filter(exam => 
      exam.exam_name.toLowerCase().includes(query) ||
      exam.exam_level.toLowerCase().includes(query) ||
      exam.exam_name_swahili?.toLowerCase().includes(query) ||
      formatDate(exam.start_date).includes(query) ||
      formatDate(exam.end_date).includes(query)
    );
  }, [exams, searchQuery]);

  // Paginate filtered exams
  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredExams.slice(start, end);
  }, [filteredExams, currentPage]);

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);

  const handleSelectExam = (exam: Exam) => {
    setSelectedExam(exam);
    if (onSelect) {
      onSelect(exam);
    } else {
      toast.success(`Selected: ${exam.exam_name}`);
    }
  };

  const handleCreateExam = () => {
    router.push('/dashboard/exams/create');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="py-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading exams...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Select an Exam</h2>
          <p className="text-muted-foreground mt-1">
            Choose an exam to view and manage, or create a new one
          </p>
        </div>
        <Button onClick={handleCreateExam} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Create New Exam
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exams by name, level, or date..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {paginatedExams.length} of {filteredExams.length} exam{filteredExams.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Exams Grid */}
      {filteredExams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No exams found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search query' : 'Get started by creating your first exam'}
            </p>
            <Button onClick={handleCreateExam}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Exam
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedExams.map((exam) => (
              <Card
                key={exam.exam_id}
                className={cn(
                  "hover:shadow-lg transition-all cursor-pointer border-2",
                  "hover:border-primary/50"
                )}
                onClick={() => handleSelectExam(exam)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold line-clamp-2 mb-2">
                        {exam.exam_name}
                      </CardTitle>
                      {exam.exam_name_swahili && (
                        <CardDescription className="text-xs line-clamp-1">
                          {exam.exam_name_swahili}
                        </CardDescription>
                      )}
                    </div>
                    <BookOpen className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {exam.exam_level}
                    </Badge>
                    {exam.is_active && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-xs">
                        {formatDate(exam.start_date)} - {formatDate(exam.end_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-xs capitalize">{exam.avg_style.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectExam(exam);
                    }}
                  >
                    Select Exam
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="min-w-[2.5rem]"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

