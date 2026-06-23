import { useState } from "react"
import { format } from "date-fns"
import { Calendar, Loader2, UtensilsCrossed, TrendingUp, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useMealLogsHistory } from "@/hooks/use-meal-logs"
import type { MealType } from "@/types/meal-log"

interface MealLogsHistoryProps {
  patientId: string
  startDate?: string
  endDate?: string
}

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  early_morning: "Early Morning",
  breakfast: "Breakfast",
  mid_morning: "Mid Morning",
  lunch: "Lunch",
  evening_snack: "Evening Snack",
  dinner: "Dinner",
  bedtime: "Bedtime",
}

const MEAL_TYPE_COLORS: Record<MealType, string> = {
  early_morning: "bg-purple-100 text-purple-700 border-purple-200",
  breakfast: "bg-orange-100 text-orange-700 border-orange-200",
  mid_morning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  lunch: "bg-green-100 text-green-700 border-green-200",
  evening_snack: "bg-blue-100 text-blue-700 border-blue-200",
  dinner: "bg-indigo-100 text-indigo-700 border-indigo-200",
  bedtime: "bg-slate-100 text-slate-700 border-slate-200",
}

export function MealLogsHistory({ patientId, startDate, endDate }: MealLogsHistoryProps) {
  const [page, setPage] = useState(1)
  const limit = 20
  const { data, isLoading, isError } = useMealLogsHistory({
    patientId,
    page,
    limit,
    startDate: startDate ? decodeURIComponent(startDate).split("T")[0] : undefined,
    endDate: endDate ? decodeURIComponent(endDate).split("T")[0] : undefined,
  })

  const mealLogs = data?.data || []
  const totalCalories = mealLogs.reduce((sum, log) => sum + (log.total_calories || 0), 0)
  const compliantMeals = mealLogs.filter((log) => log.is_compliant).length
  const complianceRate = mealLogs.length > 0 ? Math.round((compliantMeals / mealLogs.length) * 100) : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-8 text-center text-slate-500">
        Failed to load meal logs. Please try again.
      </div>
    )
  }

  if (mealLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <UtensilsCrossed className="h-12 w-12 text-slate-400 mb-4" />
        <p className="text-lg font-semibold text-slate-700">No meal logs found</p>
        <p className="text-sm text-slate-500 mt-1">Patient hasn't logged any meals yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-orange-600" />
            <p className="text-xs font-medium text-orange-700 uppercase tracking-wide">Total Calories</p>
          </div>
          <p className="text-3xl font-bold text-orange-700">{totalCalories}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <UtensilsCrossed className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Meals Logged</p>
          </div>
          <p className="text-3xl font-bold text-blue-700">{mealLogs.length}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Compliance Rate</p>
          </div>
          <p className="text-3xl font-bold text-green-700">{complianceRate}%</p>
        </div>
      </div>

      <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
        {mealLogs.map((log: any) => (
          <div
            key={log.id}
            className="flex flex-col gap-3 p-4 bg-white hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Badge className={`${MEAL_TYPE_COLORS[log.meal_type as MealType]} font-medium`}>
                      {MEAL_TYPE_LABELS[log.meal_type as MealType]}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={`
                        font-medium capitalize
                        ${log.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                        ${log.status === 'skipped' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                        ${log.status === 'pending' ? 'bg-slate-50 text-slate-700 border-slate-200' : ''}
                      `}
                    >
                      {log.status || 'Unknown'}
                    </Badge>
                    {log.is_compliant !== undefined && (
                      log.is_compliant ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(log.logged_date), "PPP")}
                    {log.logged_time && (
                      <>
                        <Clock className="h-3 w-3 ml-2" />
                        {log.logged_time}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-2xl font-bold text-slate-900">
                  {log.total_calories || 0}
                </div>
                <div className="text-xs text-slate-500">kcal</div>
              </div>
            </div>


            {/* Display food items - handle nested array structure */}
            {log.food_items && Array.isArray(log.food_items) && log.food_items.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Food Items</p>
                <div className="space-y-1">
                  {log.food_items.map((itemGroup: any, groupIdx: number) => (
                    <div key={groupIdx} className="flex flex-wrap gap-1">
                      {Array.isArray(itemGroup) ? (
                        itemGroup.map((item: any, itemIdx: number) => (
                          <span 
                            key={itemIdx} 
                            className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200"
                          >
                            {item.name || item}
                            {item.quantity && <span className="ml-1 text-blue-500">({item.quantity})</span>}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200">
                          {itemGroup.name || itemGroup}
                          {itemGroup.quantity && <span className="ml-1 text-blue-500">({itemGroup.quantity})</span>}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-3 text-xs">
              {log.protein_g !== null && (
                <div className="bg-slate-50 p-2 rounded text-center border border-slate-200">
                  <div className="font-semibold text-slate-900">{log.protein_g}g</div>
                  <div className="text-slate-500">Protein</div>
                </div>
              )}
              {log.carbs_g !== null && (
                <div className="bg-slate-50 p-2 rounded text-center border border-slate-200">
                  <div className="font-semibold text-slate-900">{log.carbs_g}g</div>
                  <div className="text-slate-500">Carbs</div>
                </div>
              )}
              {log.fat_g !== null && (
                <div className="bg-slate-50 p-2 rounded text-center border border-slate-200">
                  <div className="font-semibold text-slate-900">{log.fat_g}g</div>
                  <div className="text-slate-500">Fat</div>
                </div>
              )}
              {log.fiber_g !== null && (
                <div className="bg-slate-50 p-2 rounded text-center border border-slate-200">
                  <div className="font-semibold text-slate-900">{log.fiber_g}g</div>
                  <div className="text-slate-500">Fiber</div>
                </div>
              )}
            </div>

            {log.notes && (
              <div className="text-xs text-slate-600 italic bg-amber-50 p-2 rounded border-l-2 border-amber-400">
                <span className="font-semibold">Notes:</span> {log.notes}
              </div>
            )}

            {log.photo_url && (
              <div className="rounded-lg overflow-hidden border border-slate-200">
                <img
                  src={log.photo_url}
                  alt={`${MEAL_TYPE_LABELS[log.meal_type as MealType]} photo`}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </div>


    </div>
  )
}
