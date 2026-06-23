"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, ChevronRight } from "lucide-react";

interface AssessmentSubmissionsCardProps {
  assessmentSubmissions: any[];
  onSelectAssessment: (assessment: any) => void;
}

export function AssessmentSubmissionsCard({
  assessmentSubmissions,
  onSelectAssessment,
}: AssessmentSubmissionsCardProps) {
  return (
    <Card className="border-0 bg-white shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-cyan-100 flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-cyan-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Assessment Submissions</h2>
        </div>
        {assessmentSubmissions && assessmentSubmissions.length > 0 ? (
          <div className="space-y-4">
            {assessmentSubmissions.map((assessment: any) => (
              <div
                key={assessment.id}
                className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 cursor-pointer transition-all shadow-sm hover:shadow-md"
                onClick={() => onSelectAssessment(assessment)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{assessment.speciality_name}</h4>
                  <Badge variant="outline" className="bg-white border-cyan-200 text-cyan-700">
                    {new Date(assessment.created_at).toLocaleDateString()}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">
                  {assessment.raw_responses_json?.data?.questions_and_ans?.length || 0} questions answered
                </p>
                <p className="text-xs text-cyan-600 mt-2 flex items-center gap-1 font-medium">
                  <ChevronRight className="h-3 w-3" />
                  View details
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-8">No assessments completed</p>
        )}
      </CardContent>
    </Card>
  );
}
