"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface AssessmentDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAssessment: any;
}

export function AssessmentDetailsDrawer({ open, onOpenChange, selectedAssessment }: AssessmentDetailsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
                <h3 className="font-semibold text-slate-900 text-lg">{selectedAssessment.speciality_name || "Assessment"}</h3>
                <Badge variant="outline" className="border-slate-300 text-slate-600">
                  {new Date(selectedAssessment.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Badge>
              </div>
            </div>

            {/* New Structure with Sections */}
            {selectedAssessment.questions_and_answers && selectedAssessment.questions_and_answers.length > 0 ? (
              <div className="space-y-6">
                {selectedAssessment.questions_and_answers.map((section: any, sectionIdx: number) => (
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
                                  {qa.question?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                </p>
                                <p className="text-sm text-slate-900 font-semibold">
                                  {Array.isArray(qa.answer) ? qa.answer.join(', ') : qa.answer || "Not answered"}
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
              /* Fallback to old structure */
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">Questions & Answers</h4>
                {selectedAssessment.raw_responses_json?.data?.questions_and_ans?.map((qa: any, idx: number) => (
                  <Card key={qa.questions_id || idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <CardContent className="p-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700 mb-2">
                            {qa.question.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </p>
                          <p className="text-sm text-slate-900 font-semibold">
                            {Array.isArray(qa.ans) ? qa.ans.join(', ') : qa.ans || "Not answered"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
