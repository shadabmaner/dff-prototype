"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ClipboardList } from "lucide-react";

interface AssessmentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentSubmissions: any[];
  selectedAssessment: any;
  onSelectAssessment: (assessment: any) => void;
}

export function AssessmentDrawer({
  open,
  onOpenChange,
  assessmentSubmissions,
  selectedAssessment,
  onSelectAssessment,
}: AssessmentDrawerProps) {
  return (
    <>
      {/* Main Assessment Drawer */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-slate-900">
              Patient Assessment
            </SheetTitle>
            <SheetDescription className="text-slate-600">
              View patient's assessment responses and medical information
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {assessmentSubmissions && assessmentSubmissions.length > 0 ? (
              assessmentSubmissions.map((assessment: any, idx: number) => (
                <div key={assessment.id || idx} className="space-y-4">
                  {/* Assessment Header */}
                  <div className="pb-4 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">
                        {assessment.speciality_name || "Assessment"}
                      </h3>
                      <Badge
                        variant="outline"
                        className="border-slate-300 text-slate-600"
                      >
                        {new Date(assessment.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </Badge>
                    </div>
                  </div>

                  {/* Questions and Answers */}
                  {assessment.questions_and_answers && assessment.questions_and_answers.length > 0 ? (
                    <div className="space-y-6">
                      {assessment.questions_and_answers.map((section: any, sIdx: number) => (
                        <div key={sIdx} className="space-y-3">
                          <h4 className="text-sm font-bold text-slate-800 border-l-4 border-slate-400 pl-2">
                            {section.section_name}
                          </h4>
                          <div className="space-y-4">
                            {section.questions?.map((qa: any, qaIdx: number) => (
                              <Card
                                key={qaIdx}
                                className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                              >
                                <CardContent className="p-4">
                                  <div className="space-y-2">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                      {qa.question}
                                    </p>
                                    <p className="text-sm font-semibold text-slate-900">
                                      {Array.isArray(qa.answer)
                                        ? qa.answer.join(", ")
                                        : qa.answer || "—"}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : assessment.raw_responses_json?.data?.questions_and_ans &&
                    assessment.raw_responses_json.data.questions_and_ans
                      .length > 0 ? (
                    <div className="space-y-4">
                      {assessment.raw_responses_json.data.questions_and_ans.map(
                        (qa: any, qaIdx: number) => (
                          <Card
                            key={qaIdx}
                            className="border border-slate-200 bg-slate-50/50 shadow-sm"
                          >
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                                  {qa.question?.replace(/_/g, " ")}
                                </p>
                                <p className="text-sm font-semibold text-slate-900">
                                  {Array.isArray(qa.ans)
                                    ? qa.ans.join(", ")
                                    : qa.ans || "—"}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">
                        No assessment responses available
                      </p>
                    </div>
                  )}
                </div>
              ),
              )
            ) : (
              <div className="text-center py-12">
                <ClipboardList className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">
                  No assessments found
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Patient has not completed any assessments yet
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Assessment Details Drawer (for clicking individual assessment) */}
      <Sheet open={!!selectedAssessment} onOpenChange={(open) => !open && onSelectAssessment(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-slate-900">
              Assessment Details
            </SheetTitle>
            <SheetDescription>
              View patient's assessment responses and medical information
            </SheetDescription>
          </SheetHeader>

          {selectedAssessment && (
            <div className="mt-6 space-y-6">
              <div className="pb-4 border-b border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">{selectedAssessment.speciality_name || "Assessment"}</h3>
                  <Badge variant="outline" className="border-slate-300 text-slate-600">
                    {new Date(selectedAssessment.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Badge>
                </div>
              </div>

              <div className="space-y-6">
                {selectedAssessment.questions_and_answers && selectedAssessment.questions_and_answers.length > 0 ? (
                  selectedAssessment.questions_and_answers.map((section: any, sIdx: number) => (
                    <div key={sIdx} className="space-y-3">
                      <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide border-l-4 border-slate-400 pl-2">
                        {section.section_name}
                      </h4>
                      <div className="space-y-4">
                        {section.questions?.map((qa: any, idx: number) => (
                          <div key={qa.question_id || idx} className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-600 mb-2">
                                  {qa.question}
                                </p>
                                <p className="text-sm text-slate-900 font-bold">
                                  {Array.isArray(qa.answer) ? qa.answer.join(', ') : qa.answer || "—"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">Questions & Answers</h4>
                    {selectedAssessment.raw_responses_json?.data?.questions_and_ans?.map((qa: any, idx: number) => (
                      <div key={qa.questions_id || idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-700 mb-2">
                              {qa.question.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </p>
                            <p className="text-sm text-slate-900 font-semibold">
                              {Array.isArray(qa.ans) ? qa.ans.join(', ') : qa.ans || "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
