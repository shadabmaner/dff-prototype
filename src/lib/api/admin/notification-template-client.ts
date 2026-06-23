import { apiClient } from "@/lib/api-client";
import {
  NotificationTemplate,
  NotificationTemplateListParams,
  NotificationTemplateListResponse,
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplatePreviewDto,
  TemplatePreviewResponse,
  BulkUpdateDto,
  CloneTemplateDto,
} from "@/types/notification-template";

/**
 * Notification Template Admin API Client
 */
export const notificationTemplateClient = {
  async getTemplates(params: NotificationTemplateListParams): Promise<NotificationTemplateListResponse> {
    const { data } = await apiClient.get("/admin/notification-templates", { params });
    return data;
  },

  /**
   * Get a single template by ID
   */
  async getTemplateById(id: string): Promise<NotificationTemplate> {
    const { data } = await apiClient.get(`/admin/notification-templates/${id}`);
    return data?.data;
  },

  async createTemplate(payload: CreateTemplateDto): Promise<NotificationTemplate> {
    const { data } = await apiClient.post("/admin/notification-templates", payload);
    return data?.data;
  },

  async updateTemplate(id: string, payload: UpdateTemplateDto): Promise<NotificationTemplate> {
    const { data } = await apiClient.put(`/admin/notification-templates/${id}`, payload);
    return data?.data;
  },

  /**
   * Preview a rendered template with variables
   */
  async previewTemplate(payload: TemplatePreviewDto): Promise<TemplatePreviewResponse> {
    const { data } = await apiClient.post("/admin/notification-templates/preview", payload);
    return data;
  },

  /**
   * Get templates by code
   */
  async getTemplateByCode(code: string): Promise<NotificationTemplate[]> {
    const { data } = await apiClient.get(`/admin/notification-templates/by-code/${code}`);
    return data;
  },

  /**
   * Delete a template by ID
   */
  async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`/admin/notification-templates/${id}`);
  },

  /**
   * Bulk update template status or category
   */
  async bulkUpdate(payload: BulkUpdateDto): Promise<{ updatedCount: number }> {
    const { data } = await apiClient.post("/admin/notification-templates/bulk-update", payload);
    return data;
  },

  /**
   * Clone an existing template to a new code or channel
   */
  async cloneTemplate(id: string, payload: CloneTemplateDto): Promise<NotificationTemplate> {
    const { data } = await apiClient.post(`/admin/notification-templates/${id}/clone`, payload);
    return data;
  },
};
