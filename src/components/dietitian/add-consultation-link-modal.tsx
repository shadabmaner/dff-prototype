"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Video, Copy, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface AddConsultationLinkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: {
    patient: string
    time: string
  } | null
}

export function AddConsultationLinkModal({ open, onOpenChange, appointment }: AddConsultationLinkModalProps) {
  const [consultationLink, setConsultationLink] = useState("")
  const [notes, setNotes] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateLink = async () => {
    setIsGenerating(true)
    setTimeout(() => {
      const generatedLink = `https://meet.medikiz.com/${Math.random().toString(36).substring(7)}`
      setConsultationLink(generatedLink)
      setIsGenerating(false)
      toast.success("Video link generated successfully")
    }, 1000)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(consultationLink)
    toast.success("Link copied to clipboard")
  }

  const handleSave = () => {
    if (!consultationLink) {
      toast.error("Please add a consultation link")
      return
    }
    toast.success("Consultation link sent to patient")
    onOpenChange(false)
    setConsultationLink("")
    setNotes("")
  }

  if (!appointment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Add Consultation Link
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Patient:</span>
              <span className="text-sm">{appointment.patient}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Appointment:</span>
              <span className="text-sm">{appointment.time}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="consultation-link">Consultation Link</Label>
            <div className="flex gap-2">
              <Input
                id="consultation-link"
                placeholder="Paste or generate video meeting link"
                value={consultationLink}
                onChange={(e) => setConsultationLink(e.target.value)}
              />
              {consultationLink && (
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGenerateLink}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Meeting Link"}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes for the patient"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {consultationLink && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
              <p className="text-xs text-green-800 dark:text-green-200">
                Patient will receive notification with the consultation link
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save & Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
