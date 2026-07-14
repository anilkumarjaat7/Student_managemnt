"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { studentSchema, type StudentFormData } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { StudentType, CourseType, TeacherType } from "@/types"
import axios from "axios"

interface StudentFormProps {
  student?: StudentType | null
  onSubmit: (data: StudentFormData) => Promise<void>
  onCancel: () => void
}

export function StudentForm({ student, onSubmit, onCancel }: StudentFormProps) {
  const [courses, setCourses] = useState<CourseType[]>([])
  const [teachers, setTeachers] = useState<TeacherType[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit: rhfHandleSubmit, setValue } = useForm<Record<string, string>>({
    defaultValues: {
      studentName: student?.studentName || "",
      phone: student?.phone || "",
      batchId: student?.batchId || "",
      timing: student?.timing || "",
      days: student?.days || "",
      startDate: student?.startDate || "",
      endDate: student?.endDate || "",
      note: student?.note || "",
      remarks: student?.remarks || "",
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, teachersRes] = await Promise.all([
          axios.get("/api/courses?limit=100"),
          axios.get("/api/teachers?limit=100"),
        ])
        setCourses(coursesRes.data.data)
        setTeachers(teachersRes.data.data)
      } catch {
        // silently fail
      }
    }
    fetchData()
  }, [])

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    setErrors({})
    const formData = {
      ...data,
      courseId: student?.courseId || data.courseId,
      teacherId: student?.teacherId || data.teacherId,
      mode: data.mode || student?.mode || "online",
      feesStatus: data.feesStatus || student?.feesStatus || "pending",
      status: data.status || student?.status || "active",
      placement: data.placement || student?.placement || "no",
    }
    const result = studentSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message
      })
      setErrors(fieldErrors)
      return
    }
    setSubmitting(true)
    try {
      await onSubmit(result.data)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={rhfHandleSubmit(handleFormSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="studentName">Student Name *</Label>
          <Input
            id="studentName"
            placeholder="Enter student name"
            {...register("studentName")}
            className={errors.studentName ? "border-destructive" : ""}
          />
          {errors.studentName && <p className="text-sm text-destructive">{errors.studentName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            placeholder="Enter phone number"
            {...register("phone")}
            className={errors.phone ? "border-destructive" : ""}
          />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="courseId">Course *</Label>
          <Select
            defaultValue={student?.courseId?.toString() || undefined}
            onValueChange={(value) => setValue("courseId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>{course.courseName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.courseId && <p className="text-sm text-destructive">{errors.courseId}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="teacherId">Teacher *</Label>
          <Select
            defaultValue={student?.teacherId?.toString() || undefined}
            onValueChange={(value) => setValue("teacherId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id.toString()}>{teacher.teacherName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.teacherId && <p className="text-sm text-destructive">{errors.teacherId}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="batchId">Batch ID</Label>
          <Input id="batchId" placeholder="Enter batch ID" {...register("batchId")}
            className={errors.batchId ? "border-destructive" : ""} />
          {errors.batchId && <p className="text-sm text-destructive">{errors.batchId}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="timing">Timing</Label>
          <Input id="timing" placeholder="e.g. 10:00 AM - 12:00 PM" {...register("timing")}
            className={errors.timing ? "border-destructive" : ""} />
          {errors.timing && <p className="text-sm text-destructive">{errors.timing}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="days">Days</Label>
          <Input id="days" placeholder="e.g. Mon-Wed-Fri" {...register("days")}
            className={errors.days ? "border-destructive" : ""} />
          {errors.days && <p className="text-sm text-destructive">{errors.days}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="mode">Mode</Label>
          <Select
            defaultValue={student?.mode || undefined}
            onValueChange={(value) => setValue("mode", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
          {errors.mode && <p className="text-sm text-destructive">{errors.mode}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" type="date" {...register("startDate")}
            className={errors.startDate ? "border-destructive" : ""} />
          {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" type="date" {...register("endDate")}
            className={errors.endDate ? "border-destructive" : ""} />
          {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="feesStatus">Fees Status</Label>
          <Select
            defaultValue={student?.feesStatus || "pending"}
            onValueChange={(value) => setValue("feesStatus", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select fees status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
            </SelectContent>
          </Select>
          {errors.feesStatus && <p className="text-sm text-destructive">{errors.feesStatus}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            defaultValue={student?.status || "active"}
            onValueChange={(value) => setValue("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="placement">Placement</Label>
          <Select
            defaultValue={student?.placement || "no"}
            onValueChange={(value) => setValue("placement", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select placement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
          {errors.placement && <p className="text-sm text-destructive">{errors.placement}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="note">Note</Label>
          <Input id="note" placeholder="Any notes" {...register("note")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="remarks">Remarks</Label>
          <Input id="remarks" placeholder="Any remarks" {...register("remarks")} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : student ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  )
}