"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search, Filter, CreditCard, IndianRupee,
  CheckCircle2, Clock, XCircle, RefreshCw,
  Copy, Download, Eye, TrendingUp, Wallet,
  ReceiptText, AlertTriangle, ChevronLeft, ChevronRight,
  Loader2, PlusCircle, Banknote, FileText, ExternalLink,
  Bell, Calendar, User, Phone, Mail, UserPlus, X, Upload,
} from "lucide-react"
import { toast } from "sonner"
import { useTransactionsApi, type ManualPaymentPayload } from "@/hooks/use-transactions-api"
import { useLeadsApi } from "@/hooks/use-leads-api"
import { useSpecialities, useProgramsDropdown, usePlansDropdown } from "@/hooks/use-dropdowns"
import { usePhaseConfigs, type PhaseConfig } from "@/hooks/use-phase-config"
import { apiClient } from "@/lib/api-client"
import { useAuthStore } from "@/store/auth-store"
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { DialogTitle } from "@radix-ui/react-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// ─── Lead Types ────────────────────────────────────────────────────────────────

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  app_source: string
  status: string
  created_at: string
  amount?: number
  program?: string
  notes?: string
}

interface LeadsResponse {
  data: Lead[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n)

const formatDate = (value?: string) => {
  if (!value) return "—"
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    }).format(new Date(value))
  } catch { return value }
}

const getInitials = (name: string) => {
  const words = (name ?? "").trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

const getLeadName = (lead: Lead) => {
  if (lead.name?.trim()) return lead.name.trim()
  if (lead.email) return lead.email
  if (lead.phone) return lead.phone
  const lid = lead.id ?? ""
  return lid ? `Lead …${lid.slice(-8)}` : "Unknown"
}

const DEFAULT_META = { page: 1, limit: 10, total: 0, totalPages: 1, hasNext: false, hasPrev: false }

// ─── Manual Payment Form ──────────────────────────────────────────────────────

const EMPTY_MANUAL_FORM: any = {
  paymentType: "assessment",
  amount: 0,
  paymentMethod: "manual_cash",
  referenceId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  leadId: "",
  notes: "",
  receipt: "",
  programId: "5d202687-24e6-443a-ae9e-95548647a9fe",
  planId: "b3645b2d-d0ff-4682-bef5-921927639d97",
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PendingPaymentsPage() {
  // ── State ────────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [reminderDialog, setReminderDialog] = useState(false)
  
  // Manual payment drawer state
  const [manualDrawer, setManualDrawer] = useState(false)
  const [manualLead, setManualLead] = useState<Lead | null>(null)
  const [manualForm, setManualForm] = useState<any>(EMPTY_MANUAL_FORM)
  const [manualFormErrors, setManualFormErrors] = useState<Partial<Record<string, string>>>({})
  
  // Manual payment form - speciality, program, plan selection
  const [selectedSpecialityId, setSelectedSpecialityId] = useState<string>("")
  const [selectedProgramId, setSelectedProgramId] = useState<string>("")
  const [selectedPlanId, setSelectedPlanId] = useState<string>("")
  const [installmentType, setInstallmentType] = useState<'one-time' | 'phase'>('one-time')
  const [phaseValidationErrors, setPhaseValidationErrors] = useState<string[]>([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [patientSearch, setPatientSearch] = useState<string>("")
  const [dropdownLeadSearch, setDropdownLeadSearch] = useState<string>("")

  // Create patient drawer state
  const [createPatientDrawer, setCreatePatientDrawer] = useState(false)
  const [activeTab, setActiveTab] = useState<"create" | "bulk">("create")
  
  // Create patient form state
  const [patientForm, setPatientForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    source: "walk_in"
  })
  const [patientFormErrors, setPatientFormErrors] = useState<Partial<Record<string, string>>>({})
  const [isCreatingPatient, setIsCreatingPatient] = useState(false)
  const [patientMakePayment, setPatientMakePayment] = useState(false)
  
  // Patient form - speciality, program, plan selection
  const [patientSpecialityId, setPatientSpecialityId] = useState<string>("")
  const [patientProgramId, setPatientProgramId] = useState<string>("")
  const [patientPlanId, setPatientPlanId] = useState<string>("")
  const [patientAmount, setPatientAmount] = useState<number>(0)
  const [patientInstallmentType, setPatientInstallmentType] = useState<'one-time' | 'phase'>('one-time')
  const [patientPhaseValidationErrors, setPatientPhaseValidationErrors] = useState<string[]>([])
  
  // Bulk import form state
  const [bulkImportFile, setBulkImportFile] = useState<File | null>(null)
  const [bulkImportData, setBulkImportData] = useState("")
  const [bulkImportErrors, setBulkImportErrors] = useState<Partial<Record<string, string>>>({})
  const [isBulkImporting, setIsBulkImporting] = useState(false)
  const [bulkMakePayment, setBulkMakePayment] = useState(false)
  const [bulkSpecialityId, setBulkSpecialityId] = useState<string>("")
  const [bulkProgramId, setBulkProgramId] = useState<string>("")
  const [bulkPlanId, setBulkPlanId] = useState<string>("")
  const [bulkAmount, setBulkAmount] = useState<number>(0)
  const [bulkInstallmentType, setBulkInstallmentType] = useState<'one-time' | 'phase'>('one-time')
  const [bulkPhaseValidationErrors, setBulkPhaseValidationErrors] = useState<string[]>([])

  // ── API hooks ─────────────────────────────────────────────────────────────
  const { recordManualPayment, manualPayLoading } = useTransactionsApi()
  
  // Fetch leads using React Query (for main table)
  const limit = 10
  const { data: leadsData, isLoading: loading, refetch } = useLeadsApi({ page, limit, search: search || undefined })
  
  // Fetch leads for dropdown (separate API call with higher limit)
  const { data: dropdownLeadsData } = useLeadsApi({ page: 1, limit: 100, search: dropdownLeadSearch || undefined })
  
  // Dropdown hooks for speciality, program, plan selection
  const { data: specialities } = useSpecialities()
  const { data: programs } = useProgramsDropdown({ speciality_id: selectedSpecialityId })
  const { data: plans } = usePlansDropdown({ program_id: selectedProgramId })
  const { data: phaseConfigs, isLoading: isLoadingPhases } = usePhaseConfigs(selectedPlanId)
  
  // Dropdown hooks for patient form
  const { data: patientPrograms } = useProgramsDropdown({ speciality_id: patientSpecialityId })
  const { data: patientPlans } = usePlansDropdown({ program_id: patientProgramId })
  
  // Dropdown hooks for bulk import form
  const { data: bulkPrograms } = useProgramsDropdown({ speciality_id: bulkSpecialityId })
  const { data: bulkPlans } = usePlansDropdown({ program_id: bulkProgramId })
  const { data: bulkPhaseConfigs, isLoading: isLoadingBulkPhases } = usePhaseConfigs(bulkPlanId)
  
  // Dropdown hooks for patient form phase configs
  const { data: patientPhaseConfigs, isLoading: isLoadingPatientPhases } = usePhaseConfigs(patientPlanId)

  // ── Derived data ──────────────────────────────────────────────────────────
  const leads = leadsData?.data ?? []
  const meta = leadsData?.meta ?? DEFAULT_META

  // ── Filtered data ───────────────────────────────────────────────────────────
  const filteredLeads = useMemo(() => {
    return leads.filter((lead: Lead) => {
      const matchStatus = statusFilter === "all" || lead.status?.toLowerCase() === statusFilter
      return matchStatus
    })
  }, [leads, statusFilter])

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalLeads = leads.length
  const totalAmount = leads.reduce((sum: number, lead: Lead) => sum + (lead.amount || 0), 0)
  const newLeadsCount = leads.filter((lead: Lead) => {
    if (!lead.created_at) return false
    const createdDate = new Date(lead.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return createdDate > weekAgo
  }).length

  // ── Send reminder handler ─────────────────────────────────────────────────────
  const handleSendReminder = async (lead: Lead) => {
    setSelectedLead(lead)
    setReminderDialog(true)
  }

  const confirmSendReminder = async () => {
    if (!selectedLead) return
    
    try {
      // API call to send reminder
      await apiClient.post(`/leads/${selectedLead.id}/reminder`)
      toast.success("Reminder sent successfully")
      setReminderDialog(false)
      setSelectedLead(null)
    } catch (error) {
      console.error("Error sending reminder:", error)
      toast.error("Failed to send reminder")
    }
  }

  // ── Manual payment handlers ────────────────────────────────────────────────────
  const openManualDialog = (lead: Lead) => {
    setManualLead(lead)
    setManualForm({ 
      ...EMPTY_MANUAL_FORM, 
      leadId: lead.id,
      //@ts-ignore
      userId:lead.user_id,
      notes: `Payment for lead from ${lead.app_source}`
    })
    setManualFormErrors({})
    setSelectedSpecialityId("")
    setSelectedProgramId("")
    setSelectedPlanId("")
    setInstallmentType('one-time')
    setPhaseValidationErrors([])
    setShowConfirmation(false)
    setPatientSearch("")
    setDropdownLeadSearch("")
    setManualDrawer(true)
  }

  const validateManualForm = (): boolean => {
    const errs: Partial<Record<keyof any, string>> = {}
    if (!manualForm.leadId?.trim()) errs.leadId = "Lead ID is required"
    if (!manualForm.amount || manualForm.amount <= 0) errs.amount = "Enter a valid amount"
    setManualFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleManualSubmit = async () => {
    if (!validateManualForm()) return
    
    if(manualLead){
  // Add phase-related fields to the payload
    const { phaseNumber, totalPhases, receipt, ...restManualForm } = manualForm
    // Find the selected phase to get its ID
    const selectedPhase = phaseConfigs?.data?.find((p: PhaseConfig) => p.phase_number === phaseNumber)
    const payload: ManualPaymentPayload = {
      ...restManualForm,
      amount: Number(manualForm.amount),
      programId: selectedProgramId,
      planId: selectedPlanId,
      leadId: manualForm.leadId,
      phaseId: selectedPhase?.id,
      //@ts-ignore
      userId:manualLead?.user_id
    }
    
    const success = await recordManualPayment(payload)
    if (success) {
      setManualDrawer(false)
      setManualLead(null)
      refetch()
    }
    }
    else{

      // Add phase-related fields to the payload
      const { phaseNumber, totalPhases, receipt, ...restManualForm } = manualForm
      // Find the selected phase to get its ID
      const selectedPhase = phaseConfigs?.data?.find((p: PhaseConfig) => p.phase_number === phaseNumber)
      const payload: ManualPaymentPayload = {
        ...restManualForm,
        amount: Number(manualForm.amount),
        programId: selectedProgramId,
        planId: selectedPlanId,
        phaseId: selectedPhase?.id,
      }
      
      const success = await recordManualPayment(payload)
      if (success) {
        setManualDrawer(false)
        setManualLead(null)
        refetch()
      }
    }
  }

  const updateManualForm = (field: string, value: string | number) => {
    setManualForm((prev:any) => ({ ...prev, [field]: value }))
    if (manualFormErrors[field]) setManualFormErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  // Handle speciality selection - reset dependent dropdowns
  const handleSpecialityChange = (value: string) => {
    setSelectedSpecialityId(value)
    setSelectedProgramId("")
    setSelectedPlanId("")
    setPhaseValidationErrors([])
  }

  // Handle program selection - reset plan dropdown
  const handleProgramChange = (value: string) => {
    setSelectedProgramId(value)
    setSelectedPlanId("")
    setPhaseValidationErrors([])
  }

  // Handle plan selection - update amount based on plan price
  const handlePlanChange = (value: string) => {
    setSelectedPlanId(value)
    const selectedPlan = plans?.find(p => p.id === value)
    if (selectedPlan?.current_pricing?.base_price) {
      updateManualForm('amount', parseFloat(selectedPlan.current_pricing.base_price))
      updateManualForm('planId', value)
    } else if (selectedPlan?.base_price) {
      updateManualForm('amount', parseFloat(selectedPlan.base_price))
      updateManualForm('planId', value)
    }
    setPhaseValidationErrors([])
  }

  // Validate phase configurations
  const validatePhases = (): boolean => {
    const errors: string[] = []
    const phases = phaseConfigs?.data || []
    
    if (!phases || phases.length === 0) {
      errors.push("No phases found for this plan.")
    } else if (phases.length < 2) {
      errors.push("Minimum 2 phases are required for installment payment.")
    }
    
    // Check if any phase amount is 0
    const hasZeroAmount = phases.some((p: PhaseConfig) => p.amount === 0)
    if (hasZeroAmount) {
      errors.push("Phase amount cannot be zero.")
    }
    
    // Check if sum of phase amounts equals plan price
    const totalPhaseAmount = phases.reduce((sum: number, p: PhaseConfig) => sum + p.amount, 0)
    if (Math.abs(totalPhaseAmount - manualForm.amount) > 0.01) {
      errors.push(`Total phase amounts (${fmt(totalPhaseAmount)}) must equal the plan price (${fmt(manualForm.amount)}).`)
    }
    
    setPhaseValidationErrors(errors)
    return errors.length === 0
  }

  // Handle installment type change
  const handleInstallmentTypeChange = (value: 'one-time' | 'phase') => {
    setInstallmentType(value)
    setPhaseValidationErrors([])
    setShowConfirmation(false)
    
    // Set paymentType based on installment type
    if (value === 'one-time') {
      updateManualForm('paymentType', 'assessment')
    } else if (value === 'phase') {
      updateManualForm('paymentType', 'phase')
    }
    
    if (value === 'phase' && selectedPlanId) {
      validatePhases()
      // Auto-select Phase 1 and update amount
      const phases = phaseConfigs?.data || []
      if (phases.length > 0) {
        const phase1 = phases.find((p: PhaseConfig) => p.phase_number === 1)
        if (phase1) {
          updateManualForm('amount', phase1.amount)
          updateManualForm('phaseNumber', 1)
          updateManualForm('totalPhases', phases.length)
        }
      }
    } else if (value === 'one-time' && selectedPlanId) {
      // Restore amount from plan base_price when switching to one-time
      const selectedPlan = plans?.find(p => p.id === selectedPlanId)
      if (selectedPlan?.current_pricing?.base_price) {
        updateManualForm('amount', parseFloat(selectedPlan?.current_pricing?.base_price))
      }
    }
  }

  // ── Create patient handlers ────────────────────────────────────────────────────
  const openCreatePatientDrawer = () => {
    setActiveTab("create")
    setPatientForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      city: "",
      source: "walk_in"
    })
    setPatientFormErrors({})
    setPatientSpecialityId("")
    setPatientProgramId("")
    setPatientPlanId("")
    setPatientAmount(0)
    setPatientMakePayment(false)
    setPatientInstallmentType('one-time')
    setPatientPhaseValidationErrors([])
    setBulkImportFile(null)
    setBulkImportData("")
    setBulkImportErrors({})
    setBulkSpecialityId("")
    setBulkProgramId("")
    setBulkPlanId("")
    setBulkAmount(0)
    setBulkMakePayment(false)
    setBulkInstallmentType('one-time')
    setBulkPhaseValidationErrors([])
    setCreatePatientDrawer(true)
  }

  const updatePatientForm = (field: string, value: string) => {
    setPatientForm(prev => ({ ...prev, [field]: value }))
    if (patientFormErrors[field]) setPatientFormErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const validatePatientForm = (): boolean => {
    const errs: Partial<Record<string, string>> = {}
    if (!patientForm.firstName?.trim()) errs.firstName = "First name is required"
    if (!patientForm.lastName?.trim()) errs.lastName = "Last name is required"
    if (!patientForm.phone?.trim()) errs.phone = "Phone number is required"
    if (!patientForm.city?.trim()) errs.city = "City is required"
    if (patientMakePayment) {
      if (!patientSpecialityId) errs.speciality = "Speciality is required"
      if (!patientProgramId) errs.program = "Program is required"
      if (!patientPlanId) errs.plan = "Plan is required"
    }
    setPatientFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleCreatePatient = async () => {
    if (!validatePatientForm()) return

    setIsCreatingPatient(true)
    try {
      const fullName = `${patientForm.firstName} ${patientForm.lastName}`.trim()
      const requestData = {
        name: fullName,
        phone: patientForm.phone,
        email: patientForm.email || null,
        source: patientForm.source,
        city: patientForm.city,
        specialty: patientSpecialityId || null,
        notes: patientMakePayment ? `Program: ${patientProgramId}, Plan: ${patientPlanId}` : null
      }

      const response = await apiClient.post('/leads', requestData)

      if (response.data.success) {
        toast.success("Patient created successfully!")
        setCreatePatientDrawer(false)
        
        // Refetch leads to get the new patient
        await refetch()
        
        if (patientMakePayment) {
          // Find the newly created lead
          const newLeads = await apiClient.get('/leads/app-source', { params: { page: 1, limit: 100, search: patientForm.phone } })
          const newLead = newLeads.data.data.find((l: Lead) => l.phone === patientForm.phone)
          
          if (newLead) {
            // Open manual payment drawer with the new patient
            openManualDialog(newLead)
            // Pre-select the program and plan from patient form
            setSelectedSpecialityId(patientSpecialityId)
            setSelectedProgramId(patientProgramId)
            setSelectedPlanId(patientPlanId)
            // Update amount based on selected plan
            const selectedPlan = patientPlans?.find(p => p.id === patientPlanId)
            if (selectedPlan?.current_pricing?.base_price) {
              updateManualForm('amount', parseFloat(selectedPlan.current_pricing.base_price))
            } else if (selectedPlan?.base_price) {
              updateManualForm('amount', parseFloat(selectedPlan.base_price))
            }
          }
        }
      } else {
        toast.error(response.data.message || "Failed to create patient")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred while creating patient")
    } finally {
      setIsCreatingPatient(false)
    }
  }

  // Handle patient form speciality change
  const handlePatientSpecialityChange = (value: string) => {
    setPatientSpecialityId(value)
    setPatientProgramId("")
    setPatientPlanId("")
  }

  // Handle patient form program change
  const handlePatientProgramChange = (value: string) => {
    setPatientProgramId(value)
    setPatientPlanId("")
  }

  // Handle patient form plan change
  const handlePatientPlanChange = (value: string) => {
    setPatientPlanId(value)
    const selectedPlan = patientPlans?.find(p => p.id === value)
    if (selectedPlan?.current_pricing?.base_price) {
      setPatientAmount(parseFloat(selectedPlan.current_pricing.base_price))
    } else if (selectedPlan?.base_price) {
      setPatientAmount(parseFloat(selectedPlan.base_price))
    }
    setPatientPhaseValidationErrors([])
  }

  // Handle patient installment type change
  const handlePatientInstallmentTypeChange = (value: 'one-time' | 'phase') => {
    setPatientInstallmentType(value)
    setPatientPhaseValidationErrors([])
    
    if (value === 'phase' && patientPlanId) {
      const phases = patientPhaseConfigs?.data || []
      if (phases.length > 0) {
        const phase1 = phases.find((p: PhaseConfig) => p.phase_number === 1)
        if (phase1) {
          setPatientAmount(phase1.amount)
        }
      }
    } else if (value === 'one-time' && patientPlanId) {
      const selectedPlan = patientPlans?.find(p => p.id === patientPlanId)
      if (selectedPlan?.current_pricing?.base_price) {
        setPatientAmount(parseFloat(selectedPlan.current_pricing.base_price))
      } else if (selectedPlan?.base_price) {
        setPatientAmount(parseFloat(selectedPlan.base_price))
      }
    }
  }

  // ── Bulk import handlers ───────────────────────────────────────────────────────
  const handleBulkFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBulkImportFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        setBulkImportData(text)
      }
      reader.readAsText(file)
    }
  }

  const handleBulkImport = async () => {
    const errs: Partial<Record<string, string>> = {}
    if (!bulkImportData?.trim()) errs.data = "Import data is required"
    if (bulkMakePayment) {
      if (!bulkSpecialityId) errs.speciality = "Speciality is required"
      if (!bulkProgramId) errs.program = "Program is required"
      if (!bulkPlanId) errs.plan = "Plan is required"
    }
    setBulkImportErrors(errs)
    if (Object.keys(errs).length > 0) return

    setIsBulkImporting(true)
    try {
      // Parse CSV data (assuming format: name,phone,email,city)
      const lines = bulkImportData.trim().split('\n')
      const patients = lines.map(line => {
        const [name, phone, email, city] = line.split(',').map(s => s?.trim())
        return { name, phone, email: email || null, city: city || "Unknown", source: "bulk_import" }
      })

      // Create leads in bulk
      const promises = patients.map(patient => 
        apiClient.post('/leads', {
          ...patient,
          specialty: bulkSpecialityId || null,
          notes: bulkMakePayment ? `Program: ${bulkProgramId}, Plan: ${bulkPlanId}, Installment: ${bulkInstallmentType}, Amount: ${bulkAmount}` : null
        })
      )

      await Promise.all(promises)
      toast.success(`${patients.length} patients imported successfully!`)
      setCreatePatientDrawer(false)
      await refetch()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred during bulk import")
    } finally {
      setIsBulkImporting(false)
    }
  }

  // Handle bulk speciality change
  const handleBulkSpecialityChange = (value: string) => {
    setBulkSpecialityId(value)
    setBulkProgramId("")
    setBulkPlanId("")
  }

  // Handle bulk program change
  const handleBulkProgramChange = (value: string) => {
    setBulkProgramId(value)
    setBulkPlanId("")
  }

  // Handle bulk plan change
  const handleBulkPlanChange = (value: string) => {
    setBulkPlanId(value)
    const selectedPlan = bulkPlans?.find(p => p.id === value)
    if (selectedPlan?.current_pricing?.base_price) {
      setBulkAmount(parseFloat(selectedPlan.current_pricing.base_price))
    } else if (selectedPlan?.base_price) {
      setBulkAmount(parseFloat(selectedPlan.base_price))
    }
    setBulkPhaseValidationErrors([])
  }

  // Handle bulk installment type change
  const handleBulkInstallmentTypeChange = (value: 'one-time' | 'phase') => {
    setBulkInstallmentType(value)
    setBulkPhaseValidationErrors([])
    
    if (value === 'phase' && bulkPlanId) {
      const phases = bulkPhaseConfigs?.data || []
      if (phases.length > 0) {
        const phase1 = phases.find((p: PhaseConfig) => p.phase_number === 1)
        if (phase1) {
          setBulkAmount(phase1.amount)
        }
      }
    } else if (value === 'one-time' && bulkPlanId) {
      const selectedPlan = bulkPlans?.find(p => p.id === bulkPlanId)
      if (selectedPlan?.current_pricing?.base_price) {
        setBulkAmount(parseFloat(selectedPlan.current_pricing.base_price))
      } else if (selectedPlan?.base_price) {
        setBulkAmount(parseFloat(selectedPlan.base_price))
      }
    }
  }

  console.log(plans?.find(p => p.id === selectedPlanId),"selectedPlan")
  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">

      {/* ── Header ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            Clinic Portal / Finance / Pending Payments
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Leads Management</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Track and manage leads from various sources.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* <Button
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold shadow-sm"
              onClick={openCreatePatientDrawer}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Patient Entry
            </Button> */}
            <Button
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold shadow-sm"
              onClick={() => openManualDialog({ id: "", name: "", email: "", phone: "", app_source: "", status: "", created_at: "" })}
            >
              <Banknote className="mr-2 h-4 w-4" />
              Record Manual Payment
            </Button>
            {/* <Button
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold shadow-sm"
            >
              <Bell className="mr-2 h-4 w-4" />
              Send Bulk Reminders
            </Button> */}
            {/* <Button className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button> */}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-3 w-3 text-blue-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-blue-700 font-semibold">Total Leads</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{loading ? "—" : totalLeads}</p>
                <p className="text-xs text-blue-700/80 font-medium">All sources</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-700 font-semibold">New This Week</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{loading ? "—" : newLeadsCount}</p>
                <p className="text-xs text-emerald-700/80 font-medium">Recently added</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <IndianRupee className="h-3 w-3 text-amber-600" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-amber-700 font-semibold">Total Amount</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{loading ? "—" : fmt(totalAmount)}</p>
                <p className="text-xs text-amber-700/80 font-medium">Potential revenue</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <IndianRupee className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, ID, email, phone, source..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 border-slate-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <User className="h-12 w-12 mb-4 text-slate-300" />
              <p className="text-lg font-medium">No leads found</p>
              <p className="text-sm text-slate-400 mt-1">No leads match your search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b border-slate-200">
                    <TableHead className="text-left font-semibold text-slate-700">Lead</TableHead>
                    <TableHead className="text-left font-semibold text-slate-700">Contact</TableHead>
                    <TableHead className="text-left font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="text-left font-semibold text-slate-700">Created</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead: Lead) => (
                    <TableRow key={lead.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-800 to-indigo-900 flex items-center justify-center text-white text-xs font-semibold">
                            {getInitials(getLeadName(lead))}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{getLeadName(lead)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {lead.email && (
                            <div className="flex items-center gap-1 text-xs text-slate-600">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-1 text-xs text-slate-600">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs border ${
                          lead.status === 'new' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          lead.status === 'contacted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          lead.status === 'converted' ? 'bg-green-50 text-green-700 border-green-200' :
                          lead.status === 'lost' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                          {lead.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {lead.created_at ? formatDate(lead.created_at) : "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openManualDialog(lead)}
                            className="border-emerald-300 hover:bg-emerald-50 text-emerald-700"
                          >
                            <Banknote className="h-3 w-3 mr-1" />
                            Pay
                          </Button>
                          <Button size="sm" variant="outline" className="border-slate-300 hover:bg-slate-50">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, meta.total)} of {meta.total} leads
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={!meta.hasPrev}
              className="border-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-slate-600 px-3">
              Page {page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!meta.hasNext}
              className="border-slate-300"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Reminder Dialog */}
      <Dialog open={reminderDialog} onOpenChange={setReminderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm font-medium text-slate-900 mb-2">Lead Details</p>
              <div className="space-y-1 text-sm text-slate-600">
                <p><strong>Name:</strong> {selectedLead && getLeadName(selectedLead)}</p>
                <p><strong>Source:</strong> {selectedLead?.app_source || "Unknown"}</p>
                <p><strong>Created:</strong> {selectedLead && formatDate(selectedLead.created_at)}</p>
              </div>
            </div>
            <div>
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a custom message to the reminder..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReminderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSendReminder}>
              <Bell className="h-4 w-4 mr-2" />
              Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Payment Drawer */}
      <Sheet open={manualDrawer} onOpenChange={(open) => { if (!open) { setManualDrawer(false); setManualLead(null) } }}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Banknote className="h-5 w-5 text-emerald-600" />Record Manual Payment
            </SheetTitle>
            {manualLead && (
              <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-semibold text-slate-900">{getLeadName(manualLead)}</p>
                {/* <p className="text-xs text-slate-600 mt-1">Lead ID: {manualLead.id}</p> */}
                {manualLead.email && (
                  <p className="text-xs text-slate-600">{manualLead.email}</p>
                )}
                {manualLead.phone && (
                  <p className="text-xs text-slate-600">{manualLead.phone}</p>
                )}
              </div>
            )}
          </SheetHeader>
          <div className="space-y-4 py-4">
            {/* Lead Dropdown */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Lead <span className="text-rose-500">*</span></Label>
              <Select value={manualForm.leadId} onValueChange={(value) => {
                updateManualForm('leadId', value)
                // Find and set the selected lead from dropdown data
                const selectedLead = dropdownLeadsData?.data?.find(l => l.id === value)
                if (selectedLead) {
                  setManualLead(selectedLead)
                }
              }}>
                <SelectTrigger className="h-10 w-full border-slate-300">
                  <SelectValue placeholder="Select lead" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2 border-b border-slate-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        value={dropdownLeadSearch}
                        onChange={(e) => setDropdownLeadSearch(e.target.value)}
                        placeholder="Search by name, email, phone..."
                        className="h-9 pl-9 border-slate-300"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  {!dropdownLeadsData?.data || dropdownLeadsData.data.length === 0 ? (
                    <div className="p-2 text-sm text-slate-500">No leads found</div>
                  ) : (
                    dropdownLeadsData.data?.map((lead: Lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{getLeadName(lead)}</span>
                          <span className="text-[10px] text-slate-500">{lead.email || lead.phone || 'No contact info'}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {manualFormErrors.leadId && <p className="text-xs text-rose-500">{manualFormErrors.leadId}</p>}
            </div>

            {/* Speciality, Program, Plan Dropdowns */}
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Speciality</Label>
                <Select value={selectedSpecialityId} onValueChange={handleSpecialityChange}>
                  <SelectTrigger className="h-10 w-full border-slate-300"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {specialities?.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Program</Label>
                <Select value={selectedProgramId} onValueChange={handleProgramChange} disabled={!selectedSpecialityId}>
                  <SelectTrigger className="h-10 w-full border-slate-300"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {programs?.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Plan</Label>
                <Select value={selectedPlanId} onValueChange={handlePlanChange} disabled={!selectedProgramId}>
                  <SelectTrigger className="h-10 w-full border-slate-300"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {plans?.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Type Radio Toggle */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Payment Type</Label>
              <RadioGroup value={installmentType} onValueChange={handleInstallmentTypeChange} disabled={!selectedPlanId}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="one-time" id="one-time" />
                    <Label htmlFor="one-time" className="text-sm font-medium cursor-pointer">One-time</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phase" id="phase" />
                    <Label htmlFor="phase" className="text-sm font-medium cursor-pointer">Phase / Installment</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Phase Details Section */}
            {installmentType === 'phase' && (
              <div className="space-y-3">
                {isLoadingPhases ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  </div>
                ) : !phaseConfigs?.data || phaseConfigs.data.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-700">No installment schedule found for this plan.</p>
                  </div>
                ) : phaseValidationErrors.length > 0 ? (
                  <div className="space-y-2">
                    {phaseValidationErrors.map((error, idx) => (
                      <div key={idx} className="bg-rose-50 border border-rose-200 rounded-lg p-2">
                        <p className="text-xs text-rose-700 flex items-center gap-1.5">
                          <AlertTriangle className="h-3 w-3" />
                          {error}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="text-xs font-semibold text-slate-700">Phase</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-700">Amount</TableHead>
                          <TableHead className="text-xs font-semibold text-slate-700">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {phaseConfigs.data
                          .sort((a: PhaseConfig, b: PhaseConfig) => a.phase_number - b.phase_number)
                          .map((phase: PhaseConfig) => (
                            <TableRow 
                              key={phase.id} 
                              className={phase.phase_number === 1 ? "bg-blue-50" : ""}
                            >
                              <TableCell className="text-xs font-medium">
                                {phase.phase_number === 1 && <span className="text-blue-600">Phase {phase.phase_number} (Selected)</span>}
                                {phase.phase_number !== 1 && <span className="text-slate-600">Phase {phase.phase_number}</span>}
                              </TableCell>
                              <TableCell className="text-xs font-semibold text-slate-900">{fmt(phase.amount)}</TableCell>
                              <TableCell className="text-xs">
                                {phase.phase_number === 1 ? (
                                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">Current</Badge>
                                ) : (
                                  <Badge className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px]">Upcoming</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}

            {/* Amount Field */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Amount (₹) <span className="text-rose-500">*</span></Label>
                <Input 
                  type="number" 
                  min={1} 
                  value={manualForm.amount || ""} 
                  onChange={(e) => updateManualForm("amount", parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 5000"
                  readOnly={true}
                  className={`h-10 cursor-not-allowed border-slate-300 ${manualFormErrors.amount ? "border-rose-400" : ""} bg-slate-50`} 
                />
                {manualFormErrors.amount && <p className="text-xs text-rose-500">{manualFormErrors.amount}</p>}
                <p className="text-[10px] text-slate-500">Auto-populated from selected plan</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Payment Method</Label>
              <Select value={manualForm.paymentMethod} onValueChange={(v) => updateManualForm("paymentMethod", v)}>
                <SelectTrigger className="h-10 w-full border-slate-300"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual_cash">Cash</SelectItem>
                  <SelectItem value="manual_cheque">Cheque</SelectItem>
                  <SelectItem value="manual_bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="manual_upi">UPI (Manual)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reference ID and Receipt */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Reference ID</Label>
                <Input value={manualForm.referenceId} onChange={(e) => updateManualForm("referenceId", e.target.value)} placeholder="Cheque no., UTR…" className="h-10 border-slate-300" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Receipt No.</Label>
                <Input value={manualForm.receipt} onChange={(e) => updateManualForm("receipt", e.target.value)} placeholder="Optional" className="h-10 border-slate-300" />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Notes</Label>
              <Textarea value={manualForm.notes} onChange={(e) => updateManualForm("notes", e.target.value)} placeholder="Any additional info…" className="border-slate-300 resize-none" rows={3} />
            </div>
          </div>
          <SheetFooter className="flex gap-2">
            <Button variant="outline" onClick={() => { setManualDrawer(false); setManualLead(null) }} className="border-slate-300" disabled={manualPayLoading}>Cancel</Button>
            <Button 
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg"
              onClick={handleManualSubmit} 
              disabled={manualPayLoading || (installmentType === 'phase' && phaseValidationErrors.length > 0)}
            >
              {manualPayLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Recording…</> : <><CheckCircle2 className="h-4 w-4 mr-2" />Record Payment</>}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Create Patient Drawer */}
      <Sheet open={createPatientDrawer} onOpenChange={(open) => { if (!open) { setCreatePatientDrawer(false) } }}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />Patient Management
            </SheetTitle>
            <p className="text-sm text-slate-600 mt-1">Create new patient entry or bulk import patients</p>
          </SheetHeader>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "create" | "bulk")} className="mt-4">
            <TabsList className="grid w-full grid-cols-2 ">
              <TabsTrigger className="cursor-pointer" value="create">Create New Patient Entry</TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="bulk">Bulk Import</TabsTrigger>
            </TabsList>
            
            {/* Create Patient Tab */}
            <TabsContent value="create" className="space-y-4 py-4">
              {/* Patient Information */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">First Name <span className="text-rose-500">*</span></Label>
                    <Input 
                      value={patientForm.firstName}
                      onChange={(e) => updatePatientForm("firstName", e.target.value)}
                      placeholder="e.g. John"
                      className="h-10 border-slate-300"
                    />
                    {patientFormErrors.firstName && <p className="text-xs text-rose-500">{patientFormErrors.firstName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Last Name <span className="text-rose-500">*</span></Label>
                    <Input 
                      value={patientForm.lastName}
                      onChange={(e) => updatePatientForm("lastName", e.target.value)}
                      placeholder="e.g. Doe"
                      className="h-10 border-slate-300"
                    />
                    {patientFormErrors.lastName && <p className="text-xs text-rose-500">{patientFormErrors.lastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Email</Label>
                    <Input 
                      type="email"
                      value={patientForm.email}
                      onChange={(e) => updatePatientForm("email", e.target.value)}
                      placeholder="patient@example.com"
                      className="h-10 border-slate-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Phone Number <span className="text-rose-500">*</span></Label>
                    <Input 
                      value={patientForm.phone}
                      onChange={(e) => updatePatientForm("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className="h-10 border-slate-300"
                    />
                    {patientFormErrors.phone && <p className="text-xs text-rose-500">{patientFormErrors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">City <span className="text-rose-500">*</span></Label>
                  <Input 
                    value={patientForm.city}
                    onChange={(e) => updatePatientForm("city", e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="h-10 border-slate-300"
                  />
                  {patientFormErrors.city && <p className="text-xs text-rose-500">{patientFormErrors.city}</p>}
                </div>
              </div>

              {/* Make Payment Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="patient-make-payment" 
                  checked={patientMakePayment}
                  onCheckedChange={(checked) => setPatientMakePayment(checked as boolean)}
                />
                <Label htmlFor="patient-make-payment" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Make payment for this patient
                </Label>
              </div>

              {/* Speciality, Program, Plan Selection - Only shown when make payment is checked */}
              {patientMakePayment && (
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Speciality <span className="text-rose-500">*</span></Label>
                    <Select value={patientSpecialityId} onValueChange={handlePatientSpecialityChange}>
                      <SelectTrigger className="h-10 w-full border-slate-300"><SelectValue placeholder="Select speciality" /></SelectTrigger>
                      <SelectContent>
                        {specialities?.map((s: any) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {patientFormErrors.speciality && <p className="text-xs text-rose-500">{patientFormErrors.speciality}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Program <span className="text-rose-500">*</span></Label>
                    <Select value={patientProgramId} onValueChange={handlePatientProgramChange} disabled={!patientSpecialityId}>
                      <SelectTrigger className="h-10 w-full border-slate-300"><SelectValue placeholder="Select program" /></SelectTrigger>
                      <SelectContent>
                        {patientPrograms?.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {patientFormErrors.program && <p className="text-xs text-rose-500">{patientFormErrors.program}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Plan <span className="text-rose-500">*</span></Label>
                    <Select value={patientPlanId} onValueChange={handlePatientPlanChange} disabled={!patientProgramId}>
                      <SelectTrigger className="h-10 w-full border-slate-300"><SelectValue placeholder="Select plan" /></SelectTrigger>
                      <SelectContent>
                        {patientPlans?.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {patientFormErrors.plan && <p className="text-xs text-rose-500">{patientFormErrors.plan}</p>}
                  </div>

                  {/* Payment Type Radio Toggle */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Payment Type</Label>
                    <RadioGroup value={patientInstallmentType} onValueChange={handlePatientInstallmentTypeChange} disabled={!patientPlanId}>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="one-time" id="patient-one-time" />
                          <Label htmlFor="patient-one-time" className="text-sm font-medium cursor-pointer">One-time</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="phase" id="patient-phase" />
                          <Label htmlFor="patient-phase" className="text-sm font-medium cursor-pointer">Phase / Installment</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Phase Details Section */}
                  {patientInstallmentType === 'phase' && (
                    <div className="space-y-3">
                      {isLoadingPatientPhases ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                        </div>
                      ) : !patientPhaseConfigs?.data || patientPhaseConfigs.data.length === 0 ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <p className="text-xs text-amber-700">No installment schedule found for this plan.</p>
                        </div>
                      ) : patientPhaseValidationErrors.length > 0 ? (
                        <div className="space-y-2">
                          {patientPhaseValidationErrors.map((error, idx) => (
                            <div key={idx} className="bg-rose-50 border border-rose-200 rounded-lg p-2">
                              <p className="text-xs text-rose-700 flex items-center gap-1.5">
                                <AlertTriangle className="h-3 w-3" />
                                {error}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-50">
                                <TableHead className="text-xs font-semibold text-slate-700">Phase</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-700">Amount</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-700">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {patientPhaseConfigs.data
                                .sort((a: PhaseConfig, b: PhaseConfig) => a.phase_number - b.phase_number)
                                .map((phase: PhaseConfig) => (
                                  <TableRow 
                                    key={phase.id} 
                                    className={phase.phase_number === 1 ? "bg-blue-50" : ""}
                                  >
                                    <TableCell className="text-xs font-medium">
                                      {phase.phase_number === 1 && <span className="text-blue-600">Phase {phase.phase_number} (Selected)</span>}
                                      {phase.phase_number !== 1 && <span className="text-slate-600">Phase {phase.phase_number}</span>}
                                    </TableCell>
                                    <TableCell className="text-xs font-semibold text-slate-900">{fmt(phase.amount)}</TableCell>
                                    <TableCell className="text-xs">
                                      {phase.phase_number === 1 ? (
                                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">Current</Badge>
                                      ) : (
                                        <Badge className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px]">Upcoming</Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Amount (₹) <span className="text-rose-500">*</span></Label>
                    <Input 
                      type="number" 
                      value={patientAmount || ""} 
                      onChange={(e) => setPatientAmount(parseFloat(e.target.value) || 0)}
                      className="h-10 border-slate-300"
                    />
                    <p className="text-[10px] text-slate-500">Auto-populated from selected plan, but editable</p>
                  </div>
                </div>
              )}

              {/* Source */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Source</Label>
                <Select value={patientForm.source} onValueChange={(value) => updatePatientForm("source", value)}>
                  <SelectTrigger className="h-10 w-full border-slate-300"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk_in">Walk-in</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="campaign">Campaign</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Bulk Import Tab */}
            <TabsContent value="bulk" className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Import CSV File <span className="text-rose-500">*</span></Label>
                {bulkImportFile ? (
                  <div className="relative">
                    <div className="flex items-center justify-between p-3 rounded-xl border-2 border-slate-200 bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{bulkImportFile.name}</p>
                          <p className="text-[10px] text-slate-500">{(bulkImportFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setBulkImportFile(null)
                          setBulkImportData("")
                        }}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400 transition-all group">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 mb-2">
                      <Upload className="h-5 w-5 text-slate-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-600">Click to upload CSV file</p>
                    <p className="text-[10px] text-slate-400 mt-1">CSV format: name,phone,email,city</p>
                    <input type="file" className="hidden" accept=".csv" onChange={handleBulkFileUpload} />
                  </label>
                )}
                {bulkImportErrors.data && <p className="text-xs text-rose-500">{bulkImportErrors.data}</p>}
                <p className="text-[10px] text-slate-500">CSV format: name,phone,email,city (one patient per line)</p>
              </div>

              {/* Make Payment Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="bulk-make-payment" 
                  checked={bulkMakePayment}
                  onCheckedChange={(checked) => setBulkMakePayment(checked as boolean)}
                />
                <Label htmlFor="bulk-make-payment" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Assign payment plan to all imported patients
                </Label>
              </div>

              {/* Speciality, Program, Plan Selection - Only shown when make payment is checked */}
              {bulkMakePayment && (
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Speciality <span className="text-rose-500">*</span></Label>
                    <Select value={bulkSpecialityId} onValueChange={handleBulkSpecialityChange}>
                      <SelectTrigger className="h-10 w-full border-slate-300"><SelectValue placeholder="Select speciality" /></SelectTrigger>
                      <SelectContent>
                        {specialities?.map((s: any) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {bulkImportErrors.speciality && <p className="text-xs text-rose-500">{bulkImportErrors.speciality}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Program <span className="text-rose-500">*</span></Label>
                    <Select value={bulkProgramId} onValueChange={handleBulkProgramChange} disabled={!bulkSpecialityId}>
                      <SelectTrigger className="h-10 w-full border-slate-300"><SelectValue placeholder="Select program" /></SelectTrigger>
                      <SelectContent>
                        {bulkPrograms?.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {bulkImportErrors.program && <p className="text-xs text-rose-500">{bulkImportErrors.program}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Plan <span className="text-rose-500">*</span></Label>
                    <Select value={bulkPlanId} onValueChange={handleBulkPlanChange} disabled={!bulkProgramId}>
                      <SelectTrigger className="h-10 w-full border-slate-300"><SelectValue placeholder="Select plan" /></SelectTrigger>
                      <SelectContent>
                        {bulkPlans?.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {bulkImportErrors.plan && <p className="text-xs text-rose-500">{bulkImportErrors.plan}</p>}
                  </div>

                  {/* Payment Type Radio Toggle */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Payment Type</Label>
                    <RadioGroup value={bulkInstallmentType} onValueChange={handleBulkInstallmentTypeChange} disabled={!bulkPlanId}>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="one-time" id="bulk-one-time" />
                          <Label htmlFor="bulk-one-time" className="text-sm font-medium cursor-pointer">One-time</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="phase" id="bulk-phase" />
                          <Label htmlFor="bulk-phase" className="text-sm font-medium cursor-pointer">Phase / Installment</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Phase Details Section */}
                  {bulkInstallmentType === 'phase' && (
                    <div className="space-y-3">
                      {isLoadingBulkPhases ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                        </div>
                      ) : !bulkPhaseConfigs?.data || bulkPhaseConfigs.data.length === 0 ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <p className="text-xs text-amber-700">No installment schedule found for this plan.</p>
                        </div>
                      ) : bulkPhaseValidationErrors.length > 0 ? (
                        <div className="space-y-2">
                          {bulkPhaseValidationErrors.map((error, idx) => (
                            <div key={idx} className="bg-rose-50 border border-rose-200 rounded-lg p-2">
                              <p className="text-xs text-rose-700 flex items-center gap-1.5">
                                <AlertTriangle className="h-3 w-3" />
                                {error}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-50">
                                <TableHead className="text-xs font-semibold text-slate-700">Phase</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-700">Amount</TableHead>
                                <TableHead className="text-xs font-semibold text-slate-700">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {bulkPhaseConfigs.data
                                .sort((a: PhaseConfig, b: PhaseConfig) => a.phase_number - b.phase_number)
                                .map((phase: PhaseConfig) => (
                                  <TableRow 
                                    key={phase.id} 
                                    className={phase.phase_number === 1 ? "bg-blue-50" : ""}
                                  >
                                    <TableCell className="text-xs font-medium">
                                      {phase.phase_number === 1 && <span className="text-blue-600">Phase {phase.phase_number} (Selected)</span>}
                                      {phase.phase_number !== 1 && <span className="text-slate-600">Phase {phase.phase_number}</span>}
                                    </TableCell>
                                    <TableCell className="text-xs font-semibold text-slate-900">{fmt(phase.amount)}</TableCell>
                                    <TableCell className="text-xs">
                                      {phase.phase_number === 1 ? (
                                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">Current</Badge>
                                      ) : (
                                        <Badge className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px]">Upcoming</Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Amount (₹) <span className="text-rose-500">*</span></Label>
                    <Input 
                      type="number" 
                      value={bulkAmount || ""} 
                      onChange={(e) => setBulkAmount(parseFloat(e.target.value) || 0)}
                      className="h-10 border-slate-300"
                    />
                    <p className="text-[10px] text-slate-500">Auto-populated from selected plan, but editable</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <SheetFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setCreatePatientDrawer(false)} className="border-slate-300" disabled={isCreatingPatient || isBulkImporting}>Cancel</Button>
            {activeTab === "create" ? (
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg"
                onClick={handleCreatePatient} 
                disabled={isCreatingPatient}
              >
                {isCreatingPatient ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating…</> : <><UserPlus className="h-4 w-4 mr-2" />Create Patient</>}
              </Button>
            ) : (
              <Button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg"
                onClick={handleBulkImport} 
                disabled={isBulkImporting}
              >
                {isBulkImporting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importing…</> : <><UserPlus className="h-4 w-4 mr-2" />Bulk Import</>}
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
