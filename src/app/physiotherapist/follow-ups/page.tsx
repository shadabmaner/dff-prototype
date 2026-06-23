'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Calendar,
  Clock,
  Video,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FollowUpSession {
  id: string
  patientId: string
  patientName: string
  scheduledDate: string
  scheduledTime: string
  duration: number
  type: 'video' | 'in-person' | 'phone'
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  sessionNotes?: string
  videoLink?: string
  reminderSent: boolean
  createdAt: string
}

interface FollowUpForm {
  patientId: string
  scheduledDate: string
  scheduledTime: string
  duration: number
  type: 'video' | 'in-person' | 'phone'
  notes: string
}

const mockFollowUpSessions: FollowUpSession[] = [
  {
    id: '1',
    patientId: 'PT001',
    patientName: 'John Smith',
    scheduledDate: '2026-03-04',
    scheduledTime: '10:00 AM',
    duration: 30,
    type: 'video',
    status: 'scheduled',
    notes: 'Weekly progress check',
    videoLink: 'https://zoom.us/j/123456789',
    reminderSent: true,
    createdAt: '2026-03-01'
  },
  {
    id: '2',
    patientId: 'PT002',
    patientName: 'Emma Wilson',
    scheduledDate: '2026-03-04',
    scheduledTime: '11:30 AM',
    duration: 45,
    type: 'in-person',
    status: 'scheduled',
    notes: 'Exercise plan review and adjustment',
    reminderSent: true,
    createdAt: '2026-03-01'
  },
  {
    id: '3',
    patientId: 'PT003',
    patientName: 'Michael Brown',
    scheduledDate: '2026-03-03',
    scheduledTime: '2:00 PM',
    duration: 30,
    type: 'phone',
    status: 'completed',
    sessionNotes: 'Patient reported increased pain. Recommended rest for 2 days and ice therapy.',
    reminderSent: true,
    createdAt: '2026-02-28'
  },
  {
    id: '4',
    patientId: 'PT004',
    patientName: 'Sarah Davis',
    scheduledDate: '2026-03-02',
    scheduledTime: '3:00 PM',
    duration: 30,
    type: 'video',
    status: 'no-show',
    notes: 'Initial consultation',
    reminderSent: true,
    createdAt: '2026-02-27'
  },
  {
    id: '5',
    patientId: 'PT005',
    patientName: 'Robert Johnson',
    scheduledDate: '2026-03-05',
    scheduledTime: '9:00 AM',
    duration: 60,
    type: 'in-person',
    status: 'scheduled',
    notes: 'Final assessment and program completion',
    reminderSent: false,
    createdAt: '2026-03-02'
  }
]

const mockPatients = [
  { id: 'PT001', name: 'John Smith' },
  { id: 'PT002', name: 'Emma Wilson' },
  { id: 'PT003', name: 'Michael Brown' },
  { id: 'PT004', name: 'Sarah Davis' },
  { id: 'PT005', name: 'Robert Johnson' }
]

export default function FollowUpManagement() {
  const router = useRouter()
  const [sessions, setSessions] = useState<FollowUpSession[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<FollowUpSession | null>(null)
  const [sessionNotes, setSessionNotes] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [formData, setFormData] = useState<FollowUpForm>({
    patientId: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 30,
    type: 'video',
    notes: ''
  })

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('physio_token')
    if (!token) {
      router.push('/physiotherapist/login')
      return
    }

    loadFollowUpSessions()
  }, [router])

  const loadFollowUpSessions = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSessions(mockFollowUpSessions)
    } catch (error) {
      console.error('Failed to load follow-up sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = !searchTerm || 
      session.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.patientId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || session.status === statusFilter
    
    let matchesDate = true
    if (dateFilter) {
      const today = new Date()
      const sessionDate = new Date(session.scheduledDate)
      
      switch (dateFilter) {
        case 'today':
          matchesDate = sessionDate.toDateString() === today.toDateString()
          break
        case 'week':
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
          matchesDate = sessionDate >= today && sessionDate <= weekFromNow
          break
        case 'overdue':
          matchesDate = sessionDate < today && session.status === 'scheduled'
          break
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'scheduled': 'default',
      'in-progress': 'secondary',
      'completed': 'outline',
      'cancelled': 'destructive',
      'no-show': 'destructive'
    }
    const colors: Record<string, string> = {
      'scheduled': 'text-blue-600',
      'in-progress': 'text-yellow-600',
      'completed': 'text-green-600',
      'cancelled': 'text-red-600',
      'no-show': 'text-red-600'
    }
    
    return (
      <Badge variant={variants[status] || 'default'} className={colors[status]}>
        {status.replace('-', ' ')}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />
      case 'in-person':
        return <Calendar className="w-4 h-4" />
      case 'phone':
        return <MessageSquare className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const handleCreateSession = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newSession: FollowUpSession = {
        id: Date.now().toString(),
        ...formData,
        patientName: mockPatients.find(p => p.id === formData.patientId)?.name || '',
        status: 'scheduled',
        reminderSent: false,
        createdAt: new Date().toISOString().split('T')[0]
      }
      
      setSessions(prev => [newSession, ...prev])
      setIsCreateDialogOpen(false)
      setFormData({
        patientId: '',
        scheduledDate: '',
        scheduledTime: '',
        duration: 30,
        type: 'video',
        notes: ''
      })
    } catch (error) {
      console.error('Failed to create follow-up session:', error)
    }
  }

  const handleJoinSession = (session: FollowUpSession) => {
    if (session.type === 'video' && session.videoLink) {
      // In real app, this would open the video conference
      window.open(session.videoLink, '_blank')
    } else {
      // Mark as in-progress for in-person or phone
      setSessions(prev => prev.map(s => 
        s.id === session.id ? { ...s, status: 'in-progress' as const } : s
      ))
    }
  }

  const handleCompleteSession = (session: FollowUpSession) => {
    setSelectedSession(session)
    setSessionNotes(session.sessionNotes || '')
    setIsNotesDialogOpen(true)
  }

  const handleSaveSessionNotes = async () => {
    if (!selectedSession) return
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSessions(prev => prev.map(s => 
        s.id === selectedSession.id 
          ? { ...s, status: 'completed' as const, sessionNotes } 
          : s
      ))
      
      setIsNotesDialogOpen(false)
      setSelectedSession(null)
      setSessionNotes('')
    } catch (error) {
      console.error('Failed to save session notes:', error)
    }
  }

  const handleCancelSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to cancel this session?')) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setSessions(prev => prev.map(s => 
          s.id === sessionId ? { ...s, status: 'cancelled' as const } : s
        ))
      } catch (error) {
        console.error('Failed to cancel session:', error)
      }
    }
  }

  const getSessionStats = () => {
    const today = new Date().toISOString().split('T')[0]
    const todaySessions = sessions.filter(s => s.scheduledDate === today)
    const scheduled = sessions.filter(s => s.status === 'scheduled')
    const completed = sessions.filter(s => s.status === 'completed')
    const overdue = sessions.filter(s => 
      new Date(s.scheduledDate) < new Date() && s.status === 'scheduled'
    )
    
    return {
      today: todaySessions.length,
      scheduled: scheduled.length,
      completed: completed.length,
      overdue: overdue.length
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const stats = getSessionStats()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Follow-up Sessions</h1>
          <p className="text-gray-600 mt-2">Schedule and manage patient follow-up consultations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Schedule Follow-up</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Follow-up</DialogTitle>
              <DialogDescription>
                Set up a consultation session with a patient
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient</Label>
                <Select 
                  value={formData.patientId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} ({patient.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Select 
                    value={formData.duration.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, duration: Number(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: 'video' | 'in-person' | 'phone') => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Call</SelectItem>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Purpose of the follow-up session"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSession}>
                  Schedule Session
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled for today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduled}</div>
            <p className="text-xs text-muted-foreground">
              Upcoming sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by patient name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Date Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setStatusFilter('')
                  setDateFilter('')
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Follow-up Sessions</CardTitle>
          <CardDescription>
            Showing {filteredSessions.length} of {sessions.length} sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{session.patientName}</div>
                        <div className="text-sm text-gray-500">{session.patientId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{session.scheduledDate}</div>
                        <div className="text-sm text-gray-500">{session.scheduledTime}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(session.type)}
                        <span className="capitalize">{session.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{session.duration} min</TableCell>
                    <TableCell>{getStatusBadge(session.status)}</TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-600 truncate">
                          {session.notes || session.sessionNotes || '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {session.status === 'scheduled' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleJoinSession(session)}
                            >
                              Join
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCompleteSession(session)}
                            >
                              Complete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelSession(session.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {session.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSession(session)
                              setSessionNotes(session.sessionNotes || '')
                              setIsNotesDialogOpen(true)
                            }}
                          >
                            View Notes
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Session Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedSession?.status === 'completed' ? 'Session Notes' : 'Complete Session'}
            </DialogTitle>
            <DialogDescription>
              {selectedSession?.patientName} - {selectedSession?.scheduledDate}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionNotes">Session Notes</Label>
              <Textarea
                id="sessionNotes"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Enter session notes, observations, and recommendations..."
                rows={6}
                disabled={selectedSession?.status === 'completed'}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
                {selectedSession?.status === 'completed' ? 'Close' : 'Cancel'}
              </Button>
              {selectedSession?.status !== 'completed' && (
                <Button onClick={handleSaveSessionNotes}>
                  Complete Session
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
