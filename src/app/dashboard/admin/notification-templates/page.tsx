"use client";

import React, { useState } from "react";
import { useNotificationTemplates } from "@/hooks/use-notification-templates";
import { TemplateList } from "@/components/admin/notification-templates/template-list";
import { NotificationTemplateListParams } from "@/types/notification-template";
import { BellRing, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function NotificationTemplatesPage() {
  const [params, setParams] = useState<NotificationTemplateListParams>({
    page: 1,
    limit: 100,
  });

  const { data, isLoading } = useNotificationTemplates(params);

  const handleParamsChange = (newParams: Partial<NotificationTemplateListParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Notification Templates</h1>
           <p className="text-muted-foreground italic">Manage global communication rules across all channels.</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="h-6 gap-1 bg-blue-500/5 text-blue-400 border-blue-500/20">
             <ShieldCheck className="h-3 w-3" />
             Admin Only
           </Badge>
           <Badge variant="outline" className="h-6 gap-1 bg-amber-500/5 text-amber-500 border-amber-500/20">
             <BellRing className="h-3 w-3" />
             Live Sync
           </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        <TemplateList
          data={data?.data || []}
          isLoading={isLoading}
          total={data?.meta?.total || 0}
          page={Number(data?.meta?.page) || params.page || 1}
          limit={data?.meta?.limit || params.limit || 10}
          onParamsChange={handleParamsChange}
        />
      </div>
    </div>
  );
}
