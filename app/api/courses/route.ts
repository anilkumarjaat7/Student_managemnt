import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const where = search
      ? { courseName: { contains: search } }
      : {}

    const [data, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.course.count({ where }),
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
    const { courseName, status } = body

    if (!courseName) {
      return NextResponse.json(
        { message: "Course name is required" },
        { status: 400 }
      )
    }

    const course = await prisma.course.create({
      data: { courseName, status: status || "active" },
    })

    return NextResponse.json(course, { status: 201 })
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
    const { id, courseName, status } = body

    if (!id || !courseName) {
      return NextResponse.json(
        { message: "ID and course name are required" },
        { status: 400 }
      )
    }

    const course = await prisma.course.update({
      where: { id },
      data: { courseName, status },
    })

    return NextResponse.json(course)
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

    await prisma.course.delete({ where: { id } })
    return NextResponse.json({ message: "Course deleted successfully" })
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}