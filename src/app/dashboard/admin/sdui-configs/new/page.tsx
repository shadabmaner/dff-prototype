"use client"

import React from "react"
import { SDUIConfigForm } from "@/components/admin/sdui-config-form"
import { motion } from "framer-motion"

export default function NewSDUIConfigPage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="pb-10"
    >
      <SDUIConfigForm />
    </motion.div>
  )
}
