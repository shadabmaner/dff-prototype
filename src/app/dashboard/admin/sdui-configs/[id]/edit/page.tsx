"use client"

import React from "react"
import { useParams } from "next/navigation"
import { useSDUIConfig } from "@/hooks/use-sdui-configs"
import { SDUIConfigForm } from "@/components/admin/sdui-config-form"
import { Loader2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function EditSDUIConfigPage() {
  const params = useParams()
  const id = params.id as string

  const { data, isLoading, error } = useSDUIConfig(id)

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-slate-300 animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Loading Configuration...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Failed to load configuration</h2>
          <p className="text-slate-500 max-w-xs mx-auto">The requested SDUI template could not be retrieved from the server.</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-10"
    >
      <SDUIConfigForm initialData={data.data} />
    </motion.div>
  )
}
