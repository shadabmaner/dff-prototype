"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { useLeads } from "@/hooks/use-leads"
import { TelecallerLeadsTable } from "@/components/sales/telecaller-leads-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Phone, Clock, CheckCircle, AlertCircle, Calendar, LayoutGrid, Search, Filter, CalendarDays, X } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"

export default function TelecallerAssignedLeadsPage() {
  const searchParams = useSearchParams()
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)
  
  // Get URL parameters for date filtering
  const registrationDateFrom = searchParams?.get('registrationDateFrom') || undefined
  const registrationDateTo = searchParams?.get('registrationDateTo') || undefined
  
  const { data: leadsData, isLoading, error } = useLeads({ 
    page, 
    limit: pageSize,
    registrationDateFrom,
    registrationDateTo
  })
  const leads = leadsData?.leads || []
  const paginationMeta = leadsData?.meta
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [campaignFilter, setCampaignFilter] = React.useState("all")
  
  // Date filter state
  const [registrationDateRange, setRegistrationDateRange] = React.useState<{ from: Date | undefined; to: Date | undefined }>({ 
    from: registrationDateFrom ? new Date(registrationDateFrom) : undefined, 
    to: registrationDateTo ? new Date(registrationDateTo) : undefined
  })
  const [tempDateRange, setTempDateRange] = React.useState<{ from: Date | undefined; to: Date | undefined }>({ 
    from: registrationDateFrom ? new Date(registrationDateFrom) : undefined, 
    to: registrationDateTo ? new Date(registrationDateTo) : undefined
  })
  const [dateRangeOpen, setDateRangeOpen] = React.useState(false)
  const [dateFilter, setDateFilter] = React.useState<string>("")

  // Status options matching sales leads page
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "new", label: "New Lead" },
    { value: "not_connected", label: "Not Connected" },
    { value: "connected", label: "Connected" },
    { value: "follow_up_required", label: "Follow-up Required" },
    { value: "interested", label: "Interested" },
    { value: "not_interested", label: "Not-Interested" },
    { value: "assessment_paid", label: "Assessment Paid" },
    { value: "assessment_done", label: "Assessment Done" },
    { value: "converted", label: "Converted" },
  ]

  // Update URL parameters for date filtering
  const updateURLParams = React.useCallback((filters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    const newUrl = `${window.location.pathname}?${params.toString()}`
    if (typeof window !== "undefined") {
      window.history.replaceState(null, '', newUrl)
    }
  }, [searchParams])
  
  const handleDateRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      setTempDateRange({ from: range.from, to: range.to })
    } else {
      setTempDateRange({ from: undefined, to: undefined })
    }
  }
  
  const applyDateFilter = () => {
    setRegistrationDateRange(tempDateRange)
    updateURLParams({ 
      registrationDateFrom: tempDateRange.from ? tempDateRange.from.toISOString().split('T')[0] : '', 
      registrationDateTo: tempDateRange.to ? tempDateRange.to.toISOString().split('T')[0] : '' 
    })
  }
  // TODO: Filter by assigned telecaller (need to get current user info)
  const myLeads = React.useMemo(() => {
    // For now, return all leads. Later filter by assignedTo === currentUserId
    return leads
  }, [leads])
  
  // Filter leads based on date range
  const filteredLeadsByDate = React.useMemo(() => {
    if (!registrationDateRange.from && !registrationDateRange.to) {
      return myLeads
    }
    
    return myLeads.filter((lead) => {
      if (!lead.created_at) return false
      
      const leadDate = new Date(lead.created_at)
      const fromDate = registrationDateRange.from
      const toDate = registrationDateRange.to
      
      if (fromDate && toDate) {
        const startOfDay = new Date(fromDate)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(toDate)
        endOfDay.setHours(23, 59, 59, 999)
        
        return leadDate >= startOfDay && leadDate <= endOfDay
      } else if (fromDate) {
        const startOfDay = new Date(fromDate)
        startOfDay.setHours(0, 0, 0, 0)
        return leadDate >= startOfDay
      } else if (toDate) {
        const endOfDay = new Date(toDate)
        endOfDay.setHours(23, 59, 59, 999)
        return leadDate <= endOfDay
      }
      
      return true
    })
  }, [myLeads, registrationDateRange])

  const campaignOptions = React.useMemo(() => {
    const options = new Set<string>()
    const hardcodedCampaigns = [
      "Webinar - Diabetes Care",
      "Campaign - Ortho Pain",
      "Webinar - Cardio",
      "Campaign - Weight Loss",
      "Social Media - Health Tips",
      "Email Campaign - Nutrition",
    ]
    hardcodedCampaigns.forEach(campaign => options.add(campaign))
    leads.forEach((lead) => {
      if (lead.campaign) {
        options.add(lead.campaign)
      }
    })
    return Array.from(options)
  }, [leads])

  const filteredLeads = React.useMemo(() => {
    const trimmedSearchTerm = searchTerm.trim()
    
    return filteredLeadsByDate.filter((lead) => {
      const matchesSearch = trimmedSearchTerm
        ? [lead.patientName, lead.phone, lead.email]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(trimmedSearchTerm.toLowerCase()))
        : true

      const matchesStatus = statusFilter === "all"
        ? true
        : (() => {
            const leadStatus = lead.status || lead.stage || ""
            
            switch (statusFilter) {
              case "new":
                return leadStatus === "NEW" || leadStatus === "UNASSIGNED"
              case "not_connected":
                return leadStatus.toLowerCase() === "not_connected" || 
                       leadStatus.toLowerCase() === "not_answered" || 
                       leadStatus.toLowerCase() === "no_response" || 
                       leadStatus.toLowerCase() === "busy" || 
                       leadStatus.toLowerCase() === "wrong_number"
              case "connected":
                return leadStatus.toLowerCase() === "connected"
              case "follow_up_required":
                return leadStatus.toLowerCase() === "follow_up_required" || 
                       leadStatus.toLowerCase() === "call_back_requested" || 
                       leadStatus === "FOLLOW_UP"
              case "interested":
                return leadStatus.toLowerCase() === "interested"
              case "not_interested":
                return leadStatus.toLowerCase() === "not_interested"
              case "assessment_paid":
                return leadStatus.toLowerCase() === "assessment_paid"
              case "assessment_done":
                return leadStatus.toLowerCase() === "assessment_done"
              case "converted":
                return leadStatus === "CONVERTED"
              default:
                return leadStatus === statusFilter
            }
          })()

      const matchesCampaign = campaignFilter === "all"
        ? true
        : lead.campaign === campaignFilter

      return matchesSearch && matchesStatus && matchesCampaign
    })
  }, [filteredLeadsByDate, searchTerm, statusFilter, campaignFilter])

  const stats = React.useMemo(() => ({
    total: myLeads.length,
    pending: myLeads.filter(lead => 
      lead.stage === "UNASSIGNED" || lead.stage === "NEW"
    ).length,
    followup: myLeads.filter(lead => 
      lead.nextFollowUpAt && new Date(lead.nextFollowUpAt) <= new Date()
    ).length,
    completed: myLeads.filter(lead => 
      lead.stage === "CONVERTED" || lead.stage === "DROPPED"
    ).length,
  }), [myLeads])

  const handlePageChange = React.useCallback((nextPage: number) => {
    if (!paginationMeta) return
    const clamped = Math.min(Math.max(nextPage, 1), paginationMeta.totalPages || 1)
    setPage(clamped)
  }, [paginationMeta])

  const handlePageSizeChange = React.useCallback((nextSize: number) => {
    setPageSize(nextSize)
    setPage(1)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-muted-foreground">Loading assigned leads...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-red-600">Error loading leads: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Assigned Leads</h1>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {/* <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="h-3 w-3 text-blue-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-blue-700 font-semibold">Total Leads</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{stats.total}</p>
                <p className="text-xs text-blue-700/80 font-medium">All assigned leads</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Phone className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-violet-50 to-purple-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-3 w-3 text-violet-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-violet-700 font-semibold">Today's Leads</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{stats.today}</p>
                <p className="text-xs text-violet-700/80 font-medium">Assigned today</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-3 w-3 text-amber-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-amber-700 font-semibold">Pending</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{stats.pending}</p>
                <p className="text-xs text-amber-700/80 font-medium">Awaiting action</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-3 w-3 text-rose-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-rose-700 font-semibold">Follow-ups</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{stats.followup}</p>
                <p className="text-xs text-rose-700/80 font-medium">Due for follow-up</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-3 w-3 text-emerald-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-700 font-semibold">Completed</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{stats.completed}</p>
                <p className="text-xs text-emerald-700/80 font-medium">Converted or dropped</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Filters */}
      {/* <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-700" />
            <CardTitle className="text-sm font-bold text-slate-900">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  {campaignOptions.map((campaign) => (
                    <SelectItem key={campaign} value={campaign}>
                      {campaign}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <select
                value={dateFilter}
                onChange={(e) => {
                  const value = e.target.value
                  setDateFilter(value)
                  if (value === "") {
                    setTempDateRange({ from: undefined, to: undefined })
                    setRegistrationDateRange({ from: undefined, to: undefined })
                    updateURLParams({ registrationDateFrom: '', registrationDateTo: '' })
                  } else if (value === "custom") {
                    // Keep current temp range for custom selection
                  } else {
                    // Apply preset filters immediately
                    let fromDate: Date | undefined
                    let toDate: Date | undefined
                    
                    if (value === "today") {
                      const today = new Date()
                      fromDate = today
                      toDate = today
                    } else if (value === "last7days") {
                      const sevenDaysAgo = new Date()
                      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
                      fromDate = sevenDaysAgo
                      toDate = new Date()
                    } else if (value === "last30days") {
                      const thirtyDaysAgo = new Date()
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                      fromDate = thirtyDaysAgo
                      toDate = new Date()
                    }
                    
                    if (fromDate && toDate) {
                      setTempDateRange({ from: fromDate, to: toDate })
                      setRegistrationDateRange({ from: fromDate, to: toDate })
                      updateURLParams({ 
                        registrationDateFrom: fromDate.toISOString().split('T')[0], 
                        registrationDateTo: toDate.toISOString().split('T')[0] 
                      })
                    }
                  }
                }}
                className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                <option value="">All Dates</option>
                <option value="today">Today</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
              
              {dateFilter === "custom" && (
                <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 justify-start text-left font-normal",
                        !tempDateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {tempDateRange.from ? (
                        tempDateRange.to ? (
                          <>
                            {formatDate(tempDateRange.from, "LLL dd, y")} - {" "}
                            {formatDate(tempDateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          formatDate(tempDateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="range"
                      selected={{
                        from: tempDateRange.from,
                        to: tempDateRange.to,
                      }}
                      onSelect={handleDateRangeSelect}
                      className="rounded-md"
                    />
                    <div className="p-3 border-t">
                      <Button
                        className="w-full"
                        onClick={() => {
                          if (tempDateRange?.from && tempDateRange.to) {
                            applyDateFilter()
                            setDateRangeOpen(false)
                          }
                        }}
                        disabled={!tempDateRange?.from || !tempDateRange.to}
                      >
                        Apply Filter
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Leads Table */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-slate-700" />
            <CardTitle className="text-sm font-bold text-slate-900">
              Assigned Leads 
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <TelecallerLeadsTable 
            data={filteredLeads} 
            paginationMeta={paginationMeta}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>

    </div>
  )
}
