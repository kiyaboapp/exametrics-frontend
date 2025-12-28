// Comprehensive TypeScript types for API responses
// Eliminates all 'any' types throughout the application

// Base types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

// User types
export interface User extends BaseEntity {
  username: string;
  email: string;
  first_name: string;
  middle_name: string | null;
  surname: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  centre_number: string | null;
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

// Exam types
export interface Exam extends BaseEntity {
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

export interface ExamDivision extends BaseEntity {
  exam_id: string;
  division_name: string;
  division_name_swahili: string | null;
  points_min: number;
  points_max: number;
}

export interface ExamGrade extends BaseEntity {
  exam_id: string;
  grade_name: string;
  grade_name_swahili: string | null;
  points_min: number;
  points_max: number;
}

export interface ExamSubject extends BaseEntity {
  exam_id: string;
  subject_code: string;
  subject_name: string;
  subject_name_swahili: string | null;
  is_compulsory: boolean;
}

// Location types
export interface Region extends BaseEntity {
  region_name: string;
  region_code: string;
}

export interface Council extends BaseEntity {
  council_name: string;
  council_code: string;
  region_id: string;
}

export interface Ward extends BaseEntity {
  ward_name: string;
  ward_code: string;
  council_id: string;
}

// School types
export interface School extends BaseEntity {
  centre_number: string;
  school_name: string;
  region_id: string;
  council_id: string;
  ward_id: string;
  school_type: string;
  registration_status: string;
}

// Student types
export interface Student extends BaseEntity {
  student_id: string;
  exam_id: string;
  centre_number: string;
  candidate_number: string;
  first_name: string;
  middle_name: string | null;
  surname: string;
  gender: 'M' | 'F';
  birth_date: string;
  special_needs: string | null;
}

// Result types
export interface Result extends BaseEntity {
  result_id: string;
  exam_id: string;
  centre_number: string;
  candidate_number: string;
  subject_code: string;
  grade: string;
  points: number;
  division: string;
}

export interface SchoolProgress {
  centre_number: string;
  school_name: string;
  region_name?: string;
  council_name?: string;
  ward_name?: string;
  school_type?: string;
  school_gpa?: number;
  total_students?: number;
  division_i_count?: number;
  overall_position?: number;
  total_schools?: number;
  division_summary?: {
    divisions: {
      [key: string]: {
        F: number;
        M: number;
        T: number;
      };
    };
  };
}

export interface SchoolAnalysis {
  centre_number: string;
  school_name: string;
  region_name?: string;
  council_name?: string;
  ward_name?: string;
  school_type?: string;
  school_gpa?: number;
  school_ranking?: {
    overall_pos?: number;
    overall_out_of?: number;
    region_pos?: number;
    region_out_of?: number;
    council_pos?: number;
    council_out_of?: number;
    ward_pos?: number;
    ward_out_of?: number;
  };
  division_summary?: {
    divisions: {
      [key: string]: {
        F: number;
        M: number;
        T: number;
      };
    };
  };
  grades_summary?: {
    grades: {
      [key: string]: {
        subject_gpa?: number;
        position?: {
          subject_pos?: number;
          subject_out_of?: number;
          ward_pos?: number;
          ward_out_of?: number;
          council_pos?: number;
          council_out_of?: number;
          region_pos?: number;
          region_out_of?: number;
        };
      };
    };
  };
}

// Statistics types
export interface ExamRegistrationStats {
  exam_id: string;
  total_students: number;
  total_schools: number;
  gender_breakdown: {
    male: number;
    female: number;
  };
  region_breakdown: {
    [region_name: string]: {
      students: number;
      schools: number;
    };
  };
  council_breakdown: {
    [council_name: string]: {
      students: number;
      schools: number;
    };
  };
  ward_breakdown: {
    [ward_name: string]: {
      students: number;
      schools: number;
    };
  };
  school_type_breakdown: {
    [school_type: string]: {
      students: number;
      schools: number;
    };
  };
  subject_enrollment: {
    [subject_code: string]: {
      subject_name: string;
      enrolled_count: number;
    };
  };
}

export interface ExamStatistics {
  exam_id: string;
  total_students: number;
  total_schools: number;
  average_gpa: number;
  division_distribution: {
    [division: string]: {
      count: number;
      percentage: number;
      male_count: number;
      female_count: number;
    };
  };
  grade_distribution: {
    [grade: string]: {
      count: number;
      percentage: number;
    };
  };
  top_schools: Array<{
    centre_number: string;
    school_name: string;
    gpa: number;
    position: number;
  }>;
}

// API Error types
export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Filter types
export interface ResultFilters {
  exam_id?: string;
  region_id?: string;
  council_id?: string;
  ward_id?: string;
  school_type?: string;
  division?: string;
  grade?: string;
}

export interface SchoolFilters {
  exam_id?: string;
  region_id?: string;
  council_id?: string;
  ward_id?: string;
  school_type?: string;
}

// Utility types
export type Gender = 'M' | 'F';
export type SchoolType = 'GOVERNMENT' | 'PRIVATE' | 'SEMI_GOVERNMENT';
export type RegistrationStatus = 'REGISTERED' | 'NOT_REGISTERED' | 'PENDING';

// Chart data types
export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

export interface MultiSeriesChartData {
  name: string;
  series: Array<{
    name: string;
    value: number;
  }>;
}

// Component props types
export interface DataTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    label: string;
    render?: (value: T[keyof T], item: T) => React.ReactNode;
  }>;
  loading?: boolean;
  onRowClick?: (item: T) => void;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ReactNode;
}

// Navigation types
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
  badge?: string | number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Form types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface SearchFormData {
  query: string;
  filters?: Record<string, unknown>;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Export all types for easy importing
export type {
  // Re-export commonly used types
  User,
  Exam,
  School,
  Student,
  Result,
  SchoolProgress,
  SchoolAnalysis,
  ExamStatistics,
  ExamRegistrationStats,
};
