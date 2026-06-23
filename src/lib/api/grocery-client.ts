import { apiClient } from "@/lib/api-client"
import type { GroceryPhase } from "@/types/grocery"
import type { UpdatePhaseConfigsRequest } from "@/lib/api/clinical-diet-plan-client"

export async function getTemplatePhases(
  templateId: string
): Promise<GroceryPhase[]> {
  const { data } = await apiClient.get<GroceryPhase[]>(
    `/diet-templates/${templateId}/phases`
  )
  return data
}

/** @deprecated Use updatePhaseConfigs instead (new consolidated endpoint) */
export async function updatePhaseGrocery(
  templateId: string,
  phaseNumber: number,
  payload: any
): Promise<any> {
  const { data } = await apiClient.put(
    `/diet-template/${templateId}/phases/${phaseNumber}/configs`,
    {
      grocery_list_config: {
        url: payload.grocery_list_pdf_url,
        status: payload.grocery_list_status,
        is_unlocked: payload.grocery_list_status === "unlocked",
      },
    }
  )
  return data
}

/** New consolidated endpoint for updating grocery_list_config and/or diet_pdf_config on a template phase */
export async function updatePhaseConfigs(
  templateId: string,
  phaseNumber: number,
  payload: UpdatePhaseConfigsRequest
): Promise<any> {
  const { data } = await apiClient.put(
    `/diet-template/${templateId}/phases/${phaseNumber}/configs`,
    payload
  )
  return data
}

export async function uploadGroceryPdf(file: File): Promise<string> {
  const sanitize = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "")

  const safeName = sanitize(file.name)
  const timestamp = Date.now()
  const key = `grocery-lists/${timestamp}-${safeName}`

  const { data } = await apiClient.post<{
    success: boolean
    statusCode: number
    message: string
    data: { presignedUrl: string; fileUrl: string }
  }>("/storage/presigned-url", {
    key,
    expiresIn: 3600,
  })

  if (!data?.success || !data?.data?.presignedUrl || !data?.data?.fileUrl) {
    throw new Error(data?.message ?? "Unable to generate upload URL")
  }

  const uploadResponse = await fetch(data.data.presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/pdf",
    },
    body: file,
  })

  if (!uploadResponse.ok) {
    throw new Error("Upload failed. Please try again.")
  }

  return data.data.fileUrl
}
