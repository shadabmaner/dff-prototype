export type PrescriptionStatus = "NEW_PRESCRIPTION_RECEIVED" | "UNDER_REVIEW" | "CALCULATING_AMOUNT" | "PAYMENT_PENDING" | "PENDING_FOR_PACKING" | "MEDICINES_PACKED" | "READY_FOR_DISPATCH" | "DISPATCHED" | "DELIVERED" | "CANCELLED"

interface MedicationItem {
  name: string
  dosage: string
  quantity: number
  frequency: string
  duration: string
  instructions: string
}

interface Invoice {
  id: string
  medicationCost: number
  deliveryCharges: number
  additionalCharges: number
  discount: number
  tax: number
  totalAmount: number
  dueDate: string
  status: "PENDING" | "PAID" | "FAILED" | "OVERDUE" | "CANCELLED"
  billingNotes: string
  generatedBy: string
  createdAt: string
}

interface Dispatch {
  id: string
  courierName: string
  trackingNumber: string
  dispatchDate: string
  expectedDeliveryDate: string | null
  status: "DISPATCHED" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "DELIVERY_FAILED" | "RETURNED"
  remarks: string
  dispatchedBy: string
}

export type Prescription = {
  id: string
  patientId: string
  patientName: string
  patientContact: string
  patientPhone?: string
  patientEmail?: string
  patientAddress?: string
  batchId: string
  doctorId: string
  doctorName: string
  prescriptionDate: string
  status: PrescriptionStatus
  medications: MedicationItem[]
  dosageInstructions: string
  specialInstructions: string
  doctorNotes: string
  invoice: Invoice | null
  dispatch: Dispatch | null
  createdAt: string
  updatedAt: string
}
