"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Search, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { CourseForm } from "@/components/course-form"
import type { CourseType, PaginatedResponse } from "@/types"
import type { CourseFormData } from "@/lib/validations"
import axios from "axios"
import toast from "react-hot-toast"

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseType[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CourseType | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const limit = 10

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get<PaginatedResponse<CourseType>>("/api/courses", {
        params: { page, limit, search },
      })
      setCourses(response.data.data)
      setTotal(response.data.total)
      setTotalPages(response.data.totalPages)
    } catch {
      toast.error("Failed to fetch courses")
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const handleCreate = async (data: CourseFormData) => {
    try {
      await axios.post("/api/courses", data)
      toast.success("Course created successfully")
      setDialogOpen(false)
      fetchCourses()
    } catch {
      toast.error("Failed to create course")
    }
  }

  const handleUpdate = async (data: CourseFormData) => {
    if (!editingCourse) return
    try {
      await axios.put("/api/courses", { id: editingCourse.id, ...data })
      toast.success("Course updated successfully")
      setDialogOpen(false)
      setEditingCourse(null)
      fetchCourses()
    } catch {
      toast.error("Failed to update course")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/courses?id=${id}`)
      toast.success("Course deleted successfully")
      setDeleteConfirm(null)
      fetchCourses()
    } catch {
      toast.error("Failed to delete course")
    }
  }

  const openEdit = (course: CourseType) => {
    setEditingCourse(course)
    setDialogOpen(true)
  }

  const openCreate = () => {
    setEditingCourse(null)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">Manage your courses</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-medium">No courses found</p>
              <p className="text-sm text-muted-foreground">
                Get started by creating a new course.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                    <th className="pb-3 font-medium">ID</th>
                    <th className="pb-3 font-medium">Course Name</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Created At</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} className="border-b last:border-0">
                      <td className="py-3 text-sm">{course.id}</td>
                      <td className="py-3 text-sm font-medium">{course.courseName}</td>
                      <td className="py-3">
                        <Badge variant={course.status === "active" ? "success" : "secondary"}>
                          {course.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(course)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(course.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit Course" : "Add Course"}</DialogTitle>
            <DialogDescription>
              {editingCourse ? "Update the course details below." : "Fill in the details to create a new course."}
            </DialogDescription>
          </DialogHeader>
          <CourseForm
            course={editingCourse}
            onSubmit={editingCourse ? handleUpdate : handleCreate}
            onCancel={() => {
              setDialogOpen(false)
              setEditingCourse(null)
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}