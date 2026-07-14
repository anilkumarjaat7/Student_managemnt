import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const phone = searchParams.get("phone") || "";
    const courseId = searchParams.get("courseId") || "";
    const teacherId = searchParams.get("teacherId") || "";
    const status = searchParams.get("status") || "";
    const feesStatus = searchParams.get("feesStatus") || "";
    const mode = searchParams.get("mode") || "";

    const where: Record<string, unknown> = {};

    if (search && search !== "all") {
      where.studentName = { contains: search };
    }
    if (phone && phone !== "all") {
      where.phone = { contains: phone };
    }
    if (courseId && courseId !== "all") {
      where.courseId = parseInt(courseId);
    }
    if (teacherId && teacherId !== "all") {
      where.teacherId = parseInt(teacherId);
    }
    if (status && status !== "all") {
      where.status = status;
    }
    if (feesStatus && feesStatus !== "all") {
      where.feesStatus = feesStatus;
    }
    if (mode && mode !== "all") {
      where.mode = mode;
    }

    const [data, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          course: true,
          teacher: true,
        },
      }),
      prisma.student.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Students API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      studentName,
      phone,
      courseId,
      teacherId,
      batchId,
      timing,
      days,
      mode,
      startDate,
      endDate,
      feesStatus,
      status,
      placement,
      note,
      remarks,
    } = body;

    if (!studentName || !phone || !courseId || !teacherId) {
      return NextResponse.json(
        { message: "Required fields missing" },
        { status: 400 },
      );
    }

    const student = await prisma.student.create({
      data: {
        studentName,
        phone,
        courseId,
        teacherId,
        batchId: batchId || "",
        timing: timing || "",
        days: days || "",
        mode: mode || "",
        startDate: startDate || "",
        endDate: endDate || "",
        feesStatus: feesStatus || "pending",
        status: status || "active",
        placement: placement || "no",
        note: note || "",
        remarks: remarks || "",
      },
      include: {
        course: true,
        teacher: true,
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      studentName,
      phone,
      courseId,
      teacherId,
      batchId,
      timing,
      days,
      mode,
      startDate,
      endDate,
      feesStatus,
      status,
      placement,
      note,
      remarks,
    } = body;

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        studentName,
        phone,
        courseId,
        teacherId,
        batchId,
        timing,
        days,
        mode,
        startDate,
        endDate,
        feesStatus,
        status,
        placement,
        note,
        remarks,
      },
      include: {
        course: true,
        teacher: true,
      },
    });

    return NextResponse.json(student);
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "");

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    await prisma.student.delete({ where: { id } });
    return NextResponse.json({ message: "Student deleted successfully" });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
