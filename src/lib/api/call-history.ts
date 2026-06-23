import { apiClient } from '@/lib/api-client';

export interface CallHistoryRecord {
  id: string;
  direction: 'inbound' | 'outbound';
  calledAt: string;
  durationSeconds: number;
  durationFormatted: string;
  telecallerName: string;
  telecallerEmail: string;
  telecallerPhone: string;
  status: 'connected' | 'missed' | 'failed';
  outcome: 'interested' | 'not_interested' | 'follow_up_required' | 'voicemail' | 'wrong_number';
  notes: string;
  leadStageAtCall: string;
  followUpDate: string | null;
  phone: string;
}

export interface CallHistoryResponse {
  success: boolean;
  statusCode: number;
  data: CallHistoryRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function getCallHistory(leadId: string, page = 1, limit = 20): Promise<CallHistoryResponse> {
  const response = await apiClient.get(`/leads/${leadId}/call-history`, {
    params: { page, limit }
  });
  return response.data;
}
