"use client"

import * as React from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { useSales } from "@/components/sales/sales-context"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const schema = z.object({
  leadId: z.string().min(3, "Lead is required"),
  durationSec: z
    .string()
    .min(1, "Duration is required")
    .refine((v) => Number(v) > 0, "Duration must be > 0"),
  outcome: z.enum([
    "NO_RESPONSE",
    "INTERESTED",
    "NOT_INTERESTED",
    "CALL_BACK_LATER",
    "CONVERTED",
  ]),
  nextFollowUpAt: z.string().optional(),
  notes: z.string().optional(),
})

type Values = z.infer<typeof schema>

export function CallLogForm() {
  const { leads, logCall } = useSales()

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      leadId: leads[0]?.id ?? "",
      durationSec: "60",
      outcome: "NO_RESPONSE",
      nextFollowUpAt: "",
      notes: "",
    },
  })

  function onSubmit(values: Values) {
    // Validate that follow-up time is in the future
    if (values.nextFollowUpAt) {
      const followUpTime = new Date(values.nextFollowUpAt)
      if (followUpTime.getTime() <= Date.now()) {
        form.setError("nextFollowUpAt", {
          message: "Follow-up time must be in the future",
        })
        return
      }
    }

    logCall({
      leadId: values.leadId,
      durationSec: Number(values.durationSec),
      outcome: values.outcome,
      nextFollowUpAt: values.nextFollowUpAt || undefined,
      notes: values.notes || undefined,
    })
    toast.success("Call logged")
    form.reset({
      ...values,
      durationSec: "60",
      notes: "",
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="leadId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lead" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {leads.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.patientName} ({l.id})
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
            name="durationSec"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (sec)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="120" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="outcome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Outcome</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NO_RESPONSE">No Response</SelectItem>
                    <SelectItem value="INTERESTED">Interested</SelectItem>
                    <SelectItem value="NOT_INTERESTED">Not Interested</SelectItem>
                    <SelectItem value="CALL_BACK_LATER">Call Back Later</SelectItem>
                    <SelectItem value="CONVERTED">Converted</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nextFollowUpAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Callback (optional)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">Log call</Button>
        </div>
      </form>
    </Form>
  )
}
