export const ACTION_CATEGORIES = ["Governance", "Clinical", "Finance", "Comms"] as const
export type ActionCategory = (typeof ACTION_CATEGORIES)[number]

export const ACTION_STATUSES = ["IDLE", "RUNNING", "FAILED", "SCHEDULED"] as const
export type ActionStatus = (typeof ACTION_STATUSES)[number]

export type ActionItem = {
  id: string
  name: string
  category: ActionCategory
  owner: string
  description: string
  cadence: string
  lastRun: string
  status: ActionStatus
  autoPilot: boolean
  impactScore: number
}

export const ACTION_LIBRARY: ActionItem[] = [
  {
    id: "act-101",
    name: "Deactivate Expired Trials",
    category: "Governance",
    owner: "Platform Ops",
    description: "Identify accounts with lapsed agreements and downgrade privileges.",
    cadence: "Daily 08:00",
    lastRun: "2026-02-26T23:00:00Z",
    status: "SCHEDULED",
    autoPilot: true,
    impactScore: 86,
  },
  {
    id: "act-204",
    name: "Nudge Inactive Clinicians",
    category: "Clinical",
    owner: "Clinical Ops",
    description: "Trigger in-app prompts for clinicians without consults for 14 days.",
    cadence: "Manual",
    lastRun: "2026-02-25T10:40:00Z",
    status: "IDLE",
    autoPilot: false,
    impactScore: 72,
  },
  {
    id: "act-310",
    name: "Reconcile High-Value Refunds",
    category: "Finance",
    owner: "Finance PMO",
    description: "Moves flagged refunds into dual-approval workflow.",
    cadence: "Hourly",
    lastRun: "2026-02-27T18:05:00Z",
    status: "RUNNING",
    autoPilot: true,
    impactScore: 91,
  },
  {
    id: "act-411",
    name: "Broadcast SOP Updates",
    category: "Comms",
    owner: "Enablement",
    description: "Pushes multilingual alerts when SOP documents change.",
    cadence: "On demand",
    lastRun: "2026-02-22T05:15:00Z",
    status: "FAILED",
    autoPilot: false,
    impactScore: 64,
  },
]
