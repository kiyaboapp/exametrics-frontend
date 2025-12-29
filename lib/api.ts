import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  LoginResponse, 
  User, 
  Exam, 
  UserExam, 
  SchoolProgress, 
  SchoolAnalysis, 
  ExamStatistics, 
  ExamRegistrationStats,
  Result,
  Student,
  School,
  Region,
  Council,
  Ward,
  ApiError
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Log the API URL on initialization (client-side only)
if (typeof window !== 'undefined') {
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('🌍 Environment:', process.env.NODE_ENV);
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  middle_name: string | null;
  surname: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  centre_number: string | null;
  created_at: string;
}

export interface Exam {
  exam_id: string;
  board_id: string;
  exam_name: string;
  exam_name_swahili: string | null;
  start_date: string;
  end_date: string;
  avg_style: string;
  exam_level: string;
  ranking_style: string;
  is_active: boolean;
}

export interface UserExam {
  exam: Exam;
  role: string;
  permissions: Record<string, unknown>;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
  user_exams: UserExam[];
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

// Create axios instance with base config
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const apiError: ApiError = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    };
    
    // Handle specific status codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized access
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
          break;
        case 403:
          apiError.message = 'You do not have permission to access this resource';
          break;
        case 404:
          apiError.message = 'The requested resource was not found';
          break;
        case 500:
          apiError.message = 'Internal server error';
          break;
        default:
          apiError.message = error.response.data?.detail || error.message;
      }
    }
    
    return Promise.reject(apiError);
  }
);

// Auth APIs
export const login = async (username: string, password: string) => {
  console.log('Sending login request to:', `${API_BASE_URL}/auth/login`);
  const form = new URLSearchParams();
  form.set('username', username);
  form.set('password', password);
  form.set('grant_type', 'password');
  form.set('scope', '');
  const response = await api.post('/auth/login', form, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  if (response.data.access_token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('user_exams', JSON.stringify(response.data.user_exams));
    }
  }
  return response.data;
};

export const logout = async (token: string): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    '/auth/logout',
    { access_token: token },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  // Clear local storage on logout
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return response.data;
};

// Exam APIs
export const getExams = async (skip = 0, limit = 100) => {
  const response = await api.get('/exams', { params: { skip, limit } });
  return response.data;
};

export const getExam = async (examId: string) => {
  const response = await api.get(`/exams/${examId}`);
  return response.data;
};

export const getExamRegistrationStats = async (examId: string) => {
  const response = await api.get(`/exams/registration-stats/${examId}`);
  return response.data;
};

// Results APIs
export const getSchoolAnalysis = async (examId: string, centreNumber: string, simplified = false) => {
  const endpoint = simplified 
    ? `/exams/${examId}/schools/${centreNumber}/analysis/overview`
    : `/exams/${examId}/schools/${centreNumber}/analysis/full`;
  const response = await api.get(endpoint);
  return response.data;
};

// Get exam results for a specific school
export const getSchoolResults = async (examId: string, centreNumber: string) => {
  const response = await api.get(`/results/results/analysis/${examId}/${centreNumber}`, {
    params: {
      include_division_summary: true,
      include_grades_summary: true,
      include_school_ranking: true
    }
  });
  return response.data;
};

// Get all schools results for an exam
export const getExamResults = async (examId: string, params?: any) => {
  const response = await api.get(`/school-analyses/exams/${examId}/analyses/overviews`, {
    params: {
      limit: 100,
      sort_by: 'gpa_desc',
      ...params
    }
  });
  
  // Backend returns { data: [...], pagination: {...}, total_queried: number }
  return response.data.data || [];
};

export const downloadSchoolPDF = async (examId: string, centreNumber: string) => {
  const response = await api.get(`/school-analyses/exams/${examId}/schools/${centreNumber}/analysis/full`, {
    responseType: 'blob'
  });
  return response.data;
};

// School Analysis APIs
export const getFullSchoolAnalysis = async (examId: string, centreNumber: string) => {
  const response = await api.get(`/exams/${examId}/schools/${centreNumber}/analysis/full`);
  return response.data;
};

export const getSchoolRanking = async (examId: string, centreNumber: string) => {
  const response = await api.get(`/exams/${examId}/schools/${centreNumber}/analysis/ranking`);
  return response.data;
};

export const getSchoolSubjects = async (examId: string, centreNumber: string) => {
  const response = await api.get(`/exams/${examId}/schools/${centreNumber}/analysis/subjects`);
  return response.data;
};

export const getSchoolDivisions = async (examId: string, centreNumber: string) => {
  const response = await api.get(`/exams/${examId}/schools/${centreNumber}/analysis/divisions`);
  return response.data;
};

export const getSchoolGrades = async (examId: string, centreNumber: string) => {
  const response = await api.get(`/exams/${examId}/schools/${centreNumber}/analysis/grades`);
  return response.data;
};

export const getSubjectAnalysis = async (examId: string, centreNumber: string, subjectCode: string) => {
  const response = await api.get(`/exams/${examId}/schools/${centreNumber}/subjects/${subjectCode}`);
  return response.data;
};

// List APIs with pagination
export const listSchoolOverviews = async (examId: string, params?: any) => {
  const response = await api.get(`/exams/${examId}/analyses/overviews`, { params });
  // Handle paginated response - return items if present, otherwise return data directly
  return response.data.items || response.data;
};

export const listSchoolRankings = async (examId: string, params?: any) => {
  const response = await api.get(`/exams/${examId}/analyses/rankings`, { params });
  // Handle paginated response - return items if present, otherwise return data directly
  return response.data.items || response.data;
};

export const listSubjectRankings = async (examId: string, subjectCode: string, params?: any) => {
  const response = await api.get(`/exams/${examId}/subjects/${subjectCode}/rankings`, { params });
  // Handle paginated response - return items if present, otherwise return data directly
  return response.data.items || response.data;
};

// Exam Stats
export const getExamStats = async (examId: string) => {
  const response = await api.get(`/exams/${examId}/stats`);
  return response.data;
};

// Exam Management APIs
export const createExam = async (examData: any) => {
  const response = await api.post('/exams/', examData);
  return response.data;
};

export const updateExam = async (examId: string, examData: any) => {
  const response = await api.put(`/exams/${examId}`, examData);
  return response.data;
};

export const deleteExam = async (examId: string) => {
  const response = await api.delete(`/exams/${examId}`);
  return response.data;
};

export const reprocessExam = async (examId: string) => {
  const response = await api.post(`/exams/${examId}/reprocess`);
  return response.data;
};

// Get available examination boards
export const getBoards = async () => {
  const response = await api.get('/exam-boards');
  return response.data;
};

// Create exam board
export const createBoard = async (boardData: { board_name: string; board_code?: string }) => {
  const response = await api.post('/exam-boards/', boardData);
  return response.data;
};

// ===== RESULTS PROCESSING APIs =====

// Complete Results Processing
export const completeResultsProcessing = async (examId: string, params?: any) => {
  const response = await api.get(`/results/results/complete/${examId}`, { params });
  return response.data;
};

// Update School Progress
export const updateSchoolProgress = async (examId: string) => {
  const response = await api.post(`/results/progress/update/${examId}`);
  return response.data;
};

// Get School Progress
export const getSchoolProgress = async (examId: string, centreNumber?: string) => {
  const params: any = {};
  if (centreNumber) params.centre_number = centreNumber;
  const response = await api.get(`/results/progress/${examId}`, { params });
  return response.data;
};

// Generate School Results PDF
export const generateSchoolPDF = async (examId: string, centreNumber: string) => {
  const response = await api.get(`/results/results/pdf/${examId}/${centreNumber}`, {
    responseType: 'blob'
  });
  return response.data;
};

// Generate Multiple School Results PDFs (ZIP)
export const generateBulkPDFs = async (examId: string, params?: any) => {
  const response = await api.get(`/results/pdf/zip/${examId}`, {
    params,
    responseType: 'blob'
  });
  return response.data;
};

// Save All Exam Documents
export const saveAllExamDocuments = async (examId: string, params?: any) => {
  const response = await api.get(`/results/save/docs/${examId}`, { params });
  return response.data;
};

// Download Raw Data
export const downloadRawData = async (params?: any) => {
  const response = await api.get('/results/download/rawdata', {
    params,
    responseType: 'blob'
  });
  return response.data;
};

// Download School Subject Statistics
export const downloadSchoolSubjectStats = async (params?: any) => {
  const response = await api.get('/results/download/school-subject-stats', {
    params,
    responseType: 'blob'
  });
  return response.data;
};

// Download School Summary Statistics
export const downloadSchoolSummaryStats = async (params?: any) => {
  const response = await api.get('/results/download/school-summary-stats', {
    params,
    responseType: 'blob'
  });
  return response.data;
};

// ===== STUDENT SUBJECTS (MARKS) APIs =====

// List Student Subjects
export const getStudentSubjects = async (params?: any) => {
  const response = await api.get('/student/subjects/', { params });
  return response.data;
};

// Update Student Subject
export const updateStudentSubject = async (subjectId: string, subjectData: any) => {
  const response = await api.patch(`/student/subjects/${subjectId}`, subjectData);
  return response.data;
};

// Export Student Subjects to Excel
export const exportStudentSubjects = async (params: any) => {
  const response = await api.get('/student/subjects/export/excel', {
    params,
    responseType: 'blob'
  });
  return response.data;
};

// Export Multiple Student Subjects to Excel (ZIP)
export const exportStudentSubjectsMultiple = async (examId: string, params?: any) => {
  const response = await api.get('/student/subjects/export/excel/multiple', {
    params: { exam_id: examId, ...params },
    responseType: 'blob'
  });
  return response.data;
};

// Import Marks from Excel (Single)
export const importMarks = async (file: File, examId: string, options?: any) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('exam_id', examId);
  if (options?.upload_nulls) formData.append('upload_nulls', options.upload_nulls.toString());
  if (options?.use_student_id) formData.append('use_student_id', options.use_student_id.toString());

  const response = await api.post('/student/subjects/import/marks', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Import Marks from Multiple Excel Files
export const importMarksMultiple = async (files: File[], examId: string, options?: any) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  formData.append('exam_id', examId);
  if (options?.upload_nulls) formData.append('upload_nulls', options.upload_nulls.toString());
  if (options?.use_student_id) formData.append('use_student_id', options.use_student_id.toString());

  const response = await api.post('/student/subjects/import/marks/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Import Marks from ZIP File
export const importMarksZIP = async (zipFile: File, examId: string, options?: any) => {
  const formData = new FormData();
  formData.append('zip_file', zipFile);
  formData.append('exam_id', examId);
  if (options?.upload_nulls) formData.append('upload_nulls', options.upload_nulls.toString());
  if (options?.use_student_id) formData.append('use_student_id', options.use_student_id.toString());

  const response = await api.post('/student/subjects/import/marks/zip', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Process Subject Data
export const processSubjectData = async (examId: string) => {
  const response = await api.post(`/student/subjects/process/subject/${examId}`);
  return response.data;
};

// ===== SCHOOLS APIs =====

// Upload School PDF (Single)
export const uploadSchoolPDF = async (file: File, examId?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (examId) formData.append('exam_id', examId);

  const response = await api.post('/schools/upload/pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Upload School PDFs (Bulk)
export const uploadSchoolPDFsBulk = async (files: File[], examId?: string) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  if (examId) formData.append('exam_id', examId);

  const response = await api.post('/schools/upload/bulk-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Upload School PDFs (ZIP)
export const uploadSchoolPDFsZIP = async (zipFile: File, examId?: string) => {
  const formData = new FormData();
  formData.append('zip_file', zipFile);
  if (examId) formData.append('exam_id', examId);

  const response = await api.post('/schools/upload/zip', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Search Schools
export const searchSchools = async (searchTerm: string, params?: any) => {
  const response = await api.get('/schools/search', {
    params: { search_term: searchTerm, ...params }
  });
  return response.data;
};

// ===== ISAL APIs =====

// Generate Attendance PDF
export const generateAttendancePDF = async (params?: any) => {
  const response = await api.get('/isals/generate-attendance-pdf', {
    params,
    responseType: 'blob'
  });
  return response.data;
};

// Helper function to handle API errors in components
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  return error instanceof Error ? error.message : 'An unknown error occurred';
};

export default api;
