"use client"

import * as React from "react"
import {
  Sparkles,
  MapPin,
  Calendar,
  ExternalLink,
  MessageSquare,
  Smartphone,
  Send,
  Eye,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Users,
  Info,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  useResidentialCampStore,
  type CampPatient,
  type CampEventData,
} from "@/store/residential-camp-store"
import { toast } from "sonner"

interface CampBulkNotifyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPatients: CampPatient[]
  onDispatched?: () => void
}

export function CampBulkNotifyModal({
  open,
  onOpenChange,
  selectedPatients,
  onDispatched,
}: CampBulkNotifyModalProps) {
  const { defaultEvent, sendBulkNotifications } = useResidentialCampStore()

  const [eventDates, setEventDates] = React.useState(defaultEvent.dates)
  const [locationName, setLocationName] = React.useState(defaultEvent.locationName)
  const [mapLink, setMapLink] = React.useState(defaultEvent.mapLink)
  const [proposedFee, setProposedFee] = React.useState(defaultEvent.feeAmount)
  const [channels, setChannels] = React.useState<{
    whatsapp: boolean
    sms: boolean
    mobileApp: boolean
  }>({
    whatsapp: true,
    sms: true,
    mobileApp: true,
  })

  const [previewTab, setPreviewTab] = React.useState<"boost" | "notification_only">("boost")

  // Keep state synced with defaultEvent
  React.useEffect(() => {
    if (open) {
      setEventDates(defaultEvent.dates)
      setLocationName(defaultEvent.locationName)
      setMapLink(defaultEvent.mapLink)
      setProposedFee(defaultEvent.feeAmount)
    }
  }, [open, defaultEvent])

  const boostCount = selectedPatients.filter((p) => p.category === "boost_and_payment").length
  const notificationOnlyCount = selectedPatients.filter((p) => p.category === "notification_only").length

  const handleSend = () => {
    if (!selectedPatients.length) {
      toast.error("No patients selected")
      return
    }

    const selectedChannels = [
      channels.whatsapp && "WhatsApp",
      channels.sms && "SMS",
      channels.mobileApp && "Mobile App",
    ].filter(Boolean) as string[]

    if (!selectedChannels.length) {
      toast.error("Please select at least one dispatch channel (WhatsApp, SMS, or Mobile App)")
      return
    }

    const patientIds = selectedPatients.map((p) => p.id)
    sendBulkNotifications(patientIds, {
      eventDates,
      locationName,
      mapLink,
      channels: selectedChannels,
    })

    toast.success(
      `Residential Camp Notification sent to ${selectedPatients.length} patient${
        selectedPatients.length > 1 ? "s" : ""
      }!`,
      {
        description: `Dispatched via ${selectedChannels.join(", ")} with Google Maps link & dates (${eventDates}).`,
      }
    )

    onDispatched?.()
    onOpenChange(false)
  }

  const sampleBoostPatient = selectedPatients.find((p) => p.category === "boost_and_payment") || {
    name: "Sunanda Kadam",
    program: "DFF Standard Care",
  }
  const sampleVipPatient = selectedPatients.find((p) => p.category === "notification_only") || {
    name: "Harishchandra Mehta",
    program: "DFF Special Care (VIP)",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-700 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                {selectedPatients.length > 1
                  ? `Send Bulk Residential Camp Notification (${selectedPatients.length} Patients)`
                  : `Send Residential Camp Notification to ${selectedPatients[0]?.name || "Patient"}`}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Dispatch verified camp dates, venue details, Google Maps links, and personalized fee booking notices.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Recipient breakdown banner */}
        <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-purple-700" />
              Target Recipients Breakdown ({selectedPatients.length} Selected)
            </span>
            <Badge variant="outline" className="bg-white text-purple-800 border-purple-300 font-bold text-[11px]">
              DFF Specialty Program
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-white border border-purple-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Eligible for Boost & Payment</p>
                <p className="text-[11px] text-slate-500">DFF Standard Care & Pro Care</p>
              </div>
              <Badge className="bg-amber-100 text-amber-900 font-bold text-xs">
                {boostCount} Patients (₹{proposedFee.toLocaleString("en-IN")})
              </Badge>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-purple-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Notification Only (Pre-Paid)</p>
                <p className="text-[11px] text-slate-500">DFF Special Care (VIP Reversal)</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-900 font-bold text-xs">
                {notificationOnlyCount} Patients (₹0 Fee)
              </Badge>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 pt-1">
          {/* Dates & Proposed Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-purple-600" />
                Residential Camp Dates
              </Label>
              <Input
                value={eventDates}
                onChange={(e) => setEventDates(e.target.value)}
                placeholder="e.g. 20th to 25th September 2026"
                className="h-10 text-xs font-semibold rounded-xl"
              />
              <p className="text-[10px] text-slate-500">6-Day Intensive Residential Reversal Retreat</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <IndianRupee className="h-3.5 w-3.5 text-emerald-600" />
                Proposed Seat Fee (Standard / Pro Care)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                <Input
                  type="number"
                  value={proposedFee}
                  onChange={(e) => setProposedFee(Number(e.target.value))}
                  className="pl-7 h-10 text-xs font-semibold rounded-xl"
                />
              </div>
              <p className="text-[10px] text-purple-700 font-medium">
                *Waived automatically for Special Care VIP patients (₹0 pre-paid).
              </p>
            </div>
          </div>

          {/* Venue & Google Maps Link */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-purple-600" />
              Retreat Venue / Location
            </Label>
            <Input
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Lonavala Wellness Retreat, Khandala Ghat"
              className="h-10 text-xs font-medium rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                Google Maps Location Link
              </Label>
              {mapLink && (
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  Test Maps Link
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <Input
              value={mapLink}
              onChange={(e) => setMapLink(e.target.value)}
              placeholder="https://maps.google.com/?q=..."
              className="h-10 text-xs rounded-xl font-mono"
            />
          </div>

          {/* Dispatch Channels */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Dispatch Channels
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer p-2 rounded-xl bg-white border border-slate-200">
                <Checkbox
                  checked={channels.whatsapp}
                  onCheckedChange={(c) => setChannels((prev) => ({ ...prev, whatsapp: !!c }))}
                />
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                  WhatsApp Message
                </span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer p-2 rounded-xl bg-white border border-slate-200">
                <Checkbox
                  checked={channels.sms}
                  onCheckedChange={(c) => setChannels((prev) => ({ ...prev, sms: !!c }))}
                />
                <span className="flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-blue-600" />
                  SMS Notice
                </span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer p-2 rounded-xl bg-white border border-slate-200">
                <Checkbox
                  checked={channels.mobileApp}
                  onCheckedChange={(c) => setChannels((prev) => ({ ...prev, mobileApp: !!c }))}
                />
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                  Mobile App Push
                </span>
              </label>
            </div>
          </div>

          {/* Live Message Previews by Category */}
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-slate-500" />
                Live Message Preview (Tailored by Program)
              </span>
            </div>

            <Tabs
              value={previewTab}
              onValueChange={(v) => setPreviewTab(v as "boost" | "notification_only")}
              className="w-full"
            >
              <TabsList className="bg-slate-100 p-1 rounded-xl w-full grid grid-cols-2">
                <TabsTrigger value="boost" className="text-xs font-bold rounded-lg">
                  Standard / Pro Care (With ₹{proposedFee.toLocaleString("en-IN")} Payment Prompt)
                </TabsTrigger>
                <TabsTrigger value="notification_only" className="text-xs font-bold rounded-lg">
                  Special Care VIP (Pre-Paid Attendance Notice)
                </TabsTrigger>
              </TabsList>

              {/* Standard / Pro Care Preview */}
              <TabsContent value="boost" className="mt-3">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-slate-50 to-purple-50/40 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">
                      Sample Recipient: {sampleBoostPatient.name} ({sampleBoostPatient.program})
                    </span>
                    <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold">
                      Add-on Payment: ₹{proposedFee.toLocaleString("en-IN")}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-800 font-sans leading-relaxed">
                    🌟 <strong>DFF 7-Day Residential Reversal Retreat Announcement</strong>
                    <br />
                    Dear {sampleBoostPatient.name}, congratulations on achieving significant reversal milestones in your
                    care journey! Boost your healing at our upcoming Residential Camp from <strong>{eventDates}</strong> at{" "}
                    <strong>{locationName}</strong>.
                    <br />
                    📍 <strong>Venue Maps Link:</strong> {mapLink}
                    <br />
                    💳 <strong>Special Booster Fee:</strong> ₹{proposedFee.toLocaleString("en-IN")} (Includes doctor-supervised detox, cooking masterclasses, and luxury accommodation).
                    <br />
                    👉 Tap the link in this message to confirm your seat and complete the reservation fee via Razorpay.
                  </p>
                </div>
              </TabsContent>

              {/* Special Care VIP Preview */}
              <TabsContent value="notification_only" className="mt-3">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-slate-50 to-blue-50/40 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">
                      Sample Recipient: {sampleVipPatient.name} ({sampleVipPatient.program})
                    </span>
                    <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 text-[10px] font-bold">
                      Pre-Paid in VIP Package (₹0 Due)
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-800 font-sans leading-relaxed">
                    🌟 <strong>Your DFF VIP Residential Reversal Retreat is Scheduled!</strong>
                    <br />
                    Dear {sampleVipPatient.name}, as a valued DFF Special Care member, your 7-Day Residential Reversal
                    Retreat is <strong>pre-paid and included</strong> in your plan!
                    <br />
                    🗓️ <strong>Retreat Dates:</strong> {eventDates}
                    <br />
                    📍 <strong>Venue Location:</strong> {locationName}
                    <br />
                    🗺️ <strong>Google Maps Directions:</strong> {mapLink}
                    <br />
                    ✨ Your accommodation, private consultation slots, and detox meals are fully arranged. Please confirm
                    your arrival details with your dedicated Telecaller Divya Rao.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs font-bold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            className="rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md"
          >
            <Send className="mr-1.5 h-4 w-4" />
            Send Notification to {selectedPatients.length} Patient{selectedPatients.length > 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
