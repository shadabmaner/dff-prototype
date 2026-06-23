"use client"

import { useState, use } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, GripVertical, Edit, Trash2, Eye, EyeOff, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DraggableList } from "@/components/admin/draggable-list"
import { FileUpload } from "@/components/admin/file-upload"
import type { ExerciseVideo } from "@/types/admin"

const MAX_VIDEOS_PER_MONTH = 21

type NewVideoState = Partial<ExerciseVideo> & {
  videoFile?: File | null
  thumbnailFile?: File | null
}

interface ExerciseDetailPageProps {
  params: Promise<{ id: string }>
}

const mockExercise = {
  id: "1",
  name: "Weight Loss Program",
  description: "Comprehensive weight loss exercise program",
  coverImage: "/placeholder-exercise.jpg",
  status: "active" as const,
  months: [
    {
      id: "m1",
      month: 1,
      videos: [
        {
          id: "v1",
          monthId: "m1",
          title: "Jumping Jacks",
          videoUrl: "/video1.mp4",
          thumbnailUrl: "/thumb1.jpg",
          description: "Basic cardio warm-up exercise",
          executionSteps: ["Stand straight", "Jump and spread legs", "Raise arms overhead", "Return to start"],
          duration: 30,
          caloriesBurn: 50,
          status: "active" as const,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "v2",
          monthId: "m1",
          title: "Push Ups",
          videoUrl: "/video2.mp4",
          thumbnailUrl: "/thumb2.jpg",
          description: "Basic chest workout",
          executionSteps: ["Start in plank", "Lower body", "Push back up"],
          duration: 45,
          caloriesBurn: 60,
          status: "active" as const,
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "v3",
          monthId: "m1",
          title: "Squats",
          videoUrl: "/video3.mp4",
          thumbnailUrl: "/thumb3.jpg",
          description: "Lower body strength",
          executionSteps: ["Stand feet apart", "Lower hips", "Push back up"],
          duration: 40,
          status: "active" as const,
          order: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as ExerciseVideo[],
    },
    {
      id: "m2",
      month: 2,
      videos: Array(18).fill(null).map((_, i) => ({
        id: `v2-${i}`,
        monthId: "m2",
        title: `Month 2 Video ${i + 1}`,
        videoUrl: `/video-m2-${i}.mp4`,
        thumbnailUrl: `/thumb-m2-${i}.jpg`,
        description: `Exercise ${i + 1} description`,
        executionSteps: ["Step 1", "Step 2", "Step 3"],
        duration: 30 + i * 5,
        status: "active" as const,
        order: i + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      })) as ExerciseVideo[],
    },
    {
      id: "m3",
      month: 3,
      videos: Array(21).fill(null).map((_, i) => ({
        id: `v3-${i}`,
        monthId: "m3",
        title: `Month 3 Video ${i + 1}`,
        videoUrl: `/video-m3-${i}.mp4`,
        thumbnailUrl: `/thumb-m3-${i}.jpg`,
        description: `Exercise ${i + 1} description`,
        executionSteps: ["Step 1", "Step 2"],
        duration: 35 + i * 3,
        status: "active" as const,
        order: i + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      })) as ExerciseVideo[],
    },
  ],
}

export default function ExerciseDetailPage({ params }: ExerciseDetailPageProps) {
  const { id } = use(params)
  const [exercise, setExercise] = useState(mockExercise)
  const [selectedMonth, setSelectedMonth] = useState(1)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [newVideo, setNewVideo] = useState<NewVideoState>({
    title: "",
    description: "",
    executionSteps: ["", "", ""],
    duration: 0,
    status: "active",
    videoFile: null,
    thumbnailFile: null,
  })

  const currentMonthData = exercise.months.find((m) => m.month === selectedMonth)
  const currentVideos = currentMonthData?.videos || []
  const canAddMore = currentVideos.length < MAX_VIDEOS_PER_MONTH

  const totalVideos = exercise.months.reduce((acc, month) => acc + month.videos.length, 0)
  const maxTotalVideos = exercise.months.length * MAX_VIDEOS_PER_MONTH

  const handleReorderVideos = (reordered: ExerciseVideo[]) => {
    const updatedMonths = exercise.months.map((month) => {
      if (month.month === selectedMonth) {
        return {
          ...month,
          videos: reordered.map((video, index) => ({ ...video, order: index + 1 })),
        }
      }
      return month
    })
    setExercise({ ...exercise, months: updatedMonths })
  }

  const handleToggleVideoStatus = (videoId: string) => {
    const updatedMonths = exercise.months.map((month) => {
      if (month.month === selectedMonth) {
        return {
          ...month,
          videos: month.videos.map((video) =>
            video.id === videoId
              ? { ...video, status: video.status === "active" ? "hidden" as const : "active" as const }
              : video
          ),
        }
      }
      return month
    })
    setExercise({ ...exercise, months: updatedMonths })
  }

  const handleDeleteVideo = (videoId: string) => {
    if (confirm("Are you sure you want to delete this video?")) {
      const updatedMonths = exercise.months.map((month) => {
        if (month.month === selectedMonth) {
          return {
            ...month,
            videos: month.videos.filter((video) => video.id !== videoId),
          }
        }
        return month
      })
      setExercise({ ...exercise, months: updatedMonths })
    }
  }

  const handleSaveVideo = () => {
    // Mock save - in real app, this would upload to API
    const video: ExerciseVideo = {
      id: `v-${Date.now()}`,
      monthId: currentMonthData?.id || "",
      title: newVideo.title || "",
      videoUrl: "/placeholder-video.mp4",
      thumbnailUrl: "/placeholder-thumb.jpg",
      description: newVideo.description || "",
      executionSteps: newVideo.executionSteps || [],
      duration: newVideo.duration || 0,
      status: newVideo.status as "active" | "hidden",
      order: currentVideos.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const updatedMonths = exercise.months.map((month) => {
      if (month.month === selectedMonth) {
        return {
          ...month,
          videos: [...month.videos, video],
        }
      }
      return month
    })

    setExercise({ ...exercise, months: updatedMonths })
    setUploadDialogOpen(false)
    setNewVideo({
      title: "",
      description: "",
      executionSteps: ["", "", ""],
      duration: 0,
      status: "active",
    })
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/dashboard/admin/exercise-content">
          <Button variant="ghost" className="text-slate-600 hover:text-slate-900 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exercise List
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">
            Exercise Management / {exercise.name}
          </p>
        </div>

        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              {exercise.name}
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Manage monthly video content for this exercise program
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge
              variant={exercise.status === "active" ? "default" : "secondary"}
              className="h-8 px-4 text-sm font-semibold"
            >
              {exercise.status === "active" ? "Active" : "Hidden"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Video Progress Summary */}
      <div className="grid gap-5 sm:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
                  Total Videos
                </p>
                <p className="text-3xl font-bold text-slate-900">{totalVideos} / {maxTotalVideos}</p>
                <div className="w-full h-2 bg-blue-200 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                    style={{ width: `${(totalVideos / maxTotalVideos) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
                  Total Months
                </p>
                <p className="text-3xl font-bold text-slate-900">{exercise.months.length}</p>
                <p className="text-xs text-emerald-700 mt-2">Program duration</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
                  Current Month
                </p>
                <p className="text-3xl font-bold text-slate-900">{currentVideos.length} / {MAX_VIDEOS_PER_MONTH}</p>
                <p className="text-xs text-amber-700 mt-2">Month {selectedMonth} videos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Month Tabs and Video Management */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/80 shadow-lg overflow-hidden">
        <Tabs value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
          <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
            <TabsList className="bg-white border border-slate-200">
              {exercise.months.map((month) => {
                const monthVideos = month.videos.length
                return (
                  <TabsTrigger
                    key={month.month}
                    value={month.month.toString()}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <span>Month {month.month}</span>
                      <Badge
                        variant={monthVideos === MAX_VIDEOS_PER_MONTH ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {monthVideos}/{MAX_VIDEOS_PER_MONTH}
                      </Badge>
                    </div>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          {exercise.months.map((month) => (
            <TabsContent key={month.month} value={month.month.toString()} className="p-6 space-y-6">
              {/* Upload Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Month {month.month} Videos ({month.videos.length} / {MAX_VIDEOS_PER_MONTH})
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {canAddMore
                      ? `You can upload ${MAX_VIDEOS_PER_MONTH - month.videos.length} more video${MAX_VIDEOS_PER_MONTH - month.videos.length !== 1 ? 's' : ''}`
                      : "Maximum videos reached for this month"}
                  </p>
                </div>
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      disabled={!canAddMore}
                      className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Video
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Upload Exercise Video - Month {selectedMonth}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Video Title *</Label>
                        <Input
                          placeholder="e.g., Push Ups"
                          value={newVideo.title}
                          onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <FileUpload
                          label="Upload Video *"
                          accept="video/*"
                          maxSize={100}
                          onChange={(file) =>
                            setNewVideo((prev) => ({ ...prev, videoFile: file || null }))
                          }
                          onUpload={(url) => setNewVideo((prev) => ({ ...prev, videoUrl: url }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <FileUpload
                          label="Thumbnail Image *"
                          accept="image/*"
                          maxSize={5}
                          preview
                          onChange={(file) =>
                            setNewVideo((prev) => ({ ...prev, thumbnailFile: file || null }))
                          }
                          onUpload={(url) => setNewVideo((prev) => ({ ...prev, thumbnailUrl: url }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Describe the exercise..."
                          rows={3}
                          value={newVideo.description}
                          onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Execution Steps</Label>
                        {newVideo.executionSteps?.map((step, index) => (
                          <Input
                            key={index}
                            placeholder={`Step ${index + 1}`}
                            value={step}
                            onChange={(e) => {
                              const steps = [...(newVideo.executionSteps || [])]
                              steps[index] = e.target.value
                              setNewVideo({ ...newVideo, executionSteps: steps })
                            }}
                          />
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setNewVideo({
                              ...newVideo,
                              executionSteps: [...(newVideo.executionSteps || []), ""],
                            })
                          }
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Step
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Duration (seconds)</Label>
                          <Input
                            type="number"
                            placeholder="30"
                            value={newVideo.duration || ""}
                            onChange={(e) =>
                              setNewVideo({ ...newVideo, duration: parseInt(e.target.value) || 0 })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={newVideo.status}
                            onValueChange={(value) =>
                              setNewVideo({ ...newVideo, status: value as "active" | "hidden" })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="hidden">Hidden</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveVideo}
                        disabled={!newVideo.title}
                        className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white"
                      >
                        Save Video
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Video Grid with Drag & Drop */}
              {month.videos.length > 0 ? (
                <div className="space-y-3">
                  <DraggableList
                    items={month.videos}
                    onReorder={handleReorderVideos}
                    getItemId={(video) => video.id}
                    renderItem={(video, index) => (
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-1 flex items-center justify-center">
                          <GripVertical className="h-5 w-5 text-slate-400 cursor-grab" />
                        </div>
                        <div className="col-span-2">
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100 group">
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="col-span-3">
                          <p className="font-semibold text-slate-900">{video.title}</p>
                          <p className="text-sm text-slate-600 line-clamp-1">{video.description}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-slate-900">{video.duration} sec</p>
                          {video.caloriesBurn && (
                            <p className="text-xs text-slate-600">{video.caloriesBurn} cal</p>
                          )}
                        </div>
                        <div className="col-span-2">
                          <Badge
                            variant={video.status === "active" ? "default" : "secondary"}
                            className="font-semibold"
                          >
                            {video.status === "active" ? "Active" : "Hidden"}
                          </Badge>
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-slate-700 border-slate-300 hover:bg-slate-50"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleVideoStatus(video.id)}
                            className="text-slate-700 border-slate-300 hover:bg-slate-50"
                          >
                            {video.status === "active" ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteVideo(video.id)}
                            className="text-red-600 border-slate-300 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  />
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                  <p className="text-slate-500 mb-4">No videos uploaded for this month yet</p>
                  <Button
                    onClick={() => setUploadDialogOpen(true)}
                    className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Upload First Video
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
