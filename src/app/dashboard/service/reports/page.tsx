"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/service/stats-card"
import {
  BarChart,
  Users,
  IndianRupee,
  Activity,
  Download,
  FileText,
  TrendingUp,
  Calendar
} from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart as RechartsBarChart,
  Bar,
  LineChart,
  Line
} from "recharts"

const monthlyRevenue = [
  { month: "Oct", revenue: 450000, target: 400000 },
  { month: "Nov", revenue: 520000, target: 450000 },
  { month: "Dec", revenue: 480000, target: 500000 },
  { month: "Jan", revenue: 650000, target: 550000 },
  { month: "Feb", revenue: 710000, target: 600000 },
  { month: "Mar", revenue: 830000, target: 700000 },
]

const patientRetention = [
  { month: "Oct", active: 145, completed: 12 },
  { month: "Nov", active: 162, completed: 15 },
  { month: "Dec", active: 178, completed: 18 },
  { month: "Jan", active: 195, completed: 14 },
  { month: "Feb", active: 218, completed: 16 },
  { month: "Mar", active: 234, completed: 19 },
]

const staffProductivity = [
  { name: "Dr. Mehta", patients: 45, assessments: 120 },
  { name: "Dt. Sharma", patients: 52, assessments: 145 },
  { name: "Dr. Singh", patients: 38, assessments: 98 },
  { name: "Dt. Patel", patients: 41, assessments: 112 },
  { name: "Pt. Reddy", patients: 28, assessments: 85 },
]

export default function ReportsPage() {
  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            Service Operations / Reports & Analytics
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Reports & Analytics
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Comprehensive insights and performance metrics
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Date Range
            </Button>
            <Button className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg">
              <Download className="mr-2 h-4 w-4" />
              Export Reports
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Monthly Revenue"
          value="₹8.3L"
          subtitle="March 2026"
          icon={IndianRupee}
          colorScheme="emerald"
          trend={{ value: "+18%", positive: true }}
        />
        <StatsCard
          title="Active Patients"
          value="234"
          subtitle="Current enrollment"
          icon={Users}
          colorScheme="blue"
          trend={{ value: "+7%", positive: true }}
        />
        <StatsCard
          title="Retention Rate"
          value="92%"
          subtitle="Patient retention"
          icon={TrendingUp}
          colorScheme="purple"
          trend={{ value: "+3%", positive: true }}
        />
        <StatsCard
          title="Avg. Response Time"
          value="2.4h"
          subtitle="Service response"
          icon={Activity}
          colorScheme="amber"
          trend={{ value: "-15%", positive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">Revenue Trend (6 Months)</h2>
              </div>
              <Button variant="ghost" size="sm">
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] bg-gradient-to-br from-slate-50/50 to-blue-50/30 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                            <p className="text-xs font-semibold text-slate-700">{payload[0].payload.month}</p>
                            <p className="text-sm font-bold text-emerald-600">₹{(payload[0].value as number / 1000).toFixed(0)}K</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#94a3b8" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">Patient Retention</h2>
              </div>
              <Button variant="ghost" size="sm">
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] bg-gradient-to-br from-slate-50/50 to-blue-50/30 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={patientRetention}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }}
                  />
                  <Tooltip />
                  <Bar dataKey="active" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart className="h-4 w-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Staff Productivity</h2>
            </div>
            <Button variant="ghost" size="sm">
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[320px] bg-gradient-to-br from-slate-50/50 to-blue-50/30 rounded-xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={staffProductivity} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} width={100} />
                <Tooltip />
                <Bar dataKey="patients" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                <Bar dataKey="assessments" fill="#f59e0b" radius={[0, 8, 8, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="p-4 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">Operational Reports</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Pending Assessments Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Calls Completed Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Staff Productivity Report
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="p-4 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">Patient Reports</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Active Patients Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Program Performance
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Retention Analysis
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="p-4 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">Financial Reports</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Revenue by Program
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Payment Methods Analysis
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Refunds Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
