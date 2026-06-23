"use client"

import { useState, use } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Upload, Trash2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { EnhancedFileUpload } from "@/components/admin/enhanced-file-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DraggableList } from "@/components/admin/draggable-list"
import type { ExerciseVideo } from "@/types/admin"

const MAX_VIDEOS_PER_MONTH = 21

const mockVideos: ExerciseVideo[] = [
  {
    id: "1",
    monthId: "1",
    title: "Push Ups",
    videoUrl: "/video1.mp4",
    thumbnailUrl: "/thumb1.jpg",
    description: "Basic upper body exercise",
    executionSteps: ["Start in plank position", "Lower body", "Push back up"],
    duration: 30,
    caloriesBurn: 50,
    difficultyLevel: "beginner",
    bodyPartTarget: "chest",
    reps: 12,
    sets: 3,
    restTime: 30,
    status: "active",
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function ExerciseDetailPageEnhanced({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [selectedMonth, setSelectedMonth] = useState(1)
  const [videos, setVideos] = useState(mockVideos)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [videoForm, setVideoForm] = useState({
    title: "",
    description: "",
    duration: "",
    caloriesBurn: "",
    difficultyLevel: "beginner" as "beginner" | "intermediate" | "advanced",
    bodyPartTarget: "full-body" as "abs" | "legs" | "chest" | "arms" | "back" | "shoulders" | "full-body",
    reps: "",
    sets: "",
    restTime: "",
    status: "active" as "active" | "hidden",
    executionSteps: ["", "", ""],
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

  const exerciseData = {
    name: "Exercise 1",
    description: "Beginner level exercises for weight loss",
    coverImage: "/placeholder-exercise.jpg",
  }

  const availableMonths = [1, 2, 3]
  const currentMonthVideos = videos.filter((v) => v.monthId === selectedMonth.toString())

  const handleAddVideo = () => {
    if (currentMonthVideos.length >= MAX_VIDEOS_PER_MONTH) {
      alert(`Maximum ${MAX_VIDEOS_PER_MONTH} videos per month reached!`)
      return
    }

    const newVideo: ExerciseVideo = {
      id: crypto.randomUUID(),
      monthId: selectedMonth.toString(),
      title: videoForm.title,
      videoUrl: "/placeholder.mp4",
      thumbnailUrl: "/placeholder.jpg",
      description: videoForm.description,
      executionSteps: videoForm.executionSteps.filter((s) => s.trim() !== ""),
      duration: parseInt(videoForm.duration),
      caloriesBurn: videoForm.caloriesBurn ? parseInt(videoForm.caloriesBurn) : undefined,
      difficultyLevel: videoForm.difficultyLevel,
      bodyPartTarget: videoForm.bodyPartTarget,
      reps: videoForm.reps ? parseInt(videoForm.reps) : undefined,
      sets: videoForm.sets ? parseInt(videoForm.sets) : undefined,
      restTime: videoForm.restTime ? parseInt(videoForm.restTime) : undefined,
      status: videoForm.status,
      order: currentMonthVideos.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setVideos([...videos, newVideo])
    resetForm()
  }

  const resetForm = () => {
    setVideoForm({
      title: "",
      description: "",
      duration: "",
      caloriesBurn: "",
      difficultyLevel: "beginner",
      bodyPartTarget: "full-body",
      reps: "",
      sets: "",
      restTime: "",
      status: "active",
      executionSteps: ["", "", ""],
    })
    setVideoFile(null)
    setThumbnailFile(null)
    setIsUploadOpen(false)
  }

  const handleToggleStatus = (videoId: string) => {
    setVideos((prev) =>
      prev.map((video) =>
        video.id === videoId
          ? { ...video, status: video.status === "active" ? "hidden" : "active" }
          : video
      )
    )
  }

  const handleDeleteVideo = (videoId: string) => {
    if (confirm("Are you sure you want to delete this video?")) {
      setVideos((prev) => prev.filter((video) => video.id !== videoId))
    }
  }

  const handleReorder = (reordered: ExerciseVideo[]) => {
    const updated = reordered.map((item, index) => ({
      ...item,
      order: index + 1,
    }))
    setVideos((prev) => [
      ...prev.filter((v) => v.monthId !== selectedMonth.toString()),
      ...updated,
    ])
  }

  const updateExecutionStep = (index: number, value: string) => {
    const steps = [...videoForm.executionSteps]
    steps[index] = value
    setVideoForm({ ...videoForm, executionSteps: steps })
  }

  const addExecutionStep = () => {
    setVideoForm({
      ...videoForm,
      executionSteps: [...videoForm.executionSteps, ""],
    })
  }

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case "beginner": return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "intermediate": return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
      case "advanced": return "bg-red-500/10 text-red-700 dark:text-red-400"
      default: return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  return (
    <div className="flex min-h-screen">
      
      
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard/admin/exercise-content">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Exercises
              </Button>
            </Link>
          </div>

          <div className="bg-card rounded-lg border p-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={exerciseData.coverImage}
                  alt={exerciseData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{exerciseData.name}</h1>
                <p className="text-muted-foreground">{exerciseData.description}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <Tabs value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
              <div className="flex items-center justify-between mb-6">
                <TabsList>
                  {availableMonths.map((month) => (
                    <TabsTrigger key={month} value={month.toString()}>
                      Month {month}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={currentMonthVideos.length >= MAX_VIDEOS_PER_MONTH}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Exercise Video
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Upload Exercise Video</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Exercise Title *</Label>
                        <Input
                          placeholder="e.g., Push Ups"
                          value={videoForm.title}
                          onChange={(e) =>
                            setVideoForm({ ...videoForm, title: e.target.value })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <EnhancedFileUpload
                          label="Upload Video *"
                          accept="video/*"
                          preview
                          onChange={(file) => setVideoFile(file)}
                        />
                        <EnhancedFileUpload
                          label="Upload Thumbnail *"
                          accept="image/*"
                          preview
                          onChange={(file) => setThumbnailFile(file)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description *</Label>
                        <Textarea
                          placeholder="Enter exercise description"
                          value={videoForm.description}
                          onChange={(e) =>
                            setVideoForm({ ...videoForm, description: e.target.value })
                          }
                          rows={3}
                        />
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3">Advanced Fitness Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Difficulty Level</Label>
                            <Select
                              value={videoForm.difficultyLevel}
                              onValueChange={(value: any) =>
                                setVideoForm({ ...videoForm, difficultyLevel: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Body Part Target</Label>
                            <Select
                              value={videoForm.bodyPartTarget}
                              onValueChange={(value: any) =>
                                setVideoForm({ ...videoForm, bodyPartTarget: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="abs">Abs</SelectItem>
                                <SelectItem value="legs">Legs</SelectItem>
                                <SelectItem value="chest">Chest</SelectItem>
                                <SelectItem value="arms">Arms</SelectItem>
                                <SelectItem value="back">Back</SelectItem>
                                <SelectItem value="shoulders">Shoulders</SelectItem>
                                <SelectItem value="full-body">Full Body</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Reps</Label>
                            <Input
                              type="number"
                              placeholder="e.g., 12"
                              value={videoForm.reps}
                              onChange={(e) =>
                                setVideoForm({ ...videoForm, reps: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Sets</Label>
                            <Input
                              type="number"
                              placeholder="e.g., 3"
                              value={videoForm.sets}
                              onChange={(e) =>
                                setVideoForm({ ...videoForm, sets: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Rest Time (seconds)</Label>
                            <Input
                              type="number"
                              placeholder="e.g., 30"
                              value={videoForm.restTime}
                              onChange={(e) =>
                                setVideoForm({ ...videoForm, restTime: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Calories Burn</Label>
                            <Input
                              type="number"
                              placeholder="e.g., 50"
                              value={videoForm.caloriesBurn}
                              onChange={(e) =>
                                setVideoForm({ ...videoForm, caloriesBurn: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <Label>Execution Steps *</Label>
                        <div className="space-y-2 mt-2">
                          {videoForm.executionSteps.map((step, index) => (
                            <div key={index} className="flex gap-2">
                              <span className="text-sm font-medium text-muted-foreground pt-2">
                                {index + 1}.
                              </span>
                              <Input
                                placeholder={`Step ${index + 1}`}
                                value={step}
                                onChange={(e) =>
                                  updateExecutionStep(index, e.target.value)
                                }
                              />
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addExecutionStep}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Step
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Duration (seconds) *</Label>
                          <Input
                            type="number"
                            placeholder="e.g., 30"
                            value={videoForm.duration}
                            onChange={(e) =>
                              setVideoForm({ ...videoForm, duration: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Status *</Label>
                          <Select
                            value={videoForm.status}
                            onValueChange={(value: any) =>
                              setVideoForm({ ...videoForm, status: value })
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

                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsUploadOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAddVideo}>Save Exercise</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {availableMonths.map((month) => (
                <TabsContent key={month} value={month.toString()} className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      Uploaded Videos: <span className="font-medium">{currentMonthVideos.length}</span> / {MAX_VIDEOS_PER_MONTH}
                    </p>
                    {currentMonthVideos.length >= MAX_VIDEOS_PER_MONTH && (
                      <Badge variant="secondary">Maximum videos reached</Badge>
                    )}
                  </div>

                  {currentMonthVideos.length > 0 ? (
                    <DraggableList
                      items={currentMonthVideos}
                      onReorder={handleReorder}
                      getItemId={(item) => item.id}
                      renderItem={(video) => (
                        <div className="flex items-center gap-4">
                          <div className="w-32 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{video.title}</h3>
                              {video.difficultyLevel && (
                                <Badge className={getDifficultyColor(video.difficultyLevel)}>
                                  {video.difficultyLevel}
                                </Badge>
                              )}
                              {video.bodyPartTarget && (
                                <Badge variant="outline" className="capitalize">
                                  {video.bodyPartTarget}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {video.description}
                            </p>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span>Duration: {video.duration}s</span>
                              {video.reps && <span>Reps: {video.reps}</span>}
                              {video.sets && <span>Sets: {video.sets}</span>}
                              {video.restTime && <span>Rest: {video.restTime}s</span>}
                              {video.caloriesBurn && <span>Cal: {video.caloriesBurn}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={video.status === "active" ? "default" : "secondary"}
                            >
                              {video.status === "active" ? "Active" : "Hidden"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleStatus(video.id)}
                            >
                              {video.status === "active" ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteVideo(video.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      )}
                    />
                  ) : (
                    <div className="text-center py-12 border rounded-lg">
                      <p className="text-muted-foreground">No videos uploaded yet</p>
                      <Button
                        className="mt-4"
                        onClick={() => setIsUploadOpen(true)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Your First Video
                      </Button>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
