import { apiClient } from "@/lib/api-client"
import type {
    MindsetTemplate,
    CreateMindsetTemplateRequest,
    UpdateMindsetTemplateRequest,
    MindsetTemplateListParams,
    MindsetPhase,
    CreateMindsetPhaseRequest,
    UpdateMindsetPhaseRequest,
    MindsetDayDetail,
    CreateMindsetDayDetailRequest,
    UpdateMindsetDayDetailRequest,
    MindsetActivity,
    CreateMindsetActivityRequest,
    UpdateMindsetActivityRequest,
} from "@/types/mindset-template"

// ── Template CRUD ───────────────────────────────────────────

export async function getMindsetTemplates(
    params?: MindsetTemplateListParams
): Promise<any> {
    const { data } = await apiClient.get("/mindset-templates", { params })
    return data
}

export async function getMindsetTemplateById(
    id: string,
    language_code?: string
): Promise<MindsetTemplate> {
    const { data } = await apiClient.get<MindsetTemplate>(
        `/mindset-templates/${id}`,
        { params: language_code ? { language_code } : undefined }
    )
    return data
}

export async function createMindsetTemplate(
    payload: CreateMindsetTemplateRequest
): Promise<MindsetTemplate> {
    const { data } = await apiClient.post<MindsetTemplate>(
        "/mindset-templates",
        payload
    )
    return data
}

export async function updateMindsetTemplate(
    id: string,
    payload: UpdateMindsetTemplateRequest
): Promise<MindsetTemplate> {
    const { data } = await apiClient.put<MindsetTemplate>(
        `/mindset-templates/${id}`,
        payload
    )
    return data
}

export async function deleteMindsetTemplate(id: string): Promise<void> {
    await apiClient.delete(`/mindset-templates/${id}`)
}

// ── Phase CRUD ──────────────────────────────────────────────

export async function addPhaseToTemplate(
    templateId: string,
    payload: CreateMindsetPhaseRequest
): Promise<MindsetPhase> {
    const { data } = await apiClient.post<MindsetPhase>(
        `/mindset-templates/${templateId}/phases`,
        payload
    )
    return data
}

export async function updatePhase(
    phaseId: string,
    payload: UpdateMindsetPhaseRequest
): Promise<MindsetPhase> {
    const { data } = await apiClient.put<MindsetPhase>(
        `/mindset-templates/phases/${phaseId}`,
        payload
    )
    return data
}

export async function deletePhase(phaseId: string): Promise<void> {
    await apiClient.delete(`/mindset-templates/phases/${phaseId}`)
}

// ── Day Details CRUD ────────────────────────────────────────

export async function addDayDetailToTemplate(
    templateId: string,
    payload: CreateMindsetDayDetailRequest
): Promise<MindsetDayDetail> {
    const { data } = await apiClient.post<MindsetDayDetail>(
        `/mindset-templates/${templateId}/day-details`,
        payload
    )
    return data
}

export async function updateDayDetail(
    detailId: string,
    payload: UpdateMindsetDayDetailRequest
): Promise<MindsetDayDetail> {
    const { data } = await apiClient.put<MindsetDayDetail>(
        `/mindset-templates/day-details/${detailId}`,
        payload
    )
    return data
}

// ── Activity CRUD ───────────────────────────────────────────

export async function addActivityToDayDetail(
    detailId: string,
    payload: CreateMindsetActivityRequest
): Promise<MindsetActivity> {
    const { data } = await apiClient.post<MindsetActivity>(
        `/mindset-templates/day-details/${detailId}/activities`,
        payload
    )
    return data
}

export async function updateActivity(
    activityId: string,
    payload: UpdateMindsetActivityRequest
): Promise<MindsetActivity> {
    const { data } = await apiClient.put<MindsetActivity>(
        `/mindset-templates/activities/${activityId}`,
        payload
    )
    return data
}
