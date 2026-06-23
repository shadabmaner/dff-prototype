"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Box,
  DollarSign,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ProductFormDrawer } from "@/components/pharmacy/product-form-drawer"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

// Static data for products
const initialProducts = [
  {
    id: "PRD-001",
    name: "Metformin 500mg",
    category: "Diabetes",
    manufacturer: "Sun Pharma",
    sku: "MET-500-100",
    price: 45.50,
    stock: 150,
    minStock: 20,
    expiryDate: "2025-12-31",
    status: "In Stock",
  },
  {
    id: "PRD-002",
    name: "Atorvastatin 20mg",
    category: "Cardiovascular",
    manufacturer: "Pfizer",
    sku: "ATO-20-50",
    price: 120.00,
    stock: 75,
    minStock: 15,
    expiryDate: "2026-06-30",
    status: "In Stock",
  },
  {
    id: "PRD-003",
    name: "Levothyroxine 75mcg",
    category: "Thyroid",
    manufacturer: "Abbott",
    sku: "LEV-75-100",
    price: 85.00,
    stock: 12,
    minStock: 25,
    expiryDate: "2025-08-15",
    status: "Low Stock",
  },
  {
    id: "PRD-004",
    name: "Omeprazole 20mg",
    category: "Gastric",
    manufacturer: "Dr. Reddy's",
    sku: "OME-20-30",
    price: 35.00,
    stock: 0,
    minStock: 30,
    expiryDate: "2025-03-20",
    status: "Out of Stock",
  },
  {
    id: "PRD-005",
    name: "Amlodipine 5mg",
    category: "Cardiovascular",
    manufacturer: "Cipla",
    sku: "AML-5-100",
    price: 55.00,
    stock: 200,
    minStock: 20,
    expiryDate: "2026-12-31",
    status: "In Stock",
  },
]

export default function ProductManagementPage() {
  const [products, setProducts] = useState(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)

  const handleAddProduct = () => {
    setEditProduct(null)
    setIsDrawerOpen(true)
  }

  const handleEditProduct = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setEditProduct(product)
      setIsDrawerOpen(true)
    }
  }

  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (productToDelete) {
      setProducts(products.filter(p => p.id !== productToDelete))
      setProductToDelete(null)
    }
  }

  const handleProductSubmit = (data: any) => {
    if (editProduct) {
      setProducts(products.map(p => p.id === editProduct.id ? { ...p, ...data, price: parseFloat(data.price), stock: parseInt(data.stock), minStock: parseInt(data.minStock) } : p))
    } else {
      const newProduct = {
        id: `PRD-${String(products.length + 1).padStart(3, '0')}`,
        ...data,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        minStock: parseInt(data.minStock),
        status: parseInt(data.stock) > parseInt(data.minStock) ? "In Stock" : parseInt(data.stock) === 0 ? "Out of Stock" : "Low Stock",
      }
      setProducts([...products, newProduct])
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const inStockCount = products.filter((p) => p.status === "In Stock").length
  const lowStockCount = products.filter((p) => p.status === "Low Stock").length
  const outOfStockCount = products.filter((p) => p.status === "Out of Stock").length

  const categories = [...new Set(products.map((p) => p.category))]

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateStr))
    } catch {
      return dateStr
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "Low Stock":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "Out of Stock":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">Pharmacy / Product Management</p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Product Management</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">Manage pharmaceutical products, inventory levels, and pricing.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleAddProduct}
              className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-700 font-semibold">In Stock</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{inStockCount}</p>
                <p className="text-xs text-emerald-700/80 font-medium">Available products</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-amber-700 font-semibold">Low Stock</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{lowStockCount}</p>
                <p className="text-xs text-amber-700/80 font-medium">Need replenishment</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-red-50 to-rose-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Box className="h-3 w-3 text-red-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-red-700 font-semibold">Out of Stock</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{outOfStockCount}</p>
                <p className="text-xs text-red-700/80 font-medium">Immediate attention</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Box className="h-6 w-6 text-white" />
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
                placeholder="Search by name, ID, or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 bg-white border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-900 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-11 px-4 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 px-4 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              >
                <option value="all">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Cards */}
      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description="Try adjusting your search terms or filters."
            className=""
          />
        ) : (
          filteredProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all rounded-xl group">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1">
                      {/* Product Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                            <Badge className={cn("text-xs font-medium px-3 py-0.5", getStatusColor(product.status))}>
                              {product.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">{product.id} • SKU: {product.sku}</p>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-[11px] text-slate-500 uppercase tracking-wide">Category</p>
                            <p className="text-sm font-semibold text-slate-900">{product.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-emerald-500" />
                          <div>
                            <p className="text-[11px] text-slate-500 uppercase tracking-wide">Price</p>
                            <p className="text-sm font-semibold text-slate-900">₹{product.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Box className="h-4 w-4 text-purple-500" />
                          <div>
                            <p className="text-[11px] text-slate-500 uppercase tracking-wide">Stock</p>
                            <p className="text-sm font-semibold text-slate-900">{product.stock} units</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-amber-500" />
                          <div>
                            <p className="text-[11px] text-slate-500 uppercase tracking-wide">Expiry</p>
                            <p className="text-sm font-semibold text-slate-900">{formatDate(product.expiryDate)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Stock Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Stock Level</span>
                          <span className="font-semibold text-slate-900">{product.stock} / {product.minStock} (min)</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              product.stock === 0 ? "bg-red-500" :
                              product.stock < product.minStock ? "bg-amber-500" :
                              "bg-gradient-to-r from-emerald-500 to-teal-500"
                            )}
                            style={{ width: `${Math.min((product.stock / (product.minStock * 2)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Manufacturer */}
                      <p className="text-sm text-slate-600">Manufacturer: <span className="font-semibold text-slate-900">{product.manufacturer}</span></p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 lg:flex-col lg:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditProduct(product.id)}
                        className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 font-semibold shadow-sm h-10 px-4"
                      >
                        <Edit className="h-4 w-4 mr-1.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 font-semibold shadow-sm h-10 px-4"
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Product Form Drawer */}
      <ProductFormDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSubmit={handleProductSubmit}
        editData={editProduct}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  )
}
