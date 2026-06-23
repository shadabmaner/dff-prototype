'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bell, 
  Check, 
  X, 
  User, 
  Activity, 
  Calendar,
  AlertTriangle,
  TrendingDown,
  Clock,
  Filter,
  Archive,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Notification {
  id: string
  type: 'patient_assigned' | 'exercise_plan_pending' | 'upcoming_followup' | 'low_compliance' | 'missed_consultation' | 'system'
  title: string
  message: string
  patientId?: string
  patientName?: string
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  actionUrl?: string
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'patient_assigned',
    title: 'New Patient Assigned',
    message: 'John Smith (PT001) has been assigned to your care. Please review their medical history and create an initial exercise plan.',
    patientId: 'PT001',
    patientName: 'John Smith',
    timestamp: '2026-03-04T09:30:00Z',
    read: false,
    priority: 'high',
    actionUrl: '/physiotherapist/patients/PT001'
  },
  {
    id: '2',
    type: 'low_compliance',
    title: 'Low Compliance Alert',
    message: 'Michael Brown (PT003) has shown compliance below 50% for the past 3 days. Immediate attention recommended.',
    patientId: 'PT003',
    patientName: 'Michael Brown',
    timestamp: '2026-03-04T08:15:00Z',
    read: false,
    priority: 'urgent',
    actionUrl: '/physiotherapist/patients/PT003'
  },
  {
    id: '3',
    type: 'upcoming_followup',
    title: 'Follow-up Reminder',
    message: 'You have a follow-up session with Emma Wilson (PT002) today at 11:30 AM.',
    patientId: 'PT002',
    patientName: 'Emma Wilson',
    timestamp: '2026-03-04T07:00:00Z',
    read: true,
    priority: 'medium',
    actionUrl: '/physiotherapist/follow-ups'
  },
  {
    id: '4',
    type: 'exercise_plan_pending',
    title: 'Exercise Plan Pending',
    message: 'Sarah Davis (PT004) is ready for their next exercise plan phase. Please create and assign the new plan.',
    patientId: 'PT004',
    patientName: 'Sarah Davis',
    timestamp: '2026-03-03T16:45:00Z',
    read: true,
    priority: 'high',
    actionUrl: '/physiotherapist/exercise-plans'
  },
  {
    id: '5',
    type: 'missed_consultation',
    title: 'Missed Consultation',
    message: 'Sarah Davis (PT004) missed their scheduled consultation yesterday. Please reschedule.',
    patientId: 'PT004',
    patientName: 'Sarah Davis',
    timestamp: '2026-03-03T15:30:00Z',
    read: true,
    priority: 'medium',
    actionUrl: '/physiotherapist/follow-ups'
  },
  {
    id: '6',
    type: 'system',
    title: 'System Maintenance',
    message: 'The system will be under maintenance on March 10, 2026, from 2:00 AM to 4:00 AM EST.',
    timestamp: '2026-03-03T10:00:00Z',
    read: true,
    priority: 'low'
  },
  {
    id: '7',
    type: 'patient_assigned',
    title: 'New Patient Assigned',
    message: 'Robert Johnson (PT005) has been assigned to your care for post-surgery rehabilitation.',
    patientId: 'PT005',
    patientName: 'Robert Johnson',
    timestamp: '2026-03-02T14:20:00Z',
    read: true,
    priority: 'high',
    actionUrl: '/physiotherapist/patients/PT005'
  }
]

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('physio_token')
    if (!token) {
      router.push('/physiotherapist/login')
      return
    }

    loadNotifications()
  }, [router])

  const loadNotifications = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filter === 'all' || notification.type === filter
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter
    return matchesType && matchesPriority
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'patient_assigned':
        return <User className="w-5 h-5 text-blue-600" />
      case 'exercise_plan_pending':
        return <Activity className="w-5 h-5 text-orange-600" />
      case 'upcoming_followup':
        return <Calendar className="w-5 h-5 text-green-600" />
      case 'low_compliance':
        return <TrendingDown className="w-5 h-5 text-red-600" />
      case 'missed_consultation':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'system':
        return <Bell className="w-5 h-5 text-gray-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'low': 'secondary',
      'medium': 'outline',
      'high': 'default',
      'urgent': 'destructive'
    }
    return <Badge variant={variants[priority] || 'default'}>{priority}</Badge>
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    }
  }

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([])
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id)
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  const getNotificationStats = () => {
    const total = notifications.length
    const unread = notifications.filter(n => !n.read).length
    const urgent = notifications.filter(n => n.priority === 'urgent' && !n.read).length
    const high = notifications.filter(n => n.priority === 'high' && !n.read).length
    
    return { total, unread, urgent, high }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const stats = getNotificationStats()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">Stay updated with important alerts and updates</p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Mark All as Read
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Archive className="w-4 h-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleClearAll}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All time notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
            <p className="text-xs text-muted-foreground">
              Immediate action needed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
            <p className="text-xs text-muted-foreground">
              Important notifications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="patient_assigned">Patient Assigned</SelectItem>
                <SelectItem value="exercise_plan_pending">Exercise Plan Pending</SelectItem>
                <SelectItem value="upcoming_followup">Upcoming Follow-up</SelectItem>
                <SelectItem value="low_compliance">Low Compliance</SelectItem>
                <SelectItem value="missed_consultation">Missed Consultation</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setFilter('all')
                setPriorityFilter('all')
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No notifications found</p>
                <p className="text-sm text-gray-500 mt-2">
                  {filter !== 'all' || priorityFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'You\'re all caught up!'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    relative p-4 rounded-lg border transition-all cursor-pointer
                    ${notification.read 
                      ? 'bg-white border-gray-200 hover:bg-gray-50' 
                      : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                    }
                  `}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`
                          text-sm font-medium truncate
                          ${notification.read ? 'text-gray-900' : 'text-blue-900'}
                        `}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2 ml-4">
                          {getPriorityBadge(notification.priority)}
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      {notification.patientName && (
                        <p className="text-xs text-gray-500 mt-2">
                          Patient: {notification.patientName} ({notification.patientId})
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkAsRead(notification.id)
                          }}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteNotification(notification.id)
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-lg"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
