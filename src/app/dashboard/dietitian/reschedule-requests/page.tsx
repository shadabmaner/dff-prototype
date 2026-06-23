"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Calendar, Check, X, Clock, Search, RefreshCcw, AlertCircle, CheckCircle2, User, Download, Plus, AlertTriangle, Filter, TrendingUp } from "lucide-react"
import { toast } from "sonner"

interface RescheduleRequest {
  id: string
  patient: string
  currentSlot: string
  requestedSlot: string
  reason: string
  status: "pending" | "approved" | "rejected"
  requestedAt: string
  programStage: string
}

const mockRequests: RescheduleRequest[] = [
  {
    id: "1",
    patient: "Rahul Patil",
    currentSlot: "Mar 15, 2026 - 10:00 AM",
    requestedSlot: "Mar 16, 2026 - 2:00 PM",
    reason: "Work commitment conflict",
    status: "pending",
    requestedAt: "2 hours ago",
    programStage: "Month 2"
  },
  {
    id: "2",
    patient: "Priya Sharma",
    currentSlot: "Mar 14, 2026 - 3:00 PM",
    requestedSlot: "Mar 17, 2026 - 11:00 AM",
    reason: "Medical emergency",
    status: "pending",
    requestedAt: "5 hours ago",
    programStage: "Month 1"
  },
  {
    id: "3",
    patient: "Amit Kumar",
    currentSlot: "Mar 13, 2026 - 11:00 AM",
    requestedSlot: "Mar 14, 2026 - 4:00 PM",
    reason: "Family event",
    status: "approved",
    requestedAt: "1 day ago",
    programStage: "Month 3"
  },
]

export default function RescheduleRequestsPage() {
  const [requests, setRequests] = useState(mockRequests)
  const [selectedRequest, setSelectedRequest] = useState<RescheduleRequest | null>(null)
  const [showSuggestModal, setShowSuggestModal] = useState(false)
  const [suggestedSlot, setSuggestedSlot] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [timeFilter, setTimeFilter] = useState("this_week")
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [pendingActionRequest, setPendingActionRequest] = useState<RescheduleRequest | null>(null)

  const confirmApprove = () => {
    if (!pendingActionRequest) return
    setRequests(requests.map(req => 
      req.id === pendingActionRequest.id ? { ...req, status: "approved" as const } : req
    ))
    toast.success("Reschedule request approved")
    setShowApproveDialog(false)
    setPendingActionRequest(null)
  }

  const handleApprove = (request: RescheduleRequest) => {
    setPendingActionRequest(request)
    setShowApproveDialog(true)
  }

  const confirmReject = () => {
    if (!pendingActionRequest) return
    setRequests(requests.map(req => 
      req.id === pendingActionRequest.id ? { ...req, status: "rejected" as const } : req
    ))
    toast.error("Reschedule request rejected")
    setShowRejectDialog(false)
    setPendingActionRequest(null)
  }

  const handleReject = (request: RescheduleRequest) => {
    setPendingActionRequest(request)
    setShowRejectDialog(true)
  }

  const handleSuggestSlot = (request: RescheduleRequest) => {
    setSelectedRequest(request)
    setShowSuggestModal(true)
  }

  const submitSuggestedSlot = () => {
    if (!suggestedSlot) {
      toast.error("Please enter a suggested slot")
      return
    }
    toast.success("Suggested slot sent to patient")
    setShowSuggestModal(false)
    setSuggestedSlot("")
  }

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.patient.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || req.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const pendingCount = requests.filter(r => r.status === "pending").length
  const approvedCount = requests.filter(r => r.status === "approved").length
  const rejectedCount = requests.filter(r => r.status === "rejected").length
  const urgentCount = requests.filter(r => r.reason.toLowerCase().includes("urgent") || r.reason.toLowerCase().includes("emergency")).length
  const approvalRate = requests.length ? Math.round((approvedCount / requests.length) * 100) : 0
  const getInitials = (name: string) => name.split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase()

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">Clinic Portal / Appointments</p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Reschedule Requests</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">Review and manage appointment change requests with clinical precision.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 shadow-sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-md">
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by patient name, record ID, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 bg-white border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-900 rounded-lg"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as "all" | "pending" | "approved" | "rejected")}>
                  <SelectTrigger className="w-[160px] border-slate-300 bg-white h-11 rounded-lg hover:border-slate-400">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[150px] border-slate-300 bg-white h-11 rounded-lg hover:border-slate-400">
                  <SelectValue placeholder="This Week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 h-11 w-11 p-0 rounded-lg">
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-900 hover:to-slate-800 border-b-0">
                  <TableHead className="w-[40px] text-white/60"></TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Patient Details</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Current Slot</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Requested Slot</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Reason</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold">Status</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.15em] text-white/90 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center text-sm text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <AlertCircle className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="font-medium">No reschedule requests found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => {
                    const [currentDate, currentTime] = request.currentSlot.split(" - ")
                    const [requestedDate, requestedTime] = request.requestedSlot.split(" - ")

                    return (
                      <TableRow key={request.id} className="hover:bg-slate-50/80 border-b border-slate-100 transition-colors">
                        <TableCell className="text-slate-400 py-4">
                          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 text-white flex items-center justify-center text-xs font-bold shadow-md">
                              {getInitials(request.patient)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{request.patient}</p>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                <span className="font-medium">{request.programStage}</span>
                                <span className="text-slate-300">•</span>
                                <span>{request.requestedAt}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm">
                            <p className="font-semibold text-slate-900">{currentTime}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{currentDate}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm">
                            <p className="font-semibold text-slate-900">{requestedTime}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{requestedDate}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 max-w-xs">
                          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{request.reason}</p>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge className={`text-xs font-medium px-3 py-1 ${
                            request.status === "pending" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            request.status === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                            "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}>
                            {request.status === "pending" ? "Pending Review" : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right py-4">
                          {request.status === "pending" ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleApprove(request)}
                                className="h-9 w-9 border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 rounded-lg shadow-sm"
                                title="Approve"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleReject(request)}
                                className="h-9 w-9 border-rose-300 text-rose-600 hover:bg-rose-50 hover:border-rose-400 rounded-lg shadow-sm"
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleSuggestSlot(request)}
                                className="h-9 w-9 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 rounded-lg shadow-sm"
                                title="Suggest Slot"
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-amber-700 font-semibold">Active Requests</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{pendingCount}</p>
                <p className="text-xs text-amber-700/80 font-medium">Awaiting clinical review</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-700 font-semibold">Processed Today</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{approvedCount}</p>
                <p className="text-xs text-emerald-700/80 font-medium">{approvalRate}% approval rate</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-rose-700 font-semibold">Urgent Cases</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{urgentCount}</p>
                <p className="text-xs text-rose-700/80 font-medium">Require immediate attention</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Reschedule Request</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingActionRequest && (
                <span>
                  Are you sure you want to approve the reschedule request for <strong>{pendingActionRequest.patient}</strong>?
                  <br /><br />
                  New appointment time: <strong>{pendingActionRequest.requestedSlot}</strong>
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApprove} className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700">
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Reschedule Request</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingActionRequest && (
                <span>
                  Are you sure you want to reject the reschedule request for <strong>{pendingActionRequest.patient}</strong>?
                  <br /><br />
                  This action cannot be undone. The patient will be notified of the rejection.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReject} className="bg-rose-600 hover:bg-rose-700">
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suggest Slot Modal */}
      <Dialog open={showSuggestModal} onOpenChange={setShowSuggestModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suggest Alternative Slot</DialogTitle>
            <DialogDescription>
              Propose a different time slot for this appointment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedRequest && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-sm font-medium text-slate-900">Patient: {selectedRequest.patient}</p>
                <p className="text-xs text-slate-600 mt-1">Requested: {selectedRequest.requestedSlot}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Suggested Slot</Label>
              <Input
                type="datetime-local"
                value={suggestedSlot}
                onChange={(e) => setSuggestedSlot(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuggestModal(false)}>
              Cancel
            </Button>
            <Button onClick={submitSuggestedSlot} className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700">
              Send Suggestion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
