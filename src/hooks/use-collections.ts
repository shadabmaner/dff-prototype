"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  reorderCollections,
  getCollectionItems,
  getCollectionItemById,
  createCollectionItem,
  bulkCreateCollectionItems,
  updateCollectionItem,
  deleteCollectionItem,
  reorderCollectionItems,
  startPatientJourney,
  rerunUnlockEngine,
  manuallyUnlockItem,
  manuallyUnlockCollection,
  getPatientCollectionProgress,
  getCollectionPatientProgress
} from "@/lib/api/collection-client"
import type {
  CollectionListParams,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  CreateCollectionItemRequest,
  UpdateCollectionItemRequest,
  BulkCreateItemsRequest,
  ReorderRequest,
  CollectionItemListParams
} from "@/types/collection-api"
import { toast } from "sonner"

export function useCollections(params: CollectionListParams = {}) {
  return useQuery({
    queryKey: ["collections", params],
    queryFn: () => getCollections(params),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCollectionById(collectionId: string | null) {
  return useQuery({
    queryKey: ["collection", collectionId],
    queryFn: async () => {
      if (!collectionId) throw new Error("Collection ID is required")
      return await getCollectionById(collectionId)
    },
    enabled: Boolean(collectionId),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCollectionRequest) => createCollection(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["collections"] })
      toast.success(data.message || "Collection created successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create collection")
    },
  })
}

export function useUpdateCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ collectionId, payload }: { collectionId: string; payload: UpdateCollectionRequest }) =>
      updateCollection(collectionId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["collections"] })
      queryClient.invalidateQueries({ queryKey: ["collection", variables.collectionId] })
      toast.success(data.message || "Collection updated successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update collection")
    },
  })
}

export function useDeleteCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (collectionId: string) => deleteCollection(collectionId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["collections"] })
      toast.success(data.message || "Collection deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete collection")
    },
  })
}

export function useReorderCollections() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ReorderRequest) => reorderCollections(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["collections"] })
      toast.success(data.message || "Collections reordered successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reorder collections")
    },
  })
}

export function useCollectionItems(collectionId: string | null, params: CollectionItemListParams = {}) {
  return useQuery({
    queryKey: ["collection-items", collectionId, params],
    queryFn: async () => {
      if (!collectionId) throw new Error("Collection ID is required")
      return await getCollectionItems(collectionId, params)
    },
    enabled: Boolean(collectionId),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCollectionItemById(itemId: string | null) {
  return useQuery({
    queryKey: ["collection-item", itemId],
    queryFn: async () => {
      if (!itemId) throw new Error("Item ID is required")
      return await getCollectionItemById(itemId)
    },
    enabled: Boolean(itemId),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateCollectionItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ collectionId, payload }: { collectionId: string; payload: CreateCollectionItemRequest }) =>
      createCollectionItem(collectionId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["collection-items", variables.collectionId] })
      queryClient.invalidateQueries({ queryKey: ["collection", variables.collectionId] })
      queryClient.invalidateQueries({ queryKey: ["collections"] })
      toast.success(data.message || "Item added successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add item")
    },
  })
}

export function useBulkCreateCollectionItems() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ collectionId, payload }: { collectionId: string; payload: BulkCreateItemsRequest }) =>
      bulkCreateCollectionItems(collectionId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["collection-items", variables.collectionId] })
      queryClient.invalidateQueries({ queryKey: ["collection", variables.collectionId] })
      queryClient.invalidateQueries({ queryKey: ["collections"] })
      toast.success(data.message || "Items added successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add items")
    },
  })
}

export function useUpdateCollectionItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: UpdateCollectionItemRequest | FormData }) =>
      updateCollectionItem(itemId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["collection-items"] })
      queryClient.invalidateQueries({ queryKey: ["collection-item"] })
      queryClient.invalidateQueries({ queryKey: ["collection"] })
      queryClient.invalidateQueries({ queryKey: ["collections"] })
      toast.success(data.message || "Item updated successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update item")
    },
  })
}

export function useDeleteCollectionItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) => deleteCollectionItem(itemId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["collection-items"] })
      queryClient.invalidateQueries({ queryKey: ["collection"] })
      queryClient.invalidateQueries({ queryKey: ["collections"] })
      toast.success(data.message || "Item deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete item")
    },
  })
}

export function useReorderCollectionItems() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ collectionId, payload }: { collectionId: string; payload: ReorderRequest }) =>
      reorderCollectionItems(collectionId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["collection-items", variables.collectionId] })
      queryClient.invalidateQueries({ queryKey: ["collection", variables.collectionId] })
      toast.success(data.message || "Items reordered successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reorder items")
    },
  })
}

export function useStartPatientJourney() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (patientId: string) => startPatientJourney(patientId),
    onSuccess: (data, patientId) => {
      queryClient.invalidateQueries({ queryKey: ["patient-collection-progress", patientId] })
      toast.success(data.message || "Journey started successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to start journey")
    },
  })
}

export function useRerunUnlockEngine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (patientId: string) => rerunUnlockEngine(patientId),
    onSuccess: (data, patientId) => {
      queryClient.invalidateQueries({ queryKey: ["patient-collection-progress", patientId] })
      toast.success(data.message || "Unlock engine re-executed successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to re-run unlock engine")
    },
  })
}

export function useManuallyUnlockItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, patientId }: { itemId: string; patientId: string }) =>
      manuallyUnlockItem(itemId, patientId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["patient-collection-progress", variables.patientId] })
      toast.success(data.message || "Item unlocked successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to unlock item")
    },
  })
}

export function useManuallyUnlockCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ collectionId, patientId }: { collectionId: string; patientId: string }) =>
      manuallyUnlockCollection(collectionId, patientId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["patient-collection-progress", variables.patientId] })
      toast.success(data.message || "Collection unlocked successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to unlock collection")
    },
  })
}

export function usePatientCollectionProgress(patientId: string | null) {
  return useQuery({
    queryKey: ["patient-collection-progress", patientId],
    queryFn: async () => {
      if (!patientId) throw new Error("Patient ID is required")
      return await getPatientCollectionProgress(patientId)
    },
    enabled: Boolean(patientId),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCollectionPatientProgress(collectionId: string | null) {
  return useQuery({
    queryKey: ["collection-patient-progress", collectionId],
    queryFn: async () => {
      if (!collectionId) throw new Error("Collection ID is required")
      return await getCollectionPatientProgress(collectionId)
    },
    enabled: Boolean(collectionId),
    staleTime: 1000 * 60 * 5,
  })
}
