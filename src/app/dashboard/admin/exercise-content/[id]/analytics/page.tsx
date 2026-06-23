"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, TrendingUp, Users, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCollectionById, useCollectionPatientProgress } from "@/hooks/use-collections"
import type { CollectionPatientProgress } from "@/types/collection-api"
import Link from "next/link"

function StatsCard({ 
  icon: Icon, 
  label, 
  value, 
  trend 
}: { 
  icon: any
  label: string
  value: string | number
  trend?: string 
}) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
        </div>
        {trend && (
          <Badge variant="outline" className="text-green-600">
            {trend}
          </Badge>
        )}
      </div>
    </div>
  )
}

export default function CollectionAnalyticsPage() {
  const params = useParams()
  const collectionId = params.id as string

  const { data: collectionData, isLoading: collectionLoading } = useCollectionById(collectionId)
  const { data: progressData, isLoading: progressLoading } = useCollectionPatientProgress(collectionId)

  const collection = collectionData?.data
  const patients = progressData?.data || []

  const isLoading = collectionLoading || progressLoading

  const stats = React.useMemo(() => {
    if (!patients.length) {
      return {
        totalPatients: 0,
        avgProgress: 0,
        completedPatients: 0,
        activePatients: 0,
      }
    }

    const totalPatients = patients.length
    const avgProgress = Math.round(
      patients.reduce((sum, p) => sum + p.progress_percent, 0) / totalPatients
    )
    const completedPatients = patients.filter((p) => p.completed_count === p.total_items).length
    const activePatients = patients.filter(
      (p) => p.completed_count > 0 && p.completed_count < p.total_items
    ).length

    return {
      totalPatients,
      avgProgress,
      completedPatients,
      activePatients,
    }
  }, [patients])

  const getProgressColor = (percent: number) => {
    if (percent >= 75) return "text-green-600"
    if (percent >= 50) return "text-blue-600"
    if (percent >= 25) return "text-yellow-600"
    return "text-gray-600"
  }

  const getJourneyDayColor = (day: number) => {
    if (day >= 15) return "text-green-600"
    if (day >= 7) return "text-blue-600"
    return "text-gray-600"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500">Collection not found</p>
        <Link href="/dashboard/admin/exercise-content">
          <Button className="mt-4">Back to Collections</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <Link href={`/dashboard/admin/exercise-content/${collectionId}`}>
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Collection
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            Admin Portal / Content Management / Analytics
          </p>
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Collection Analytics</h1>
          <p className="text-sm text-slate-600 mt-2">{collection.name}</p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              icon={Users}
              label="Total Patients"
              value={stats.totalPatients}
            />
            <StatsCard
              icon={TrendingUp}
              label="Avg Progress"
              value={`${stats.avgProgress}%`}
            />
            <StatsCard
              icon={CheckCircle2}
              label="Completed"
              value={stats.completedPatients}
            />
            <StatsCard
              icon={Clock}
              label="Active"
              value={stats.activePatients}
            />
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-lg shadow-lg">
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Patient Progress Details</h2>
              <p className="text-sm text-slate-600 mt-1">
                Showing progress for {patients.length} patient{patients.length !== 1 ? "s" : ""}
              </p>
            </div>

            {patients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-slate-500">No patients enrolled in this collection yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 border-b border-slate-200">
                      <TableHead className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Patient</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Journey Day</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Progress</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Completed</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Last Activity</TableHead>
                      <TableHead className="text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-200">
                    {patients.map((patient) => (
                      <TableRow key={patient.patient_id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-semibold text-slate-900">
                          {patient.patient_name}
                          <p className="text-xs text-slate-500 mt-1">{patient.patient_id}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getJourneyDayColor(patient.journey_day)}>
                            Day {patient.journey_day}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Progress value={patient.progress_percent} className="w-24 h-2" />
                            <span className={`text-sm font-medium ${getProgressColor(patient.progress_percent)}`}>
                              {patient.progress_percent}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {patient.completed_count} / {patient.total_items}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {patient.last_activity_at ? (
                            <>
                              {new Date(patient.last_activity_at).toLocaleDateString()}
                              <br />
                              <span className="text-xs">
                                {new Date(patient.last_activity_at).toLocaleTimeString()}
                              </span>
                            </>
                          ) : (
                            "No activity"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/admin/patients/${patient.patient_id}/collection-progress`}>
                            <Button variant="outline" size="sm" className="text-slate-700 border-slate-300 hover:bg-slate-50">
                              View Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {patients.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-lg shadow-lg p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Progress Distribution</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-gray-900">
                    {patients.filter((p) => p.progress_percent === 0).length}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Not Started</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">
                    {patients.filter((p) => p.progress_percent > 0 && p.progress_percent < 50).length}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">In Progress (0-50%)</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-3xl font-bold text-yellow-600">
                    {patients.filter((p) => p.progress_percent >= 50 && p.progress_percent < 100).length}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">In Progress (50-99%)</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">
                    {patients.filter((p) => p.progress_percent === 100).length}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Completed</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  )
}
