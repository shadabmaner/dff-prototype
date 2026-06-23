import { apiClient } from "../api-client"

export interface StaffProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  specialization: string
  qualification: string
  experience_years: number
  bio: string
  profile_photo_url: string | null
  languages: string[]
  address: string
  city: string
  state: string
  country: string
  pincode: string
}

export interface UpdateStaffProfileDto {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  specialization?: string
  qualification?: string
  experience_years?: number
  bio?: string
  profile_photo_url?: string | null
  languages?: string[]
  address?: string
  city?: string
  state?: string
  country?: string
  pincode?: string
}

export const staffProfileClient = {
  async getProfile(): Promise<StaffProfile> {
    const { data } = await apiClient.get<{ data: StaffProfile }>('/staff/me')
    return data.data || (data as any)
  },

  async updateProfile(dto: UpdateStaffProfileDto): Promise<StaffProfile> {
    const { data } = await apiClient.patch<{ data: StaffProfile }>('/staff/me', dto)
    return data.data || (data as any)
  },

  async uploadProfilePhoto(file: File): Promise<string> {
    const sanitize = (name: string) => name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/-+/g, "-").replace(/(^-|-$)/g, "")
    const safeName = sanitize(file.name)
    const timestamp = Date.now()
    const key = `profiles/${timestamp}-${safeName}`

    const { data } = await apiClient.post<{ success: boolean; data: { presignedUrl: string; fileUrl: string }; message: string }>("/storage/presigned-url", {
      key,
      expiresIn: 3600,
    })

    if (!data?.success || !data?.data?.presignedUrl || !data?.data?.fileUrl) {
      throw new Error(data?.message ?? "Unable to generate upload URL")
    }

    const uploadResponse = await fetch(data.data.presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    })

    if (!uploadResponse.ok) {
      throw new Error("Upload failed. Please try again.")
    }

    return data.data.fileUrl
  }
}
