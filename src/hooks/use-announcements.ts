import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { announcementApi } from "@/lib/api/announcement-client";
import type {
  AnnouncementListParams,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from "@/types/announcement";

const QUERY_KEY = "announcements";

export function useAnnouncements(params?: AnnouncementListParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => announcementApi.list(params),
  });
}

export function useAnnouncement(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => announcementApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateAnnouncementDto) => announcementApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Announcement created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create announcement");
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAnnouncementDto }) =>
      announcementApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Announcement updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update announcement");
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => announcementApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Announcement deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete announcement");
    },
  });
}

export function useSendAnnouncementNow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => announcementApi.sendNow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Announcement sent successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to send announcement");
    },
  });
}
