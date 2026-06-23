"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    getMindsetTemplates,
    getMindsetTemplateById,
    createMindsetTemplate,
    updateMindsetTemplate,
    deleteMindsetTemplate,
    addPhaseToTemplate,
    updatePhase,
    deletePhase,
    addDayDetailToTemplate,
    updateDayDetail,
    addActivityToDayDetail,
    updateActivity,
} from "@/lib/api/mindset-template-client"
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

// ── Template Hooks ──────────────────────────────────────────

export function useMindsetTemplates(params?: MindsetTemplateListParams) {
    return useQuery<any, Error>({
        queryKey: ["mindset-templates", params],
        queryFn: () => getMindsetTemplates(params),
        staleTime: 1000 * 60 * 5,
    })
}

export function useMindsetTemplateById(id: string | null, language_code?: string) {
    return useQuery<any, Error>({
        queryKey: ["mindset-template", id, language_code],
        queryFn: () => {
            if (!id) throw new Error("Template ID is required")
            return getMindsetTemplateById(id, language_code)
        },
        enabled: Boolean(id),
        staleTime: 1000 * 60 * 5,
    })
}

export function useCreateMindsetTemplate() {
    const queryClient = useQueryClient()

    return useMutation<MindsetTemplate, Error, CreateMindsetTemplateRequest>({
        mutationFn: createMindsetTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mindset-templates"] })
        },
    })
}

export function useUpdateMindsetTemplate() {
    const queryClient = useQueryClient()

    return useMutation<
        MindsetTemplate,
        Error,
        { id: string; data: UpdateMindsetTemplateRequest }
    >({
        mutationFn: ({ id, data }) => updateMindsetTemplate(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["mindset-templates"] })
            queryClient.invalidateQueries({ queryKey: ["mindset-template", variables.id] })
        },
    })
}

export function useDeleteMindsetTemplate() {
    const queryClient = useQueryClient()

    return useMutation<void, Error, string>({
        mutationFn: deleteMindsetTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mindset-templates"] })
        },
    })
}

// ── Phase Hooks ─────────────────────────────────────────────

export function useAddPhase() {
    const queryClient = useQueryClient()

    return useMutation<
        MindsetPhase,
        Error,
        { templateId: string; data: CreateMindsetPhaseRequest }
    >({
        mutationFn: ({ templateId, data }) => addPhaseToTemplate(templateId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["mindset-template", variables.templateId] })
        },
    })
}

export function useUpdatePhase() {
    const queryClient = useQueryClient()

    return useMutation<
        MindsetPhase,
        Error,
        { phaseId: string; data: UpdateMindsetPhaseRequest; templateId?: string }
    >({
        mutationFn: ({ phaseId, data }) => updatePhase(phaseId, data),
        onSuccess: (_, variables) => {
            if (variables.templateId) {
                queryClient.invalidateQueries({ queryKey: ["mindset-template", variables.templateId] })
            }
            queryClient.invalidateQueries({ queryKey: ["mindset-templates"] })
        },
    })
}

export function useDeletePhase() {
    const queryClient = useQueryClient()

    return useMutation<void, Error, { phaseId: string; templateId?: string }>({
        mutationFn: ({ phaseId }) => deletePhase(phaseId),
        onSuccess: (_, variables) => {
            if (variables.templateId) {
                queryClient.invalidateQueries({ queryKey: ["mindset-template", variables.templateId] })
            }
            queryClient.invalidateQueries({ queryKey: ["mindset-templates"] })
        },
    })
}

// ── Day Detail Hooks ────────────────────────────────────────

export function useAddDayDetail() {
    const queryClient = useQueryClient()

    return useMutation<
        MindsetDayDetail,
        Error,
        { templateId: string; data: CreateMindsetDayDetailRequest }
    >({
        mutationFn: ({ templateId, data }) => addDayDetailToTemplate(templateId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["mindset-template", variables.templateId] })
        },
    })
}

export function useUpdateDayDetail() {
    const queryClient = useQueryClient()

    return useMutation<
        MindsetDayDetail,
        Error,
        { detailId: string; data: UpdateMindsetDayDetailRequest; templateId?: string }
    >({
        mutationFn: ({ detailId, data }) => updateDayDetail(detailId, data),
        onSuccess: (_, variables) => {
            if (variables.templateId) {
                queryClient.invalidateQueries({ queryKey: ["mindset-template", variables.templateId] })
            }
            queryClient.invalidateQueries({ queryKey: ["mindset-templates"] })
        },
    })
}

// ── Activity Hooks ──────────────────────────────────────────

export function useAddActivity() {
    const queryClient = useQueryClient()

    return useMutation<
        MindsetActivity,
        Error,
        { detailId: string; data: CreateMindsetActivityRequest; templateId?: string }
    >({
        mutationFn: ({ detailId, data }) => addActivityToDayDetail(detailId, data),
        onSuccess: (_, variables) => {
            if (variables.templateId) {
                queryClient.invalidateQueries({ queryKey: ["mindset-template", variables.templateId] })
            }
        },
    })
}

export function useUpdateActivity() {
    const queryClient = useQueryClient()

    return useMutation<
        MindsetActivity,
        Error,
        { activityId: string; data: UpdateMindsetActivityRequest; templateId?: string }
    >({
        mutationFn: ({ activityId, data }) => updateActivity(activityId, data),
        onSuccess: (_, variables) => {
            if (variables.templateId) {
                queryClient.invalidateQueries({ queryKey: ["mindset-template", variables.templateId] })
            }
        },
    })
}
