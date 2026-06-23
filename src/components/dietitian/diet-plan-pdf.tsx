"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FileText, Download, Send, Mail, MessageSquare, Eye } from "lucide-react"
import { toast } from "sonner"

interface DietPlanPDFProps {
  patientName: string
  planName: string
}

export function DietPlanPDF({ patientName, planName }: DietPlanPDFProps) {
  const [showSendModal, setShowSendModal] = useState(false)
  const [sendViaApp, setSendViaApp] = useState(true)
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(false)
  const [sendViaEmail, setSendViaEmail] = useState(false)

  const handleGeneratePDF = () => {
    toast.success("Generating PDF...")
    setTimeout(() => {
      toast.success("PDF generated successfully")
    }, 1000)
  }

  const handlePreviewPDF = () => {
    toast.info("Opening PDF preview...")
  }

  const handleSendPDF = () => {
    const methods = []
    if (sendViaApp) methods.push("App Notification")
    if (sendViaWhatsApp) methods.push("WhatsApp")
    if (sendViaEmail) methods.push("Email")

    if (methods.length === 0) {
      toast.error("Please select at least one delivery method")
      return
    }

    toast.success(`Diet plan sent via ${methods.join(", ")}`)
    setShowSendModal(false)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Diet Plan PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{planName}</p>
                <p className="text-sm text-muted-foreground">For: {patientName}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">PDF Includes:</p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Patient name and program details
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Complete diet schedule (all meals)
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Meal plan with calorie breakdown
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Water intake recommendations
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Special instructions and notes
              </li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handlePreviewPDF}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleGeneratePDF}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button 
              className="flex-1"
              onClick={() => setShowSendModal(true)}
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Diet Plan to Patient</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{patientName}</p>
                  <p className="text-sm text-muted-foreground">{planName}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Send Via:</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="app" 
                  checked={sendViaApp}
                  onCheckedChange={(checked) => setSendViaApp(checked as boolean)}
                />
                <label
                  htmlFor="app"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  App Notification
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="whatsapp" 
                  checked={sendViaWhatsApp}
                  onCheckedChange={(checked) => setSendViaWhatsApp(checked as boolean)}
                />
                <label
                  htmlFor="whatsapp"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="email" 
                  checked={sendViaEmail}
                  onCheckedChange={(checked) => setSendViaEmail(checked as boolean)}
                />
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </label>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                Patient will receive the diet plan PDF immediately via selected channels
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendPDF}>
              Send Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
