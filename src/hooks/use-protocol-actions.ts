import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

export interface ProtocolActionSchedulePayload {
  protocol_id: string;
  action_id: string;
  month_number: number;
  day_of_month: number;
  time_of_day: string;
  time_slot: string;
  sequence: number;
  is_mandatory: boolean;
  duration_mins: number;
  requires_specific_staff: boolean;
  staff_type_override?: string | null;
}

export interface ProtocolActionUpdateInput {
  actionId: string;
  payload: ProtocolActionSchedulePayload;
}

async function updateProtocolAction(input: ProtocolActionUpdateInput) {
  const { actionId, payload } = input;
  await apiClient.put(`/protocols/actions/${actionId}`, payload);
}

export function useBulkUpdateProtocolActions() {
  return useMutation({
    mutationFn: async (updates: ProtocolActionUpdateInput[]) => {
      await Promise.all(updates.map(updateProtocolAction));
    },
  });
}
