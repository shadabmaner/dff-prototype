import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

export interface WorkflowProgramPlan {
    id: string
    program_id: string
    name: string
    code: string
    description?: string
    plan_type: string
    duration_override_days: number | null
    is_default: boolean
    display_order: number
    status?: any
    is_active?: boolean
    created_at?: string
    updated_at?: string
    current_pricing?: {
        id?: string
        plan_id?: string
        base_price: string
        currency: string
        enrollment_fee: string
        enrollment_fee_adjustable: boolean
        max_discount_percent?: string
        max_discount_amount?: string
        emi_months?: number | null
        emi_interest_rate?: string | null
        effective_from: string
        effective_to: string | null
        is_active?: boolean
    } | null
}

interface WorkflowProgramPlansResponse {
    success: boolean
    message: string
    statusCode: number
    data: WorkflowProgramPlan[]
}

interface WorkflowProgramPlanDetailResponse {
    success: boolean
    message: string
    statusCode: number
    data: WorkflowProgramPlan
}

export function useWorkflowProgramPlans(programId: string, params: { active_only?: boolean } = {}) {
    return useQuery({
        queryKey: ["workflow-program-plans", programId, params],
        enabled: Boolean(programId),
        queryFn: async () => {
            const { data } = await apiClient.get<WorkflowProgramPlansResponse>(
                `/workflow-programs/${programId}/plans`,
                { params }
            )
            if (!data?.success) {
                throw new Error(data?.message ?? "Unable to load plans")
            }
            return data.data
        },
    })
}

export function useWorkflowProgramPlan(programId: string, planId: string) {
    return useQuery({
        queryKey: ["workflow-program-plan", programId, planId],
        enabled: Boolean(programId && planId),
        queryFn: async () => {
            const { data } = await apiClient.get<WorkflowProgramPlanDetailResponse>(
                `/workflow-programs/${programId}/plans/${planId}`
            )
            if (!data?.success) {
                throw new Error(data?.message ?? "Unable to load plan")
            }
            return data.data
        },
    })
}

export function useCreateWorkflowProgramPlan() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({
            programId,
            payload,
        }: {
            programId: string
            payload: Partial<WorkflowProgramPlan>
        }) => {
            const { data } = await apiClient.post<WorkflowProgramPlanDetailResponse>(
                `/workflow-programs/${programId}/plans`,
                payload
            )
            if (!data?.success) {
                throw new Error(data?.message ?? "Unable to create plan")
            }
            return data.data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["workflow-program-plans", variables.programId] })
        },
    })
}

export function useUpdateWorkflowProgramPlan() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({
            programId,
            planId,
            payload,
        }: {
            programId: string
            planId: string
            payload: Partial<WorkflowProgramPlan>
        }) => {
            const { data } = await apiClient.put<WorkflowProgramPlanDetailResponse>(
                `/workflow-programs/${programId}/plans/${planId}`,
                payload
            )
            if (!data?.success) {
                throw new Error(data?.message ?? "Unable to update plan")
            }
            return data.data
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["workflow-program-plans", variables.programId] })
            queryClient.invalidateQueries({ queryKey: ["workflow-program-plan", variables.programId, variables.planId] })
        },
    })
}

export function useDeleteWorkflowProgramPlan() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ programId, planId }: { programId: string; planId: string }) => {
            const { data } = await apiClient.delete(`/workflow-programs/${programId}/plans/${planId}`)
            if (!data?.success) {
                throw new Error(data?.message ?? "Unable to delete plan")
            }
            return data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["workflow-program-plans", variables.programId] })
        },
    })
}
