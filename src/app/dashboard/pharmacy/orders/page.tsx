"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  User,
  Package,
  IndianRupee,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { OrderFormDrawer } from "@/components/pharmacy/order-form-drawer"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Static data for orders
const initialOrders = [
  {
    id: "ORD-001",
    patientName: "Aditya Sharma",
    patientId: "PAT-001",
    date: "2025-01-15",
    items: [
      { name: "Metformin 500mg", quantity: 2, price: 45.50 },
      { name: "Atorvastatin 20mg", quantity: 1, price: 120.00 },
    ],
    total: 211.00,
    status: "Processing",
    priority: "Normal",
    prescriptionId: "RX-9021",
  },
  {
    id: "ORD-002",
    patientName: "Priya Patel",
    patientId: "PAT-002",
    date: "2025-01-14",
    items: [
      { name: "Levothyroxine 75mcg", quantity: 3, price: 85.00 },
    ],
    total: 255.00,
    status: "Pending",
    priority: "High",
    prescriptionId: "RX-9018",
  },
  {
    id: "ORD-003",
    patientName: "Rajesh Kumar",
    patientId: "PAT-003",
    date: "2025-01-13",
    items: [
      { name: "Omeprazole 20mg", quantity: 1, price: 35.00 },
      { name: "Amlodipine 5mg", quantity: 2, price: 55.00 },
    ],
    total: 145.00,
    status: "Dispatched",
    priority: "Normal",
    prescriptionId: "RX-8995",
  },
  {
    id: "ORD-004",
    patientName: "Sneha Gupta",
    patientId: "PAT-004",
    date: "2025-01-12",
    items: [
      { name: "Metformin 500mg", quantity: 1, price: 45.50 },
    ],
    total: 45.50,
    status: "Delivered",
    priority: "Normal",
    prescriptionId: "RX-8990",
  },
  {
    id: "ORD-005",
    patientName: "Vikram Singh",
    patientId: "PAT-005",
    date: "2025-01-11",
    items: [
      { name: "Atorvastatin 20mg", quantity: 1, price: 120.00 },
      { name: "Amlodipine 5mg", quantity: 1, price: 55.00 },
    ],
    total: 175.00,
    status: "Cancelled",
    priority: "Low",
    prescriptionId: "RX-8985",
  },
]

export default function PharmacyOrdersPage() {
  const [orders, setOrders] = useState(initialOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [orderToDownload, setOrderToDownload] = useState<string | null>(null)

  const handleCreateOrder = () => {
    setIsDrawerOpen(true)
  }

  const handleViewDetails = (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (order) {
      setSelectedOrder(order)
      setViewDetailsOpen(true)
    }
  }

  const handleDownloadInvoice = (orderId: string) => {
    setOrderToDownload(orderId)
    setDownloadDialogOpen(true)
  }

  const confirmDownload = () => {
    if (orderToDownload) {
      alert(`Downloading invoice for order ${orderToDownload}`)
      setOrderToDownload(null)
    }
  }

  const handleOrderSubmit = (data: any) => {
    const newOrder = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      ...data,
      date: new Date().toISOString().split('T')[0],
      items: [],
      total: 0,
      status: "Pending",
    }
    setOrders([...orders, newOrder])
  }

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.prescriptionId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const pendingCount = orders.filter((o) => o.status === "Pending").length
  const processingCount = orders.filter((o) => o.status === "Processing").length
  const dispatchedCount = orders.filter((o) => o.status === "Dispatched").length
  const totalRevenue = orders.filter((o) => o.status !== "Cancelled").reduce((acc, o) => acc + o.total, 0)

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
      case "Accepted":
        return "bg-cyan-50 text-cyan-700 border-cyan-200"
      case "Processing":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "Dispatched":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return Clock
      case "Accepted":
        return CheckCircle2
      case "Processing":
        return Package
      case "Dispatched":
        return Truck
      case "Delivered":
        return CheckCircle2
      case "Cancelled":
        return XCircle
      default:
        return Clock
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 border-red-300"
      case "Normal":
        return "bg-blue-100 text-blue-700 border-blue-300"
      case "Low":
        return "bg-slate-100 text-slate-700 border-slate-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">Pharmacy / Orders</p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Order Management</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">Track and manage prescription orders from creation to delivery.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleCreateOrder}
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Order
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
                <p className="text-xs text-amber-700/80 font-medium">Awaiting action</p>
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
                <p className="text-xs text-purple-700/80 font-medium">Shipped</p>
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
                  <IndianRupee className="h-3 w-3 text-emerald-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-700 font-semibold">Revenue</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-emerald-700/80 font-medium">Total value</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <IndianRupee className="h-6 w-6 text-white" />
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
                placeholder="Search by patient name, order ID, or prescription ID..."
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
                <option value="Accepted">Accepted</option>
                <option value="Processing">Processing</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-11 px-4 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              >
                <option value="all">All Priority</option>
                <option value="High">High</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Cards */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No orders found"
            description="Try adjusting your search terms or filters."
            className=""
          />
        ) : (
          filteredOrders.map((order, idx) => {
            const StatusIcon = getStatusIcon(order.status)
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all rounded-xl group">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      <div className="flex-1">
                        {/* Order Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-slate-900">{order.patientName}</h3>
                              <Badge className={cn("text-xs font-medium px-3 py-0.5", getStatusColor(order.status))}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {order.status}
                              </Badge>
                              <Badge className={cn("text-xs font-medium px-3 py-0.5", getPriorityColor(order.priority))}>
                                {order.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">{order.id} • {order.patientId}</p>
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="text-[11px] text-slate-500 uppercase tracking-wide">Order Date</p>
                              <p className="text-sm font-semibold text-slate-900">{formatDate(order.date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-purple-500" />
                            <div>
                              <p className="text-[11px] text-slate-500 uppercase tracking-wide">Prescription</p>
                              <p className="text-sm font-semibold text-slate-900">{order.prescriptionId}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-emerald-500" />
                            <div>
                              <p className="text-[11px] text-slate-500 uppercase tracking-wide">Items</p>
                              <p className="text-sm font-semibold text-slate-900">{order.items.length}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <IndianRupee className="h-4 w-4 text-amber-500" />
                            <div>
                              <p className="text-[11px] text-slate-500 uppercase tracking-wide">Total</p>
                              <p className="text-sm font-semibold text-slate-900">₹{order.total.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Items List */}
                        <div className="bg-slate-50 rounded-lg p-4 mb-4">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Order Items</p>
                          <div className="space-y-2">
                            {order.items.map((item, itemIdx) => (
                              <div key={itemIdx} className="flex justify-between items-center text-sm">
                                <span className="text-slate-700">{item.name} <span className="text-slate-500">x{item.quantity}</span></span>
                                <span className="font-semibold text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 lg:flex-col lg:w-auto">
                        <div className="space-y-2">
                          <p className="text-[11px] text-slate-500 uppercase tracking-wide">Update Status</p>
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order.id, value)}
                          >
                            <SelectTrigger className="h-9 text-sm font-medium">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Accepted">Accepted</SelectItem>
                              <SelectItem value="Processing">Processing</SelectItem>
                              <SelectItem value="Dispatched">Dispatched</SelectItem>
                              <SelectItem value="Delivered">Delivered</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(order.id)}
                          className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-semibold shadow-sm h-10 px-4"
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadInvoice(order.id)}
                          className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-semibold shadow-sm h-10 px-4"
                        >
                          <Download className="h-4 w-4 mr-1.5" />
                          Download Invoice
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Order Form Drawer */}
      <OrderFormDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSubmit={handleOrderSubmit}
      />

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>View complete order information</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Order ID</p>
                  <p className="font-semibold">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Date</p>
                  <p className="font-semibold">{selectedOrder.date}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Patient Name</p>
                  <p className="font-semibold">{selectedOrder.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Patient ID</p>
                  <p className="font-semibold">{selectedOrder.patientId}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Prescription ID</p>
                  <p className="font-semibold">{selectedOrder.prescriptionId}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <p className="font-semibold">{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Priority</p>
                  <p className="font-semibold">{selectedOrder.priority}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="font-semibold">₹{selectedOrder.total.toFixed(2)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-2">Order Items</p>
                <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Download Invoice Confirmation Dialog */}
      <ConfirmDialog
        open={downloadDialogOpen}
        onOpenChange={setDownloadDialogOpen}
        title="Download Invoice"
        description="Are you sure you want to download the invoice for this order?"
        confirmText="Download"
        cancelText="Cancel"
        onConfirm={confirmDownload}
      />
    </div>
  )
}
