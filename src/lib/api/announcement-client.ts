import { apiClient } from "@/lib/api-client";
import type {
  Announcement,
  AnnouncementListParams,
  AnnouncementListResponse,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from "@/types/announcement";

const BASE_URL = "/admin/announcements";

export const announcementApi = {
  list: async (params?: AnnouncementListParams): Promise<AnnouncementListResponse> => {
    const { data } = await apiClient.get(BASE_URL, { params });
    return data;
  },

  getById: async (id: string): Promise<Announcement> => {
    const { data } = await apiClient.get(`${BASE_URL}/${id}`);
    return data;
  },

  create: async (dto: CreateAnnouncementDto): Promise<Announcement> => {
    const { data } = await apiClient.post(BASE_URL, dto);
    return data;
  },

  update: async (id: string, dto: UpdateAnnouncementDto): Promise<Announcement> => {
    const { data } = await apiClient.patch(`${BASE_URL}/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  sendNow: async (id: string): Promise<Announcement> => {
    const { data } = await apiClient.post(`${BASE_URL}/${id}/send-now`);
    return data;
  },
};
