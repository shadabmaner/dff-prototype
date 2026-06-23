"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ClipboardCheck,
  Search,
  Filter,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye } from "lucide-react"

// Static data for order status tracking
const initialOrderStatus = [
  {
    id: "ORD-001",
    patientName: "Aditya Sharma",
    patientId: "PAT-001",
    prescriptionId: "RX-9021",
    currentStatus: "Processing",
    estimatedDelivery: "2025-01-18",
    trackingNumber: "TRK-123456789",
    address: "123, Sector 15, Gurugram, Haryana - 122001",
    phone: "+91 98765 43210",
    email: "aditya.sharma@email.com",
    timeline: [
      { status: "Order Placed", date: "2025-01-15 10:30", completed: true },
      { status: "Processing", date: "2025-01-15 14:00", completed: true },
      { status: "Quality Check", date: "2025-01-16 09:00", completed: true },
      { status: "Dispatched", date: "Pending", completed: false },
      { status: "Delivered", date: "Pending", completed: false },
    ],
  },
  {
    id: "ORD-002",
    patientName: "Priya Patel",
    patientId: "PAT-002",
    prescriptionId: "RX-9018",
    currentStatus: "Dispatched",
    estimatedDelivery: "2025-01-17",
    trackingNumber: "TRK-987654321",
    address: "456, Park Street, Mumbai, Maharashtra - 400001",
    phone: "+91 87654 32109",
    email: "priya.patel@email.com",
    timeline: [
      { status: "Order Placed", date: "2025-01-14 11:00", completed: true },
      { status: "Processing", date: "2025-01-14 15:30", completed: true },
      { status: "Quality Check", date: "2025-01-15 10:00", completed: true },
      { status: "Dispatched", date: "2025-01-16 08:00", completed: true },
      { status: "Delivered", date: "Pending", completed: false },
    ],
  },
  {
    id: "ORD-003",
    patientName: "Rajesh Kumar",
    patientId: "PAT-003",
    prescriptionId: "RX-8995",
    currentStatus: "Delivered",
    estimatedDelivery: "2025-01-13",
    trackingNumber: "TRK-456789123",
    address: "789, MG Road, Bangalore, Karnataka - 560001",
    phone: "+91 76543 21098",
    email: "rajesh.kumar@email.com",
    timeline: [
      { status: "Order Placed", date: "2025-01-11 09:00", completed: true },
      { status: "Processing", date: "2025-01-11 13:00", completed: true },
      { status: "Quality Check", date: "2025-01-12 09:00", completed: true },
      { status: "Dispatched", date: "2025-01-12 14:00", completed: true },
      { status: "Delivered", date: "2025-01-13 10:30", completed: true },
    ],
  },
  {
    id: "ORD-004",
    patientName: "Sneha Gupta",
    patientId: "PAT-004",
    prescriptionId: "RX-8990",
    currentStatus: "Pending",
    estimatedDelivery: "2025-01-20",
    trackingNumber: "Pending",
    address: "321, Anna Nagar, Chennai, Tamil Nadu - 600040",
    phone: "+91 65432 10987",
    email: "sneha.gupta@email.com",
    timeline: [
      { status: "Order Placed", date: "2025-01-16 16:00", completed: true },
      { status: "Processing", date: "Pending", completed: false },
      { status: "Quality Check", date: "Pending", completed: false },
      { status: "Dispatched", date: "Pending", completed: false },
      { status: "Delivered", date: "Pending", completed: false },
    ],
  },
]

export default function OrderStatusPage() {
  const [orderStatus, setOrderStatus] = useState(initialOrderStatus)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const handleRefreshStatus = () => {
    alert("Refreshing order status...")
  }

  const handleViewOrder = (orderId: string) => {
    const order = orderStatus.find(o => o.id === orderId)
    if (order) {
      setSelectedOrder(order)
      setViewDialogOpen(true)
    }
  }

  const filteredOrders = orderStatus.filter((order) => {
    const matchesSearch =
      order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.currentStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingCount = orderStatus.filter((o) => o.currentStatus === "Pending").length
  const processingCount = orderStatus.filter((o) => o.currentStatus === "Processing").length
  const dispatchedCount = orderStatus.filter((o) => o.currentStatus === "Dispatched").length
  const deliveredCount = orderStatus.filter((o) => o.currentStatus === "Delivered").length

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateStr))
    } catch {
      return dateStr
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "Processing":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "Dispatched":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return Clock
      case "Processing":
        return Package
      case "Dispatched":
        return Truck
      case "Delivered":
        return CheckCircle2
      default:
        return Clock
    }
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">Pharmacy / Order Status</p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Order Status Tracking</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">Real-time tracking of prescription orders and delivery status.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleRefreshStatus}
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-semibold shadow-sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-3 w-3 text-amber-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-amber-700 font-semibold">Pending</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{pendingCount}</p>
                <p className="text-xs text-amber-700/80 font-medium">Awaiting processing</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-3 w-3 text-blue-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-blue-700 font-semibold">Processing</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{processingCount}</p>
                <p className="text-xs text-blue-700/80 font-medium">In progress</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="h-3 w-3 text-purple-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-purple-700 font-semibold">Dispatched</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{dispatchedCount}</p>
                <p className="text-xs text-purple-700/80 font-medium">In transit</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Truck className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-700 font-semibold">Delivered</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{deliveredCount}</p>
                <p className="text-xs text-emerald-700/80 font-medium">Completed</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-md">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by patient name, order ID, or tracking number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 bg-white border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-900 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 px-4 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Status Cards */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="No orders found"
            description="Try adjusting your search terms or filters."
            className=""
          />
        ) : (
          filteredOrders.map((order, idx) => {
            const StatusIcon = getStatusIcon(order.currentStatus)
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">{order.patientName}</h3>
                          <Badge className={cn("text-xs font-medium px-3 py-0.5", getStatusColor(order.currentStatus))}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {order.currentStatus}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{order.id} • {order.patientId} • {order.prescriptionId}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {order.address.split(',')[0]}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(order.estimatedDelivery)}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewOrder(order.id)}
                        className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-semibold shadow-sm h-10 px-4"
                      >
                        <Eye className="h-4 w-4 mr-1.5" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>

      {/* View Order Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>View complete order status and timeline</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Order Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{selectedOrder.patientName}</h3>
                    <Badge className={cn("text-xs font-medium px-3 py-0.5", getStatusColor(selectedOrder.currentStatus))}>
                      {selectedOrder.currentStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{selectedOrder.id} • {selectedOrder.patientId} • {selectedOrder.prescriptionId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Tracking Number</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedOrder.trackingNumber}</p>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 bg-slate-50 rounded-lg p-4">
                  <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">Delivery Address</p>
                    <p className="text-sm text-slate-900">{selectedOrder.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-slate-50 rounded-lg p-4">
                  <Clock className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">Estimated Delivery</p>
                    <p className="text-sm font-semibold text-slate-900">{formatDate(selectedOrder.estimatedDelivery)}</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{selectedOrder.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{selectedOrder.email}</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Order Timeline</p>
                <div className="space-y-3">
                  {selectedOrder.timeline.map((step: any, stepIdx: number) => (
                    <div key={stepIdx} className="flex items-start gap-3">
                      <div className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0",
                        step.completed ? "bg-emerald-500" : "bg-slate-200"
                      )}>
                        {step.completed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                        ) : (
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={cn("text-sm font-medium", step.completed ? "text-slate-900" : "text-slate-500")}>
                            {step.status}
                          </p>
                          <p className="text-xs text-slate-400">{step.date}</p>
                        </div>
                        {stepIdx < selectedOrder.timeline.length - 1 && (
                          <div className={cn(
                            "ml-3 h-4 w-0.5",
                            selectedOrder.timeline[stepIdx + 1].completed ? "bg-emerald-500" : "bg-slate-200"
                          )} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
