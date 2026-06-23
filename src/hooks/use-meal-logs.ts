import { useQuery } from "@tanstack/react-query"
import { mealLogClient } from "@/lib/api/meal-log-client"
import type { MealLogsHistoryParams } from "@/types/meal-log"

export const useMealLogsHistory = (params: MealLogsHistoryParams) => {
  return useQuery({
    queryKey: ["meal-logs-history", params],
    queryFn: () => mealLogClient.getMealLogsHistory(params),
    enabled: !!params.patientId,
  })
}
