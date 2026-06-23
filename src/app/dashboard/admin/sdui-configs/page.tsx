"use client"

import React, { useState } from "react"
import { useSDUIConfigs } from "@/hooks/use-sdui-configs"
import { SDUIConfigList } from "@/components/admin/sdui-config-list"
import { ListSDUIConfigsDto } from "@/types/sdui-config"
import { ShieldCheck, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export default function SDUIConfigsPage() {
  const [params, setParams] = useState<ListSDUIConfigsDto>({
    page: 1,
    limit: 100,
  })

  const { data, isLoading } = useSDUIConfigs(params)

  const handleSearch = (query: string) => {
    setParams((prev) => ({ ...prev, search: query, page: 1 }))
  }

  const handleCategoryFilter = (category: string) => {
    setParams((prev) => ({ ...prev, category, page: 1 }))
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-500">Engine Interface</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">SDUI <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Configurations</span></h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1 italic">
            Dynamically override mobile UI templates with real-time database configurations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-8 gap-2 bg-slate-900 text-white border-none px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin Restricted
          </Badge>
          <Badge variant="outline" className="h-8 gap-2 bg-blue-50 text-blue-600 border-blue-100 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest">
            <Zap className="h-3.5 w-3.5" />
            Live Sync
          </Badge>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SDUIConfigList
          data={data?.data || []}
          isLoading={isLoading}
          onSearch={handleSearch}
          onCategoryFilter={handleCategoryFilter}
        />
      </motion.div>
    </div>
  )
}
