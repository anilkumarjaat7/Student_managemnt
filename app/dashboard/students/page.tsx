"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StudentForm } from "@/components/student-form";
import type {
  StudentType,
  PaginatedResponse,
  CourseType,
  TeacherType,
} from "@/types";
import type { StudentFormData } from "@/lib/validations";
import axios from "axios";
import toast from "react-hot-toast";

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentType[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentType | null>(
    null,
  );
  const [viewingStudent, setViewingStudent] = useState<StudentType | null>(
    null,
  );
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [phone, setPhone] = useState("");
  const [filterCourseId, setFilterCourseId] = useState("");
  const [filterTeacherId, setFilterTeacherId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFeesStatus, setFilterFeesStatus] = useState("");
  const [filterMode, setFilterMode] = useState("");
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [teachers, setTeachers] = useState<TeacherType[]>([]);

  const limit = 10;

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      };
      if (search) params.search = search;
      if (phone) params.phone = phone;
      if (filterCourseId) params.courseId = filterCourseId;
      if (filterTeacherId) params.teacherId = filterTeacherId;
      if (filterStatus) params.status = filterStatus;
      if (filterFeesStatus) params.feesStatus = filterFeesStatus;
      if (filterMode) params.mode = filterMode;

      const response = await axios.get<PaginatedResponse<StudentType>>(
        "/api/students",
        { params },
      );
      setStudents(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch {
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    search,
    phone,
    filterCourseId,
    filterTeacherId,
    filterStatus,
    filterFeesStatus,
    filterMode,
  ]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [coursesRes, teachersRes] = await Promise.all([
          axios.get("/api/courses?limit=100"),
          axios.get("/api/teachers?limit=100"),
        ]);
        setCourses(coursesRes.data.data);
        setTeachers(teachersRes.data.data);
      } catch {
        // silently fail
      }
    };
    fetchFilters();
  }, []);

  const handleCreate = async (data: StudentFormData) => {
    try {
      await axios.post("/api/students", data);
      toast.success("Student created successfully");
      setDialogOpen(false);
      fetchStudents();
    } catch {
      toast.error("Failed to create student");
    }
  };

  const handleUpdate = async (data: StudentFormData) => {
    if (!editingStudent) return;
    try {
      await axios.put("/api/students", { id: editingStudent.id, ...data });
      toast.success("Student updated successfully");
      setDialogOpen(false);
      setEditingStudent(null);
      fetchStudents();
    } catch {
      toast.error("Failed to update student");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/students?id=${id}`);
      toast.success("Student deleted successfully");
      setDeleteConfirm(null);
      fetchStudents();
    } catch {
      toast.error("Failed to delete student");
    }
  };

  const handleExport = async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (phone) params.phone = phone;
      if (filterCourseId) params.courseId = filterCourseId;
      if (filterTeacherId) params.teacherId = filterTeacherId;
      if (filterStatus) params.status = filterStatus;
      if (filterFeesStatus) params.feesStatus = filterFeesStatus;
      if (filterMode) params.mode = filterMode;

      const response = await axios.get("/api/students/export", {
        params,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `students_export_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Export downloaded successfully");
    } catch {
      toast.error("Failed to export students");
    }
  };

  const openEdit = (student: StudentType) => {
    setEditingStudent(student);
    setDialogOpen(true);
  };

  const openView = (student: StudentType) => {
    setViewingStudent(student);
    setViewDialogOpen(true);
  };

  const openCreate = () => {
    setEditingStudent(null);
    setDialogOpen(true);
  };

  const clearFilters = () => {
    setSearch("");
    setPhone("");
    setFilterCourseId("");
    setFilterTeacherId("");
    setFilterStatus("");
    setFilterFeesStatus("");
    setFilterMode("");
    setPage(1);
  };

  const getFeesBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "success" as const;
      case "partial":
        return "warning" as const;
      default:
        return "secondary" as const;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success" as const;
      case "completed":
        return "default" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Manage your students</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Input
              placeholder="Search by phone..."
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setPage(1);
              }}
            />
            <Select
              value={filterCourseId}
              onValueChange={(v) => {
                setFilterCourseId(v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.courseName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterTeacherId}
              onValueChange={(v) => {
                setFilterTeacherId(v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Teachers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.teacherName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterStatus}
              onValueChange={(v) => {
                setFilterStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterFeesStatus}
              onValueChange={(v) => {
                setFilterFeesStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Fees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fees</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterMode}
              onValueChange={(v) => {
                setFilterMode(v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-medium">No students found</p>
              <p className="text-sm text-muted-foreground">
                Get started by adding a new student.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                    <th className="pb-3 font-medium">ID</th>
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Phone</th>
                    <th className="pb-3 font-medium">Course</th>
                    <th className="pb-3 font-medium">Teacher</th>
                    <th className="pb-3 font-medium">Fees</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b last:border-0">
                      <td className="py-3 text-sm">{student.id}</td>
                      <td className="py-3 text-sm font-medium">
                        {student.studentName}
                      </td>
                      <td className="py-3 text-sm">{student.phone}</td>
                      <td className="py-3 text-sm">
                        {student.course?.courseName || "-"}
                      </td>
                      <td className="py-3 text-sm">
                        {student.teacher?.teacherName || "-"}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={getFeesBadgeVariant(student.feesStatus)}
                        >
                          {student.feesStatus}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge variant={getStatusBadgeVariant(student.status)}>
                          {student.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openView(student)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(student)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirm(student.id)}
                          >
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
                Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)}{" "}
                of {total}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? "Edit Student" : "Add Student"}
            </DialogTitle>
            <DialogDescription>
              {editingStudent
                ? "Update the student details below."
                : "Fill in the details to add a new student."}
            </DialogDescription>
          </DialogHeader>
          <StudentForm
            student={editingStudent}
            onSubmit={editingStudent ? handleUpdate : handleCreate}
            onCancel={() => {
              setDialogOpen(false);
              setEditingStudent(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {viewingStudent && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <p className="font-medium">{viewingStudent.studentName}</p>
              </div>
              <div>
                <Label>Phone</Label>
                <p className="font-medium">{viewingStudent.phone}</p>
              </div>
              <div>
                <Label>Course</Label>
                <p className="font-medium">
                  {viewingStudent.course?.courseName || "-"}
                </p>
              </div>
              <div>
                <Label>Teacher</Label>
                <p className="font-medium">
                  {viewingStudent.teacher?.teacherName || "-"}
                </p>
              </div>
              <div>
                <Label>Timing</Label>
                <p className="font-medium">{viewingStudent.timing}</p>
              </div>
              <div>
                <Label>Days</Label>
                <p className="font-medium">{viewingStudent.days}</p>
              </div>
              <div>
                <Label>Mode</Label>
                <p className="font-medium">{viewingStudent.mode}</p>
              </div>
              <div>
                <Label>Start Date</Label>
                <p className="font-medium">{viewingStudent.startDate}</p>
              </div>
              <div>
                <Label>End Date</Label>
                <p className="font-medium">{viewingStudent.endDate}</p>
              </div>
              <div>
                <Label>Fees Status</Label>
                <p className="font-medium">{viewingStudent.feesStatus}</p>
              </div>
              <div>
                <Label>Status</Label>
                <p className="font-medium">{viewingStudent.status}</p>
              </div>
              <div>
                <Label>Placement</Label>
                <p className="font-medium">{viewingStudent.placement}</p>
              </div>
              <div>
                <Label>Note</Label>
                <p className="font-medium">{viewingStudent.note || "-"}</p>
              </div>
              <div className="col-span-2">
                <Label>Remarks</Label>
                <p className="font-medium">{viewingStudent.remarks || "-"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this student? This action cannot
              be undone.
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
  );
}
