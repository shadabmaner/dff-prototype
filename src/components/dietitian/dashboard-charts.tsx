"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts"

const weightProgressData = [
  { month: "Jan", avgLoss: 2.5 },
  { month: "Feb", avgLoss: 3.2 },
  { month: "Mar", avgLoss: 4.1 },
  { month: "Apr", avgLoss: 3.8 },
  { month: "May", avgLoss: 4.5 },
  { month: "Jun", avgLoss: 5.2 },
]

const adherenceData = [
  { day: "Mon", rate: 85 },
  { day: "Tue", rate: 88 },
  { day: "Wed", rate: 82 },
  { day: "Thu", rate: 90 },
  { day: "Fri", rate: 87 },
  { day: "Sat", rate: 84 },
  { day: "Sun", rate: 86 },
]

const programStageData = [
  { name: "Month 1", value: 45, color: "#3b82f6" },
  { name: "Month 2", value: 35, color: "#10b981" },
  { name: "Month 3", value: 20, color: "#8b5cf6" },
]

const appointmentTrendData = [
  { month: "Jan", count: 45 },
  { month: "Feb", count: 52 },
  { month: "Mar", count: 48 },
  { month: "Apr", count: 61 },
  { month: "May", count: 55 },
  { month: "Jun", count: 67 },
]

export function WeightProgressChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Patient Weight Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weightProgressData}>
            <XAxis dataKey="month" stroke="#888888" fontSize={12} />
            <YAxis stroke="#888888" fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="avgLoss" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function AdherenceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Diet Adherence Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={adherenceData}>
            <XAxis dataKey="day" stroke="#888888" fontSize={12} />
            <YAxis stroke="#888888" fontSize={12} />
            <Tooltip />
            <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function ProgramStageChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Program Stage Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={programStageData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {programStageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function AppointmentTrendChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Monthly Appointment Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={appointmentTrendData}>
            <XAxis dataKey="month" stroke="#888888" fontSize={12} />
            <YAxis stroke="#888888" fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
