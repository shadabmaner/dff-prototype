"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, Plus, X, Link as LinkIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().min(1, "Description is required"),
  specialty: z.string().min(1, "Specialty is required"),
  targetGeography: z.array(z.string()).min(1, "At least one geography is required"),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  budget: z.string().min(1, "Budget is required"),
  startDate: z.date().refine((date) => date !== undefined, { message: "Start date is required" }),
  endDate: z.date().refine((date) => date !== undefined, { message: "End date is required" }),
  trackingUrls: z.array(z.string().url("Invalid URL")).optional(),
})

type CampaignFormValues = z.infer<typeof campaignSchema>

const specialties = [
  "Diabetes",
  "Weight Loss",
  "Thyroid",
  "Heart Health",
  "Mental Wellness",
  "Orthopedics",
  "Women's Health",
  "Pediatrics",
]

const geographies = [
  "North India",
  "South India",
  "East India",
  "West India",
  "Central India",
  "Metro Cities",
  "Tier 2 Cities",
  "Tier 3 Cities",
  "Rural Areas",
]

const languages = [
  "English",
  "Hindi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Marathi",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Punjabi",
]

interface CampaignFormProps {
  initialData?: Partial<CampaignFormValues>
  onSubmit: (data: CampaignFormValues) => void
  onCancel: () => void
  isLoading?: boolean
}

export function CampaignForm({ initialData, onSubmit, onCancel, isLoading }: CampaignFormProps) {
  const [newTrackingUrl, setNewTrackingUrl] = useState("")
  const [trackingUrls, setTrackingUrls] = useState<string[]>(initialData?.trackingUrls || [])

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      specialty: initialData?.specialty || "",
      targetGeography: initialData?.targetGeography || [],
      languages: initialData?.languages || [],
      budget: initialData?.budget || "",
      startDate: initialData?.startDate,
      endDate: initialData?.endDate,
      trackingUrls: initialData?.trackingUrls || [],
    },
  })

  const handleAddTrackingUrl = () => {
    if (newTrackingUrl && !trackingUrls.includes(newTrackingUrl)) {
      setTrackingUrls([...trackingUrls, newTrackingUrl])
      setNewTrackingUrl("")
    }
  }

  const handleRemoveTrackingUrl = (url: string) => {
    setTrackingUrls(trackingUrls.filter((u) => u !== url))
  }

  const handleSubmit = (data: CampaignFormValues) => {
    onSubmit({ ...data, trackingUrls })
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-semibold">
          {initialData ? "Edit Campaign" : "Create New Campaign"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter campaign name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your campaign objectives and target audience"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Target Configuration */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Target Configuration</h3>

              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetGeography"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Geography</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {geographies.map((geo) => (
                        <label
                          key={geo}
                          className={cn(
                            "flex cursor-pointer items-center space-x-2 rounded-md border p-2 text-sm",
                            field.value?.includes(geo)
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={field.value?.includes(geo)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...(field.value || []), geo])
                              } else {
                                field.onChange(field.value?.filter((g) => g !== geo) || [])
                              }
                            }}
                            className="sr-only"
                          />
                          {geo}
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="languages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Languages</FormLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {languages.map((lang) => (
                        <label
                          key={lang}
                          className={cn(
                            "flex cursor-pointer items-center space-x-2 rounded-md border p-2 text-sm",
                            field.value?.includes(lang)
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={field.value?.includes(lang)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...(field.value || []), lang])
                              } else {
                                field.onChange(field.value?.filter((l) => l !== lang) || [])
                              }
                            }}
                            className="sr-only"
                          />
                          {lang}
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Budget and Schedule */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Budget & Schedule</h3>

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter campaign budget"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date() || date < (form.getValues("startDate") || new Date())}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Tracking URLs */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Tracking URLs</h3>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Enter tracking URL"
                      value={newTrackingUrl}
                      onChange={(e) => setNewTrackingUrl(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTrackingUrl}
                    disabled={!newTrackingUrl}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {trackingUrls.length > 0 && (
                  <div className="space-y-2">
                    {trackingUrls.map((url) => (
                      <div key={url} className="flex items-center justify-between rounded-md border p-2">
                        <span className="truncate text-sm text-gray-600">{url}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTrackingUrl(url)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : initialData ? "Update Campaign" : "Create Campaign"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
