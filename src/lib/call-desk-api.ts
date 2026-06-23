/**
 * Call Desk API Service
 * Connects to the NestJS backend at /api/v1/
 * All calls include the JWT token from auth store.
 */

import { useAuthStore } from "@/store/auth-store";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '') + '/api/v1';

function getAuthHeaders(): Record<string, string> {
    const token = useAuthStore.getState().accessToken;
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `API error ${res.status}`);
    }
    return res.json();
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export interface ApiLead {
    id: string;
    name: string;
    phone: string;
    email: string;
    status: string;
    source?: string;
    priority?: string;
    city?: string;
    assigned_to?: string;
    created_at: string;
    updated_at: string;
    last_contacted_at?: string;
}

export interface ApiLeadsResponse {
    data: ApiLead[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export async function fetchLeads(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}): Promise<ApiLeadsResponse> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.search) qs.set('search', params.search);
    if (params?.status) qs.set('status', params.status);

    const res = await fetch(`${API_BASE}/sales/leads?${qs}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse<ApiLeadsResponse>(res);
}

// ─── Call Logs ────────────────────────────────────────────────────────────────

export interface LogCallPayload {
    leadId: string;
    phone: string;
    status: string;       // connected | no_answer | busy | voicemail | wrong_number
    outcome: string;      // connected | not_answered | busy | etc.
    notes: string;
    direction?: string;
    durationSeconds?: number;
    callerName?: string;
    leadStageAtCall?: string;
    followUpDate?: string;
    duration?: string;
    callTime?: string;
    calledAt?: string;
}

export interface ApiCallLog {
    id: string;
    lead_id: string;
    lead_name?: string;
    lead_current_status?: string;
    telecaller_id: string;
    telecaller_email?: string;
    caller_name?: string;
    phone: string;
    direction: string;
    status: string;
    duration_seconds?: number;
    notes?: string;
    outcome?: string;
    lead_stage_at_call?: string;
    follow_up_date?: string;
    called_at: string;
    created_at: string;
    // UI convenience fields (may be added by context)
    lead_name_display?: string;
    duration_label?: string;
    call_time_label?: string;
}

export interface CallLogSummary {
    totalCalls: number;
    connected: number;
    notConnected: number;
    followUps: number;
    overdueFollowUps: number;
}

export interface ApiCallLogsResponse {
    data: (ApiCallLog | { summary: CallLogSummary })[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export async function postCallLog(payload: LogCallPayload): Promise<ApiCallLog> {
    const res = await fetch(`${API_BASE}/call-logs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            leadId: payload.leadId,
            phone: payload.phone,
            status: payload.status,
            outcome: payload.outcome,
            notes: payload.notes,
            direction: payload.direction ?? 'outbound',
            durationSeconds: payload.durationSeconds,
            callerName: payload.callerName,
            leadStageAtCall: payload.leadStageAtCall,
            followUpDate: payload.followUpDate,
            duration: payload.duration,
            callTime: payload.callTime,
            calledAt: payload.calledAt,
        }),
    });
    return handleResponse<ApiCallLog>(res);
}

export async function fetchCallLogs(params?: {
    page?: number;
    limit?: number;
    leadId?: string;
    telecallerId?: string;
    outcome?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    overdueOnly?: boolean;
}): Promise<ApiCallLogsResponse> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.leadId) qs.set('leadId', params.leadId);
    if (params?.telecallerId) qs.set('telecallerId', params.telecallerId);
    if (params?.outcome) qs.set('outcome', params.outcome);
    if (params?.search) qs.set('search', params.search);
    if (params?.startDate) qs.set('startDate', params.startDate);
    if (params?.endDate) qs.set('endDate', params.endDate);
    if (params?.overdueOnly) qs.set('overdueOnly', 'true');

    const res = await fetch(`${API_BASE}/call-logs?${qs}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse<ApiCallLogsResponse>(res);
}

export async function fetchOverdueFollowUps(): Promise<ApiCallLog[]> {
    const res = await fetch(`${API_BASE}/call-logs/overdue`, {
        headers: getAuthHeaders(),
    });
    return handleResponse<ApiCallLog[]>(res);
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export interface TimelineEvent {
    id: string;
    timestamp: string;
    event_type: string;
    outcome?: string;
    notes?: string;
    follow_up_date?: string;
    performed_by_name?: string;
    stage_at_event?: string;
    duration_seconds?: number;
    call_status?: string;
    old_status?: string;
    new_status?: string;
    status?: string;
    follow_up_type?: string;
    completed_at?: string;
    source: 'call_log' | 'activity' | 'follow_up';
}

export interface LeadTimelineResponse {
    lead: {
        id: string;
        name: string;
        phone: string;
        status: string;
        lastContactedAt?: string;
    };
    timeline: TimelineEvent[];
}

export async function fetchLeadTimeline(leadId: string): Promise<LeadTimelineResponse> {
    const res = await fetch(`${API_BASE}/leads/${leadId}/timeline`, {
        headers: getAuthHeaders(),
    });
    return handleResponse<LeadTimelineResponse>(res);
}

// ─── Telecallers ─────────────────────────────────────────────────────────────

export interface Telecaller {
    id: string;
    email: string;
    phone?: string;
    user_type: string;
    created_at: string;
}

export async function fetchTelecallers(): Promise<Telecaller[]> {
    const res = await fetch(`${API_BASE}/sales/telecallers`, {
        headers: getAuthHeaders(),
    });
    return handleResponse<Telecaller[]>(res);
}
