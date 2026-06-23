"use client"

import * as React from "react"

type PrescriptionStatus = "NEW_PRESCRIPTION_RECEIVED" | "UNDER_REVIEW" | "CALCULATING_AMOUNT" | "PAYMENT_PENDING" | "PENDING_FOR_PACKING" | "MEDICINES_PACKED" | "READY_FOR_DISPATCH" | "DISPATCHED" | "DELIVERED" | "CANCELLED"

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

interface Prescription {
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

type PharmacyContextValue = {
  prescriptions: Prescription[]
  updateStatus: (id: string, status: PrescriptionStatus, remarks?: string) => void
  generateInvoice: (id: string, invoiceData: Partial<Invoice>) => void
  updatePaymentStatus: (id: string, status: Invoice["status"]) => void
  createDispatch: (id: string, dispatchData: Partial<Dispatch>) => void
  updateDispatchStatus: (id: string, status: Dispatch["status"], remarks?: string) => void
  confirmDelivery: (id: string, notes?: string) => void
}

const PharmacyContext = React.createContext<PharmacyContextValue | null>(null)

const seedPrescriptions: Prescription[] = [
  {
    id: "RX-1001",
    patientId: "PT-001",
    patientName: "John Doe",
    patientContact: "+91 98765 43210",
    patientPhone: "+91 98765 43210",
    patientEmail: "john.doe@email.com",
    patientAddress: "123 Main Street, Apt 4B, Mumbai, Maharashtra 400001",
    batchId: "DFF-001",
    doctorId: "DR-001",
    doctorName: "Dr. Smith",
    prescriptionDate: "2026-02-18",
    status: "NEW_PRESCRIPTION_RECEIVED",
    medications: [
      { name: "Metformin", dosage: "500mg", quantity: 60, frequency: "Twice daily", duration: "30 days", instructions: "Take after meals" },
      { name: "Amlodipine", dosage: "5mg", quantity: 30, frequency: "Once daily", duration: "30 days", instructions: "Take in the morning" },
    ],
    dosageInstructions: "Take all medications as prescribed",
    specialInstructions: "None",
    doctorNotes: "Follow up after 30 days",
    invoice: null,
    dispatch: null,
    createdAt: "2026-02-18T10:30:00",
    updatedAt: "2026-02-18T10:30:00",
  },
  {
    id: "RX-1002",
    patientId: "PT-002",
    patientName: "Jane Smith",
    patientContact: "+91 98765 43211",
    patientPhone: "+91 98765 43211",
    patientEmail: "jane.smith@email.com",
    patientAddress: "456 Park Avenue, Floor 3, Delhi, Delhi 110001",
    batchId: "DFF-001",
    doctorId: "DR-002",
    doctorName: "Dr. Wilson",
    prescriptionDate: "2026-02-18",
    status: "UNDER_REVIEW",
    medications: [
      { name: "Omeprazole", dosage: "20mg", quantity: 30, frequency: "Once daily", duration: "30 days", instructions: "Take before breakfast" },
    ],
    dosageInstructions: "Take before meals",
    specialInstructions: "None",
    doctorNotes: "Regular follow-up required",
    invoice: null,
    dispatch: null,
    createdAt: "2026-02-18T09:00:00",
    updatedAt: "2026-02-18T11:00:00",
  },
  {
    id: "RX-1003",
    patientId: "PT-003",
    patientName: "Robert Johnson",
    patientContact: "+91 98765 43212",
    patientPhone: "+91 98765 43212",
    patientEmail: "robert.johnson@email.com",
    patientAddress: "789 MG Road, Sector 62, Bangalore, Karnataka 560102",
    batchId: "DFF-002",
    doctorId: "DR-003",
    doctorName: "Dr. Chen",
    prescriptionDate: "2026-02-17",
    status: "MEDICINES_PACKED",
    medications: [
      { name: "Insulin Glargine", dosage: "100U/mL", quantity: 3, frequency: "Once daily", duration: "90 days", instructions: "Inject subcutaneously" },
    ],
    dosageInstructions: "Refrigerate before use",
    specialInstructions: "Cold chain required",
    doctorNotes: "Monitor blood sugar regularly",
    invoice: null,
    dispatch: null,
    createdAt: "2026-02-17T14:00:00",
    updatedAt: "2026-02-18T15:00:00",
  },
  {
    id: "RX-1004",
    patientId: "PT-004",
    patientName: "Emily Davis",
    patientContact: "+91 98765 43213",
    patientPhone: "+91 98765 43213",
    patientEmail: "emily.davis@email.com",
    patientAddress: "321 Connaught Place, New Delhi, Delhi 110001",
    batchId: "DFF-002",
    doctorId: "DR-004",
    doctorName: "Dr. Brown",
    prescriptionDate: "2026-02-16",
    status: "PAYMENT_PENDING",
    medications: [
      { name: "Atorvastatin", dosage: "10mg", quantity: 30, frequency: "Once daily", duration: "30 days", instructions: "Take at bedtime" },
    ],
    dosageInstructions: "Take at bedtime",
    specialInstructions: "None",
    doctorNotes: "Lipid profile test after 30 days",
    invoice: {
      id: "INV-001",
      medicationCost: 450,
      deliveryCharges: 50,
      additionalCharges: 0,
      discount: 0,
      tax: 45,
      totalAmount: 545,
      dueDate: "2026-02-20",
      status: "PENDING",
      billingNotes: "Standard delivery",
      generatedBy: "Pharmacy Staff",
      createdAt: "2026-02-16T10:00:00",
    },
    dispatch: null,
    createdAt: "2026-02-16T10:00:00",
    updatedAt: "2026-02-16T16:00:00",
  },
  {
    id: "RX-1005",
    patientId: "PT-005",
    patientName: "Michael Wilson",
    patientContact: "+91 98765 43214",
    patientPhone: "+91 98765 43214",
    patientEmail: "michael.wilson@email.com",
    patientAddress: "654 Anna Nagar, Chennai, Tamil Nadu 600040",
    batchId: "DFF-001",
    doctorId: "DR-001",
    doctorName: "Dr. Smith",
    prescriptionDate: "2026-02-15",
    status: "READY_FOR_DISPATCH",
    medications: [
      { name: "Cetirizine", dosage: "10mg", quantity: 30, frequency: "Once daily", duration: "30 days", instructions: "Take at night" },
    ],
    dosageInstructions: "Take at night",
    specialInstructions: "None",
    doctorNotes: "Follow up if symptoms persist",
    invoice: {
      id: "INV-002",
      medicationCost: 120,
      deliveryCharges: 50,
      additionalCharges: 0,
      discount: 0,
      tax: 12,
      totalAmount: 182,
      dueDate: "2026-02-17",
      status: "PAID",
      billingNotes: "Express delivery",
      generatedBy: "Pharmacy Staff",
      createdAt: "2026-02-15T11:00:00",
    },
    dispatch: null,
    createdAt: "2026-02-15T11:00:00",
    updatedAt: "2026-02-17T14:00:00",
  },
  {
    id: "RX-1006",
    patientId: "PT-006",
    patientName: "Sarah Johnson",
    patientContact: "+91 98765 43215",
    patientPhone: "+91 98765 43215",
    patientEmail: "sarah.johnson@email.com",
    patientAddress: "987 Banjara Hills, Hyderabad, Telangana 500034",
    batchId: "DFF-002",
    doctorId: "DR-002",
    doctorName: "Dr. Wilson",
    prescriptionDate: "2026-02-14",
    status: "DISPATCHED",
    medications: [
      { name: "Paracetamol", dosage: "500mg", quantity: 60, frequency: "As needed", duration: "30 days", instructions: "Take for fever" },
    ],
    dosageInstructions: "Take as needed for fever",
    specialInstructions: "None",
    doctorNotes: "Monitor temperature",
    invoice: {
      id: "INV-003",
      medicationCost: 80,
      deliveryCharges: 50,
      additionalCharges: 0,
      discount: 0,
      tax: 8,
      totalAmount: 138,
      dueDate: "2026-02-15",
      status: "PAID",
      billingNotes: "Standard delivery",
      generatedBy: "Pharmacy Staff",
      createdAt: "2026-02-14T09:00:00",
    },
    dispatch: {
      id: "DSP-001",
      courierName: "Delhivery",
      trackingNumber: "DLV123456789",
      dispatchDate: "2026-02-17T10:00:00",
      expectedDeliveryDate: "2026-02-19",
      status: "DISPATCHED",
      remarks: "Standard delivery",
      dispatchedBy: "Pharmacy Staff",
    },
    createdAt: "2026-02-14T09:00:00",
    updatedAt: "2026-02-17T10:00:00",
  },
  {
    id: "RX-1007",
    patientId: "PT-007",
    patientName: "David Brown",
    patientContact: "+91 98765 43216",
    patientPhone: "+91 98765 43216",
    patientEmail: "david.brown@email.com",
    patientAddress: "147 Salt Lake, Kolkata, West Bengal 700091",
    batchId: "DFF-001",
    doctorId: "DR-003",
    doctorName: "Dr. Chen",
    prescriptionDate: "2026-02-10",
    status: "DELIVERED",
    medications: [
      { name: "Salbutamol", dosage: "100mcg", quantity: 1, frequency: "As needed", duration: "30 days", instructions: "Inhale for asthma" },
    ],
    dosageInstructions: "Use as needed for asthma attacks",
    specialInstructions: "Keep inhaler with you",
    doctorNotes: "Regular lung function tests",
    invoice: {
      id: "INV-004",
      medicationCost: 350,
      deliveryCharges: 50,
      additionalCharges: 0,
      discount: 0,
      tax: 35,
      totalAmount: 435,
      dueDate: "2026-02-11",
      status: "PAID",
      billingNotes: "Standard delivery",
      generatedBy: "Pharmacy Staff",
      createdAt: "2026-02-10T08:00:00",
    },
    dispatch: {
      id: "DSP-002",
      courierName: "Blue Dart",
      trackingNumber: "BD987654321",
      dispatchDate: "2026-02-11T14:00:00",
      expectedDeliveryDate: "2026-02-13",
      status: "DELIVERED",
      remarks: "Delivered successfully",
      dispatchedBy: "Pharmacy Staff",
    },
    createdAt: "2026-02-10T08:00:00",
    updatedAt: "2026-02-13T16:00:00",
  },
]

export function PharmacyProvider({ children }: { children: React.ReactNode }) {
  const [prescriptions, setPrescriptions] = React.useState<Prescription[]>(seedPrescriptions)

  const updateStatus = React.useCallback((id: string, status: PrescriptionStatus, remarks?: string) => {
    setPrescriptions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p))
    )
  }, [])

  const generateInvoice = React.useCallback((id: string, invoiceData: Partial<Invoice>) => {
    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              invoice: {
                id: `INV-${Date.now()}`,
                medicationCost: invoiceData.medicationCost || 0,
                deliveryCharges: invoiceData.deliveryCharges || 0,
                additionalCharges: invoiceData.additionalCharges || 0,
                discount: invoiceData.discount || 0,
                tax: invoiceData.tax || 0,
                totalAmount: (invoiceData.medicationCost || 0) + (invoiceData.deliveryCharges || 0) + (invoiceData.additionalCharges || 0) - (invoiceData.discount || 0) + (invoiceData.tax || 0),
                dueDate: invoiceData.dueDate || "",
                status: "PENDING",
                billingNotes: invoiceData.billingNotes || "",
                generatedBy: invoiceData.generatedBy || "Pharmacy Staff",
                createdAt: new Date().toISOString(),
              },
              status: "PAYMENT_PENDING",
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    )
  }, [])

  const updatePaymentStatus = React.useCallback((id: string, status: Invoice["status"]) => {
    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === id && p.invoice
          ? {
              ...p,
              invoice: { ...p.invoice, status },
              status: status === "PAID" ? "READY_FOR_DISPATCH" : p.status,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    )
  }, [])

  const createDispatch = React.useCallback((id: string, dispatchData: Partial<Dispatch>) => {
    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              dispatch: {
                id: `DSP-${Date.now()}`,
                courierName: dispatchData.courierName || "",
                trackingNumber: dispatchData.trackingNumber || "",
                dispatchDate: new Date().toISOString(),
                expectedDeliveryDate: dispatchData.expectedDeliveryDate || null,
                status: "DISPATCHED",
                remarks: dispatchData.remarks || "",
                dispatchedBy: dispatchData.dispatchedBy || "Pharmacy Staff",
              },
              status: "DISPATCHED",
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    )
  }, [])

  const updateDispatchStatus = React.useCallback((id: string, status: Dispatch["status"], remarks?: string) => {
    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === id && p.dispatch
          ? {
              ...p,
              dispatch: { ...p.dispatch, status, remarks: remarks || p.dispatch.remarks },
              status: status === "DELIVERED" ? "DELIVERED" : p.status,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    )
  }, [])

  const confirmDelivery = React.useCallback((id: string, notes?: string) => {
    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === id && p.dispatch
          ? {
              ...p,
              dispatch: { ...p.dispatch, status: "DELIVERED", remarks: notes || p.dispatch.remarks },
              status: "DELIVERED",
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    )
  }, [])

  const value = React.useMemo(
    () => ({
      prescriptions,
      updateStatus,
      generateInvoice,
      updatePaymentStatus,
      createDispatch,
      updateDispatchStatus,
      confirmDelivery,
    }),
    [prescriptions, updateStatus, generateInvoice, updatePaymentStatus, createDispatch, updateDispatchStatus, confirmDelivery]
  )

  return (
    <PharmacyContext.Provider value={value}>{children}</PharmacyContext.Provider>
  )
}

export function usePharmacy() {
  const ctx = React.useContext(PharmacyContext)
  if (!ctx) throw new Error("usePharmacy must be used within PharmacyProvider")
  return ctx
}
