export type InvoiceStatus = "DRAFT" | "ISSUED" | "PAID"

export type Invoice = {
  id: string
  prescriptionId: string
  patientName: string
  amount: number
  transactionId: string
  createdAt: string
  status: InvoiceStatus
}
