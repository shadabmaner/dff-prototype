'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Activity, 
  Calendar, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  CheckCircle,
  Bell
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DashboardStats {
  assignedPatients: number
  pendingExercisePlans: number
  todaysFollowUps: number
  overdueFollowUps: number
}

interface RecentActivity {
  id: string
  patientName: string
  activity: string
  time: string
  type: 'exercise' | 'followup' | 'compliance'
}

export default function PhysiotherapistDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    assignedPatients: 0,
    pendingExercisePlans: 0,
    todaysFollowUps: 0,
    overdueFollowUps: 0
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('physio_token')
    if (!token) {
      router.push('/physiotherapist/login')
      return
    }

    // Load dashboard data
    loadDashboardData()
  }, [router])

  const loadDashboardData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      setStats({
        assignedPatients: 24,
        pendingExercisePlans: 8,
        todaysFollowUps: 6,
        overdueFollowUps: 3
      })

      setRecentActivities([
        {
          id: '1',
          patientName: 'John Smith',
          activity: 'Completed exercise plan',
          time: '2 hours ago',
          type: 'exercise'
        },
        {
          id: '2',
          patientName: 'Emma Wilson',
          activity: 'Follow-up session scheduled',
          time: '3 hours ago',
          type: 'followup'
        },
        {
          id: '3',
          patientName: 'Michael Brown',
          activity: 'Low compliance alert',
          time: '5 hours ago',
          type: 'compliance'
        },
        {
          id: '4',
          patientName: 'Sarah Davis',
          activity: 'Exercise plan updated',
          time: '1 day ago',
          type: 'exercise'
        }
      ])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWidgetClick = (filter: string) => {
    router.push(`/physiotherapist/patients?filter=${filter}`)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'exercise':
        return <Activity className="w-4 h-4 text-green-600" />
      case 'followup':
        return <Calendar className="w-4 h-4 text-blue-600" />
      case 'compliance':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your practice.</p>
      </div>

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          {
            id: 'assigned',
            title: 'Assigned Patients',
            subtitle: 'Active caseload',
            value: stats.assignedPatients,
            status: '+6%',
            statusTone: 'bg-blue-100 text-blue-700',
            icon: Users,
            iconTone: 'bg-blue-50 text-blue-600',
            accent: 'from-blue-50/80 to-white',
            progressTone: 'bg-blue-600',
            target: 40,
          },
          {
            id: 'pending-plans',
            title: 'Pending Exercise Plan Creation',
            subtitle: 'Awaiting assignment',
            value: stats.pendingExercisePlans,
            status: 'Queue',
            statusTone: 'bg-amber-100 text-amber-600',
            icon: Activity,
            iconTone: 'bg-amber-50 text-amber-600',
            accent: 'from-amber-50/80 to-white',
            progressTone: 'bg-amber-500',
            target: 12,
          },
          {
            id: 'today-followups',
            title: "Today's Follow-up Sessions",
            subtitle: 'Sessions scheduled',
            value: stats.todaysFollowUps,
            status: 'Scheduled',
            statusTone: 'bg-emerald-100 text-emerald-600',
            icon: Calendar,
            iconTone: 'bg-emerald-50 text-emerald-600',
            accent: 'from-emerald-50/80 to-white',
            progressTone: 'bg-emerald-500',
            target: 10,
          },
          {
            id: 'overdue',
            title: 'Overdue Follow-ups',
            subtitle: 'Need attention',
            value: stats.overdueFollowUps,
            status: 'Alert',
            statusTone: 'bg-rose-100 text-rose-600',
            icon: AlertTriangle,
            iconTone: 'bg-rose-50 text-rose-600',
            accent: 'from-rose-50/80 to-white',
            progressTone: 'bg-rose-500',
            target: 10,
          },
        ].map((widget) => {
          const Icon = widget.icon
          const progress = Math.min(100, Math.round((widget.value / widget.target) * 100))

          return (
            <button
              key={widget.id}
              onClick={() => handleWidgetClick(widget.id)}
              className={`relative w-full text-left rounded-2xl border border-slate-200 bg-gradient-to-br ${widget.accent} px-5 py-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-200`}
            >
              <div className="flex items-start justify-between">
                <div className={`h-12 w-12 rounded-2xl ${widget.iconTone} flex items-center justify-center text-lg font-semibold`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${widget.statusTone}`}>
                  {widget.status}
                </span>
              </div>
              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{widget.subtitle}</p>
                <div className="mt-2 text-4xl font-semibold text-slate-900">
                  {widget.value}
                </div>
                <p className="text-sm font-medium text-slate-600 mt-1">{widget.title}</p>
              </div>
              <div className="mt-5">
                <div className="h-1.5 rounded-full bg-white/70">
                  <div
                    className={`h-full rounded-full ${widget.progressTone}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest updates from your patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.patientName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {activity.activity}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => router.push('/physiotherapist/notifications')}
            >
              View All Activities
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you can perform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => router.push('/physiotherapist/patients')}
              >
                <Users className="w-6 h-6 mb-2" />
                <span className="text-sm">View Patients</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => router.push('/physiotherapist/exercise-plans')}
              >
                <Activity className="w-6 h-6 mb-2" />
                <span className="text-sm">Create Plan</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => router.push('/physiotherapist/follow-ups')}
              >
                <Calendar className="w-6 h-6 mb-2" />
                <span className="text-sm">Schedule Follow-up</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => router.push('/physiotherapist/notifications')}
              >
                <Bell className="w-6 h-6 mb-2" />
                <span className="text-sm">Notifications</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Compliance Overview
          </CardTitle>
          <CardDescription>
            Overall patient compliance trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">78%</div>
              <p className="text-sm text-gray-600">Average Compliance</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">92%</div>
              <p className="text-sm text-gray-600">Weekly Completion</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">15%</div>
              <p className="text-sm text-gray-600">Need Attention</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
