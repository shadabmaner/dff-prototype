"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { FileQuestion, FormInput, LayoutDashboard } from "lucide-react"
import QuestionsManagement from "./components/questions-management"
import FormsManagement from "./components/forms-management"

const tabs = [
  { id: "questions", label: "Questions", icon: FileQuestion },
  { id: "forms", label: "Forms", icon: FormInput },
]

export default function AssessmentsPage() {
  const [activeTab, setActiveTab] = useState("questions")

  return (
    <div className="space-y-8 p-8 min-h-screen bg-gradient-to-br from-[var(--muted)] via-blue-50/30 to-[var(--muted)] rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-[var(--foreground)]"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)] font-bold">
            Admin Portal / Assessment Management
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[var(--foreground)] tracking-tight">
              Assessment Management
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-2xl font-medium">
              Create and manage clinical assessment questions and forms across specialities.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] border border-[var(--border)] px-4 py-2.5 rounded-xl bg-[var(--card)] shadow-sm">
            <LayoutDashboard className="h-4 w-4 text-[var(--muted-foreground)]" />
            <span className="font-bold">{activeTab === "questions" ? "Question Library" : "Form Builder"}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b-2 border-[var(--border)] overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2.5 px-8 py-4 text-sm font-black transition-all relative min-w-fit uppercase tracking-wider",
                isActive
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]")} />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeAssessmentTab"
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--foreground)] rounded-t-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "questions" ? (
            <QuestionsManagement />
          ) : (
            <FormsManagement />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
