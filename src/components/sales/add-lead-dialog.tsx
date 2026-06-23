"use client"

import * as React from "react"
import type { Priority } from "@/components/sales/types"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { useLanguages } from "@/hooks/use-languages"
import { useSpecialitiesQuery } from "@/hooks/use-specialities"
import { useWorkflowPrograms } from "@/hooks/use-workflow-programs"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerFooter } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { UserPlus, Plus, Clock, Sparkles, Loader2 } from "lucide-react"

interface AddLeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const campaigns = [
  "Webinar - Diabetes Care",
  "Campaign - Ortho Pain",
  "Webinar - Cardio",
  "Campaign - Weight Loss",
  "Social Media - Health Tips",
  "Email Campaign - Nutrition",
]

const sources = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "campaign", label: "Campaign" },
  { value: "event", label: "Event" },
  { value: "walk_in", label: "Walk-in" },
  { value: "social_media", label: "Social Media" },
]

const priorityOptions: Priority[] = ["low", "medium", "high"]
const quickSources = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "campaign", label: "Campaign" },
]

const sectionCardStyles = "rounded-3xl border border-white/40 bg-white/80 p-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)]"
const sectionLabelStyles = "text-[11px] font-black uppercase tracking-widest text-slate-500"
const inputStyles =
  "h-11 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium"

export function AddLeadDialog({ open, onOpenChange, onSuccess }: AddLeadDialogProps) {
  const [isAdding, setIsAdding] = React.useState(false)
  const { data: languagesData, isLoading: isLoadingLanguages } = useLanguages()
  const { data: specialitiesData, isLoading: isLoadingSpecialities } = useSpecialitiesQuery()
  const { data: programsData, isLoading: isLoadingPrograms } = useWorkflowPrograms({ limit: 100 })
  
  const [formData, setFormData] = React.useState({
    name: "",
    phone: "",
    email: "",
    source: "",
    priority: "medium" as Priority,
    city: "",
    notes: "",
    language: "",
    specialty: "",
    mode: "online"
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '')
    // Check if it's a valid Indian mobile number (10 digits) or international format
    return cleanPhone.length >= 10 && cleanPhone.length <= 15
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.phone || !formData.city || !formData.source) {
      toast.error("Please fill in all required fields (marked with *)")
      return
    }

    // Validate mobile number
    if (!validatePhone(formData.phone)) {
      toast.error("Please enter a valid mobile number")
      return
    }

    // Validate email if provided
    if (formData.email && !validateEmail(formData.email)) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsAdding(true)

    try {
      const requestData: any = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        source: formData.source,
        priority: formData.priority,
        city: formData.city,
        notes: formData.notes || null,
        language: formData.language || null,
        specialty: formData.specialty || null,
        mode: formData.mode || null
      }

      const response = await apiClient.post('/leads', requestData)

      if (response.data.success) {
        toast.success("Lead added successfully!")
        
        // Reset form
        setFormData({
          name: "",
          phone: "",
          email: "",
          source: "",
          priority: "medium" as Priority,
          city: "",
          notes: "",
          language: "",
          specialty: "",
          mode: "online"
        })
        
        // Close dialog
        onOpenChange(false)
        
        // Call success callback
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast.error(response.data.message || "Failed to add lead")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred while adding lead")
    } finally {
      setIsAdding(false)
    }
  }

  const isFormValid = Boolean(
    formData.name &&
    formData.phone &&
    formData.city &&
    formData.source &&
    formData.priority &&
    validatePhone(formData.phone) &&
    (!formData.email || validateEmail(formData.email))
  )

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button className="h-10 rounded-full bg-gradient-to-r from-primary to-blue-500 px-5 text-[12px] font-black uppercase tracking-[0.2em] shadow-md">
          <Plus className="h-4 w-4 mr-2" />
          Add New Lead
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full min-w-lg max-w-3xl overflow-y-auto border-l bg-white/95 shadow-2xl backdrop-blur-xl sm:max-w-3xl">
        <DrawerHeader className="px-10 pt-10 pb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Lead</h2>
          <p className="text-[11px] uppercase font-black tracking-[0.2em] text-slate-400 mt-1">
            Capture essential lead information to initialize the record.
          </p>
        </DrawerHeader>
        <div className="px-10 py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className={sectionLabelStyles}>
                Patient Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g. John Doe"
                className={inputStyles}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className={sectionLabelStyles}>
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+91 98765 43210"
                className={inputStyles}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className={sectionLabelStyles}>Email Address</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="patient@example.com"
                  className={inputStyles}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={sectionLabelStyles}>
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="e.g. Mumbai"
                  className={inputStyles}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className={sectionLabelStyles}>
                Source <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.source} onValueChange={(value) => handleInputChange("source", value)}>
                <SelectTrigger className={inputStyles}>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2">
                {quickSources.map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => handleInputChange("source", chip.value)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-wide transition",
                      formData.source === chip.value
                        ? "border-primary bg-primary/10 text-primary shadow-[0_5px_15px_rgba(59,130,246,0.25)]"
                        : "border-slate-200 text-slate-500 hover:border-primary/40 hover:text-primary"
                    )}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className={sectionLabelStyles}>Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => handleInputChange("language", value)}
                  disabled={isLoadingLanguages}
                >
                  <SelectTrigger className={inputStyles}>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languagesData?.data?.map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        {language.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className={sectionLabelStyles}>Speciality</Label>
                <Select
                  value={formData.specialty}
                  onValueChange={(value) => handleInputChange("specialty", value)}
                  disabled={isLoadingSpecialities}
                >
                  <SelectTrigger className={inputStyles}>
                    <SelectValue placeholder="Select speciality" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialitiesData?.data?.map((speciality) => (
                      <SelectItem key={speciality.id} value={speciality.id}>
                        {speciality.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className={sectionLabelStyles}>Mode</Label>
                <Select value={formData.mode} onValueChange={(value) => handleInputChange("mode", value)}>
                  <SelectTrigger className={inputStyles}>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className={sectionLabelStyles}>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Add any additional notes about the lead..."
                className="rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium"
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              className="cursor-pointer w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]" 
              disabled={isAdding || !isFormValid}
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Lead...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                   Create
                </>
              )}
            </Button>
          </form>
        </div>
        
      </DrawerContent>
    </Drawer>
  )
}
