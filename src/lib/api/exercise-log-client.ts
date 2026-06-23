import { apiClient } from "@/lib/api-client"
import type { ExerciseLogsHistoryParams, ExerciseLogsHistoryResponse } from "@/types/exercise-log"

export const exerciseLogClient = {
  getExerciseLogsHistory: async (params: ExerciseLogsHistoryParams): Promise<ExerciseLogsHistoryResponse> => {
    const { patientId, page = 1, limit = 10, startDate, endDate } = params
    
    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    
    if (startDate) queryParams.append('startDate', startDate)
    if (endDate) queryParams.append('endDate', endDate)
    
    const { data } = await apiClient.get<ExerciseLogsHistoryResponse>(
      `/clinical/patients/${patientId}/exercise-logs/history?${queryParams.toString()}`
    )
    
    return data
  },
}
