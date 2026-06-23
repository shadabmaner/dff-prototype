"use client"

import * as React from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { usePharmacy } from "@/components/pharmacy/pharmacy-context"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const invoiceSchema = z.object({
  prescriptionId: z.string().min(3, "Prescription ID is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => Number(v) > 0, "Amount must be > 0"),
  transactionId: z.string().min(3, "Transaction ID is required"),
})

type InvoiceValues = z.infer<typeof invoiceSchema>

function CreateInvoiceDialog() {
  const { generateBill } = usePharmacy()
  const [open, setOpen] = React.useState(false)

  const form = useForm<InvoiceValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      prescriptionId: "",
      amount: "",
      transactionId: "",
    },
  })

  function onSubmit(values: InvoiceValues) {
    generateBill(values.prescriptionId, Number(values.amount), values.transactionId)
    toast.success("Invoice created")
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Create Invoice</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Invoice creation</DialogTitle>
          <DialogDescription>
            Create an invoice for a prescription and store it in the patient ledger.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="prescriptionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prescription ID</FormLabel>
                  <FormControl>
                    <Input placeholder="RX-1001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="499" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction ID</FormLabel>
                    <FormControl>
                      <Input placeholder="TXN-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default function PharmacyBillingPage() {
  const { prescriptions } = usePharmacy()

  const invoices = prescriptions
    .filter((p) => typeof p.amount === "number" && !!p.transactionId)
    .map((p) => ({
      prescriptionId: p.id,
      patientName: p.patientName,
      amount: p.amount as number,
      transactionId: p.transactionId as string,
      date: p.date,
      status: p.status,
    }))

  const ledger = React.useMemo(() => {
    const map = new Map<string, { patientName: string; total: number; count: number }>()
    for (const inv of invoices) {
      const existing = map.get(inv.patientName)
      if (!existing) {
        map.set(inv.patientName, { patientName: inv.patientName, total: inv.amount, count: 1 })
      } else {
        existing.total += inv.amount
        existing.count += 1
      }
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total)
  }, [invoices])

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">Billing</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Invoice creation and patient ledger.
          </p>
        </div>
        <CreateInvoiceDialog />
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="ledger">Patient ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Generated from prescription billing records.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prescription</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.length ? (
                      invoices.map((inv) => (
                        <TableRow key={`${inv.prescriptionId}-${inv.transactionId}`}>
                          <TableCell className="font-medium">{inv.prescriptionId}</TableCell>
                          <TableCell>{inv.patientName}</TableCell>
                          <TableCell>₹{inv.amount}</TableCell>
                          <TableCell>{inv.transactionId}</TableCell>
                          <TableCell>{inv.date}</TableCell>
                          <TableCell>{inv.status}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No invoices yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ledger">
          <Card>
            <CardHeader>
              <CardTitle>Patient ledger</CardTitle>
              <CardDescription>Total billed per patient.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Invoices</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledger.length ? (
                      ledger.map((row) => (
                        <TableRow key={row.patientName}>
                          <TableCell className="font-medium">{row.patientName}</TableCell>
                          <TableCell>{row.count}</TableCell>
                          <TableCell>₹{row.total}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          No ledger entries yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
