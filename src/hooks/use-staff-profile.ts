import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { staffProfileClient, UpdateStaffProfileDto } from "@/lib/api/staff-profile-client"

export function useStaffProfile() {
  return useQuery({
    queryKey: ["staff-profile", "me"],
    queryFn: () => staffProfileClient.getProfile(),
  })
}

export function useUpdateStaffProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateStaffProfileDto) => staffProfileClient.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-profile", "me"] })
      toast.success("Profile updated successfully")
    },
    onError: (error: any) => {
      toast.error("Failed to update profile", {
        description: error?.response?.data?.message || error.message,
      })
    },
  })
}

export function useUploadProfilePhoto() {
  return useMutation({
    mutationFn: (file: File) => staffProfileClient.uploadProfilePhoto(file),
    onError: (error: any) => {
      toast.error("Failed to upload photo", {
        description: error.message,
      })
    },
  })
}
