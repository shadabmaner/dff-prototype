import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { WorkflowProgram } from "./use-workflow-programs";

export type UpdateWorkflowProgramPayload = {
  name?: string;
  code?: string;
  description?: string;
  language_code?: string;
  status?: string;
  duration_type_v2?: string;
  duration_value?: number;
  duration_extra_days?: number;
  auto_generate_trigger_day?: number;
  min_batch_size?: number;
  max_batch_size?: number;
  auto_generate_batch?: boolean;
  auto_enroll_patients?: boolean;
};

export function useUpdateWorkflowProgram() {
  const queryClient = useQueryClient();

  return useMutation<WorkflowProgram, Error, { programId: string; payload: UpdateWorkflowProgramPayload }>({
    mutationFn: async ({ programId, payload }) => {
      const { data } = await apiClient.put<{ success: boolean; data: WorkflowProgram }>(
        `/workflow-programs/${programId}`,
        payload,
      );
      if (!data?.success) {
        throw new Error("Unable to update workflow program");
      }
      return data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workflow-program", variables.programId] });
      queryClient.invalidateQueries({ queryKey: ["workflow-programs"] });
    },
  });
}
