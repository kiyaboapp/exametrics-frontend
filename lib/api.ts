import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Log the API URL on initialization (client-side only)
if (typeof window !== 'undefined') {
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('🌍 Environment:', process.env.NODE_ENV);
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

// Get all schools results for an exam - uses /exams/{exam_id}/analyses/overviews
export const getExamResults = async (examId: string, params?: any) => {
  const response = await api.get(`/exams/${examId}/analyses/overviews`, {
    params: {
      limit: 100,
      sort_by: 'gpa_desc',
      ...params
    }
  });
  
  // Backend may return paginated or direct array
  return response.data.data || response.data.items || response.data || [];
};

export const downloadSchoolPDF = async (examId: string, centreNumber: string) => {
  const response = await api.get(`/results/results/pdf/${examId}/${centreNumber}`, {
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
  const response = await api.get('/exam-boards/');
  return response.data;
};

// Create exam board - API expects: name, location, chairman, secretary
export const createBoard = async (boardData: { name: string; location?: string; chairman?: string; secretary?: string }) => {
  const response = await api.post('/exam-boards/', boardData);
  return response.data;
};

// Update exam board
export const updateBoard = async (boardId: string, boardData: any) => {
  const response = await api.patch(`/exam-boards/${boardId}`, boardData);
  return response.data;
};

// Delete exam board
export const deleteBoard = async (boardId: string) => {
  const response = await api.delete(`/exam-boards/${boardId}`);
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

// ===== USERS APIs =====

export const getUsers = async (params?: any) => {
  const response = await api.get('/users/', { params });
  return response.data;
};

export const getUser = async (userId: string) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const createUser = async (userData: any) => {
  const response = await api.post('/users/', userData);
  return response.data;
};

export const updateUser = async (userId: string, userData: any) => {
  const response = await api.patch(`/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// ===== USER EXAMS APIs =====

export const getUserExams = async (params?: any) => {
  const response = await api.get('/user-exams/', { params });
  return response.data;
};

export const createUserExam = async (userExamData: any) => {
  const response = await api.post('/user-exams/', userExamData);
  return response.data;
};

export const updateUserExam = async (userId: string, examId: string, data: any) => {
  const response = await api.patch(`/user-exams/${userId}/${examId}`, data);
  return response.data;
};

export const deleteUserExam = async (userId: string, examId: string) => {
  const response = await api.delete(`/user-exams/${userId}/${examId}`);
  return response.data;
};

// ===== SUBJECTS APIs =====

export const getSubjects = async (params?: any) => {
  const response = await api.get('/subjects/', { params });
  return response.data;
};

export const createSubject = async (subjectData: any) => {
  const response = await api.post('/subjects/', subjectData);
  return response.data;
};

export const updateSubject = async (subjectCode: string, subjectData: any) => {
  const response = await api.patch(`/subjects/${subjectCode}`, subjectData);
  return response.data;
};

export const deleteSubject = async (subjectCode: string) => {
  const response = await api.delete(`/subjects/${subjectCode}`);
  return response.data;
};

// ===== EXAM SUBJECTS APIs =====

export const getExamSubjects = async (examId: string) => {
  const response = await api.get('/exam-subjects/', { params: { exam_id: examId, limit: 100 } });
  return response.data;
};

export const createExamSubject = async (examSubjectData: any) => {
  const response = await api.post('/exam-subjects/', examSubjectData);
  return response.data;
};

export const deleteExamSubject = async (examSubjectId: string) => {
  const response = await api.delete(`/exam-subjects/${examSubjectId}`);
  return response.data;
};

// ===== LOCATIONS APIs =====

export const getRegions = async (params?: any) => {
  const response = await api.get('/regions/', { params });
  return response.data;
};

export const createRegion = async (regionData: any) => {
  const response = await api.post('/regions/', regionData);
  return response.data;
};

export const getCouncils = async (params?: any) => {
  const response = await api.get('/councils/', { params });
  return response.data;
};

export const createCouncil = async (councilData: any) => {
  const response = await api.post('/councils/', councilData);
  return response.data;
};

export const getWards = async (params?: any) => {
  const response = await api.get('/wards/', { params });
  return response.data;
};

export const createWard = async (wardData: any) => {
  const response = await api.post('/wards/', wardData);
  return response.data;
};

// ===== UPLOAD TRAILS APIs =====

export const getUploadTrails = async (params?: any) => {
  const response = await api.get('/upload-trails/', { params });
  return response.data;
};

export const getUploadTrail = async (uploadId: string) => {
  const response = await api.get(`/upload-trails/${uploadId}`);
  return response.data;
};

// ===== SCHOOLS APIs (Extended) =====

export const getSchools = async (params?: any) => {
  const response = await api.get('/schools/', { params });
  return response.data;
};

export const getSchool = async (centreNumber: string) => {
  const response = await api.get(`/schools/${centreNumber}`);
  return response.data;
};

export const createSchool = async (schoolData: any) => {
  const response = await api.post('/schools/', schoolData);
  return response.data;
};

export const updateSchool = async (centreNumber: string, schoolData: any) => {
  const response = await api.patch(`/schools/${centreNumber}`, schoolData);
  return response.data;
};

export const deleteSchool = async (centreNumber: string) => {
  const response = await api.delete(`/schools/${centreNumber}`);
  return response.data;
};

// ===== STUDENTS APIs =====

export const getStudents = async (params?: any) => {
  const response = await api.get('/students/', { params });
  return response.data;
};

export const getStudent = async (studentGlobalId: string) => {
  const response = await api.get(`/students/${studentGlobalId}`);
  return response.data;
};

// ===== RESULTS APIs =====

export const getResults = async (params?: any) => {
  const response = await api.get('/results/', { params });
  return response.data;
};

// ===== LOCATION ANALYSIS APIs =====

export const getLocationAnalyses = async (examId: string, params?: any) => {
  const response = await api.get(`/location-analysis/exam/${examId}`, { params });
  return response.data;
};

export const getLocationAnalysis = async (analysisId: string) => {
  const response = await api.get(`/location-analysis/${analysisId}`);
  return response.data;
};

export const getLocationAnalysesByRegion = async (regionName: string) => {
  const response = await api.get(`/location-analysis/region/${regionName}`);
  return response.data;
};

// ===== SCHOOL ANALYSIS APIs =====

export const getSchoolAnalyses = async (examId: string, params?: any) => {
  const response = await api.get(`/exams/${examId}/analyses/overviews`, { params });
  return response.data;
};

export const getSchoolAnalysisRankings = async (examId: string, params?: any) => {
  const response = await api.get(`/exams/${examId}/analyses/rankings`, { params });
  return response.data;
};

export const getSchoolAnalysisSubjects = async (examId: string, params?: any) => {
  const response = await api.get(`/exams/${examId}/analyses/subjects`, { params });
  return response.data;
};

// ===== EXAM DIVISIONS APIs =====

export const getExamDivisions = async (params?: any) => {
  const response = await api.get('/exam-divisions/', { params });
  return response.data;
};

export const createExamDivision = async (divisionData: any) => {
  const response = await api.post('/exam-divisions/', divisionData);
  return response.data;
};

// ===== EXAM GRADES APIs =====

export const getExamGrades = async (params?: any) => {
  const response = await api.get('/exam-grades/', { params });
  return response.data;
};

export const createExamGrade = async (gradeData: any) => {
  const response = await api.post('/exam-grades/', gradeData);
  return response.data;
};

// ===== STUDENT SUBJECT BACKUPS APIs =====

export const getStudentSubjectBackups = async (params?: any) => {
  const response = await api.get('/student-subject-backups/', { params });
  return response.data;
};

export const getStudentSubjectBackupsByExam = async (examId: string) => {
  const response = await api.get(`/student-subject-backups/exam/${examId}`);
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
