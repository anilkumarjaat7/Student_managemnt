"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { teacherSchema, type TeacherFormData } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TeacherType } from "@/types"

interface TeacherFormProps {
  teacher?: TeacherType | null
  onSubmit: (data: TeacherFormData) => Promise<void>
  onCancel: () => void
}

export function TeacherForm({ teacher, onSubmit, onCancel }: TeacherFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    setValue,
  } = useForm({
    defaultValues: {
      teacherName: teacher?.teacherName || "",
      phone: teacher?.phone || "",
      status: teacher?.status || "active",
    },
  })

  const handleFormSubmit = async (data: { teacherName: string; phone: string; status: string }) => {
    setErrors({})
    const result = teacherSchema.safeParse(data)
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
        <Label htmlFor="teacherName">Teacher Name</Label>
        <Input
          id="teacherName"
          placeholder="Enter teacher name"
          {...register("teacherName")}
          className={errors.teacherName ? "border-destructive" : ""}
        />
        {errors.teacherName && (
          <p className="text-sm text-destructive">{errors.teacherName}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          placeholder="Enter phone number"
          {...register("phone")}
          className={errors.phone ? "border-destructive" : ""}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          defaultValue={teacher?.status || "active"}
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
          {submitting ? "Saving..." : teacher ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  )
}