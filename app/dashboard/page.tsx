"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, Users, GraduationCap } from "lucide-react"
import axios from "axios"

interface DashboardStats {
  totalStudents: number
  totalCourses: number
  totalTeachers: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, coursesRes, teachersRes] = await Promise.all([
          axios.get("/api/students?limit=1"),
          axios.get("/api/courses?limit=1"),
          axios.get("/api/teachers?limit=1"),
        ])
        setStats({
          totalStudents: studentsRes.data.total || 0,
          totalCourses: coursesRes.data.total || 0,
          totalTeachers: teachersRes.data.total || 0,
        })
      } catch {
        setStats({ totalStudents: 0, totalCourses: 0, totalTeachers: 0 })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const cards = [
    {
      title: "Total Students",
      value: stats?.totalStudents ?? 0,
      icon: GraduationCap,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Total Courses",
      value: stats?.totalCourses ?? 0,
      icon: BookOpen,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/20",
    },
    {
      title: "Total Teachers",
      value: stats?.totalTeachers ?? 0,
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/20",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your student management system</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold">{card.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}