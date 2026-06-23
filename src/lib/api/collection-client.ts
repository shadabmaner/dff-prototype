import { apiClient } from "@/lib/api-client"
import type {
  ApiResponse,
  Collection,
  CollectionWithItems,
  CollectionItem,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  CreateCollectionItemRequest,
  UpdateCollectionItemRequest,
  BulkCreateItemsRequest,
  ReorderRequest,
  CollectionListParams,
  CollectionItemListParams,
  PatientCollectionProgress,
  CollectionPatientProgress,
  PatientCollectionJourney
} from "@/types/collection-api"

export async function getCollections(params: CollectionListParams = {}): Promise<ApiResponse<Collection[]>> {
  const { data } = await apiClient.get<ApiResponse<Collection[]>>("/collections", { params })
  return data
}

export async function getCollectionById(collectionId: string): Promise<ApiResponse<CollectionWithItems>> {
  const { data } = await apiClient.get<ApiResponse<CollectionWithItems>>(`/collections/${collectionId}`)
  return data
}

export async function createCollection(payload: CreateCollectionRequest): Promise<ApiResponse<Collection>> {
  const { data } = await apiClient.post<ApiResponse<Collection>>("/collections", payload)
  return data
}

export async function updateCollection(
  collectionId: string,
  payload: UpdateCollectionRequest
): Promise<ApiResponse<Collection>> {
  const { data } = await apiClient.put<ApiResponse<Collection>>(`/collections/${collectionId}`, payload)
  return data
}

export async function deleteCollection(collectionId: string): Promise<ApiResponse<Collection>> {
  const { data } = await apiClient.delete<ApiResponse<Collection>>(`/collections/${collectionId}`)
  return data
}

export async function reorderCollections(payload: ReorderRequest): Promise<ApiResponse<Collection[]>> {
  const { data } = await apiClient.patch<ApiResponse<Collection[]>>("/collections/reorder", payload)
  return data
}

export async function getCollectionItems(
  collectionId: string,
  params: CollectionItemListParams = {}
): Promise<ApiResponse<CollectionItem[]>> {
  const { data } = await apiClient.get<ApiResponse<CollectionItem[]>>(
    `/collections/${collectionId}/items`,
    { params }
  )
  return data
}

export async function getCollectionItemById(itemId: string): Promise<ApiResponse<CollectionItem>> {
  const { data } = await apiClient.get<ApiResponse<CollectionItem>>(`/collection-items/${itemId}`)
  return data
}

export async function createCollectionItem(
  collectionId: string,
  payload: CreateCollectionItemRequest
): Promise<ApiResponse<CollectionItem>> {
  const { data } = await apiClient.post<ApiResponse<CollectionItem>>(
    `/collections/${collectionId}/items`,
    payload
  )
  return data
}

export async function bulkCreateCollectionItems(
  collectionId: string,
  payload: BulkCreateItemsRequest
): Promise<ApiResponse<CollectionItem[]>> {
  const { data } = await apiClient.post<ApiResponse<CollectionItem[]>>(
    `/collections/${collectionId}/items/bulk`,
    payload
  )
  return data
}

export async function updateCollectionItem(
  itemId: string,
  payload: UpdateCollectionItemRequest | FormData
): Promise<ApiResponse<CollectionItem>> {
  const config = payload instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
  const { data } = await apiClient.put<ApiResponse<CollectionItem>>(`/collection-items/${itemId}`, payload, config)
  return data
}

export async function deleteCollectionItem(itemId: string): Promise<ApiResponse<CollectionItem>> {
  const { data } = await apiClient.delete<ApiResponse<CollectionItem>>(`/collection-items/${itemId}`)
  return data
}

export async function reorderCollectionItems(
  collectionId: string,
  payload: ReorderRequest
): Promise<ApiResponse<CollectionItem[]>> {
  const { data } = await apiClient.patch<ApiResponse<CollectionItem[]>>(
    `/collections/${collectionId}/items/reorder`,
    payload
  )
  return data
}

export async function startPatientJourney(
  patientId: string
): Promise<ApiResponse<PatientCollectionJourney[]>> {
  const { data } = await apiClient.post<ApiResponse<PatientCollectionJourney[]>>(
    `/patients/${patientId}/collection-journey/start`
  )
  return data
}

export async function rerunUnlockEngine(patientId: string): Promise<ApiResponse<null>> {
  const { data } = await apiClient.post<ApiResponse<null>>(`/patients/${patientId}/collection-unlock`)
  return data
}

export async function manuallyUnlockItem(
  itemId: string,
  patientId: string
): Promise<ApiResponse<any>> {
  const { data } = await apiClient.patch<ApiResponse<any>>(
    `/collection-items/${itemId}/unlock/${patientId}`
  )
  return data
}

export async function manuallyUnlockCollection(
  collectionId: string,
  patientId: string
): Promise<ApiResponse<any>> {
  const { data } = await apiClient.patch<ApiResponse<any>>(
    `/collections/${collectionId}/unlock/${patientId}`
  )
  return data
}

export async function getPatientCollectionProgress(
  patientId: string
): Promise<ApiResponse<PatientCollectionProgress[]>> {
  const { data } = await apiClient.get<ApiResponse<PatientCollectionProgress[]>>(
    `/patients/${patientId}/collection-progress`
  )
  return data
}

export async function getCollectionPatientProgress(
  collectionId: string
): Promise<ApiResponse<CollectionPatientProgress[]>> {
  const { data } = await apiClient.get<ApiResponse<CollectionPatientProgress[]>>(
    `/collections/${collectionId}/patient-progress`
  )
  return data
}
