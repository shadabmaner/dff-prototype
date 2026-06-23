"use client"

import { useState } from "react"
import { AdminDashboardSkeleton } from "@/components/admin/admin-dashboard-skeleton"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Shield, Users, AlertTriangle, Activity, TrendingUp, Stethoscope, Briefcase, Megaphone, Layers3, Target, UserCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import { useAdminDashboard } from "@/hooks/use-admin-dashboard"

export default function AdminDashboardPage() {
  const [patientGrowthFilter, setPatientGrowthFilter] = useState<'today' | 'last_7_days' | 'last_30_days'>('last_7_days')
  const [revenueFilter, setRevenueFilter] = useState<'all_time' | 'today' | 'last_7_days' | 'last_30_days'>('all_time')

  const { data: dashboardData, isLoading, isError } = useAdminDashboard(
    { patientGrowthFilter, revenueFilter },
    { enabled: true }
  )

  if (isLoading) {
    return <AdminDashboardSkeleton />
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-rose-600">Unable to load dashboard</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-[var(--muted)] via-blue-50/30 to-[var(--muted)] rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-2xl">Monitor platform operations, user activity, and system performance.</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Select value={patientGrowthFilter} onValueChange={(value: any) => setPatientGrowthFilter(value)}>
              <SelectTrigger className="w-[160px] h-10">
                <SelectValue placeholder="Growth Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={revenueFilter} onValueChange={(value: any) => setRevenueFilter(value)}>
              <SelectTrigger className="w-[160px] h-10">
                <SelectValue placeholder="Revenue Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_time">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Active Users", value: dashboardData?.overview?.totalActiveUsers || 0, icon: Shield, color: "blue" },
          { label: "Total Patients", value: dashboardData?.overview?.totalPatients || 0, icon: Users, color: "emerald" },
          { label: "Total Leads", value: dashboardData?.overview?.totalLeads || 0, icon: Activity, color: "purple" },
          { label: "Active Staff", value: dashboardData?.overview?.activeStaffMembers || 0, icon: AlertTriangle, color: "amber" },
        ].map((k) => {
          const Icon = k.icon
          const bgColor = k.color === "blue" ? "from-blue-50 to-indigo-50" : k.color === "emerald" ? "from-emerald-50 to-teal-50" : k.color === "purple" ? "from-purple-50 to-violet-50" : "from-amber-50 to-orange-50"
          const iconColor = k.color === "blue" ? "text-blue-600" : k.color === "emerald" ? "text-emerald-600" : k.color === "purple" ? "text-purple-600" : "text-amber-600"
          const iconBg = k.color === "blue" ? "from-blue-500 to-indigo-500" : k.color === "emerald" ? "from-emerald-500 to-teal-500" : k.color === "purple" ? "from-purple-500 to-violet-500" : "from-amber-500 to-orange-500"
          const textColor = k.color === "blue" ? "text-blue-700" : k.color === "emerald" ? "text-emerald-700" : k.color === "purple" ? "text-purple-700" : "text-amber-700"
          return (
            <Card key={k.label} className={`border-0 bg-gradient-to-br ${bgColor} shadow-lg hover:shadow-xl transition-shadow overflow-hidden group`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={`h-3 w-3 ${iconColor}`} />
                      <p className={`text-[10px] uppercase tracking-[0.15em] ${textColor} font-semibold`}>{k.label}</p>
                    </div>
                    <p className="text-3xl font-bold text-[var(--foreground)] mb-2">{k.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Patient Growth & Age Distribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border border-[var(--border)] bg-[var(--card)] backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[var(--muted-foreground)]" />
                <h2 className="text-sm font-bold text-[var(--foreground)]">Patient Growth Trends</h2>
              </div>
              <Badge variant="outline" className="text-xs font-semibold border-emerald-300 text-emerald-700 bg-emerald-50">
                {dashboardData?.patientGrowth?.growthRate || 0}% Growth
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[320px] bg-[var(--muted)]/50 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData?.patientGrowth?.data || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="patientGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[var(--card)] p-3 rounded-lg shadow-lg border border-[var(--border)]">
                            <p className="text-xs font-semibold text-[var(--foreground)] mb-2">
                              {new Date(payload[0].payload.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="text-sm font-bold text-blue-600">Patients: {payload[0].value}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#patientGrad)"
                    fillOpacity={1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[var(--border)] bg-[var(--card)] backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-[var(--muted-foreground)]" />
              <h2 className="text-sm font-bold text-[var(--foreground)]">Age Distribution</h2>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[220px] bg-[var(--muted)]/50 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={dashboardData?.patientDemographics?.ageDistribution || []} 
                    dataKey="count" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={80} 
                    paddingAngle={5}
                  >
                    {dashboardData?.patientDemographics?.ageDistribution?.map((entry, index) => (
                      <Cell key={entry.range} fill={['#3b82f6', '#f97316', '#10b981', '#a855f7', '#f59e0b'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[var(--card)] p-3 rounded-lg shadow-lg border border-[var(--border)]">
                            <p className="text-xs font-semibold text-[var(--foreground)] mb-1">{payload[0].payload.range}</p>
                            <p className="text-sm font-bold text-[var(--foreground)]">{payload[0].value}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-6">
              {dashboardData?.patientDemographics?.ageDistribution?.map((age, index) => (
                <div key={age.range} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#3b82f6', '#f97316', '#10b981', '#a855f7', '#f59e0b'][index % 5] }} />
                    <p className="text-xs font-medium text-[var(--muted-foreground)]">{age.range}</p>
                  </div>
                  <p className="text-sm font-bold text-[var(--foreground)]">{age.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Distribution & Gender Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[var(--border)]/80 bg-[var(--card)]/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-[var(--foreground)]" />
              <h2 className="text-sm font-bold text-[var(--foreground)]">Location Distribution</h2>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[260px] bg-[var(--muted)]/50 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={dashboardData?.patientDemographics?.locationDistribution || []} 
                  barSize={18} 
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="city" tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)]/80 bg-[var(--card)]/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--foreground)]" />
              <h2 className="text-sm font-bold text-[var(--foreground)]">Gender Distribution</h2>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {dashboardData?.patientDemographics?.genderDistribution?.map((gender) => (
                <div key={gender.gender} className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                      {gender.gender.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm font-semibold text-[var(--foreground)] capitalize">{gender.gender}</p>
                  </div>
                  <Badge className="bg-white text-[var(--foreground)] border-[var(--border)] text-lg font-bold px-4 py-2">
                    {gender.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Knowledge Base */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[var(--border)]/80 bg-[var(--card)]/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[var(--foreground)]" />
                <h2 className="text-sm font-bold text-[var(--foreground)]">Revenue Breakdown</h2>
              </div>
              <Badge variant="outline" className="text-xs font-semibold border-indigo-300 text-indigo-700 bg-indigo-50">
                {revenueFilter === 'all_time' ? 'All Time' : revenueFilter === 'today' ? 'Today' : revenueFilter === 'last_7_days' ? 'Last 7 Days' : 'Last 30 Days'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <p className="text-xs text-[var(--muted-foreground)] mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-[var(--foreground)]">₹{(dashboardData?.revenue?.total || 0).toLocaleString()}</p>
              </div>
              <div className="space-y-3">
                {dashboardData?.revenue?.breakdown?.map((item) => (
                  <div key={item.source} className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)] capitalize">{item.source}</p>
                    </div>
                    <p className="text-lg font-bold text-indigo-600">₹{item.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)]/80 bg-[var(--card)]/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-[var(--foreground)]" />
              <h2 className="text-sm font-bold text-[var(--foreground)]">Knowledge Base</h2>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <p className="text-xs text-[var(--muted-foreground)] mb-1">Total Items</p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{dashboardData?.knowledgeBase?.totalItems || 0}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                <p className="text-xs text-[var(--muted-foreground)] mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{dashboardData?.knowledgeBase?.totalCourses || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Utilization */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[var(--border)]/80 bg-[var(--card)]/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-[var(--foreground)]" />
              <h2 className="text-sm font-bold text-[var(--foreground)]">Staff Patient Assignments</h2>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {dashboardData?.staffUtilization?.patientAssignments?.map((staff) => (
                <div key={staff.staffId} className="flex items-center justify-between gap-3 p-4 rounded-xl border border-[var(--border)] hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                  <div>
                    <p className="text-sm font-bold text-[var(--foreground)]">{staff.staffName}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{staff.patientCount} patients assigned</p>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    {staff.patientCount}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)]/80 bg-[var(--card)]/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--foreground)]" />
              <h2 className="text-sm font-bold text-[var(--foreground)]">Completed Consultations</h2>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {dashboardData?.staffUtilization?.completedConsultations?.map((staff) => (
                <div key={staff.staffId} className="flex items-center justify-between gap-3 p-4 rounded-xl border border-[var(--border)] hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                  <div>
                    <p className="text-sm font-bold text-[var(--foreground)]">{staff.staffName}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{staff.consultationCount} consultations</p>
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                    {staff.consultationCount}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Community Activity */}
      <Card className="border-[var(--border)]/80 bg-[var(--card)]/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardHeader className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-[var(--foreground)]" />
            <h2 className="text-sm font-bold text-[var(--foreground)]">Community Activity</h2>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <p className="text-xs text-[var(--muted-foreground)] mb-1">Total Posts</p>
              <p className="text-3xl font-bold text-[var(--foreground)]">{dashboardData?.communityActivity?.totalPosts || 0}</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-100">
              <p className="text-xs text-[var(--muted-foreground)] mb-1">Total Likes</p>
              <p className="text-3xl font-bold text-[var(--foreground)]">{dashboardData?.communityActivity?.totalLikes || 0}</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
              <p className="text-xs text-[var(--muted-foreground)] mb-1">Total Comments</p>
              <p className="text-3xl font-bold text-[var(--foreground)]">{dashboardData?.communityActivity?.totalComments || 0}</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
              <p className="text-xs text-[var(--muted-foreground)] mb-1">Total Shares</p>
              <p className="text-3xl font-bold text-[var(--foreground)]">{dashboardData?.communityActivity?.totalShares || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
