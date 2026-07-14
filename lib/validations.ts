import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const courseSchema = z.object({
  courseName: z.string().min(1),
  status: z.string().min(1),
});

export const teacherSchema = z.object({
  teacherName: z.string().min(1),
  phone: z.string().min(10).regex(/^\d+$/),
  status: z.string().min(1),
});

export const studentSchema = z.object({
  studentName: z.string().min(1),
  phone: z.string().min(10),
  courseId: z.coerce.number(),
  teacherId: z.coerce.number(),
  timing: z.string().min(1),
  days: z.string().min(1),
  mode: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  feesStatus: z.string().min(1),
  status: z.string().min(1),
  placement: z.string().min(1),
  note: z.string(),
  remarks: z.string(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type CourseFormData = z.infer<typeof courseSchema>;
export type TeacherFormData = z.infer<typeof teacherSchema>;
export type StudentFormData = z.infer<typeof studentSchema>;
