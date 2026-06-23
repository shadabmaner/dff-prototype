import { apiClient } from "@/lib/api-client"
import type { MealLogsHistoryParams, MealLogsHistoryResponse } from "@/types/meal-log"

export const mealLogClient = {
  getMealLogsHistory: async (params: MealLogsHistoryParams): Promise<MealLogsHistoryResponse> => {
    const { patientId, page = 1, limit = 10, startDate, endDate } = params
    
    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    
    if (startDate) queryParams.append('startDate', startDate)
    if (endDate) queryParams.append('endDate', endDate)
    
    const { data } = await apiClient.get<MealLogsHistoryResponse>(
      `/clinical/patients/${patientId}/meal-logs/history?${queryParams.toString()}`
    )
    
    return data
  },
}
