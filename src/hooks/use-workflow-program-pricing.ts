import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { WorkflowProgramPricing } from "./use-workflow-programs";

interface WorkflowProgramPricingListResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: WorkflowProgramPricing[];
}

interface WorkflowProgramPricingDetailResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: WorkflowProgramPricing | null;
}

interface WorkflowProgramPricingMutationResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: WorkflowProgramPricing;
}

export type CreateWorkflowProgramPricingPayload = {
  program_id: string;
  base_price: number;
  currency: string;
  enrollment_fee?: number;
  enrollment_fee_adjustable?: boolean;
  max_discount_percent?: number;
  max_discount_amount?: number;
  effective_from: string;
  effective_to?: string;
};

export function useWorkflowProgramPricing(programId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["workflow-program-pricing", programId],
    enabled: Boolean(programId) && (options?.enabled ?? true),
    queryFn: async () => {
      if (!programId) throw new Error("Program ID is required to fetch pricing");
      const { data } = await apiClient.get<WorkflowProgramPricingListResponse>(
        `/workflow-programs/${programId}/pricing`,
      );
      if (!data?.success) {
        throw new Error(data?.message ?? "Unable to load workflow program pricing");
      }
      return data.data;
    },
    staleTime: 1000 * 60,
  });
}

export function useActivateWorkflowProgramPricing() {
  const queryClient = useQueryClient();

  return useMutation<WorkflowProgramPricing, Error, { programId: string; pricingId: string }>({
    mutationFn: async ({ pricingId }) => {
      const { data } = await apiClient.patch<WorkflowProgramPricingMutationResponse>(
        `/workflow-programs/pricing/${pricingId}/activate`,
        {},
      );
      if (!data?.success) {
        throw new Error(data?.message ?? "Unable to activate workflow program pricing");
      }
      return data.data;
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workflow-program-pricing", variables.programId] });
      queryClient.invalidateQueries({ queryKey: ["workflow-program-pricing-current", variables.programId] });
      queryClient.invalidateQueries({ queryKey: ["workflow-program", variables.programId] });
    },
  });
}

export function useCurrentWorkflowProgramPricing(programId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["workflow-program-pricing-current", programId],
    enabled: Boolean(programId) && (options?.enabled ?? true),
    queryFn: async () => {
      if (!programId) throw new Error("Program ID is required to fetch current pricing");
      const { data } = await apiClient.get<WorkflowProgramPricingDetailResponse>(
        `/workflow-programs/${programId}/pricing/current`,
      );
      if (!data?.success) {
        throw new Error(data?.message ?? "Unable to load current workflow program pricing");
      }
      return data.data;
    },
  });
}

export function useCreateWorkflowProgramPricing() {
  const queryClient = useQueryClient();

  return useMutation<WorkflowProgramPricing, Error, CreateWorkflowProgramPricingPayload>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<WorkflowProgramPricingMutationResponse>(
        "/workflow-programs/pricing",
        payload,
      );
      if (!data?.success) {
        throw new Error(data?.message ?? "Unable to create workflow program pricing");
      }
      return data.data;
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workflow-program-pricing", variables.program_id] });
      queryClient.invalidateQueries({ queryKey: ["workflow-program-pricing-current", variables.program_id] });
      queryClient.invalidateQueries({ queryKey: ["workflow-program", variables.program_id] });
    },
  });
}

export function useUpdateWorkflowProgramPricing() {
  const queryClient = useQueryClient();

  return useMutation<
    WorkflowProgramPricing,
    Error,
    { pricingId: string; payload: CreateWorkflowProgramPricingPayload }
  >({
    mutationFn: async ({ pricingId, payload }) => {
      const { data } = await apiClient.patch<WorkflowProgramPricingMutationResponse>(
        `/workflow-programs/pricing/${pricingId}`,
        payload,
      );
      if (!data?.success) {
        throw new Error(data?.message ?? "Unable to update workflow program pricing");
      }
      return data.data;
    },
    onSuccess: (_response, variables) => {
      const programId = variables.payload.program_id;
      queryClient.invalidateQueries({ queryKey: ["workflow-program-pricing", programId] });
      queryClient.invalidateQueries({ queryKey: ["workflow-program-pricing-current", programId] });
      queryClient.invalidateQueries({ queryKey: ["workflow-program", programId] });
    },
  });
}

export function useDeactivateWorkflowProgramPricing() {
  const queryClient = useQueryClient();

  return useMutation<WorkflowProgramPricing, Error, { programId: string; pricingId: string }>({
    mutationFn: async ({ pricingId }) => {
      const { data } = await apiClient.patch<WorkflowProgramPricingMutationResponse>(
        `/workflow-programs/pricing/${pricingId}/deactivate`,
        {},
      );
      if (!data?.success) {
        throw new Error(data?.message ?? "Unable to deactivate workflow program pricing");
      }
      return data.data;
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workflow-program-pricing", variables.programId] });
      queryClient.invalidateQueries({ queryKey: ["workflow-program-pricing-current", variables.programId] });
      queryClient.invalidateQueries({ queryKey: ["workflow-program", variables.programId] });
    },
  });
}
