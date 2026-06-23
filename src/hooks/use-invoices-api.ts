"use client"

import { useState } from "react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"
import { useAuthStore } from "@/store/auth-store"

// ─── Types ─────────────────────────────────────────
export interface InvoiceItem {
  description: string
  quantity: number
  total: number
}

export interface Invoice {
  id: string
  invoice_number: string
  createdAt: string
  updatedAt: string
  status: "PAID" | "PENDING" | "OVERDUE" | "CANCELLED"
  patient_id: string
  patient_name: string
  patient_email?: string
  patient_phone?: string
  items: InvoiceItem[]
  total_amount: number
  notes?: string
  pdfUrl?: string
}

export interface GetInvoicesResponse {
  data: Invoice[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface GetInvoicesParams {
  page: number
  limit: number
  patientId?: string
}

export interface GenerateInvoicePayload {
  invoiceNumber: string
  date: string
  status: string
  billToName: string
  billToEmail: string
  billToPhone: string
  items: {
    description: string
    quantity: number
    total: number
  }[]
  totalAmount: number
  notes?: string
}

export interface GenerateInvoiceResponse {
  url: string
}

// ─── Correct mapping function ───────────────────────
export const mapInvoiceForPdf = (invoice: Invoice) => ({
  invoiceNumber: invoice.invoice_number,
  date: invoice.createdAt || invoice.updatedAt || new Date().toISOString(),
  status: invoice.status || "PAID",
  billToName: invoice.patient_name || "",
  billToEmail: invoice.patient_email || "",
  billToPhone: invoice.patient_phone || "",
  items: (invoice.items || []).map((item) => ({
    description: item?.description || "",
    quantity: Number(item?.quantity ?? 0),
    total: Number(item?.total ?? 0),
  })),
  totalAmount: Number(invoice.total_amount || 0),
  notes: invoice.notes || "",
})

// ─── Hook ─────────────────────────────────────────
export function useInvoicesApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generateLoading, setGenerateLoading] = useState<string | null>(null)

  // ✅ Get invoices
  const getInvoices = async (params: GetInvoicesParams): Promise<GetInvoicesResponse | null> => {
    setLoading(true)
    setError(null)
    try {
      
      const response = await apiClient.get("/payments/invoices", { params })
      return response.data
    } catch (err: any) {
      console.error("Failed to load invoices:", err)
      toast.error("Failed to load invoices")
      return null
    } finally {
      setLoading(false)
    }
  }

  // ✅ Generate PDF & open in new tab
  const generateInvoicePdf = async (invoiceData: any) => {
  // ✅ Open window FIRST (synchronous) — bypasses popup blocker
  const newTab = window.open("", "_blank");
  
  try {
    const items = invoiceData.items?.length
      ? invoiceData.items
      : [{ description: "Item", quantity: 1, total: invoiceData.totalAmount || 0 }];

    const payload = {
      invoiceNumber: invoiceData.invoiceNumber || "INV-0000",
      date: invoiceData.date || new Date().toISOString(),
      status: invoiceData.status || "PAID",
      billToName: invoiceData.billToName || "Unknown",
      billToEmail: invoiceData.billToEmail || "",
      billToPhone: invoiceData.billToPhone || "",
      items,
      totalAmount: invoiceData.totalAmount || 0,
      notes: invoiceData.notes || "",
    };

    const response = await fetch("/api/generate-invoices", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

    if (!response.ok) throw new Error("Failed to generate PDF");

    const blob = await response.blob();
    const pdfBlob = new Blob([blob], { type: "application/pdf" });
    const url = window.URL.createObjectURL(pdfBlob);

    // ✅ Navigate the already-opened tab to the PDF
    if (newTab) {
      newTab.location.href = url;
    } else {
      window.open(url, "_blank"); // fallback
    }

    setTimeout(() => window.URL.revokeObjectURL(url), 10000);

  } catch (error) {
    console.error("PDF generation error:", error);
    newTab?.close(); // close the blank tab on error
    toast.error("Failed to generate invoice PDF.");
  }
};


  // ✅ Just call PDF function
  const generateAndDownload = async (payload: GenerateInvoicePayload) => {
    await generateInvoicePdf(payload)
  }

  // ✅ Generate single invoice
  const generateInvoicesFromPatientData = async (invoice: Invoice) => {
    const payload = mapInvoiceForPdf(invoice)
    console.log("PAYLOAD:", payload)
    await generateAndDownload(payload)
  }

  // ✅ Generate all invoices for a patient
  const generateAllInvoicesForPatient = async (patientId: string) => {
    const invoicesResponse = await getInvoices({ patientId, page: 1, limit: 50 })
    const invoices = invoicesResponse?.data || []

    if (invoices.length === 0) {
      toast.error("No invoices found for this patient")
      return
    }

    for (const invoice of invoices) {
      await generateInvoicesFromPatientData(invoice)
    }
  }

  return {
    loading,
    error,
    generateLoading,
    getInvoices,
    generateInvoicePdf,
    generateAndDownload,
    generateInvoicesFromPatientData,
    generateAllInvoicesForPatient,
  }
}