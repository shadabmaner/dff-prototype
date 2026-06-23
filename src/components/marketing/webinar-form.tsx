"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, Plus, X, Clock, Users, Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { format, addHours, addDays } from "date-fns"

const webinarSchema = z.object({
  title: z.string().min(1, "Webinar title is required"),
  description: z.string().min(1, "Description is required"),
  speaker: z.string().min(1, "Speaker name is required"),
  speakerTitle: z.string().min(1, "Speaker title is required"),
  date: z.date().refine((date) => date !== undefined, { message: "Date is required" }),
  time: z.string().min(1, "Time is required"),
  duration: z.string().min(1, "Duration is required"),
  capacity: z.string().min(1, "Capacity is required"),
  specialty: z.string().min(1, "Specialty is required"),
  targetAudience: z.array(z.string()).min(1, "At least one target audience is required"),
  reminderSettings: z.object({
    oneDayBefore: z.boolean(),
    oneHourBefore: z.boolean(),
    fifteenMinutesBefore: z.boolean(),
  }),
  interestPolls: z.array(z.object({
    question: z.string().min(1, "Question is required"),
    options: z.array(z.string().min(1)).min(2, "At least 2 options required"),
  })).optional(),
  engagementNotifications: z.boolean(),
})

type WebinarFormValues = z.infer<typeof webinarSchema>

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

const targetAudiences = [
  "Patients",
  "Caregivers",
  "Healthcare Professionals",
  "General Public",
  "Students",
  "Senior Citizens",
  "Young Adults",
]

const speakers = [
  { name: "Dr. Rajesh Kumar", title: "Senior Endocrinologist", specialty: "Diabetes" },
  { name: "Dr. Priya Sharma", title: "Nutritionist & Dietitian", specialty: "Weight Loss" },
  { name: "Dr. Amit Patel", title: "Thyroid Specialist", specialty: "Thyroid" },
  { name: "Dr. Meera Desai", title: "Cardiologist", specialty: "Heart Health" },
  { name: "Dr. Vikram Nair", title: "Psychiatrist", specialty: "Mental Wellness" },
  { name: "Dr. Anita Reddy", title: "Orthopedic Surgeon", specialty: "Orthopedics" },
]

const durations = [
  "30 minutes",
  "45 minutes",
  "1 hour",
  "1.5 hours",
  "2 hours",
]

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
  "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM",
]

interface WebinarFormProps {
  initialData?: Partial<WebinarFormValues>
  onSubmit: (data: WebinarFormValues) => void
  onCancel: () => void
  isLoading?: boolean
}

export function WebinarForm({ initialData, onSubmit, onCancel, isLoading }: WebinarFormProps) {
  const [interestPolls, setInterestPolls] = useState(
    initialData?.interestPolls || [{ question: "", options: ["", ""] }]
  )

  const form = useForm<WebinarFormValues>({
    resolver: zodResolver(webinarSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      speaker: initialData?.speaker || "",
      speakerTitle: initialData?.speakerTitle || "",
      date: initialData?.date,
      time: initialData?.time || "",
      duration: initialData?.duration || "1 hour",
      capacity: initialData?.capacity || "",
      specialty: initialData?.specialty || "",
      targetAudience: initialData?.targetAudience || [],
      reminderSettings: initialData?.reminderSettings || {
        oneDayBefore: true,
        oneHourBefore: true,
        fifteenMinutesBefore: true,
      },
      interestPolls: initialData?.interestPolls || [],
      engagementNotifications: initialData?.engagementNotifications || true,
    },
  })

  const handleSpeakerChange = (speakerName: string) => {
    const speaker = speakers.find(s => s.name === speakerName)
    if (speaker) {
      form.setValue("speaker", speaker.name)
      form.setValue("speakerTitle", speaker.title)
      form.setValue("specialty", speaker.specialty)
    }
  }

  const handleAddPoll = () => {
    setInterestPolls([...interestPolls, { question: "", options: ["", ""] }])
  }

  const handleRemovePoll = (index: number) => {
    setInterestPolls(interestPolls.filter((_, i) => i !== index))
  }

  const handlePollQuestionChange = (index: number, question: string) => {
    const updatedPolls = [...interestPolls]
    updatedPolls[index].question = question
    setInterestPolls(updatedPolls)
  }

  const handlePollOptionChange = (pollIndex: number, optionIndex: number, value: string) => {
    const updatedPolls = [...interestPolls]
    updatedPolls[pollIndex].options[optionIndex] = value
    setInterestPolls(updatedPolls)
  }

  const handleAddPollOption = (pollIndex: number) => {
    const updatedPolls = [...interestPolls]
    updatedPolls[pollIndex].options.push("")
    setInterestPolls(updatedPolls)
  }

  const handleRemovePollOption = (pollIndex: number, optionIndex: number) => {
    const updatedPolls = [...interestPolls]
    if (updatedPolls[pollIndex].options.length > 2) {
      updatedPolls[pollIndex].options = updatedPolls[pollIndex].options.filter((_, i) => i !== optionIndex)
      setInterestPolls(updatedPolls)
    }
  }

  const handleSubmit = (data: WebinarFormValues) => {
    onSubmit({ ...data, interestPolls })
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-semibold">
          {initialData ? "Edit Webinar" : "Schedule New Webinar"}
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
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webinar Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter webinar title" {...field} />
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
                        placeholder="Describe what attendees will learn"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Speaker Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Speaker Information</h3>

              <FormField
                control={form.control}
                name="speaker"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Speaker</FormLabel>
                    <Select onValueChange={handleSpeakerChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select speaker" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {speakers.map((speaker) => (
                          <SelectItem key={speaker.name} value={speaker.name}>
                            {speaker.name} - {speaker.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="speakerTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Speaker Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Senior Endocrinologist" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Schedule</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
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
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {durations.map((duration) => (
                            <SelectItem key={duration} value={duration}>
                              {duration}
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
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Maximum attendees"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Target Audience</h3>

              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {targetAudiences.map((audience) => (
                        <label
                          key={audience}
                          className={cn(
                            "flex cursor-pointer items-center space-x-2 rounded-md border p-2 text-sm",
                            field.value?.includes(audience)
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={field.value?.includes(audience)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...(field.value || []), audience])
                              } else {
                                field.onChange(field.value?.filter((a) => a !== audience) || [])
                              }
                            }}
                            className="sr-only"
                          />
                          {audience}
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Reminder Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Reminder Settings</h3>
              
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="reminderSettings.oneDayBefore"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">1 Day Before</FormLabel>
                        <p className="text-xs text-gray-500">Send reminder 24 hours before webinar</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reminderSettings.oneHourBefore"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">1 Hour Before</FormLabel>
                        <p className="text-xs text-gray-500">Send reminder 1 hour before webinar</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reminderSettings.fifteenMinutesBefore"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">15 Minutes Before</FormLabel>
                        <p className="text-xs text-gray-500">Send reminder 15 minutes before webinar</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Interest Polls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Interest Polls</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddPoll}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Poll
                </Button>
              </div>
              
              <div className="space-y-4">
                {interestPolls.map((poll, pollIndex) => (
                  <Card key={pollIndex} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium">Poll {pollIndex + 1}</h4>
                        {interestPolls.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePoll(pollIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <Input
                          placeholder="Enter poll question"
                          value={poll.question}
                          onChange={(e) => handlePollQuestionChange(pollIndex, e.target.value)}
                        />
                        
                        <div className="space-y-2">
                          {poll.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <Input
                                placeholder={`Option ${optionIndex + 1}`}
                                value={option}
                                onChange={(e) => handlePollOptionChange(pollIndex, optionIndex, e.target.value)}
                                className="flex-1"
                              />
                              {poll.options.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemovePollOption(pollIndex, optionIndex)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddPollOption(pollIndex)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Option
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Engagement Notifications */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Engagement Settings</h3>
              
              <FormField
                control={form.control}
                name="engagementNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">Engagement Notifications</FormLabel>
                      <p className="text-xs text-gray-500">Send notifications for high engagement activities</p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Scheduling..." : initialData ? "Update Webinar" : "Schedule Webinar"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
