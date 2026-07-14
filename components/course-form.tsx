"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { courseSchema, type CourseFormData } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CourseType } from "@/types"

interface CourseFormProps {
  course?: CourseType | null
  onSubmit: (data: CourseFormData) => Promise<void>
  onCancel: () => void
}

export function CourseForm({ course, onSubmit, onCancel }: CourseFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    setValue,
  } = useForm({
    defaultValues: {
      courseName: course?.courseName || "",
      status: course?.status || "active",
    },
  })

  const handleFormSubmit = async (data: { courseName: string; status: string }) => {
    setErrors({})
    const result = courseSchema.safeParse(data)
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
    <form onSubmit={rhfHandleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="courseName">Course Name</Label>
        <Input
          id="courseName"
          placeholder="Enter course name"
          {...register("courseName")}
          className={errors.courseName ? "border-destructive" : ""}
        />
        {errors.courseName && (
          <p className="text-sm text-destructive">{errors.courseName}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          defaultValue={course?.status || "active"}
          onValueChange={(value) => setValue("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : course ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  )
}