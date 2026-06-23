export interface GroceryPhaseConfig {
  url?: string | null
  pdf_url?: string | null
  is_unlocked?: boolean
  status?: 'locked' | 'unlocked' | string
  name?: string
}

export interface GroceryPhase {
  id?: string
  template_id?: string
  phase_number: number
  phase_name?: string
  start_day?: number
  end_day?: number
  duration_days?: number
  guidelines?: string
  instructions?: string
  /** New: rich config object for the grocery list */
  grocery_list_config?: GroceryPhaseConfig
  /** New: rich config object for the diet phase PDF */
  diet_pdf_config?: GroceryPhaseConfig
  /** Legacy flat fields for backward compat */
  grocery_list_pdf_url?: string | null
  grocery_list_status?: "unlocked" | "locked" | string
}

export interface UpdateGroceryRequest {
  grocery_list_pdf_url?: string
  grocery_list_status?: "unlocked" | "locked"
}
