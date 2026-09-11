import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type CampEligibilityCategory = "boost_and_payment" | "notification_only"

export type CampOutreachStatus = 
  | "eligible" 
  | "notification_sent" 
  | "call_logged" 
  | "seat_reserved" 
  | "attendance_confirmed"

export interface MultiAgentCallLog {
  id: string
  callerName: string
  callerRole: string
  callType: string
  date: string
  duration: string
  outcome: string
  notes: string
}

export interface CampNotificationRecord {
  id: string
  sentAt: string
  eventDates: string
  locationName: string
  mapLink: string
  channels: string[]
  feeMentioned: string
  title: string
  message: string
}

export interface CampPatient {
  id: string
  name: string
  phone: string
  email: string
  city: string
  specialty: string
  program: string
  category: CampEligibilityCategory // "boost_and_payment" (Standard/Pro Care) vs "notification_only" (Special Care)
  tenureDays: number
  clinicalMilestone: string
  status: CampOutreachStatus
  assignedCaller: string
  proposedFee: number // 35000 for Standard/Pro Care; 0 for Special Care
  
  // Concise payment info (short manner)
  paymentSummary: {
    programEnrolled: string
    programPaid: number
    campEntitlement: string
    campPaymentStatus: "included_prepaid" | "pending" | "paid"
    campFee: number
    paidAmount: number
    paymentDate?: string
    transactionRef?: string
  }

  // Call history made by multiple team members (Welcome Call, Doctors, Camp Booster)
  callHistory: MultiAgentCallLog[]

  // Dispatched notifications history
  notificationHistory: CampNotificationRecord[]

  // Latest call notes for quick display
  latestCallNotes?: string
}

export interface CampEventData {
  title: string
  dates: string
  locationName: string
  mapLink: string
  feeAmount: number
}

export const DEFAULT_CAMP_EVENT: CampEventData = {
  title: "DFF 7-Day Residential Reversal Retreat",
  dates: "20th to 25th September 2026",
  locationName: "Lonavala Wellness Retreat, Khandala Ghat, Maharashtra",
  mapLink: "https://maps.google.com/?q=Lonavala+Wellness+Retreat",
  feeAmount: 35000,
}

const INITIAL_PATIENTS: CampPatient[] = [
  {
    id: "CP-301",
    name: "Harishchandra Mehta",
    phone: "+91 98210 55432",
    email: "harishchandra.m@example.com",
    city: "Mumbai",
    specialty: "Diabetes Free Forever (DFF)",
    program: "DFF Special Care (VIP Reversal)",
    category: "notification_only",
    tenureDays: 110,
    clinicalMilestone: "HbA1c: 9.1 → 6.9% (Insulin completely stopped)",
    status: "eligible",
    assignedCaller: "Divya Rao",
    proposedFee: 0,
    paymentSummary: {
      programEnrolled: "DFF Special Care (VIP Annual Plan)",
      programPaid: 120000,
      campEntitlement: "Residential Retreat Included & Pre-Paid in Special Care Package",
      campPaymentStatus: "included_prepaid",
      campFee: 0,
      paidAmount: 0,
      transactionRef: "INV-DFF-2026-0891 (VIP Bundle)",
    },
    callHistory: [
      {
        id: "call-w1",
        callerName: "Ananya Iyer",
        callerRole: "Welcome Call Specialist",
        callType: "Welcome & Onboarding Call",
        date: "2026-06-02 11:30 AM",
        duration: "14 mins",
        outcome: "Onboarding Completed",
        notes: "Welcomed Harishchandra ji to DFF VIP Reversal. Confirmed continuous glucose monitor delivery and introduced dedicated care coach.",
      },
      {
        id: "call-c1",
        callerName: "Dr. Sneha Patil",
        callerRole: "Senior Clinical Diabetologist",
        callType: "Month 2 Clinical Review",
        date: "2026-07-28 04:15 PM",
        duration: "18 mins",
        outcome: "Insulin Stopped",
        notes: "Remarkable response: Lantus insulin stopped, fasting sugars 108 mg/dL. Recommended prioritizing September residential retreat.",
      },
    ],
    notificationHistory: [],
  },
  {
    id: "CP-302",
    name: "Sunanda Kadam",
    phone: "+91 98450 12908",
    email: "sunanda.kadam@example.com",
    city: "Pune",
    specialty: "Diabetes Free Forever (DFF)",
    program: "DFF Standard Care",
    category: "boost_and_payment",
    tenureDays: 98,
    clinicalMilestone: "HbA1c: 8.4 → 6.7% (Fasting 104 mg/dL, -4 kg)",
    status: "notification_sent",
    assignedCaller: "Divya Rao",
    proposedFee: 35000,
    paymentSummary: {
      programEnrolled: "DFF Standard Care (6 Months)",
      programPaid: 45000,
      campEntitlement: "Optional Add-on 7-Day Residential Reversal Camp (₹35,000)",
      campPaymentStatus: "pending",
      campFee: 35000,
      paidAmount: 0,
    },
    callHistory: [
      {
        id: "call-w2",
        callerName: "Ananya Iyer",
        callerRole: "Welcome Call Specialist",
        callType: "Welcome & Onboarding Call",
        date: "2026-06-15 02:20 PM",
        duration: "10 mins",
        outcome: "Onboarding Completed",
        notes: "Introductory onboarding call completed. Diet chart guidelines shared on WhatsApp.",
      },
    ],
    notificationHistory: [
      {
        id: "notif-1",
        sentAt: "2026-09-08 10:45 AM",
        eventDates: "20th to 25th September 2026",
        locationName: "Lonavala Wellness Retreat",
        mapLink: "https://maps.google.com/?q=Lonavala+Wellness+Retreat",
        channels: ["WhatsApp", "Mobile App"],
        feeMentioned: "₹35,000",
        title: "🌟 Upcoming 7-Day Residential Reversal Retreat - Lonavala",
        message: "Invitation sent for Sept 20-25 batch with itinerary and ₹35,000 seat reservation booking link.",
      },
    ],
  },
  {
    id: "CP-303",
    name: "Ashok Singhania",
    phone: "+91 98190 77654",
    email: "ashok.singhania@example.com",
    city: "Delhi",
    specialty: "Diabetes Free Forever (DFF)",
    program: "DFF Pro Care",
    category: "boost_and_payment",
    tenureDays: 125,
    clinicalMilestone: "Off 40 units Lantus insulin, HbA1c 6.5%",
    status: "seat_reserved",
    assignedCaller: "Divya Rao",
    proposedFee: 35000,
    latestCallNotes: "Spoke with Ashok ji. Confirmed participation for Sept 20-25 Lonavala Camp. Paid ₹35,000 retreat seat fee.",
    paymentSummary: {
      programEnrolled: "DFF Pro Care (9 Months)",
      programPaid: 65000,
      campEntitlement: "Add-on Residential Camp (Reserved & Paid)",
      campPaymentStatus: "paid",
      campFee: 35000,
      paidAmount: 35000,
      paymentDate: "2026-09-09",
      transactionRef: "pay_Razorpay_SeptCamp_303",
    },
    callHistory: [
      {
        id: "call-w3",
        callerName: "Ananya Iyer",
        callerRole: "Welcome Call Specialist",
        callType: "Welcome Call",
        date: "2026-05-18 10:00 AM",
        duration: "15 mins",
        outcome: "Completed",
        notes: "Onboarding done. Explained glucose monitoring and nutrition protocols.",
      },
      {
        id: "call-b3",
        callerName: "Divya Rao",
        callerRole: "Residential Camp Booster",
        callType: "Camp Booster Counseling Call",
        date: "2026-09-09 03:30 PM",
        duration: "12 mins",
        outcome: "Seat Reserved @ ₹35,000",
        notes: "Patient excited for intensive doctor-led cooking and yoga retreat. Completed ₹35,000 payment via Razorpay link.",
      },
    ],
    notificationHistory: [
      {
        id: "notif-2",
        sentAt: "2026-09-05 11:00 AM",
        eventDates: "20th to 25th September 2026",
        locationName: "Lonavala Wellness Retreat",
        mapLink: "https://maps.google.com/?q=Lonavala+Wellness+Retreat",
        channels: ["WhatsApp", "Mobile App"],
        feeMentioned: "₹35,000",
        title: "🌟 Upcoming 7-Day Residential Reversal Retreat - Lonavala",
        message: "Retreat details and booking link dispatched.",
      },
    ],
  },
  {
    id: "CP-304",
    name: "Vandana Deshpande",
    phone: "+91 98811 44321",
    email: "vandana.deshpande@example.com",
    city: "Nagpur",
    specialty: "Diabetes Free Forever (DFF)",
    program: "DFF Standard Care",
    category: "boost_and_payment",
    tenureDays: 104,
    clinicalMilestone: "HbA1c: 8.8 → 7.1% (-3.8 kg)",
    status: "eligible",
    assignedCaller: "Divya Rao",
    proposedFee: 35000,
    paymentSummary: {
      programEnrolled: "DFF Standard Care",
      programPaid: 45000,
      campEntitlement: "Optional Add-on Residential Reversal Camp",
      campPaymentStatus: "pending",
      campFee: 35000,
      paidAmount: 0,
    },
    callHistory: [
      {
        id: "call-w4",
        callerName: "Ananya Iyer",
        callerRole: "Welcome Call Specialist",
        callType: "Welcome Call",
        date: "2026-06-08 04:00 PM",
        duration: "11 mins",
        outcome: "Completed",
        notes: "Patient welcomed. Connected with health coach Pratibha.",
      },
    ],
    notificationHistory: [],
  },
  {
    id: "CP-305",
    name: "Kishore Rao",
    phone: "+91 98320 55112",
    email: "kishore.rao@example.com",
    city: "Bengaluru",
    specialty: "Diabetes Free Forever (DFF)",
    program: "DFF Special Care (VIP Reversal)",
    category: "notification_only",
    tenureDays: 130,
    clinicalMilestone: "HbA1c: 7.9 → 6.2% (Reversal Milestone)",
    status: "notification_sent",
    assignedCaller: "Divya Rao",
    proposedFee: 0,
    paymentSummary: {
      programEnrolled: "DFF Special Care (VIP Annual Plan)",
      programPaid: 120000,
      campEntitlement: "Residential Retreat Included & Pre-Paid in Special Care Package",
      campPaymentStatus: "included_prepaid",
      campFee: 0,
      paidAmount: 0,
      transactionRef: "INV-DFF-2026-0742 (VIP Package)",
    },
    callHistory: [
      {
        id: "call-w5",
        callerName: "Ananya Iyer",
        callerRole: "Welcome Call Specialist",
        callType: "Welcome Call",
        date: "2026-05-12 11:00 AM",
        duration: "16 mins",
        outcome: "VIP Onboarding Completed",
        notes: "Explained VIP privileges including priority nutritionist support and included 7-Day Residential Camp retreat.",
      },
    ],
    notificationHistory: [
      {
        id: "notif-3",
        sentAt: "2026-09-07 09:30 AM",
        eventDates: "20th to 25th September 2026",
        locationName: "Lonavala Wellness Retreat",
        mapLink: "https://maps.google.com/?q=Lonavala+Wellness+Retreat",
        channels: ["WhatsApp", "SMS", "Mobile App"],
        feeMentioned: "Included in VIP Package (₹0 Fee)",
        title: "🌟 DFF VIP Retreat Notification: Sept 20-25 Lonavala",
        message: "Event dates and venue Google Maps link shared. Pre-paid VIP accommodation and session slots reserved.",
      },
    ],
  },
  {
    id: "CP-306",
    name: "Rajeshwari Patel",
    phone: "+91 98790 66543",
    email: "rajeshwari.p@example.com",
    city: "Ahmedabad",
    specialty: "Diabetes Free Forever (DFF)",
    program: "DFF Pro Care",
    category: "boost_and_payment",
    tenureDays: 115,
    clinicalMilestone: "Fasting blood sugar: 180 → 112 mg/dL",
    status: "call_logged",
    assignedCaller: "Divya Rao",
    proposedFee: 35000,
    latestCallNotes: "Discussed retreat schedule. Patient requested callback on Friday after checking spouse's schedule.",
    paymentSummary: {
      programEnrolled: "DFF Pro Care (9 Months)",
      programPaid: 65000,
      campEntitlement: "Add-on Residential Camp (₹35,000)",
      campPaymentStatus: "pending",
      campFee: 35000,
      paidAmount: 0,
    },
    callHistory: [
      {
        id: "call-w6",
        callerName: "Ananya Iyer",
        callerRole: "Welcome Call Specialist",
        callType: "Welcome Call",
        date: "2026-05-29 03:00 PM",
        duration: "12 mins",
        outcome: "Completed",
        notes: "Routine onboarding completed.",
      },
      {
        id: "call-c6",
        callerName: "Divya Rao",
        callerRole: "Residential Camp Booster",
        callType: "Camp Booster Outreach",
        date: "2026-09-10 11:30 AM",
        duration: "7 mins",
        outcome: "Callback Requested",
        notes: "Patient interested; checking dates with spouse before paying ₹35,000 booking fee.",
      },
    ],
    notificationHistory: [],
  },
  {
    id: "CP-307",
    name: "Mahesh Chandra",
    phone: "+91 98102 33441",
    email: "mahesh.chandra@example.com",
    city: "Indore",
    specialty: "Diabetes Free Forever (DFF)",
    program: "DFF Special Care (VIP Reversal)",
    category: "notification_only",
    tenureDays: 140,
    clinicalMilestone: "HbA1c: 9.4 → 6.4% (-6.5 kg)",
    status: "attendance_confirmed",
    assignedCaller: "Divya Rao",
    proposedFee: 0,
    latestCallNotes: "Attendance confirmed for Sept 20-25 Lonavala Camp. Verified flight travel and room preferences.",
    paymentSummary: {
      programEnrolled: "DFF Special Care (VIP Reversal)",
      programPaid: 120000,
      campEntitlement: "Residential Retreat Included & Pre-Paid in Special Care Package",
      campPaymentStatus: "included_prepaid",
      campFee: 0,
      paidAmount: 0,
      transactionRef: "INV-DFF-2026-0511 (VIP)",
    },
    callHistory: [
      {
        id: "call-w7",
        callerName: "Ananya Iyer",
        callerRole: "Welcome Call Specialist",
        callType: "Welcome Call",
        date: "2026-05-04 10:30 AM",
        duration: "15 mins",
        outcome: "Completed",
        notes: "Onboarded as VIP Reversal patient.",
      },
      {
        id: "call-b7",
        callerName: "Divya Rao",
        callerRole: "Residential Camp Booster",
        callType: "Retreat Attendance Confirmation",
        date: "2026-09-08 04:00 PM",
        duration: "9 mins",
        outcome: "Attendance Confirmed (Pre-paid VIP)",
        notes: "Confirmed arrival at Pune/Lonavala on Sept 20 morning. Ground transport arranged.",
      },
    ],
    notificationHistory: [
      {
        id: "notif-4",
        sentAt: "2026-09-06 12:15 PM",
        eventDates: "20th to 25th September 2026",
        locationName: "Lonavala Wellness Retreat",
        mapLink: "https://maps.google.com/?q=Lonavala+Wellness+Retreat",
        channels: ["WhatsApp", "Mobile App"],
        feeMentioned: "Included in VIP Package (₹0)",
        title: "🌟 DFF 7-Day Residential Reversal Retreat - Sept 20-25",
        message: "VIP invitation & location itinerary dispatched.",
      },
    ],
  },
]

interface ResidentialCampStoreState {
  patients: CampPatient[]
  defaultEvent: CampEventData
  setDefaultEvent: (event: Partial<CampEventData>) => void
  getPatientById: (id: string) => CampPatient | undefined
  sendBulkNotifications: (
    patientIds: string[],
    notification: {
      eventDates: string
      locationName: string
      mapLink: string
      channels: string[]
      customMessage?: string
    }
  ) => void
  sendSingleNotification: (
    patientId: string,
    notification: {
      eventDates: string
      locationName: string
      mapLink: string
      channels: string[]
      customMessage?: string
    }
  ) => void
  logCall: (
    patientId: string,
    log: {
      callerName: string
      callerRole: string
      duration: string
      outcome: string
      notes: string
      statusUpdate?: CampOutreachStatus
    }
  ) => void
  recordPayment: (
    patientId: string,
    payment: {
      amount: number
      mode: string
      reference: string
    }
  ) => void
}

export const useResidentialCampStore = create<ResidentialCampStoreState>()(
  persist(
    (set, get) => ({
      patients: INITIAL_PATIENTS,
      defaultEvent: DEFAULT_CAMP_EVENT,

      setDefaultEvent: (eventUpdate) =>
        set((state) => ({
          defaultEvent: { ...state.defaultEvent, ...eventUpdate },
        })),

      getPatientById: (id: string) => {
        return get().patients.find((p) => p.id === id)
      },

      sendBulkNotifications: (patientIds, notification) => {
        const now = new Date().toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })

        set((state) => ({
          patients: state.patients.map((p) => {
            if (!patientIds.includes(p.id)) return p

            const feeMentioned =
              p.category === "notification_only"
                ? "Included in Package (₹0 Fee)"
                : `₹${state.defaultEvent.feeAmount.toLocaleString("en-IN")}`

            const record: CampNotificationRecord = {
              id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              sentAt: now,
              eventDates: notification.eventDates,
              locationName: notification.locationName,
              mapLink: notification.mapLink,
              channels: notification.channels,
              feeMentioned,
              title: `🌟 ${state.defaultEvent.title} (${notification.eventDates})`,
              message:
                notification.customMessage ||
                (p.category === "notification_only"
                  ? `Dear ${p.name}, your VIP Residential Retreat is scheduled for ${notification.eventDates} at ${notification.locationName}. Map link: ${notification.mapLink}. Your retreat is pre-paid with your plan.`
                  : `Dear ${p.name}, congratulations on your reversal milestone! Reserve your seat for the 7-Day Residential Reversal Retreat (${notification.eventDates}) at ${notification.locationName}. Special booster fee: ₹35,000. Map link: ${notification.mapLink}`),
            }

            return {
              ...p,
              status: p.status === "seat_reserved" || p.status === "attendance_confirmed" ? p.status : "notification_sent",
              notificationHistory: [record, ...p.notificationHistory],
            }
          }),
        }))
      },

      sendSingleNotification: (patientId, notification) => {
        get().sendBulkNotifications([patientId], notification)
      },

      logCall: (patientId, log) => {
        const now = new Date().toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })

        set((state) => ({
          patients: state.patients.map((p) => {
            if (p.id !== patientId) return p

            const newLog: MultiAgentCallLog = {
              id: `call-${Date.now()}`,
              callerName: log.callerName,
              callerRole: log.callerRole,
              callType: "Camp Booster Phone Call",
              date: now,
              duration: log.duration,
              outcome: log.outcome,
              notes: log.notes,
            }

            let newStatus: CampOutreachStatus = p.status
            if (log.statusUpdate) {
              newStatus = log.statusUpdate
            } else if (log.outcome.toLowerCase().includes("seat reserved")) {
              newStatus = "seat_reserved"
            } else if (log.outcome.toLowerCase().includes("attendance confirmed")) {
              newStatus = "attendance_confirmed"
            } else if (p.status === "eligible" || p.status === "notification_sent") {
              newStatus = "call_logged"
            }

            // If seat reserved, update payment status to committed
            const updatedPaymentSummary = { ...p.paymentSummary }
            if (newStatus === "seat_reserved" && p.category === "boost_and_payment") {
              updatedPaymentSummary.campPaymentStatus = "paid"
              updatedPaymentSummary.paidAmount = 35000
              updatedPaymentSummary.paymentDate = now
              updatedPaymentSummary.transactionRef = `pay_Razorpay_${Date.now().toString().slice(-6)}`
            }

            return {
              ...p,
              status: newStatus,
              latestCallNotes: log.notes,
              callHistory: [newLog, ...p.callHistory],
              paymentSummary: updatedPaymentSummary,
            }
          }),
        }))
      },

      recordPayment: (patientId, payment) => {
        const now = new Date().toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })

        set((state) => ({
          patients: state.patients.map((p) => {
            if (p.id !== patientId) return p

            return {
              ...p,
              status: "seat_reserved",
              paymentSummary: {
                ...p.paymentSummary,
                campPaymentStatus: "paid",
                paidAmount: payment.amount,
                paymentDate: now,
                paymentMode: payment.mode,
                transactionRef: payment.reference,
              },
            }
          }),
        }))
      },
    }),
    {
      name: "residential-camp-patients-v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
