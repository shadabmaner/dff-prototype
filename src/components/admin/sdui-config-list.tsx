"use client"

import React, { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Layers,
  Database,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { SDUIConfig } from "@/types/sdui-config"
import { format } from "date-fns"
import { useDeleteSDUIConfig } from "@/hooks/use-sdui-configs"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface SDUIConfigListProps {
  data: SDUIConfig[]
  isLoading: boolean
  onSearch: (query: string) => void
  onCategoryFilter: (category: string) => void
}

export function SDUIConfigList({ data, isLoading, onSearch, onCategoryFilter }: SDUIConfigListProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { mutate: deleteConfig, isPending: isDeleting } = useDeleteSDUIConfig()

  const handleDelete = () => {
    if (deleteId) {
      deleteConfig(deleteId, {
        onSuccess: () => setDeleteId(null),
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 p-4 rounded-2xl border border-slate-100 backdrop-blur-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name or description..."
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus:ring-slate-900/5 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            onClick={() => router.push("/dashboard/admin/sdui-configs/new")}
            className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg gap-2 font-bold text-[13px] uppercase tracking-wide w-full md:w-auto"
          >
            <Plus className="h-4 w-4" />
            Create Config
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="w-[300px] font-bold text-slate-500 uppercase tracking-widest text-[10px]">Configuration</TableHead>
              <TableHead className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Category</TableHead>
              <TableHead className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Status</TableHead>
              <TableHead className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Last Updated</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 text-slate-300 animate-spin" />
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Synchronizing Matrix...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Database className="h-12 w-12 text-slate-200" />
                    <div className="space-y-1">
                      <p className="text-slate-900 font-bold">No Configurations Found</p>
                      <p className="text-slate-400 text-sm">Start by creating your first SDUI template.</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((config) => (
                <TableRow key={config.id} className="group hover:bg-slate-50/80 transition-colors border-slate-50">
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-mono font-bold text-blue-600 text-[13px] tracking-tight">{config.name}</span>
                      <span className="text-[12px] text-slate-500 font-medium line-clamp-1">{config.description || "No description provided"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-lg bg-white border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[9px] px-2 h-6">
                      {config.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        config.is_active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-slate-300"
                      )} />
                      <span className={cn(
                        "text-[12px] font-bold uppercase tracking-wider",
                        config.is_active ? "text-emerald-600" : "text-slate-400"
                      )}>
                        {config.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[12px] font-medium text-slate-500">
                    {format(new Date(config.updated_at), "MMM d, yyyy · HH:mm")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white border-transparent hover:border-slate-200 transition-all">
                          <MoreVertical className="h-4 w-4 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-slate-200 shadow-2xl rounded-xl p-1.5 w-48">
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/admin/sdui-configs/${config.id}/edit`)}
                          className="rounded-lg gap-2 font-bold text-[11px] uppercase tracking-widest py-2.5 cursor-pointer text-slate-700"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit Config
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="rounded-lg gap-2 font-bold text-[11px] uppercase tracking-widest py-2.5 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                          onClick={() => setDeleteId(config.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete Config
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-white border-slate-200 rounded-3xl p-8 max-w-md shadow-2xl">
          <AlertDialogHeader>
            <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
              <Trash2 className="h-8 w-8 text-red-600" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Erase Configuration?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-base font-medium mt-2 leading-relaxed">
              This action is permanent. Deleting this SDUI configuration will cause the mobile app to fallback to local JSON files for this identifier.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="rounded-xl border-slate-200 font-bold uppercase tracking-widest text-[11px] h-12 flex-1">Abort</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-[11px] h-12 flex-1 shadow-lg shadow-red-200"
            >
              Erase Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
