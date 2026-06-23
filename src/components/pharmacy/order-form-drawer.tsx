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

const orderSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  patientId: z.string().min(1, "Patient ID is required"),
  prescriptionId: z.string().min(1, "Prescription ID is required"),
  priority: z.string().min(1, "Priority is required"),
  notes: z.string().optional(),
})

type OrderFormData = z.infer<typeof orderSchema>

interface OrderFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: OrderFormData) => void
}

const priorities = [
  "High",
  "Medium",
  "Low",
]

export function OrderFormDrawer({ open, onOpenChange, onSubmit }: OrderFormDrawerProps) {
  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      patientName: "",
      patientId: "",
      prescriptionId: "",
      priority: "Medium",
      notes: "",
    },
  })

  const handleSubmit = (data: OrderFormData) => {
    onSubmit(data)
    form.reset()
    onOpenChange(false)
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>Create New Order</DrawerTitle>
          <DrawerDescription>
            Create a new prescription order for a patient
          </DrawerDescription>
        </DrawerHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full overflow-auto w-full">
            <div className="flex-1 overflow-y-auto px-4 space-y-4 w-full">
              <FormField
                control={form.control}
                name="patientName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Patient Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="John Doe"
                        className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patientId"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Patient ID *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="PAT-001"
                        className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prescriptionId"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Prescription ID *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="RX-1001"
                        className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Priority *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl className="w-full">
                        <SelectTrigger className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40 w-full")}>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
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
                name="notes"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Additional notes..."
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
                Create Order
              </Button>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  )
}
