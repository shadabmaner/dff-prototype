"use client"

import * as React from "react"
import {
  Sparkles,
  MapPin,
  Link as LinkIcon,
  MessageSquare,
  Smartphone,
  Send,
  Eye,
  CheckCircle2,
  Calendar,
  IndianRupee,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export interface CampReminderData {
  location: string
  locationLink: string
  title: string
  description: string
  channels: {
    whatsapp: boolean
    mobileApp: boolean
  }
}

interface CampReminderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  patientName: string
  patientPhone: string
  tenureDays: number
  programName?: string
  clinicalImprovement?: string
  onSend: (patientId: string, data: CampReminderData) => void
}

const DEFAULT_LOCATIONS = [
  {
    name: "Lonavala Wellness Retreat (The Dukes Retreat)",
    link: "https://dff.health/camps/lonavala-retreat-2026",
    dates: "Oct 12 - Oct 18, 2026",
  },
  {
    name: "Mahabaleshwar Mountain Healing Camp (Brightland Resort)",
    link: "https://dff.health/camps/mahabaleshwar-camp-2026",
    dates: "Nov 5 - Nov 11, 2026",
  },
  {
    name: "Goa Reversal & Longevity Camp (Alila Diwa)",
    link: "https://dff.health/camps/goa-reversal-camp-2026",
    dates: "Dec 1 - Dec 7, 2026",
  },
]

export function CampReminderModal({
  open,
  onOpenChange,
  patientId,
  patientName,
  patientPhone,
  tenureDays,
  programName = "DFF VIP Care Plan",
  clinicalImprovement = "HbA1c: 8.5% → 6.7% (-4.2 kg)",
  onSend,
}: CampReminderModalProps) {
  const [selectedLocIndex, setSelectedLocIndex] = React.useState("0")
  const [locationName, setLocationName] = React.useState(DEFAULT_LOCATIONS[0].name)
  const [locationLink, setLocationLink] = React.useState(DEFAULT_LOCATIONS[0].link)
  const [title, setTitle] = React.useState("🌟 Exclusive 7-Day Residential Reversal Retreat - Lonavala")
  const [description, setDescription] = React.useState(
    `Dear ${patientName}, congratulations on completing ${tenureDays} days with great progress (${clinicalImprovement})! Boost your reversal journey with our upcoming 7-Day Residential Reversal Retreat at Lonavala. Doctor-supervised detox, cooking workshops & yoga. Special booster fee: ₹35,000.`
  )
  const [sendWhatsApp, setSendWhatsApp] = React.useState(true)
  const [sendMobileApp, setSendMobileApp] = React.useState(true)

  React.useEffect(() => {
    if (open) {
      setDescription(
        `Dear ${patientName}, congratulations on completing ${tenureDays} days with great progress (${clinicalImprovement})! Boost your reversal journey with our upcoming 7-Day Residential Reversal Retreat at Lonavala. Doctor-supervised detox, cooking workshops & yoga. Special booster fee: ₹35,000.`
      )
    }
  }, [open, patientName, tenureDays, clinicalImprovement])

  const handleLocationChange = (val: string) => {
    setSelectedLocIndex(val)
    const idx = Number(val)
    if (DEFAULT_LOCATIONS[idx]) {
      setLocationName(DEFAULT_LOCATIONS[idx].name)
      setLocationLink(DEFAULT_LOCATIONS[idx].link)
      setTitle(`🌟 7-Day Residential Reversal Retreat - ${DEFAULT_LOCATIONS[idx].name.split("(")[0].trim()}`)
    }
  }

  const handleDispatch = () => {
    onSend(patientId, {
      location: locationName,
      locationLink,
      title,
      description,
      channels: {
        whatsapp: sendWhatsApp,
        mobileApp: sendMobileApp,
      },
    })

    toast.success(`Residential Camp Reminder sent to ${patientName}!`, {
      description: `Dispatched via ${[sendWhatsApp && "WhatsApp", sendMobileApp && "Mobile App"].filter(Boolean).join(" & ")}. Status updated.`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl p-6 sm:p-8">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100/70 text-purple-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Initiate Residential Camp Booster Reminder
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Push personalized camp invitation and brochure links directly to patient's WhatsApp & Mobile App.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Patient Eligibility Badge */}
        <div className="flex flex-wrap items-center justify-between p-3.5 rounded-2xl bg-purple-50/50 border border-purple-200/80 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-slate-900">{patientName}</p>
              <Badge className="bg-purple-100 text-purple-800 text-[10px] font-bold">
                {tenureDays} Days Completed (Eligible &gt;90d)
              </Badge>
            </div>
            <p className="text-[11px] text-purple-700 font-medium mt-0.5">
              {programName} · {clinicalImprovement}
            </p>
          </div>
          <Badge variant="outline" className="border-purple-300 text-purple-800 bg-white font-bold text-[10px]">
            Booster Fee: ₹35,000
          </Badge>
        </div>

        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {/* Location Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-purple-600" />
              Select Residential Camp Venue
            </Label>
            <Select value={selectedLocIndex} onValueChange={handleLocationChange}>
              <SelectTrigger className="h-10 rounded-xl text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {DEFAULT_LOCATIONS.map((loc, i) => (
                  <SelectItem key={loc.name} value={String(i)} className="text-xs">
                    {loc.name} ({loc.dates})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Brochure Link */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <LinkIcon className="h-3.5 w-3.5 text-blue-600" />
              Brochure / Itinerary Web Link
            </Label>
            <Input
              value={locationLink}
              onChange={(e) => setLocationLink(e.target.value)}
              className="h-9 text-xs rounded-xl"
            />
          </div>

          {/* Notification Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Notification Card Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-xs font-semibold rounded-xl"
            />
          </div>

          {/* Draft Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">
              Notification & WhatsApp Draft Message
            </Label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs rounded-xl resize-none"
            />
          </div>

          {/* Dispatch Channels */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Dispatch Channels
            </span>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                <Checkbox
                  checked={sendWhatsApp}
                  onCheckedChange={(c) => setSendWhatsApp(!!c)}
                />
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                  WhatsApp Direct Message
                </span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                <Checkbox
                  checked={sendMobileApp}
                  onCheckedChange={(c) => setSendMobileApp(!!c)}
                />
                <span className="flex items-center gap-1">
                  <Smartphone className="h-3.5 w-3.5 text-blue-600" />
                  Mobile App Push Card
                </span>
              </label>
            </div>
          </div>

          {/* Live Mobile Card Preview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3 text-slate-400" />
                Patient Mobile Preview
              </span>
              <span className="text-purple-600">DFF App Notification</span>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 via-slate-50 to-purple-50/30 border border-purple-100">
              <p className="text-xs font-bold text-purple-950">{title}</p>
              <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{description}</p>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-purple-700">Fee: ₹35,000</span>
                <span className="text-[10px] font-bold text-blue-600 underline">Tap to view itinerary & map</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDispatch}
            className="rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md"
          >
            <Send className="mr-1.5 h-4 w-4" />
            Send WhatsApp & App Reminders
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
