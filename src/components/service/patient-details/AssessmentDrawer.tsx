"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ClipboardList } from "lucide-react";

interface AssessmentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientClinicalData: any;
}

export function AssessmentDrawer({ open, onOpenChange, patientClinicalData }: AssessmentDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-slate-900">
            Patient Assessment
          </SheetTitle>
          <SheetDescription className="text-slate-600">
            View patient's assessment responses and medical information
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {patientClinicalData?.data?.assessment_submissions &&
            patientClinicalData.data.assessment_submissions.length > 0 ? (
            patientClinicalData.data.assessment_submissions.map(
              (assessment: any, idx: number) => (
                <div key={assessment.id || idx} className="space-y-6">
                  {/* Assessment Header */}
                  <div className="pb-4 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900 text-lg">
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

                  {/* Questions and Answers - New Structure with Sections */}
                  {assessment.questions_and_answers && assessment.questions_and_answers.length > 0 ? (
                    <div className="space-y-6">
                      {assessment.questions_and_answers.map((section: any, sectionIdx: number) => (
                        <div key={sectionIdx} className="space-y-4">
                          {/* Section Header */}
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-1 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
                            <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
                              {section.section_name}
                            </h4>
                          </div>

                          {/* Section Questions */}
                          <div className="space-y-3 pl-7">
                            {section.questions && section.questions.length > 0 ? (
                              section.questions.map((qa: any, qaIdx: number) => (
                                <Card
                                  key={qaIdx}
                                  className="border border-slate-200 bg-slate-50/50 shadow-sm hover:shadow-md transition-shadow"
                                >
                                  <CardContent className="p-4">
                                    <div className="space-y-2">
                                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                                        {qa.question?.replace(/_/g, " ")}
                                      </p>
                                      <p className="text-sm font-semibold text-slate-900">
                                        {Array.isArray(qa.answer)
                                          ? qa.answer.join(", ")
                                          : qa.answer || "Not answered"}
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))
                            ) : (
                              <p className="text-xs text-slate-500 italic">No questions in this section</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Fallback to old structure if questions_and_answers is not available */
                    assessment.raw_responses_json?.data?.questions_and_ans &&
                    assessment.raw_responses_json.data.questions_and_ans.length > 0 ? (
                      <div className="space-y-4">
                        {assessment.raw_responses_json.data.questions_and_ans.map(
                          (qa: any, qaIdx: number) => (
                            <Card
                              key={qaIdx}
                              className="border border-slate-200 bg-slate-50/50 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <CardContent className="p-4">
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                                    {qa.question?.replace(/_/g, " ")}
                                  </p>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {Array.isArray(qa.ans)
                                      ? qa.ans.join(", ")
                                      : qa.ans || "Not answered"}
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
                    )
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
  );
}
