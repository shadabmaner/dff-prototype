"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  UserPlus,
  Plus,
  Trash2,
  ArrowRight,
  Save,
  RefreshCw,
  MapPin,
  Star,
  Clock,
  Filter,
  CheckCircle,
  XCircle,
  Edit,
  Copy,
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
type AllocationMethod = "First Enrolled First Assigned" | "Priority Based" | "Location Based" | "Program Based" | "Custom Rules"
type RuleOperator = "AND" | "OR"
type RuleCondition = "Location" | "VIP Status" | "Priority Level" | "Program Type" | "Enrollment Date"

interface AllocationRule {
  id: string
  name: string
  method: AllocationMethod
  priority: number
  isActive: boolean
  conditions: RuleCondition[]
  targetBatch: string
}

interface RuleConditionConfig {
  id: string
  condition: RuleCondition
  operator: RuleOperator
  value: string
}

// Mock Data
const mockAllocationRules: AllocationRule[] = [
  {
    id: "1",
    name: "Pune Location Allocation",
    method: "Location Based",
    priority: 1,
    isActive: true,
    conditions: ["Location"],
    targetBatch: "Pune Batch",
  },
  {
    id: "2",
    name: "Mumbai Location Allocation",
    method: "Location Based",
    priority: 2,
    isActive: true,
    conditions: ["Location"],
    targetBatch: "Mumbai Batch",
  },
  {
    id: "3",
    name: "VIP Patient Priority",
    method: "Priority Based",
    priority: 1,
    isActive: true,
    conditions: ["VIP Status"],
    targetBatch: "Premium Batch",
  },
  {
    id: "4",
    name: "Priority Patient Fast Track",
    method: "Priority Based",
    priority: 2,
    isActive: true,
    conditions: ["Priority Level"],
    targetBatch: "Fast Track Batch",
  },
  {
    id: "5",
    name: "Diabetes Program Allocation",
    method: "Program Based",
    priority: 1,
    isActive: true,
    conditions: ["Program Type"],
    targetBatch: "DFF Batch",
  },
]

const allocationMethods: AllocationMethod[] = [
  "First Enrolled First Assigned",
  "Priority Based",
  "Location Based",
  "Program Based",
  "Custom Rules",
]

const ruleConditions: RuleCondition[] = [
  "Location",
  "VIP Status",
  "Priority Level",
  "Program Type",
  "Enrollment Date",
]

export default function PatientAllocationPage() {
  const [selectedRule, setSelectedRule] = useState<AllocationRule | null>(null)
  const [showRuleDialog, setShowRuleDialog] = useState(false)
  const [showConditionDialog, setShowConditionDialog] = useState(false)
  const [currentRuleConditions, setCurrentRuleConditions] = useState<RuleConditionConfig[]>([])
  const [formData, setFormData] = useState({
    name: "",
    method: "Location Based" as AllocationMethod,
    priority: 1,
    targetBatch: "",
  })

  const handleSaveRule = () => {
    alert("Allocation rule saved successfully")
    setShowRuleDialog(false)
  }

  const handleAddCondition = () => {
    const newCondition: RuleConditionConfig = {
      id: Date.now().toString(),
      condition: "Location",
      operator: "AND",
      value: "",
    }
    setCurrentRuleConditions([...currentRuleConditions, newCondition])
  }

  const handleRemoveCondition = (conditionId: string) => {
    setCurrentRuleConditions(currentRuleConditions.filter((c) => c.id !== conditionId))
  }

  const handleToggleRule = (ruleId: string) => {
    const rule = mockAllocationRules.find((r) => r.id === ruleId)
    if (rule) {
      rule.isActive = !rule.isActive
    }
  }

  const getMethodIcon = (method: AllocationMethod) => {
    switch (method) {
      case "Location Based":
        return <MapPin className="h-4 w-4" />
      case "Priority Based":
        return <Star className="h-4 w-4" />
      case "First Enrolled First Assigned":
        return <Clock className="h-4 w-4" />
      case "Program Based":
        return <Filter className="h-4 w-4" />
      default:
        return <UserPlus className="h-4 w-4" />
    }
  }

  const getMethodColor = (method: AllocationMethod) => {
    switch (method) {
      case "Location Based":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Priority Based":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "First Enrolled First Assigned":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "Program Based":
        return "bg-purple-100 text-purple-700 border-purple-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
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
            Patient <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Allocation Rules</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Define how patients are assigned to batches based on location, priority, and program
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Rules
          </Button>
          <Button className="h-11 px-6 rounded-xl bg-primary text-white" onClick={() => setShowRuleDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </div>

      {/* Allocation Methods Overview */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Allocation Methods</CardTitle>
          <CardDescription>
            Available patient allocation strategies
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {allocationMethods.map((method, index) => (
              <motion.div
                key={method}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary transition-colors cursor-pointer"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    {getMethodIcon(method)}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">{method}</h4>
                  <p className="text-[10px] text-slate-500">
                    {method === "Location Based" && "Assign by city/location"}
                    {method === "Priority Based" && "VIP and priority patients"}
                    {method === "First Enrolled First Assigned" && "FIFO allocation"}
                    {method === "Program Based" && "Program-specific batches"}
                    {method === "Custom Rules" && "Custom logic"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Allocation Rules */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Active Allocation Rules</CardTitle>
          <CardDescription>
            {mockAllocationRules.filter((r) => r.isActive).length} active rules
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {mockAllocationRules.map((rule, index) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  rule.isActive ? "bg-white border-slate-200 shadow-sm" : "bg-slate-50 border-slate-200 opacity-60"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      {getMethodIcon(rule.method)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-slate-900">{rule.name}</h4>
                        <Badge className={cn("text-[10px] font-semibold border", getMethodColor(rule.method))}>
                          {rule.method}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        Priority: {rule.priority} • Target: {rule.targetBatch}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleRule(rule.id)}
                      className={cn(
                        "h-8 w-8 p-0 rounded-lg",
                        rule.isActive ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"
                      )}
                    >
                      {rule.isActive ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                      <Edit className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                      <Copy className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rule Builder Interface */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Rule Builder Interface</CardTitle>
          <CardDescription>
            Visual rule builder similar to HubSpot workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Example Rule 1 */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Location-Based Allocation</h4>
                  <p className="text-xs text-slate-500">Assign patients to batches based on their location</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <Badge className="text-xs font-semibold bg-blue-100 text-blue-700 border-blue-200">IF</Badge>
                  <span className="text-sm text-slate-600">Patient Location</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-900">Pune</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Assign to</span>
                  <Badge className="text-xs font-semibold bg-emerald-100 text-emerald-700 border-emerald-200">Pune Batch</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <Badge className="text-xs font-semibold bg-blue-100 text-blue-700 border-blue-200">IF</Badge>
                  <span className="text-sm text-slate-600">Patient Location</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-900">Mumbai</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Assign to</span>
                  <Badge className="text-xs font-semibold bg-emerald-100 text-emerald-700 border-emerald-200">Mumbai Batch</Badge>
                </div>
              </div>
            </div>

            {/* Example Rule 2 */}
            <div className="p-6 bg-gradient-to-br from-amber-50 to-slate-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Star className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Priority-Based Allocation</h4>
                  <p className="text-xs text-slate-500">VIP and priority patients get premium batches</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <Badge className="text-xs font-semibold bg-amber-100 text-amber-700 border-amber-200">IF</Badge>
                  <span className="text-sm text-slate-600">VIP Status</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-900">True</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Assign to</span>
                  <Badge className="text-xs font-semibold bg-purple-100 text-purple-700 border-purple-200">Premium Batch</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <Badge className="text-xs font-semibold bg-amber-100 text-amber-700 border-amber-200">IF</Badge>
                  <span className="text-sm text-slate-600">Priority Level</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-900">High</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Assign to</span>
                  <Badge className="text-xs font-semibold bg-orange-100 text-orange-700 border-orange-200">Fast Track Batch</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Rule Dialog */}
      <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Create Allocation Rule</DialogTitle>
            <DialogDescription>
              Define a new patient allocation rule
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700">Rule Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Delhi Location Allocation"
                className="h-10 rounded-xl border-slate-200 mt-2"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700">Allocation Method</Label>
              <Select value={formData.method} onValueChange={(v) => setFormData({ ...formData, method: v as AllocationMethod })}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allocationMethods.map((method) => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700">Priority</Label>
              <Input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                className="h-10 rounded-xl border-slate-200 mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">Lower number = higher priority</p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700">Target Batch</Label>
              <Input
                value={formData.targetBatch}
                onChange={(e) => setFormData({ ...formData, targetBatch: e.target.value })}
                placeholder="e.g., Pune Batch"
                className="h-10 rounded-xl border-slate-200 mt-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-semibold text-slate-700">Conditions</Label>
                <Button variant="outline" size="sm" onClick={handleAddCondition} className="h-8 px-3 rounded-lg border-slate-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </div>
              <div className="space-y-2">
                {currentRuleConditions.map((condition, index) => (
                  <div key={condition.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Select value={condition.condition}>
                      <SelectTrigger className="h-8 rounded-lg border-slate-200 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ruleConditions.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={condition.operator}>
                      <SelectTrigger className="h-8 rounded-lg border-slate-200 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={condition.value}
                      placeholder="Value"
                      className="h-8 rounded-lg border-slate-200 text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCondition(condition.id)}
                      className="h-8 w-8 p-0 rounded-lg text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {currentRuleConditions.length === 0 && (
                  <div className="text-center py-4 text-sm text-slate-500">
                    No conditions added yet
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowRuleDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button className="h-10 px-6 rounded-xl bg-primary text-white" onClick={handleSaveRule}>
              <Save className="h-4 w-4 mr-2" />
              Save Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
