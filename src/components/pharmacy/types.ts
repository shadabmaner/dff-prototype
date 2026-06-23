export type PrescriptionStatus = "NEW" | "PROCESSING" | "READY" | "DISPATCHED"

export type Prescription = {
  id: string
  patientName: string
  doctorName: string
  date: string
  status: PrescriptionStatus
  amount?: number
  transactionId?: string
}
