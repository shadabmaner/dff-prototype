export const WORKFLOW_PROGRAM_STATUSES = ["draft", "active", "inactive", "archived"] as const
export const WORKFLOW_DURATION_TYPES = ["days", "months"] as const
export const WORKFLOW_DURATION_DAY_OPTIONS = ["", "0", "3", "7", "10", "14"] as const
export const WORKFLOW_TRIGGER_DAY_OPTIONS = ["", "0", "5", "10", "15", "20"] as const

export type WorkflowProgramStatus = (typeof WORKFLOW_PROGRAM_STATUSES)[number]
export type WorkflowDurationType = (typeof WORKFLOW_DURATION_TYPES)[number]
