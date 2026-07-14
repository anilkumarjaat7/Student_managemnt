export interface CourseType {
  id: number;
  courseName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherType {
  id: number;
  teacherName: string;
  phone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentType {
  id: number;
  studentName: string;
  phone: string;
  courseId: number;
  teacherId: number;
  timing: string;
  days: string;
  mode: string;
  startDate: string;
  endDate: string;
  feesStatus: string;
  status: string;
  placement: string;
  note: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
  course?: CourseType;
  teacher?: TeacherType;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
