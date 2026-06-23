"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Plus, GripVertical, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CollectionItem {
  id: string
  collectionId: string
  day: number
  week: number
  title: string
  mediaType: "VIDEO" | "PDF" | "IMAGE"
  duration?: string
  manualMark: boolean
  notify: string
  autoComplete?: string
}

const mockCollectionItems: CollectionItem[] = [
  {
    id: "1",
    collectionId: "1",
    day: 2,
    week: 1,
    title: "Day 2 — Posture Awareness",
    mediaType: "VIDEO",
    duration: "8m 0s",
    manualMark: true,
    notify: "07:00",
  },
  {
    id: "2",
    collectionId: "1",
    day: 3,
    week: 1,
    title: "Day 3 — Nutrition Guide",
    mediaType: "VIDEO",
    duration: "8m 0s",
    manualMark: true,
    notify: "07:00",
  },
  {
    id: "3",
    collectionId: "1",
    day: 1,
    week: 1,
    title: "Day 1 — Diaphragmatic Breathing",
    mediaType: "VIDEO",
    duration: "8m 0s",
    manualMark: true,
    notify: "07:00",
  },
  {
    id: "4",
    collectionId: "1",
    day: 4,
    week: 1,
    title: "Day 4 — Core Activation",
    mediaType: "PDF",
    autoComplete: "5s",
    manualMark: false,
    notify: "07:00",
  },
  {
    id: "5",
    collectionId: "1",
    day: 5,
    week: 1,
    title: "Day 5 — Yoga Flow",
    mediaType: "VIDEO",
    duration: "8m 0s",
    manualMark: true,
    notify: "07:00",
  },
  {
    id: "6",
    collectionId: "1",
    day: 6,
    week: 1,
    title: "Day 6 — Healthy Plate Infographic",
    mediaType: "IMAGE",
    autoComplete: "3s",
    manualMark: false,
    notify: "07:00",
  },
]

const MEDIA_VARIANTS: Record<CollectionItem["mediaType"], string> = {
  VIDEO: "bg-blue-100 text-blue-700 border-0",
  PDF: "bg-pink-100 text-pink-700 border-0",
  IMAGE: "bg-emerald-100 text-emerald-700 border-0",
}

export default function CollectionItemsPage() {
  const params = useParams<{ id: string }>()
  const collectionId = params.id
  const [selectedItemType, setSelectedItemType] = useState("all")
  const [collectionItems] = useState(mockCollectionItems)

  const currentItems = useMemo(() => {
    const filtered = collectionItems.filter((item) => item.collectionId === collectionId)
    if (selectedItemType === "all") return filtered
    return filtered.filter((item) => item.mediaType.toLowerCase() === selectedItemType)
  }, [collectionItems, collectionId, selectedItemType])

  const getMediaBadge = (type: CollectionItem["mediaType"]) => (
    <Badge className={MEDIA_VARIANTS[type]}>{type}</Badge>
  )

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      <div className="space-y-4">
        <Link href={`/dashboard/admin/exercise-content/${collectionId}`}>
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Collections
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Collection Items</h1>
          <p className="text-sm text-slate-600 mt-2">Manage media items inside a collection. Drag to reorder.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select value={collectionId} onValueChange={() => {}}>
          <SelectTrigger className="w-[280px] bg-white">
            <SelectValue placeholder="Month 1 — 21-Day Collection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Month 1 — 21-Day Collection</SelectItem>
            <SelectItem value="2">Month 2 — 21-Day Collection</SelectItem>
            <SelectItem value="3">Month 3 — 21-Day Collection</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedItemType} onValueChange={setSelectedItemType}>
          <SelectTrigger className="w-[200px] bg-white">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="image">Image</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2 ml-auto">
          <Button variant="outline">Bulk Add</Button>
          <Button className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentItems.map((item) => (
          <Card key={item.id} className="border border-slate-200 bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <GripVertical className="h-5 w-5 text-slate-400 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-slate-500">#{item.day}</span>
                    <span className="text-xs text-slate-400">Week {item.week}</span>
                    {getMediaBadge(item.mediaType)}
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-2">{item.title}</h3>
                  <div className="space-y-1 text-xs text-slate-600">
                    {item.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{item.duration}</span>
                        <span className="text-slate-400">• Manual mark</span>
                        <span className="text-slate-400">• Notify: {item.notify}</span>
                      </div>
                    )}
                    {item.autoComplete && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">• Auto-complete: {item.autoComplete}</span>
                        <span className="text-slate-400">• Notify: {item.notify}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs text-rose-600">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
