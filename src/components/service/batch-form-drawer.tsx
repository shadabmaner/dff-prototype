"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"

const batchSchema = z.object({
  name: z.string().min(1, "Batch name is required").max(200, "Name must be under 200 characters"),
  speciality: z.string().min(1, "Speciality is required"),
  program: z.string().min(1, "Program is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  language: z.string().min(1, "Language is required"),
  capacity: z.string().min(1, "Capacity is required"),
  description: z.string().max(500, "Description can't exceed 500 characters").optional(),
})

type BatchFormData = z.infer<typeof batchSchema>

interface BatchFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: BatchFormData) => void
}

const specialities = [
  "Diabetes Management",
  "Cardiovascular Health",
  "Weight Management",
  "Thyroid Care",
  "Respiratory Health",
  "Mental Wellness",
]

const programs = [
  "Comprehensive Diabetes Care",
  "Heart Wellness Program",
  "Fitness & Nutrition",
  "Thyroid Management",
  "Respiratory Rehabilitation",
  "Mental Health Support",
]

const languages = [
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Bengali",
]

export function BatchFormDrawer({ open, onOpenChange, onSubmit }: BatchFormDrawerProps) {
  const form = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      name: "",
      speciality: "",
      program: "",
      startDate: "",
      endDate: "",
      language: "",
      capacity: "",
      description: "",
    },
  })

  const { handleSubmit, formState: { errors }, reset } = form

  const handleFormSubmit = (data: BatchFormData) => {
    onSubmit(data)
    reset()
    onOpenChange(false)
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>Create New Batch</DrawerTitle>
          <DrawerDescription>
            Create a new service batch with speciality, program, and schedule details.
          </DrawerDescription>
        </DrawerHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col h-full overflow-auto w-full">
            <div className="flex-1 overflow-y-auto px-4 space-y-4 w-full">
              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Batch Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="January 2025 Intake"
                        className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="speciality"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Speciality *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl className="w-full">
                        <SelectTrigger className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40 w-full")}>
                          <SelectValue placeholder="Select speciality" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {specialities.map((speciality) => (
                          <SelectItem key={speciality} value={speciality}>
                            {speciality}
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
                name="program"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Program *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl className="w-full">
                        <SelectTrigger className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40 w-full")}>
                          <SelectValue placeholder="Select program" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {programs.map((program) => (
                          <SelectItem key={program} value={program}>
                            {program}
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
                  name="startDate"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>End Date *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="language"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Language *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl className="w-full">
                        <SelectTrigger className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40 w-full")}>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
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
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Capacity *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        placeholder="50"
                        className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Brief description of the batch..."
                        rows={3}
                        className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DrawerFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Batch
              </Button>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  )
}
