import { apiClient } from "@/lib/api-client"
import {
  SDUIConfig,
  SDUIConfigListResponse,
  ListSDUIConfigsDto,
  CreateSDUIConfigDto,
  UpdateSDUIConfigDto,
} from "@/types/sdui-config"

export async function listSDUIConfigs(
  params?: ListSDUIConfigsDto
): Promise<SDUIConfigListResponse> {
  const { data } = await apiClient.get<SDUIConfigListResponse>("/sdui-configs", {
    params,
  })
  return data
}

export async function getSDUIConfig(idOrName: string): Promise<{ data: SDUIConfig; message: string }> {
  const { data } = await apiClient.get<{ data: SDUIConfig; message: string }>(
    `/sdui-configs/${idOrName}`
  )
  return data
}

export async function createSDUIConfig(
  payload: CreateSDUIConfigDto
): Promise<{ data: SDUIConfig; message: string }> {
  const { data } = await apiClient.post<{ data: SDUIConfig; message: string }>(
    "/sdui-configs",
    payload
  )
  return data
}

export async function updateSDUIConfig(
  id: string,
  payload: UpdateSDUIConfigDto
): Promise<{ data: SDUIConfig; message: string }> {
  const { data } = await apiClient.put<{ data: SDUIConfig; message: string }>(
    `/sdui-configs/${id}`,
    payload
  )
  return data
}

export async function deleteSDUIConfig(id: string): Promise<{ message: string }> {
  const { data } = await apiClient.delete<{ message: string }>(
    `/sdui-configs/${id}`
  )
  return data
}

// Mobile/Direct Endpoints
export async function getDynamicUI(filename: string): Promise<{ template: any }> {
  const { data } = await apiClient.get<{ template: any }>(
    `/patients/dynamic-ui/${filename}`
  )
  return data
}

export async function updateDynamicUI(
  filename: string,
  payload: { data: any }
): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(
    `/patients/dynamic-ui/${filename}`,
    payload
  )
  return data
}
