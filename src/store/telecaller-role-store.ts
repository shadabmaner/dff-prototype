import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type TelecallerRoleType = 
  | "welcome_call" 
  | "payment_recovery" 
  | "residential_camp" 
  | "lead_nurture"

export interface TelecallerProfile {
  id: string
  name: string
  email: string
  phone: string
  role: TelecallerRoleType
  roleTitle: string
  avatar: string
  department: string
}

export const ROLE_PROFILES: Record<TelecallerRoleType, TelecallerProfile> = {
  welcome_call: {
    id: "TC-W101",
    name: "Ananya Iyer",
    email: "ananya.iyer@dff.health",
    phone: "+91 98201 55678",
    role: "welcome_call",
    roleTitle: "Welcome Call Specialist",
    avatar: "AI",
    department: "Patient Onboarding & Care Setup",
  },
  payment_recovery: {
    id: "TC-R202",
    name: "Sneha Nair",
    email: "sneha.nair@dff.health",
    phone: "+91 98334 11223",
    role: "payment_recovery",
    roleTitle: "Payment Recovery Specialist",
    avatar: "SN",
    department: "Finance & Installment Recovery",
  },
  residential_camp: {
    id: "TC-C303",
    name: "Divya Rao",
    email: "divya.rao@dff.health",
    phone: "+91 98711 99887",
    role: "residential_camp",
    roleTitle: "Residential Camp Booster",
    avatar: "DR",
    department: "Events & Camp Retention",
  },
  lead_nurture: {
    id: "TC-L404",
    name: "Rahul Sharma",
    email: "rahul.sharma@dff.health",
    phone: "+91 98901 33445",
    role: "lead_nurture",
    roleTitle: "Lead Nurture Specialist",
    avatar: "RS",
    department: "Inbound Pipeline & Sales Conversion",
  },
}

interface TelecallerRoleState {
  currentRole: TelecallerRoleType
  setCurrentRole: (role: TelecallerRoleType) => void
  getProfile: () => TelecallerProfile
}

export const useTelecallerRoleStore = create<TelecallerRoleState>()(
  persist(
    (set, get) => ({
      currentRole: "welcome_call",
      setCurrentRole: (role: TelecallerRoleType) => set({ currentRole: role }),
      getProfile: () => ROLE_PROFILES[get().currentRole] ?? ROLE_PROFILES.welcome_call,
    }),
    {
      name: "telecaller-specialized-role",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
