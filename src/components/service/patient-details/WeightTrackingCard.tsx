"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp as TrendingUpIcon } from "lucide-react";

interface WeightTrackingCardProps {
  isLoadingMetrics: boolean;
  metricsData: any;
}

export function WeightTrackingCard({ isLoadingMetrics, metricsData }: WeightTrackingCardProps) {
  return (
    <Card className="border-0 bg-white shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-pink-100 flex items-center justify-center">
            <TrendingUpIcon className="h-5 w-5 text-pink-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Weight Tracking</h2>
        </div>
        {isLoadingMetrics ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ) : metricsData?.data?.weight_logs && metricsData.data.weight_logs.length > 0 ? (
          <div className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <p className="text-4xl font-bold text-blue-900">{metricsData.data.weight_logs[0].weight_kg}</p>
              <p className="text-sm text-blue-700 mt-1">kg</p>
              <p className="text-xs text-blue-600 mt-2">
                Logged on {new Date(metricsData.data.weight_logs[0].logged_date).toLocaleDateString()}
              </p>
            </div>
            {metricsData.data.weight_logs[0].bmi && (
              <div className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">BMI</span>
                  <span className="font-semibold text-slate-900">{metricsData.data.weight_logs[0].bmi}</span>
                </div>
                {metricsData.data.weight_logs[0].bmi_category && (
                  <p className="text-xs text-slate-500 mt-1">Category: {metricsData.data.weight_logs[0].bmi_category}</p>
                )}
              </div>
            )}
            {metricsData.data.weight_logs[0].notes && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">{metricsData.data.weight_logs[0].notes}</p>
              </div>
            )}
            {metricsData.data.weight_logs.length > 1 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-900">Weight History</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {metricsData.data.weight_logs.slice(1, 6).map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{log.weight_kg} kg</p>
                        <p className="text-xs text-slate-500">{new Date(log.logged_date).toLocaleDateString()}</p>
                      </div>
                      {log.bmi && (
                        <Badge variant="outline" className="text-xs">
                          BMI: {log.bmi}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-8">No weight data available</p>
        )}
      </CardContent>
    </Card>
  );
}
