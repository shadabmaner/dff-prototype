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
  outcome: 'interested' | 'not_interested' | 'follow_up_required' | 'voicemail' | 'wrong_number' | 'converted' | 'connected' | 'busy';
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

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0s'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}

const TELECALLER_POOL = [
  { name: "Priya Sharma", email: "priya.sharma@dr.com", phone: "+91 98765 43210" },
  { name: "Rahul Verma", email: "rahul.verma@dr.com", phone: "+91 98765 43211" },
  { name: "Ananya Patel", email: "ananya.patel@dr.com", phone: "+91 98765 43212" },
  { name: "Vikram Malhotra", email: "vikram.m@dr.com", phone: "+91 98765 43213" },
  { name: "Neha Deshmukh", email: "neha.d@dr.com", phone: "+91 98765 43214" }
]

const SAMPLE_CALL_NOTES = [
  "Explained the 90-day reversal program and doctor consultation schedule. Patient was very engaged and asked about personalized meal kits.",
  "Followed up regarding blood sugar baseline reports. Patient is keen to proceed and requested payment link on WhatsApp.",
  "Informed about our weekly lifestyle coach check-ins and clinical progress review. Follow-up consultation scheduled.",
  "Introductory onboarding discovery call. Addressed questions about continuous glucose monitor (CGM) sensor setup.",
  "Patient was in a meeting; requested callback in evening to finalize clinical assessment slot.",
  "Discussed current diabetes medication history and family risk factors. Patient agreed to start primary assessment."
]

export function generateMockCallHistory(leadId: string, page = 1, limit = 20): CallHistoryResponse {
  const hash = hashString(leadId)
  const totalCalls = 4 + (hash % 5)
  const outcomes: CallHistoryRecord['outcome'][] = ['interested', 'follow_up_required', 'converted', 'connected', 'interested']

  const records: CallHistoryRecord[] = Array.from({ length: totalCalls }, (_, i) => {
    const itemHash = hash + i * 29
    const telecaller = TELECALLER_POOL[itemHash % TELECALLER_POOL.length]
    const outcome = outcomes[i % outcomes.length]
    const isOutbound = (itemHash % 4) !== 0
    const durationSeconds = 95 + (itemHash % 280)
    
    const callDate = new Date()
    callDate.setDate(callDate.getDate() - (i * 2 + 1))
    callDate.setHours(10 + (itemHash % 7), 15 + (itemHash % 40))

    const followUpDate = outcome === 'follow_up_required' || outcome === 'interested'
      ? new Date(Date.now() + (2 + (itemHash % 3)) * 86400000).toISOString()
      : null

    return {
      id: `CH-${leadId.slice(0, 5)}-${100 + i}`,
      direction: isOutbound ? 'outbound' : 'inbound',
      calledAt: callDate.toISOString(),
      durationSeconds,
      durationFormatted: formatDuration(durationSeconds),
      telecallerName: telecaller.name,
      telecallerEmail: telecaller.email,
      telecallerPhone: telecaller.phone,
      status: 'connected',
      outcome,
      notes: SAMPLE_CALL_NOTES[itemHash % SAMPLE_CALL_NOTES.length],
      leadStageAtCall: outcome === 'converted' ? 'CONVERTED' : outcome === 'interested' ? 'INTERESTED' : 'FOLLOW_UP',
      followUpDate,
      phone: `+91 98${String(10000000 + itemHash).slice(0, 8)}`
    }
  })

  return {
    success: true,
    statusCode: 200,
    data: records,
    meta: {
      page,
      limit,
      total: records.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    }
  }
}

export async function getCallHistory(leadId: string, page = 1, limit = 20): Promise<CallHistoryResponse> {
  try {
    const response = await apiClient.get(`/leads/${leadId}/call-history`, {
      params: { page, limit }
    });
    if (response?.data?.success && Array.isArray(response?.data?.data) && response.data.data.length > 0) {
      return response.data;
    }
  } catch {
    // API endpoint unavailable in prototype environment
  }
  return generateMockCallHistory(leadId, page, limit);
}
