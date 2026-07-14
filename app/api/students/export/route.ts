import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import ExcelJS from "exceljs"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const phone = searchParams.get("phone") || ""
    const courseId = searchParams.get("courseId") || ""
    const teacherId = searchParams.get("teacherId") || ""
    const status = searchParams.get("status") || ""
    const feesStatus = searchParams.get("feesStatus") || ""
    const mode = searchParams.get("mode") || ""

    const where: Record<string, unknown> = {}

    if (search && search !== "all") where.studentName = { contains: search }
    if (phone && phone !== "all") where.phone = { contains: phone }
    if (courseId && courseId !== "all") where.courseId = parseInt(courseId)
    if (teacherId && teacherId !== "all") where.teacherId = parseInt(teacherId)
    if (status && status !== "all") where.status = status
    if (feesStatus && feesStatus !== "all") where.feesStatus = feesStatus
    if (mode && mode !== "all") where.mode = mode

    const students = await prisma.student.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        course: true,
        teacher: true,
      },
    })

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Students")

    worksheet.columns = [
      { header: "Student Name", key: "studentName", width: 25 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Course", key: "course", width: 20 },
      { header: "Teacher", key: "teacher", width: 20 },
      { header: "Batch", key: "batchId", width: 15 },
      { header: "Timing", key: "timing", width: 20 },
      { header: "Days", key: "days", width: 15 },
      { header: "Mode", key: "mode", width: 12 },
      { header: "Start Date", key: "startDate", width: 15 },
      { header: "End Date", key: "endDate", width: 15 },
      { header: "Fees Status", key: "feesStatus", width: 15 },
      { header: "Status", key: "status", width: 12 },
      { header: "Placement", key: "placement", width: 12 },
      { header: "Remarks", key: "remarks", width: 25 },
    ]

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    }

    students.forEach((student: { studentName: string; phone: string; course?: { courseName: string } | null; teacher?: { teacherName: string } | null; batchId: string; timing: string; days: string; mode: string; startDate: string; endDate: string; feesStatus: string; status: string; placement: string; remarks: string }) => {
      worksheet.addRow({
        studentName: student.studentName,
        phone: student.phone,
        course: student.course?.courseName || "",
        teacher: student.teacher?.teacherName || "",
        batchId: student.batchId,
        timing: student.timing,
        days: student.days,
        mode: student.mode,
        startDate: student.startDate,
        endDate: student.endDate,
        feesStatus: student.feesStatus,
        status: student.status,
        placement: student.placement,
        remarks: student.remarks,
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="students_export_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    })
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}