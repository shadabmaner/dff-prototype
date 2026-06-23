"use client"

import * as React from "react"

import type {
  AssessmentStatus,
  CallLog,
  CallOutcome,
  Callback,
  Lead,
  LeadStage,
  PaymentLink,
  PaymentStage,
  WebinarStatus,
} from "@/components/sales/types"

type SalesContextValue = {
  leads: Lead[]
  callLogs: CallLog[]

  addLead: (lead: Lead) => void
  updateLeadStage: (leadId: string, stage: LeadStage) => void
  addRemark: (leadId: string, remark: string) => void
  reassignLead: (leadId: string, assignedTo: string) => void
  setPaymentStage: (leadId: string, stage: PaymentStage) => void
  setAssessmentStatus: (leadId: string, status: AssessmentStatus) => void
  setWebinarStatus: (leadId: string, status: WebinarStatus) => void

  addCallLog: (callLog: CallLog) => void
  logCall: (payload: {
    leadId: string
    durationSec: number
    outcome: CallOutcome
    nextFollowUpAt?: string
    notes?: string
  }) => void

  sendPaymentLink: (payload: { leadId: string; amount: number }) => void
  scheduleCallback: (payload: { leadId: string; scheduledAt: string; notes?: string }) => void
  updateCallbackStatus: (payload: {
    leadId: string
    callbackId: string
    status: Callback["status"]
    completedNotes?: string
  }) => void
}

const SalesContext = React.createContext<SalesContextValue | null>(null)

function nowISO() {
  return new Date().toISOString()
}

function makeEvent(action: string, by: string) {
  return { id: Math.random().toString(36).slice(2), at: nowISO(), action, by }
}

const seedLeads: Lead[] = [
  // Existing assigned leads
  {
    id: "LD-1001",
    patientName: "Aarav Mehta",
    phone: "+91 90000 00001",
    email: "aarav.mehta@example.com",
    campaign: "Webinar - Diabetes Care",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: "2026-02-18T09:00:00.000Z",
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 15000,
    amountRecovered: 0,
  },
  {
    id: "LD-1002",
    patientName: "Neha Sharma",
    phone: "+91 90000 00002",
    email: "neha.sharma@example.com",
    campaign: "Campaign - Ortho Pain",
    assignedTo: "sales-1",
    stage: "HOT",
    lastContactedAt: "2026-02-18T08:30:00.000Z",
    nextFollowUpAt: "2026-02-19T10:30",
    paymentStage: "LINK_SENT",
    assessmentStatus: "PENDING",
    webinarStatus: "ATTENDED",
    remarks: [
      {
        id: "RM-1001",
        text: "Interested, asked for payment link",
        at: "2026-02-18T08:31:00.000Z",
        by: "sales-1",
      },
    ],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system"), makeEvent("Marked hot", "sales-1")],
    programValue: 22000,
    amountRecovered: 0,
  },
  {
    id: "LD-1003",
    patientName: "Vikram Singh",
    phone: "+91 90000 00003",
    email: "vikram.singh@example.com",
    campaign: "Webinar - Cardio",
    assignedTo: "sales-2",
    stage: "CONVERTED",
    lastContactedAt: "2026-02-17T18:10:00.000Z",
    nextFollowUpAt: undefined,
    paymentStage: "RECEIVED",
    assessmentStatus: "COMPLETED",
    webinarStatus: "ATTENDED",
    remarks: [
      {
        id: "RM-1002",
        text: "Converted",
        at: "2026-02-17T18:11:00.000Z",
        by: "sales-2",
      },
    ],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system"), makeEvent("Converted", "sales-2")],
    programValue: 18000,
    amountRecovered: 18000,
  },

  // New unassigned leads for today's leads
  {
    id: "LD-1004",
    patientName: "Priya Patel",
    phone: "+91 90000 00004",
    email: "priya.patel@example.com",
    campaign: "Social Media - Health Tips",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 12000,
    amountRecovered: 0,
  },
  {
    id: "LD-1005",
    patientName: "Rahul Kumar",
    phone: "+91 90000 00005",
    email: "rahul.kumar@example.com",
    campaign: "Email Campaign - Nutrition",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 16000,
    amountRecovered: 0,
  },
  {
    id: "LD-1006",
    patientName: "Anjali Gupta",
    phone: "+91 90000 00006",
    email: "anjali.gupta@example.com",
    campaign: "Webinar - Diabetes Care",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 14000,
    amountRecovered: 0,
  },
  {
    id: "LD-1007",
    patientName: "Suresh Reddy",
    phone: "+91 90000 00007",
    email: "suresh.reddy@example.com",
    campaign: "Campaign - Ortho Pain",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 19000,
    amountRecovered: 0,
  },
  {
    id: "LD-1008",
    patientName: "Meera Joshi",
    phone: "+91 90000 00008",
    email: "meera.joshi@example.com",
    campaign: "Webinar - Cardio",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 17000,
    amountRecovered: 0,
  },
  {
    id: "LD-1009",
    patientName: "Amit Tiwari",
    phone: "+91 90000 00009",
    email: "amit.tiwari@example.com",
    campaign: "Social Media - Health Tips",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 13000,
    amountRecovered: 0,
  },
  {
    id: "LD-1010",
    patientName: "Kavita Sharma",
    phone: "+91 90000 00010",
    email: "kavita.sharma@example.com",
    campaign: "Email Campaign - Nutrition",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 15000,
    amountRecovered: 0,
  },
  {
    id: "LD-1011",
    patientName: "Rajesh Verma",
    phone: "+91 90000 00011",
    email: "rajesh.verma@example.com",
    campaign: "Webinar - Diabetes Care",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 18000,
    amountRecovered: 0,
  },
  {
    id: "LD-1012",
    patientName: "Sunita Agarwal",
    phone: "+91 90000 00012",
    email: "sunita.agarwal@example.com",
    campaign: "Campaign - Ortho Pain",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 16000,
    amountRecovered: 0,
  },
  {
    id: "LD-1013",
    patientName: "Vivek Jain",
    phone: "+91 90000 00013",
    email: "vivek.jain@example.com",
    campaign: "Webinar - Cardio",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 20000,
    amountRecovered: 0,
  },
  {
    id: "LD-1014",
    patientName: "Poonam Singh",
    phone: "+91 90000 00014",
    email: "poonam.singh@example.com",
    campaign: "Social Media - Health Tips",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 11000,
    amountRecovered: 0,
  },
  {
    id: "LD-1015",
    patientName: "Manoj Chauhan",
    phone: "+91 90000 00015",
    email: "manoj.chauhan@example.com",
    campaign: "Email Campaign - Nutrition",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 17500,
    amountRecovered: 0,
  },
  {
    id: "LD-1016",
    patientName: "Rekha Mishra",
    phone: "+91 90000 00016",
    email: "rekha.mishra@example.com",
    campaign: "Webinar - Diabetes Care",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 15500,
    amountRecovered: 0,
  },
  {
    id: "LD-1017",
    patientName: "Alok Pandey",
    phone: "+91 90000 00017",
    email: "alok.pandey@example.com",
    campaign: "Campaign - Ortho Pain",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 18500,
    amountRecovered: 0,
  },
  {
    id: "LD-1018",
    patientName: "Geeta Saxena",
    phone: "+91 90000 00018",
    email: "geeta.saxena@example.com",
    campaign: "Webinar - Cardio",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 16500,
    amountRecovered: 0,
  },
  {
    id: "LD-1019",
    patientName: "Deepak Yadav",
    phone: "+91 90000 00019",
    email: "deepak.yadav@example.com",
    campaign: "Social Media - Health Tips",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 12500,
    amountRecovered: 0,
  },
  {
    id: "LD-1020",
    patientName: "Nisha Kapoor",
    phone: "+91 90000 00020",
    email: "nisha.kapoor@example.com",
    campaign: "Email Campaign - Nutrition",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 19500,
    amountRecovered: 0,
  },
  {
    id: "LD-1021",
    patientName: "Sanjay Malhotra",
    phone: "+91 90000 00021",
    email: "sanjay.malhotra@example.com",
    campaign: "Webinar - Diabetes Care",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 14500,
    amountRecovered: 0,
  },
  {
    id: "LD-1022",
    patientName: "Ritu Bansal",
    phone: "+91 90000 00022",
    email: "ritu.bansal@example.com",
    campaign: "Campaign - Ortho Pain",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 21000,
    amountRecovered: 0,
  },
  {
    id: "LD-1023",
    patientName: "Arun Khanna",
    phone: "+91 90000 00023",
    email: "arun.khanna@example.com",
    campaign: "Webinar - Cardio",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 13500,
    amountRecovered: 0,
  },
  {
    id: "LD-1024",
    patientName: "Preeti Arora",
    phone: "+91 90000 00024",
    email: "preeti.arora@example.com",
    campaign: "Social Media - Health Tips",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 17000,
    amountRecovered: 0,
  },
  {
    id: "LD-1025",
    patientName: "Karan Gill",
    phone: "+91 90000 00025",
    email: "karan.gill@example.com",
    campaign: "Email Campaign - Nutrition",
    assignedTo: null,
    stage: "UNASSIGNED",
    lastContactedAt: undefined,
    nextFollowUpAt: undefined,
    paymentStage: "INTERESTED",
    assessmentStatus: "PENDING",
    webinarStatus: "INVITED",
    remarks: [],
    paymentLinks: [],
    callbacks: [],
    history: [makeEvent("Lead created", "system")],
    programValue: 15200,
    amountRecovered: 0,
  },
]

const seedCallLogs: CallLog[] = [
  {
    id: "CL-9001",
    leadId: "LD-1002",
    leadName: "Neha Sharma",
    phone: "+91 90000 00002",
    callAt: nowISO(),
    callTime: "10:30 AM",
    duration: "2 min",
    durationSec: 125,
    outcome: "INTERESTED",
    remarks: "Requested payment link",
    nextFollowUpAt: "2026-02-19T10:30",
    userId: "sales-1",
    createdBy: "sales-1",
    createdAt: nowISO(),
  },
]

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = React.useState<Lead[]>(seedLeads)
  const [callLogs, setCallLogs] = React.useState<CallLog[]>(seedCallLogs)

  const addLead = React.useCallback((lead: Lead) => {
    setLeads((prev) => [lead, ...prev])
  }, [])

  const updateLeadStage = React.useCallback((leadId: string, stage: LeadStage) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
            ...l,
            stage,
            history: [makeEvent(`Stage set to ${stage}`, "user"), ...l.history],
          }
          : l
      )
    )
  }, [])

  const addRemark = React.useCallback((leadId: string, remark: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
            ...l,
            remarks: [
              { id: `RM-${Math.random().toString(36).slice(2, 7)}`, text: remark, at: nowISO(), by: "user" },
              ...l.remarks,
            ],
            history: [makeEvent("Remark added", "user"), ...l.history],
          }
          : l
      )
    )
  }, [])

  const reassignLead = React.useCallback((leadId: string, assignedTo: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
            ...l,
            assignedTo,
            history: [makeEvent(`Reassigned to ${assignedTo}`, "user"), ...l.history],
          }
          : l
      )
    )
  }, [])

  const setPaymentStage = React.useCallback((leadId: string, stage: PaymentStage) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
            ...l,
            paymentStage: stage,
            history: [makeEvent(`Payment stage ${stage}`, "user"), ...l.history],
          }
          : l
      )
    )
  }, [])

  const setAssessmentStatus = React.useCallback((leadId: string, status: AssessmentStatus) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
            ...l,
            assessmentStatus: status,
            history: [makeEvent(`Assessment ${status}`, "user"), ...l.history],
          }
          : l
      )
    )
  }, [])

  const setWebinarStatus = React.useCallback((leadId: string, status: WebinarStatus) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
            ...l,
            webinarStatus: status,
            history: [makeEvent(`Webinar ${status}`, "user"), ...l.history],
          }
          : l
      )
    )
  }, [])

  const logCall = React.useCallback(
    (payload: {
      leadId: string
      durationSec: number
      outcome: CallOutcome
      nextFollowUpAt?: string
      notes?: string
    }) => {
      setCallLogs((prev) => {
        const lead = leads.find((l) => l.id === payload.leadId)
        const item: CallLog = {
          id: `CL-${Math.random().toString(36).slice(2, 7)}`,
          leadId: payload.leadId,
          leadName: lead?.patientName ?? payload.leadId,
          phone: lead?.phone ?? "",
          callAt: nowISO(),
          callTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: `${Math.floor(payload.durationSec / 60)} min`,
          durationSec: payload.durationSec,
          outcome: payload.outcome,
          remarks: payload.notes ?? "",
          nextFollowUpAt: payload.nextFollowUpAt,
          userId: "user",
          createdBy: "user",
          createdAt: nowISO(),
        }
        return [item, ...prev]
      })

      setLeads((prev) =>
        prev.map((l) =>
          l.id === payload.leadId
            ? {
              ...l,
              lastContactedAt: nowISO(),
              nextFollowUpAt: payload.nextFollowUpAt,
              history: [makeEvent(`Call logged: ${payload.outcome}`, "user"), ...l.history],
            }
            : l
        )
      )
    },
    [leads]
  )

  const sendPaymentLink = React.useCallback((payload: { leadId: string; amount: number }) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== payload.leadId) return l

        const item: PaymentLink = {
          id: `PL-${Math.random().toString(36).slice(2, 7)}`,
          sentAt: nowISO(),
          sentBy: "user",
          status: "PENDING",
          amount: payload.amount,
          paymentLink: `https://payments.example.com/pay/${payload.leadId}`,
        }

        return {
          ...l,
          paymentStage: "LINK_SENT",
          paymentLinks: [item, ...l.paymentLinks],
          history: [makeEvent("Payment link sent", "user"), ...l.history],
        }
      })
    )
  }, [])

  const scheduleCallback = React.useCallback(
    (payload: { leadId: string; scheduledAt: string; notes?: string }) => {
      setLeads((prev) =>
        prev.map((l) => {
          if (l.id !== payload.leadId) return l

          const item: Callback = {
            id: `CB-${Math.random().toString(36).slice(2, 7)}`,
            scheduledAt: payload.scheduledAt,
            status: "PENDING",
            notes: payload.notes,
            createdBy: "user",
          }

          return {
            ...l,
            stage: l.stage === "CONVERTED" ? l.stage : "FOLLOW_UP",
            nextFollowUpAt: payload.scheduledAt,
            callbacks: [item, ...l.callbacks],
            history: [makeEvent("Callback scheduled", "user"), ...l.history],
          }
        })
      )
    },
    []
  )

  const updateCallbackStatus = React.useCallback(
    (payload: {
      leadId: string
      callbackId: string
      status: Callback["status"]
      completedNotes?: string
    }) => {
      setLeads((prev) =>
        prev.map((l) => {
          if (l.id !== payload.leadId) return l

          return {
            ...l,
            callbacks: l.callbacks.map((c) =>
              c.id === payload.callbackId
                ? {
                  ...c,
                  status: payload.status,
                  completedAt: payload.status === "PENDING" ? undefined : nowISO(),
                  completedNotes: payload.completedNotes,
                }
                : c
            ),
            history: [makeEvent(`Callback marked ${payload.status}`, "user"), ...l.history],
          }
        })
      )
    },
    []
  )

  const addCallLog = React.useCallback(
    (newCallLog: CallLog) => {
      setCallLogs((prev) => [newCallLog, ...prev])
    },
    []
  )

  const value = React.useMemo<SalesContextValue>(
    () => ({
      leads,
      callLogs,
      addLead,
      updateLeadStage,
      addRemark,
      reassignLead,
      setPaymentStage,
      setAssessmentStatus,
      setWebinarStatus,
      addCallLog,
      logCall,
      sendPaymentLink,
      scheduleCallback,
      updateCallbackStatus,
    }),
    [
      leads,
      callLogs,
      addLead,
      updateLeadStage,
      addRemark,
      reassignLead,
      setPaymentStage,
      setAssessmentStatus,
      setWebinarStatus,
      addCallLog,
      logCall,
      sendPaymentLink,
      scheduleCallback,
      updateCallbackStatus,
    ]
  )

  return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>
}

export function useSales() {
  const ctx = React.useContext(SalesContext)
  if (!ctx) throw new Error("useSales must be used within SalesProvider")
  return ctx
}
