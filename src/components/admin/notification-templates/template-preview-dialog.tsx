"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  NotificationTemplate,
  TemplateVariable,
  TemplatePreviewResponse,
} from "@/types/notification-template";
import { usePreviewNotificationTemplate } from "@/hooks/use-notification-templates";
import {
  Eye,
  RefreshCcw,
  Smartphone,
  Mail,
  Zap,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface TemplatePreviewDialogProps {
  template: NotificationTemplate;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplatePreviewDialog({
  template,
  isOpen,
  onOpenChange,
}: TemplatePreviewDialogProps) {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const { mutate: preview, data: previewData, isPending } = usePreviewNotificationTemplate();

  // Extract variables from templates on mount
  useEffect(() => {
    const combinedTemplates = `${template.titleTemplate} ${template.bodyTemplate}`;
    const found = combinedTemplates.match(/{{([^}]+)}}/g);
    if (found) {
      const initialVars: Record<string, string> = {};
      found.forEach((v) => {
        const varName = v.replace(/{{|}}/g, "");
        if (!initialVars[varName]) {
          initialVars[varName] = getMockValue(varName);
        }
      });
      setVariables(initialVars);
    }
  }, [template]);

  const handlePreview = () => {
    preview({
      code: template.code,
      channel: template.channel,
      variables,
    });
  };

  const getMockValue = (varName: string): string => {
    const mocks: Record<string, string> = {
      [TemplateVariable.PATIENT_NAME]: "John Doe",
      [TemplateVariable.DOCTOR_NAME]: "Dr. Smith",
      [TemplateVariable.APPOINTMENT_DATE]: "March 29, 2026",
      [TemplateVariable.APPOINTMENT_TIME]: "10:30 AM",
      [TemplateVariable.APP_NAME]: "Medikiz Nexus",
      [TemplateVariable.OTP]: "123456",
    };
    return mocks[varName as TemplateVariable] || `[${varName}]`;
  };

  const ChannelIcon = () => {
    switch (template.channel) {
      case "fcm":
        return <Smartphone className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <Zap className="h-4 w-4" />;
      case "whatsapp":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Smartphone className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 uppercase bg-primary/5 border-primary/20">
              <ChannelIcon />
              {template.channel}
            </Badge>
            <DialogTitle className="text-xl">Preview: {template.code}</DialogTitle>
          </div>
          <DialogDescription>
            Test how your template renders with dynamic values
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 py-4 overflow-hidden">
          {/* Mock Data Form */}
          <div className="md:col-span-2 space-y-4 px-1">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <RefreshCcw className="h-3.5 w-3.5 text-primary" />
              Mock Variables
            </h4>
            <ScrollArea className="h-[300px] pr-4 border rounded-lg p-3 bg-slate-900/40">
              <div className="space-y-4">
                {Object.keys(variables).length > 0 ? (
                  Object.keys(variables).map((key) => (
                    <div key={key} className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {key}
                      </label>
                      <Input
                        value={variables[key]}
                        onChange={(e) =>
                          setVariables((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center py-4">
                    No variables detected in template.
                  </p>
                )}
              </div>
            </ScrollArea>
            <Button 
                className="w-full" 
                onClick={handlePreview} 
                disabled={isPending}
            >
              {isPending ? "Rendering..." : "Refresh Preview"}
            </Button>
          </div>

          {/* Visual Preview */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-primary" />
              Rendered Output
            </h4>
            
            <div className="relative rounded-2xl border bg-slate-950 p-6 aspect-[16/10] flex flex-col items-center justify-center overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-blue-600/5 opacity-50" />
              
              {isPending ? (
                <div className="w-full max-w-sm space-y-4 relative z-10">
                    <Skeleton className="h-4 w-3/4 bg-white/5" />
                    <Skeleton className="h-24 w-full bg-white/5" />
                </div>
              ) : previewData ? (
                <div className="w-full relative z-10 animate-in fade-in slide-in-from-bottom-2">
                  {/* Smartphone/Notification style for Push/SMS */}
                  {(template.channel === 'fcm' || template.channel === 'sms') && (
                    <div className="mx-auto max-w-[280px] rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 shadow-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-5 w-5 rounded-md bg-primary flex items-center justify-center">
                          <Zap className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-white/60 truncate uppercase tracking-tighter">
                          {template.name}
                        </span>
                        <span className="text-[10px] text-white/40 ml-auto">Now</span>
                      </div>
                      <h5 className="font-bold text-sm text-white mb-1 leading-tight">
                        {previewData.renderedTitle}
                      </h5>
                      <p className="text-xs text-white/80 leading-relaxed font-medium">
                        {previewData.renderedBody}
                      </p>
                    </div>
                  )}

                  {/* Email style */}
                  {template.channel === 'email' && (
                    <div className="mx-auto w-full max-w-md rounded-xl bg-white overflow-hidden shadow-lg">
                      <div className="bg-slate-100 p-3 border-b">
                         <p className="text-[10px] text-slate-500 font-bold uppercase overflow-hidden truncate">
                             Subject: {previewData.renderedTitle}
                         </p>
                      </div>
                      <div className="p-6">
                        <div className="h-8 w-full bg-primary/10 rounded-lg mb-4 flex items-center px-3">
                             <div className="h-3 w-24 bg-primary/20 rounded" />
                        </div>
                        <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                          {previewData.renderedBody}
                        </p>
                        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center">
                             <div className="h-2 w-32 bg-slate-200 rounded" />
                             <div className="h-6 w-20 bg-primary/80 rounded shadow-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp style */}
                  {(template.channel === 'whatsapp' || template.channel === 'in_app') && (
                     <div className="mx-auto max-w-[300px] rounded-3xl bg-[#e5ddd5] p-3 shadow-xl border-4 border-slate-900 overflow-hidden">
                        <div className="bg-[#075e54] -mx-4 -mt-4 px-4 py-2 flex items-center gap-2 mb-3">
                             <div className="h-6 w-6 rounded-full bg-white/20" />
                             <span className="text-[11px] font-bold text-white">Medikiz Care</span>
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-sm max-w-[90%] relative">
                            <h6 className="font-bold text-xs text-slate-900 mb-1 leading-tight">
                                {previewData.renderedTitle}
                            </h6>
                            <p className="text-[11px] text-slate-700 leading-relaxed">
                                {previewData.renderedBody}
                            </p>
                            <span className="block text-[8px] text-slate-400 text-right mt-1">12:35 PM</span>
                            {/* tail decor */}
                            <div className="absolute top-0 -left-1.5 w-0 h-0 border-l-[8px] border-l-transparent border-t-[10px] border-t-white" />
                        </div>
                     </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-muted-foreground opacity-30">
                  <Smartphone className="h-12 w-12" />
                  <p className="text-sm">Click "Refresh Preview" to see output</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
