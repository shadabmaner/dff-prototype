"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationTemplateClient } from "@/lib/api/admin/notification-template-client";
import {
  NotificationTemplateListParams,
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplatePreviewDto,
  BulkUpdateDto,
  CloneTemplateDto,
} from "@/types/notification-template";
import { toast } from "sonner";

export const NOTIFICATION_TEMPLATE_KEYS = {
  all: ["notification-templates"] as const,
  lists: () => [...NOTIFICATION_TEMPLATE_KEYS.all, "list"] as const,
  list: (params: NotificationTemplateListParams) =>
    [...NOTIFICATION_TEMPLATE_KEYS.lists(), params] as const,
  details: () => [...NOTIFICATION_TEMPLATE_KEYS.all, "detail"] as const,
  detail: (id: string) => [...NOTIFICATION_TEMPLATE_KEYS.details(), id] as const,
};

export function useNotificationTemplates(params: NotificationTemplateListParams) {
  return useQuery({
    queryKey: NOTIFICATION_TEMPLATE_KEYS.list(params),
    queryFn: () => notificationTemplateClient.getTemplates(params),
  });
}

export function useNotificationTemplate(id: string) {
  return useQuery({
    queryKey: NOTIFICATION_TEMPLATE_KEYS.detail(id),
    queryFn: () => notificationTemplateClient.getTemplateById(id),
    enabled: !!id,
  });
}

export function useCreateNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTemplateDto) =>
      notificationTemplateClient.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_TEMPLATE_KEYS.lists() });
      toast.success("Template created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create template");
    },
  });
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateDto }) =>
      notificationTemplateClient.updateTemplate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_TEMPLATE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_TEMPLATE_KEYS.detail(id) });
      toast.success("Template updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update template");
    },
  });
}

export function useBulkUpdateNotificationTemplates() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkUpdateDto) =>
      notificationTemplateClient.bulkUpdate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_TEMPLATE_KEYS.lists() });
      toast.success("Templates updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to bulk update templates");
    },
  });
}

export function useCloneNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CloneTemplateDto }) =>
      notificationTemplateClient.cloneTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_TEMPLATE_KEYS.lists() });
      toast.success("Template cloned successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to clone template");
    },
  });
}

export function usePreviewNotificationTemplate() {
  return useMutation({
    mutationFn: (data: TemplatePreviewDto) =>
      notificationTemplateClient.previewTemplate(data),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to preview template");
    },
  });
}

export function useDeleteNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationTemplateClient.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_TEMPLATE_KEYS.lists() });
      toast.success("Template deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete template");
    },
  });
}

export function useNotificationTemplateByCode(code: string) {
  return useQuery({
    queryKey: [...NOTIFICATION_TEMPLATE_KEYS.all, "by-code", code],
    queryFn: () => notificationTemplateClient.getTemplateByCode(code),
    enabled: !!code,
  });
}

export function useNotificationTemplatesDropdown() {
  return useQuery({
    queryKey: [...NOTIFICATION_TEMPLATE_KEYS.all, "dropdown"],
    queryFn: async () => {
      const response = await notificationTemplateClient.getTemplates({
        limit: 1000,
        isActive: true,
      });
      return response.data.map((template) => ({
        id: template.id,
        label: template.name || template.code,
        code: template.code,
        channel: template.channel,
        locale: template.locale,
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
