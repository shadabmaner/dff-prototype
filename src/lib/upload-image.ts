import { apiClient } from "@/lib/api-client"

const sanitizeFileName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "")

export async function uploadImage(
  file: File,
  options?: { prefix?: string; expiresIn?: number }
): Promise<string> {
  const fileExtension = file.name.split(".").pop() ?? "bin"
  const safeName = sanitizeFileName(file.name)
  const timestamp = Date.now()
  const key = `${options?.prefix ?? "thumbnails"}/${timestamp}-${safeName}`

  const { data } = await apiClient.post<{
    success: boolean
    statusCode: number
    message: string
    data: { presignedUrl: string; fileUrl: string }
  }>("/storage/presigned-url", {
    key,
    expiresIn: options?.expiresIn ?? 3600,
  })

  if (!data?.success || !data?.data?.presignedUrl || !data?.data?.fileUrl) {
    throw new Error(data?.message ?? "Unable to generate upload URL")
  }

  const uploadResponse = await fetch(data.data.presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  })

  if (!uploadResponse.ok) {
    throw new Error("Upload failed. Please try again.")
  }

  return data.data.fileUrl
}
