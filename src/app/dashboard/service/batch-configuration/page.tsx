"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Settings,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Play,
  Save,
  RefreshCw,
  Layers,
  Calendar,
  Users,
  Zap,
  CheckCircle,
  XCircle,
  PlusCircle,
  MinusCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// Types
type Program = "Diabetes Free Forever" | "Thyroid Free Forever" | "Healthy BMI"
type GenerationMode = "Daily" | "Weekly" | "Monthly" | "On Demand"
type RuleOperator = "AND" | "OR"
type RuleCondition = "Payment Completed" | "Enrollment Active" | "Program Assigned" | "Batch Not Assigned" | "Assessment Completed"

interface Rule {
  id: string
  condition: RuleCondition
  operator: RuleOperator
}

interface BatchConfig {
  id: string
  program: Program
  capacity: number
  namingFormat: string
  generationMode: GenerationMode
  autoBatchCreation: boolean
  autoPatientAllocation: boolean
  rules: Rule[]
}

// Mock Data
const mockConfigs: BatchConfig[] = [
  {
    id: "1",
    program: "Diabetes Free Forever",
    capacity: 50,
    namingFormat: "DFF-DIA-{MONTH}-{SEQ}",
    generationMode: "Monthly",
    autoBatchCreation: true,
    autoPatientAllocation: true,
    rules: [
      { id: "1", condition: "Payment Completed", operator: "AND" },
      { id: "2", condition: "Enrollment Active", operator: "AND" },
      { id: "3", condition: "Program Assigned", operator: "AND" },
      { id: "4", condition: "Batch Not Assigned", operator: "AND" },
    ],
  },
  {
    id: "2",
    program: "Thyroid Free Forever",
    capacity: 50,
    namingFormat: "TFF-THY-{MONTH}-{SEQ}",
    generationMode: "Monthly",
    autoBatchCreation: true,
    autoPatientAllocation: true,
    rules: [
      { id: "1", condition: "Payment Completed", operator: "AND" },
      { id: "2", condition: "Enrollment Active", operator: "AND" },
      { id: "3", condition: "Program Assigned", operator: "AND" },
      { id: "4", condition: "Batch Not Assigned", operator: "AND" },
    ],
  },
  {
    id: "3",
    program: "Healthy BMI",
    capacity: 100,
    namingFormat: "HBMI-{MONTH}-{SEQ}",
    generationMode: "Monthly",
    autoBatchCreation: true,
    autoPatientAllocation: true,
    rules: [
      { id: "1", condition: "Payment Completed", operator: "AND" },
      { id: "2", condition: "Enrollment Active", operator: "AND" },
      { id: "3", condition: "Program Assigned", operator: "AND" },
      { id: "4", condition: "Batch Not Assigned", operator: "AND" },
    ],
  },
]

const ruleConditions: RuleCondition[] = [
  "Payment Completed",
  "Enrollment Active",
  "Program Assigned",
  "Batch Not Assigned",
  "Assessment Completed",
]

export default function BatchConfigurationPage() {
  const [selectedConfig, setSelectedConfig] = useState<BatchConfig | null>(null)
  const [showRuleDialog, setShowRuleDialog] = useState(false)
  const [expandedConfig, setExpandedConfig] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    program: "Diabetes Free Forever" as Program,
    capacity: 50,
    namingFormat: "DFF-DIA-{MONTH}-{SEQ}",
    generationMode: "Monthly" as GenerationMode,
    autoBatchCreation: true,
    autoPatientAllocation: true,
  })

  const handleSaveConfig = () => {
    alert("Configuration saved successfully")
  }

  const handleAddRule = (configId: string) => {
    const config = mockConfigs.find((c) => c.id === configId)
    if (config) {
      const newRule: Rule = {
        id: Date.now().toString(),
        condition: "Payment Completed",
        operator: "AND",
      }
      config.rules.push(newRule)
    }
  }

  const handleRemoveRule = (configId: string, ruleId: string) => {
    const config = mockConfigs.find((c) => c.id === configId)
    if (config) {
      config.rules = config.rules.filter((r) => r.id !== ruleId)
    }
  }

  const handleToggleAuto = (configId: string, field: "autoBatchCreation" | "autoPatientAllocation") => {
    const config = mockConfigs.find((c) => c.id === configId)
    if (config) {
      config[field] = !config[field]
    }
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Service Operations</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Batch <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Configuration</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Configure automatic batch generation rules and eligibility criteria
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button className="h-11 px-6 rounded-xl bg-primary text-white">
            <Save className="h-4 w-4 mr-2" />
            Save All Configurations
          </Button>
        </div>
      </div>

      {/* Configuration Cards */}
      <div className="space-y-4">
        {mockConfigs.map((config, index) => (
          <Card
            key={config.id}
            className={cn(
              "border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm transition-all",
              expandedConfig === config.id && "ring-2 ring-primary"
            )}
          >
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">{config.program}</CardTitle>
                    <CardDescription className="text-sm">
                      {config.namingFormat} • Capacity: {config.capacity}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      "text-xs font-semibold border",
                      config.autoBatchCreation ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-700 border-gray-200"
                    )}
                  >
                    {config.autoBatchCreation ? "Auto Creation: ON" : "Auto Creation: OFF"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedConfig(expandedConfig === config.id ? null : config.id)}
                    className="h-8 w-8 p-0 rounded-lg"
                  >
                    {expandedConfig === config.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            {expandedConfig === config.id && (
              <CardContent className="p-6 space-y-6">
                {/* Basic Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Program</Label>
                    <Select value={config.program} disabled>
                      <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2 bg-slate-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Diabetes Free Forever">Diabetes Free Forever</SelectItem>
                        <SelectItem value="Thyroid Free Forever">Thyroid Free Forever</SelectItem>
                        <SelectItem value="Healthy BMI">Healthy BMI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Batch Capacity</Label>
                    <Input
                      value={config.capacity.toString()}
                      type="number"
                      className="h-10 rounded-xl border-slate-200 mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Batch Naming Format</Label>
                    <Input
                      value={config.namingFormat}
                      className="h-10 rounded-xl border-slate-200 mt-2"
                    />
                    <p className="text-xs text-slate-500 mt-1">Variables: {'{MONTH}'}, {'{SEQ}'}, {'{YEAR}'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Generation Mode</Label>
                    <Select value={config.generationMode}>
                      <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="On Demand">On Demand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Auto Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Layers className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Auto Batch Creation</p>
                        <p className="text-xs text-slate-500">Automatically create batches based on rules</p>
                      </div>
                    </div>
                    <Button
                      variant={config.autoBatchCreation ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleAuto(config.id, "autoBatchCreation")}
                      className={cn(
                        "h-8 px-4 rounded-lg",
                        config.autoBatchCreation ? "bg-primary text-white" : "border-slate-200"
                      )}
                    >
                      {config.autoBatchCreation ? <CheckCircle className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                      {config.autoBatchCreation ? "ON" : "OFF"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Auto Patient Allocation</p>
                        <p className="text-xs text-slate-500">Automatically assign patients to batches</p>
                      </div>
                    </div>
                    <Button
                      variant={config.autoPatientAllocation ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleAuto(config.id, "autoPatientAllocation")}
                      className={cn(
                        "h-8 px-4 rounded-lg",
                        config.autoPatientAllocation ? "bg-primary text-white" : "border-slate-200"
                      )}
                    >
                      {config.autoPatientAllocation ? <CheckCircle className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                      {config.autoPatientAllocation ? "ON" : "OFF"}
                    </Button>
                  </div>
                </div>

                {/* Eligibility Rules */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Eligibility Rules</h3>
                      <p className="text-xs text-slate-500">Define criteria for patient batch assignment</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddRule(config.id)}
                      className="h-8 px-3 rounded-lg border-slate-200"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {config.rules.map((rule, ruleIndex) => (
                      <motion.div
                        key={rule.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: ruleIndex * 0.1 }}
                        className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <div className="flex items-center gap-2">
                          <Badge className="text-xs font-semibold bg-primary/10 text-primary border-primary/20">
                            {rule.operator}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{rule.condition}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRule(config.id, rule.id)}
                          className="h-8 w-8 p-0 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button
                    variant="outline"
                    className="h-10 px-6 rounded-xl border-slate-200"
                    onClick={() => setExpandedConfig(null)}
                  >
                    Cancel
                  </Button>
                  <Button className="h-10 px-6 rounded-xl bg-primary text-white" onClick={handleSaveConfig}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900">Quick Actions</CardTitle>
          <CardDescription>
            Perform batch configuration operations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 rounded-xl border-slate-200 flex flex-col items-center justify-center gap-2"
            >
              <Play className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-slate-900">Run Auto Batch Engine</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 rounded-xl border-slate-200 flex flex-col items-center justify-center gap-2"
            >
              <RefreshCw className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-slate-900">Test Eligibility Rules</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 rounded-xl border-slate-200 flex flex-col items-center justify-center gap-2"
            >
              <Zap className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-medium text-slate-900">Preview Batch Generation</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
