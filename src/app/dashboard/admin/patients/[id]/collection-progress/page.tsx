"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Play, Lock, CheckCircle2, Circle, Unlock, RefreshCw, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  usePatientCollectionProgress,
  useStartPatientJourney,
  useRerunUnlockEngine,
  useManuallyUnlockItem,
  useManuallyUnlockCollection,
} from "@/hooks/use-collections"
import type { PatientCollectionProgress, CollectionItemProgress } from "@/types/collection-api"
import Link from "next/link"

function ItemProgressRow({ 
  item, 
  patientId, 
  onUnlock 
}: { 
  item: CollectionItemProgress
  patientId: string
  onUnlock: (itemId: string) => void
}) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 rounded-lg">
      <div className="flex items-center justify-center w-8 h-8">
        {item.is_completed ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : item.is_unlocked ? (
          <Circle className="h-5 w-5 text-blue-500" />
        ) : (
          <Lock className="h-5 w-5 text-gray-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{item.title}</span>
          <Badge variant="outline" className="text-xs capitalize">
            {item.media_type}
          </Badge>
          {item.step_label && (
            <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
              {item.step_label}
            </span>
          )}
        </div>
        
        {item.is_unlocked && item.progress_percent > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <Progress value={item.progress_percent} className="h-1.5" />
            <span className="text-xs text-gray-500 min-w-[3rem]">
              {item.progress_percent}%
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        {item.is_completed ? (
          <span className="text-green-600">
            {new Date(item.completed_at!).toLocaleDateString()}
          </span>
        ) : item.is_unlocked ? (
          <span className="text-blue-600">In Progress</span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUnlock(item.collection_item_id)}
          >
            <Unlock className="h-3 w-3 mr-1" />
            Unlock
          </Button>
        )}
      </div>
    </div>
  )
}

function CollectionProgressCard({
  collection,
  patientId,
  onUnlockCollection,
  onUnlockItem,
}: {
  collection: PatientCollectionProgress
  patientId: string
  onUnlockCollection: (collectionId: string) => void
  onUnlockItem: (itemId: string) => void
}) {
  const [isOpen, setIsOpen] = React.useState(collection.is_collection_unlocked)
  const progressPercent = collection.total_items_count > 0 
    ? Math.round((collection.completed_count / collection.total_items_count) * 100)
    : 0

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg bg-white overflow-hidden">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 font-bold text-blue-600">
              {collection.sort_order}
            </div>

            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{collection.collection_name}</h3>
                {!collection.is_collection_unlocked && (
                  <Lock className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-500">
                  {collection.completed_count} / {collection.total_items_count} completed
                </span>
                <Badge variant={collection.is_collection_unlocked ? "default" : "secondary"}>
                  {collection.is_collection_unlocked ? "Unlocked" : "Locked"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-32">
                <Progress value={progressPercent} className="h-2" />
                <span className="text-xs text-gray-500 mt-1">{progressPercent}%</span>
              </div>

              {!collection.is_collection_unlocked && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onUnlockCollection(collection.collection_id)
                  }}
                >
                  <Unlock className="h-4 w-4 mr-1" />
                  Unlock
                </Button>
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t bg-gray-50 p-4">
            <div className="space-y-1">
              {collection.items.map((item) => (
                <ItemProgressRow
                  key={item.id}
                  item={item}
                  patientId={patientId}
                  onUnlock={onUnlockItem}
                />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

export default function PatientCollectionProgressPage() {
  const params = useParams()
  const patientId = params.patientId as string

  const [unlockCollectionDialogOpen, setUnlockCollectionDialogOpen] = React.useState(false)
  const [unlockItemDialogOpen, setUnlockItemDialogOpen] = React.useState(false)
  const [startJourneyDialogOpen, setStartJourneyDialogOpen] = React.useState(false)
  const [selectedCollectionId, setSelectedCollectionId] = React.useState<string | null>(null)
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null)

  const { data: progressData, isLoading } = usePatientCollectionProgress(patientId)
  const startJourneyMutation = useStartPatientJourney()
  const rerunUnlockMutation = useRerunUnlockEngine()
  const unlockCollectionMutation = useManuallyUnlockCollection()
  const unlockItemMutation = useManuallyUnlockItem()

  const progress = progressData?.data || []
  const hasJourney = progress.length > 0

  const handleStartJourney = async () => {
    await startJourneyMutation.mutateAsync(patientId)
    setStartJourneyDialogOpen(false)
  }

  const handleRerunUnlock = async () => {
    await rerunUnlockMutation.mutateAsync(patientId)
  }

  const handleUnlockCollection = (collectionId: string) => {
    setSelectedCollectionId(collectionId)
    setUnlockCollectionDialogOpen(true)
  }

  const handleConfirmUnlockCollection = async () => {
    if (selectedCollectionId) {
      await unlockCollectionMutation.mutateAsync({
        collectionId: selectedCollectionId,
        patientId,
      })
      setSelectedCollectionId(null)
    }
  }

  const handleUnlockItem = (itemId: string) => {
    setSelectedItemId(itemId)
    setUnlockItemDialogOpen(true)
  }

  const handleConfirmUnlockItem = async () => {
    if (selectedItemId) {
      await unlockItemMutation.mutateAsync({
        itemId: selectedItemId,
        patientId,
      })
      setSelectedItemId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading patient progress...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/service/patients">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Collection Progress</h1>
              <p className="text-sm text-gray-500 mt-1">
                Patient ID: {patientId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasJourney ? (
              <Button
                variant="outline"
                onClick={handleRerunUnlock}
                disabled={rerunUnlockMutation.isPending}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {rerunUnlockMutation.isPending ? "Re-running..." : "Re-run Unlock"}
              </Button>
            ) : (
              <Button onClick={() => setStartJourneyDialogOpen(true)}>
                <Play className="h-4 w-4 mr-2" />
                Start Journey
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {!hasJourney ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500 mb-4">This patient hasn't started their collection journey yet</p>
            <Button onClick={() => setStartJourneyDialogOpen(true)}>
              <Play className="h-4 w-4 mr-2" />
              Start Journey
            </Button>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-4">
            {progress.map((collection) => (
              <CollectionProgressCard
                key={collection.id}
                collection={collection}
                patientId={patientId}
                onUnlockCollection={handleUnlockCollection}
                onUnlockItem={handleUnlockItem}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={startJourneyDialogOpen}
        onOpenChange={setStartJourneyDialogOpen}
        title="Start Collection Journey"
        description="This will create journey records for all collections and unlock the first available collection. Are you sure?"
        confirmText="Start Journey"
        onConfirm={handleStartJourney}
        isLoading={startJourneyMutation.isPending}
      />

      <ConfirmDialog
        open={unlockCollectionDialogOpen}
        onOpenChange={setUnlockCollectionDialogOpen}
        title="Unlock Collection"
        description="This will manually unlock this collection for the patient, bypassing the unlock strategy. Are you sure?"
        confirmText="Unlock"
        onConfirm={handleConfirmUnlockCollection}
        isLoading={unlockCollectionMutation.isPending}
      />

      <ConfirmDialog
        open={unlockItemDialogOpen}
        onOpenChange={setUnlockItemDialogOpen}
        title="Unlock Item"
        description="This will manually unlock this item for the patient, bypassing the unlock strategy. Are you sure?"
        confirmText="Unlock"
        onConfirm={handleConfirmUnlockItem}
        isLoading={unlockItemMutation.isPending}
      />
    </div>
  )
}
