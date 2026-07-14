import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const where = search
      ? {
          OR: [
            { teacherName: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {}

    const [data, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.teacher.count({ where }),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teacherName, phone, status } = body

    if (!teacherName || !phone) {
      return NextResponse.json(
        { message: "Teacher name and phone are required" },
        { status: 400 }
      )
    }

    const teacher = await prisma.teacher.create({
      data: { teacherName, phone, status: status || "active" },
    })

    return NextResponse.json(teacher, { status: 201 })
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, teacherName, phone, status } = body

    if (!id || !teacherName || !phone) {
      return NextResponse.json(
        { message: "ID, teacher name, and phone are required" },
        { status: 400 }
      )
    }

    const teacher = await prisma.teacher.update({
      where: { id },
      data: { teacherName, phone, status },
    })

    return NextResponse.json(teacher)
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get("id") || "")

    if (!id) {
      return NextResponse.json(
        { message: "ID is required" },
        { status: 400 }
      )
    }

    await prisma.teacher.delete({ where: { id } })
    return NextResponse.json({ message: "Teacher deleted successfully" })
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}