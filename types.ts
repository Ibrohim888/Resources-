export type AppLanguage = 'uz' | 'ru' | 'en';

export type ThemeColor = 'forest_green' | 'trust_blue' | 'violet' | 'warm_rose' | 'teal';

export type ThemeMode = 'system' | 'light' | 'dark';

export type HomeworkStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export type ResultStatus = 'COMPLETED' | 'PARTIAL' | 'MISSING';

export type GradeType = 'PERCENT' | 'POINT_10';

export interface Student {
  id: string;
  studentIdNumber: string; // 8-digit numeric ID, e.g. "84920184" (faqat raqam)
  secretCode: string; // 8-character mixed alphanumeric secret code, e.g., "TX78B2A9" (raqam va harf)
  firstName: string;
  lastName: string;
  fullName: string;
  classNames: string[]; // Multi-group support: e.g. ["7-A", "Olimpiada"]
  phone?: string;
  notes?: string;
  photo?: string;
  createdAt: number;
  isActive: boolean;
}

export interface Homework {
  id: string;
  title: string;
  subject: string;
  className: string; // Target group
  description: string;
  attachmentName?: string;
  attachmentURL?: string;
  assignedDate: string;
  deadline: string;
  status: HomeworkStatus;
  createdAt: number;
  updatedAt: number;
}

export interface Result {
  id: string;
  studentId: string;
  homeworkId: string;
  isPresent: boolean; // Attendance: true = Present, false = Absent (NB)
  completionStatus: ResultStatus;
  grade: number | null;
  gradeType: GradeType;
  comment?: string;
  checkedDate: number;
  checkedBy: string;
}

export interface TeacherProfile {
  fullName: string;
  email: string;
  centerName: string;
  profileImage?: string;
  language: AppLanguage;
  themeColor: ThemeColor;
  themeMode: ThemeMode;
  darkMode: boolean;
  ratingStartDate: number; // Day of month when rating period resets (e.g. 1 or 10)
  isFirstLaunchCompleted: boolean;
}

export interface MonthlyArchive {
  id: string;
  monthLabel: string; // e.g. "2026-07"
  archivedAt: number;
  rankings: {
    studentId: string;
    studentName: string;
    classNames: string[];
    avgGrade: number;
    completionRate: number;
    totalSubmitted: number;
  }[];
}
