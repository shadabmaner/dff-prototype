"use client";

import React, { useState } from "react";
import { useNotificationTemplate } from "@/hooks/use-notification-templates";
import { TemplateForm } from "@/components/admin/notification-templates/template-form";
import { TemplatePreviewDialog } from "@/components/admin/notification-templates/template-preview-dialog";
import { useSearchParams, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EditNotificationTemplatePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isPreviewAutoOpen = searchParams.get("preview") === "true";
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(isPreviewAutoOpen);

  const { data: template, isLoading } = useNotificationTemplate(id);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-2">
        <h2 className="text-xl font-bold">Template not found</h2>
        <p className="text-muted-foreground">The template you are looking for does not exist or has been deleted.</p>
      </div>
    );
  }

  return (
    <div className="relative py-6 space-y-6">
      {/* Background decoration for premium white feel */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] pointer-events-none opacity-60" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 bg-indigo-50/50 rounded-full blur-[100px] pointer-events-none opacity-40" />
      
      <TemplateForm initialData={template as any} />
      
      {template && (
        <TemplatePreviewDialog
          template={template}
          isOpen={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
        />
      )}
    </div>
  );
}
