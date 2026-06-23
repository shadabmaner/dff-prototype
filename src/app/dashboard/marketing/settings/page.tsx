"use client"

import { useState } from "react"
import {
  Save,
  Globe,
  Mail,
  Bell,
  Shield,
  Palette,
  Users,
  Zap,
  Settings,
  Smartphone,
  Monitor,
  Tablet,
  Target,
  Calendar,
  BarChart3,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function MarketingSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Marketing Settings</h1>
          <p className="text-sm text-gray-500">
            Configure marketing preferences and automation
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* General Settings */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input id="company-name" defaultValue="Healthcare CRM" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-email">Company Email</Label>
              <Input id="company-email" defaultValue="marketing@healthcare-crm.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-phone">Company Phone</Label>
              <Input id="company-phone" defaultValue="+91 8080 808080" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-website">Company Website</Label>
              <Input id="company-website" defaultValue="https://healthcare-crm.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-address">Company Address</Label>
            <Textarea
              id="company-address"
              defaultValue="123 Healthcare Street, Medical District, Bangalore, Karnataka 560001, India"
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input id="smtp-host" defaultValue="smtp.gmail.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input id="smtp-port" defaultValue="587" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-username">SMTP Username</Label>
              <Input id="smtp-username" defaultValue="noreply@healthcare-crm.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-password">SMTP Password</Label>
              <Input id="smtp-password" type="password" defaultValue="••••••••" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Email Notifications</Label>
                <p className="text-sm text-gray-500">Send automated emails to leads and customers</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Tracking</Label>
                <p className="text-sm text-gray-500">Track email opens and clicks</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Settings */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Target className="h-4 w-4" />
            Campaign Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="default-budget">Default Campaign Budget (₹)</Label>
              <Input id="default-budget" defaultValue="50000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-duration">Default Campaign Duration</Label>
              <Select defaultValue="30">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="60">60 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Pause Low Performance</Label>
                <p className="text-sm text-gray-500">Automatically pause campaigns with low conversion rates</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Budget Alerts</Label>
                <p className="text-sm text-gray-500">Notify when campaign budget reaches 80%</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>A/B Testing</Label>
                <p className="text-sm text-gray-500">Enable automatic A/B testing for campaigns</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webinar Settings */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Webinar Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="webinar-capacity">Default Webinar Capacity</Label>
              <Input id="webinar-capacity" defaultValue="500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webinar-duration">Default Webinar Duration</Label>
              <Select defaultValue="60">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 Minutes</SelectItem>
                  <SelectItem value="45">45 Minutes</SelectItem>
                  <SelectItem value="60">1 Hour</SelectItem>
                  <SelectItem value="90">1.5 Hours</SelectItem>
                  <SelectItem value="120">2 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder-time">Default Reminder Time</Label>
              <Select defaultValue="24">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Hour Before</SelectItem>
                  <SelectItem value="2">2 Hours Before</SelectItem>
                  <SelectItem value="6">6 Hours Before</SelectItem>
                  <SelectItem value="12">12 Hours Before</SelectItem>
                  <SelectItem value="24">24 Hours Before</SelectItem>
                  <SelectItem value="48">48 Hours Before</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buffer-time">Buffer Time Between Webinars</Label>
              <Select defaultValue="30">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 Minutes</SelectItem>
                  <SelectItem value="30">30 Minutes</SelectItem>
                  <SelectItem value="60">1 Hour</SelectItem>
                  <SelectItem value="120">2 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Record Webinars</Label>
                <p className="text-sm text-gray-500">Automatically record all webinar sessions</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Q&A</Label>
                <p className="text-sm text-gray-500">Allow attendees to ask questions during webinars</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Send Follow-up Emails</Label>
                <p className="text-sm text-gray-500">Automatically send follow-up emails after webinars</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lead Management Settings */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Lead Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="lead-score-threshold">Lead Score Threshold</Label>
              <Input id="lead-score-threshold" defaultValue="75" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="followup-days">Follow-up Reminder (Days)</Label>
              <Input id="followup-days" defaultValue="3" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Assignment</Label>
                <p className="text-sm text-gray-500">Automatically assign leads to sales representatives</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Duplicate Detection</Label>
                <p className="text-sm text-gray-500">Automatically detect and merge duplicate leads</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Lead Scoring</Label>
                <p className="text-sm text-gray-500">Automatically score leads based on engagement</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Settings */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics & Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Google Analytics</Label>
                <p className="text-sm text-gray-500">Track website traffic and conversions</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Facebook Pixel</Label>
                <p className="text-sm text-gray-500">Track Facebook ad conversions</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>LinkedIn Insight Tag</Label>
                <p className="text-sm text-gray-500">Track LinkedIn ad performance</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Custom Event Tracking</Label>
                <p className="text-sm text-gray-500">Track custom marketing events</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ga-tracking-id">Google Analytics Tracking ID</Label>
            <Input id="ga-tracking-id" placeholder="GA-XXXXXXXXX" defaultValue="GA-123456789" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fb-pixel-id">Facebook Pixel ID</Label>
            <Input id="fb-pixel-id" placeholder="1234567890123456" defaultValue="1234567890123456" />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Campaign Performance Alerts</Label>
                <p className="text-sm text-gray-500">Get notified about campaign performance changes</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Lead Generation Alerts</Label>
                <p className="text-sm text-gray-500">Get notified when new leads are generated</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Webinar Reminders</Label>
                <p className="text-sm text-gray-500">Get reminded about upcoming webinars</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Budget Alerts</Label>
                <p className="text-sm text-gray-500">Get notified when budgets are running low</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Reports</Label>
                <p className="text-sm text-gray-500">Receive weekly marketing performance reports</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="notification-email">Notification Email</Label>
              <Input id="notification-email" defaultValue="marketing@healthcare-crm.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-frequency">Notification Frequency</Label>
              <Select defaultValue="immediate">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Settings */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4" />
            API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable API Access</Label>
                <p className="text-sm text-gray-500">Allow external applications to access marketing data</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Webhook Support</Label>
                <p className="text-sm text-gray-500">Receive real-time updates via webhooks</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Rate Limiting</Label>
                <p className="text-sm text-gray-500">Limit API requests to prevent abuse</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="flex gap-2">
              <Input id="api-key" value="mk_live_1234567890abcdef" readOnly className="font-mono text-sm" />
              <Button variant="outline" size="sm">
                Regenerate
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input id="webhook-url" placeholder="https://your-app.com/webhook" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
