"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Calendar, CheckCircle2, Send } from "lucide-react";

interface DietPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dietTemplates: any[];
  selectedTemplateId: string | null;
  isLoadingTemplates: boolean;
  onTemplateSelect: (templateId: string) => void;
  onAssignTemplate: () => void;
}

export function DietPlanModal({
  open,
  onOpenChange,
  dietTemplates,
  selectedTemplateId,
  isLoadingTemplates,
  onTemplateSelect,
  onAssignTemplate,
}: DietPlanModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Diet Plan Template</DialogTitle>
          <DialogDescription>
            Choose a diet plan template to assign to the patient
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto max-h-[50vh]">
          {isLoadingTemplates ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <span className="ml-3 text-slate-600">
                Loading templates...
              </span>
            </div>
          ) : dietTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No diet templates available</p>
              <p className="text-sm text-slate-500 mt-1">
                Please create templates first
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {dietTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => onTemplateSelect(template.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedTemplateId === template.id
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 hover:border-slate-300"
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-slate-900">
                          {template.title}
                        </h3>
                        {selectedTemplateId === template.id && (
                          <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-sm text-slate-600 mb-2">
                          {template.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {template.total_days && (
                          <Badge
                            variant="outline"
                            className="border-slate-300 text-slate-600"
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            {template.total_days} days
                          </Badge>
                        )}
                        {(template.target_calories_min ||
                          template.target_calories_max) && (
                          <Badge
                            variant="outline"
                            className="border-slate-300 text-slate-600"
                          >
                            {template.target_calories_min &&
                              template.target_calories_max
                              ? `${template.target_calories_min}-${template.target_calories_max} kcal/day`
                              : template.target_calories_min
                                ? `${template.target_calories_min}+ kcal/day`
                                : `Up to ${template.target_calories_max} kcal/day`}
                          </Badge>
                        )}
                        {template.is_active && (
                          <Badge
                            variant="outline"
                            className="border-emerald-300 text-emerald-600 bg-emerald-50"
                          >
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-600">
              The diet plan will be assigned to the patient and they will
              receive notifications.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            onClick={onAssignTemplate}
            disabled={!selectedTemplateId || isLoadingTemplates}
            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50"
          >
            <Send className="h-4 w-4 mr-2" />
            Assign Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
