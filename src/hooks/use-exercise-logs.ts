import { useQuery } from "@tanstack/react-query"
import { exerciseLogClient } from "@/lib/api/exercise-log-client"
import type { ExerciseLogsHistoryParams } from "@/types/exercise-log"

export const useExerciseLogsHistory = (params: ExerciseLogsHistoryParams) => {
  return useQuery({
    queryKey: ["exercise-logs-history", params],
    queryFn: () => exerciseLogClient.getExerciseLogsHistory(params),
    enabled: !!params.patientId,
  })
}
