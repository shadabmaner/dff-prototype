export interface MindsetTemplate {
    id: string
    title: string
    description: string | null
    total_days: number
    program_type: string | null
    theme: string | null
    tagline: string | null
    speciality_id: string | null
    language_code: string | null
    is_active?: boolean
    created_by?: string
    created_at: string
    updated_at: string
    phases?: MindsetPhase[]
    day_details?: MindsetDayDetail[]
}

export interface CreateMindsetTemplateRequest {
    title: string
    description?: string
    total_days: number
    program_type?: string
    theme?: string
    tagline?: string
    speciality_id?: string
    language_code?: string
}

export interface UpdateMindsetTemplateRequest {
    title?: string
    description?: string
    total_days?: number
    program_type?: string
    theme?: string
    tagline?: string
    speciality_id?: string
    language_code?: string
}

export interface MindsetTemplateListParams {
    page?: number
    limit?: number
    search?: string
    speciality_id?: string
    language_code?: string
}

export interface MindsetTemplateListResponse {
    templates: MindsetTemplate[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
}

// ── Phases ──────────────────────────────────────────────────

export interface MindsetPhase {
    id: string
    template_id: string
    phase_number: number
    phase_name: string
    start_day: number
    end_day: number
    duration_days: number
    unlock_day_of_week: number
    resource_pdf_url: string | null
    resource_status?: string | null
    created_at: string
    updated_at: string
}

export interface CreateMindsetPhaseRequest {
    phase_number: number
    phase_name: string
    start_day: number
    end_day: number
    duration_days: number
    unlock_day_of_week: number
    resource_pdf_url?: string
}

export interface UpdateMindsetPhaseRequest {
    phase_number?: number
    phase_name?: string
    start_day?: number
    end_day?: number
    duration_days?: number
    unlock_day_of_week?: number
    resource_pdf_url?: string
    resource_status?: string
}

// ── Day Details ─────────────────────────────────────────────

export interface MindsetDayDetail {
    id: string
    template_id: string
    day_number: number
    phase_name: string | null
    week_theme: string | null
    title: string | null
    content: Record<string, string> | null
    tips: string | null
    activities?: MindsetActivity[]
    created_at: string
    updated_at: string
}

export interface CreateMindsetDayDetailRequest {
    day_number: number
    phase_name?: string
    week_theme?: string
    title?: string
    content?: Record<string, string>
    tips?: string
}

export interface UpdateMindsetDayDetailRequest {
    day_number?: number
    phase_name?: string
    week_theme?: string
    title?: string
    content?: Record<string, string>
    tips?: string
}

// ── Activities ──────────────────────────────────────────────

export interface MindsetActivity {
    id: string
    day_detail_id: string
    activity_type: string
    prompt: Record<string, string> | null
    options: Record<string, string[]> | null
    display_order: number
    created_at: string
    updated_at: string
}

export interface CreateMindsetActivityRequest {
    activity_type: string
    prompt?: Record<string, string>
    options?: Record<string, string[]>
    display_order: number
}

export interface UpdateMindsetActivityRequest {
    activity_type?: string
    prompt?: Record<string, string>
    options?: Record<string, string[]>
    display_order?: number
}
