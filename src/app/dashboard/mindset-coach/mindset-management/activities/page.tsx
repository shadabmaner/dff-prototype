"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Video, FileText, Plus, Edit, Trash2, Youtube, Music, Calendar, X } from "lucide-react"

type ActivityType = "video" | "form"

type VideoActivity = {
  id: string
  type: "video"
  title: string
  description: string
  source: "youtube" | "mp3"
  url: string
  faqs: Array<{ question: string; answer: string }>
  excludeWeekends: boolean
  createdAt: string
}

type FormActivity = {
  id: string
  type: "form"
  title: string
  description: string
  questions: Array<{
    id: string
    question: string
    type: "text" | "checkbox" | "rating" | "slider"
    options?: string[]
    required: boolean
  }>
  excludeWeekends: boolean
  createdAt: string
}

type Activity = VideoActivity | FormActivity

export default function MindsetActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: "1",
      type: "video",
      title: "Morning Meditation - 10 Minutes",
      description: "A guided meditation session to start your day with positivity and focus.",
      source: "youtube",
      url: "https://www.youtube.com/watch?v=example",
      faqs: [
        { question: "What time should I do this?", answer: "Ideally in the morning, within 30 minutes of waking up." },
        { question: "Can I do this lying down?", answer: "Yes, but sitting up is recommended for better focus." }
      ],
      excludeWeekends: false,
      createdAt: "2024-06-01"
    },
    {
      id: "2",
      type: "form",
      title: "Daily Mood Journal",
      description: "Track your daily mood and emotions to understand patterns in your mental health.",
      questions: [
        { id: "q1", question: "How are you feeling today?", type: "rating", required: true },
        { id: "q2", question: "What made you feel this way?", type: "text", required: true },
        { id: "q3", question: "What are you grateful for today?", type: "text", required: false },
        { id: "q4", question: "Check activities you completed today", type: "checkbox", options: ["Exercise", "Meditation", "Journaling", "Healthy eating"], required: false }
      ],
      excludeWeekends: false,
      createdAt: "2024-06-05"
    }
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType>("video")
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)

  // Form state for video activity
  const [videoForm, setVideoForm] = useState({
    title: "",
    description: "",
    source: "youtube" as "youtube" | "mp3",
    url: "",
    excludeWeekends: false,
    faqs: [{ question: "", answer: "" }]
  })

  // Form state for form activity
  const [formActivity, setFormActivity] = useState({
    title: "",
    description: "",
    excludeWeekends: false,
    questions: [{ id: "q1", question: "", type: "text" as "text" | "checkbox" | "rating" | "slider", required: true, options: [""] }]
  })

  const handleCreateActivity = () => {
    if (selectedActivityType === "video") {
      const newActivity: VideoActivity = {
        id: Date.now().toString(),
        type: "video",
        title: videoForm.title,
        description: videoForm.description,
        source: videoForm.source,
        url: videoForm.url,
        faqs: videoForm.faqs.filter(faq => faq.question && faq.answer),
        excludeWeekends: videoForm.excludeWeekends,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setActivities([...activities, newActivity])
    } else {
      const newActivity: FormActivity = {
        id: Date.now().toString(),
        type: "form",
        title: formActivity.title,
        description: formActivity.description,
        questions: formActivity.questions.filter(q => q.question),
        excludeWeekends: formActivity.excludeWeekends,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setActivities([...activities, newActivity])
    }
    setIsCreateDialogOpen(false)
    resetForms()
  }

  const resetForms = () => {
    setVideoForm({
      title: "",
      description: "",
      source: "youtube",
      url: "",
      excludeWeekends: false,
      faqs: [{ question: "", answer: "" }]
    })
    setFormActivity({
      title: "",
      description: "",
      excludeWeekends: false,
      questions: [{ id: "q1", question: "", type: "text", required: true, options: [""] }]
    })
  }

  const handleDeleteActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id))
  }

  const addFAQ = () => {
    setVideoForm({
      ...videoForm,
      faqs: [...videoForm.faqs, { question: "", answer: "" }]
    })
  }

  const removeFAQ = (index: number) => {
    setVideoForm({
      ...videoForm,
      faqs: videoForm.faqs.filter((_, i) => i !== index)
    })
  }

  const addQuestion = () => {
    setFormActivity({
      ...formActivity,
      questions: [...formActivity.questions, { id: `q${formActivity.questions.length + 1}`, question: "", type: "text", required: true, options: [""] }]
    })
  }

  const removeQuestion = (index: number) => {
    setFormActivity({
      ...formActivity,
      questions: formActivity.questions.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 rounded-[50px]">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Mindset Activity Management</h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">Create and manage video and form-based mindset activities for patients.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-900/20">
              <Plus className="mr-2 h-4 w-4" />
              Create Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Create New Mindset Activity
              </DialogTitle>
            </DialogHeader>
            
            <Tabs value={selectedActivityType} onValueChange={(v) => setSelectedActivityType(v as ActivityType)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="video" className="gap-2">
                  <Video className="h-4 w-4" /> Video Type
                </TabsTrigger>
                <TabsTrigger value="form" className="gap-2">
                  <FileText className="h-4 w-4" /> Form Type
                </TabsTrigger>
              </TabsList>

              {/* Video Type Form */}
              <TabsContent value="video" className="space-y-4">
                <div className="space-y-2">
                  <Label>Activity Title *</Label>
                  <Input 
                    placeholder="e.g., Morning Meditation - 10 Minutes"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea 
                    placeholder="Describe the activity and its benefits..."
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Source Type *</Label>
                  <Select value={videoForm.source} onValueChange={(v) => setVideoForm({ ...videoForm, source: v as "youtube" | "mp3" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">
                        <div className="flex items-center gap-2">
                          <Youtube className="h-4 w-4" /> YouTube Video
                        </div>
                      </SelectItem>
                      <SelectItem value="mp3">
                        <div className="flex items-center gap-2">
                          <Music className="h-4 w-4" /> MP3 Audio
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>URL *</Label>
                  <Input 
                    placeholder={videoForm.source === "youtube" ? "https://www.youtube.com/watch?v=..." : "https://example.com/audio.mp3"}
                    value={videoForm.url}
                    onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>FAQs</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addFAQ}>
                      <Plus className="h-4 w-4 mr-1" /> Add FAQ
                    </Button>
                  </div>
                  {videoForm.faqs.map((faq, index) => (
                    <div key={index} className="space-y-2 p-4 border border-slate-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-slate-700">FAQ #{index + 1}</span>
                        {videoForm.faqs.length > 1 && (
                          <Button type="button" size="sm" variant="ghost" onClick={() => removeFAQ(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Input 
                        placeholder="Question"
                        value={faq.question}
                        onChange={(e) => {
                          const newFaqs = [...videoForm.faqs]
                          newFaqs[index].question = e.target.value
                          setVideoForm({ ...videoForm, faqs: newFaqs })
                        }}
                      />
                      <Textarea 
                        placeholder="Answer"
                        value={faq.answer}
                        onChange={(e) => {
                          const newFaqs = [...videoForm.faqs]
                          newFaqs[index].answer = e.target.value
                          setVideoForm({ ...videoForm, faqs: newFaqs })
                        }}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-600" />
                    <Label className="mb-0">Exclude Weekends</Label>
                  </div>
                  <Switch 
                    checked={videoForm.excludeWeekends}
                    onCheckedChange={(checked) => setVideoForm({ ...videoForm, excludeWeekends: checked })}
                  />
                </div>
              </TabsContent>

              {/* Form Type Form */}
              <TabsContent value="form" className="space-y-4">
                <div className="space-y-2">
                  <Label>Activity Title *</Label>
                  <Input 
                    placeholder="e.g., Daily Mood Journal"
                    value={formActivity.title}
                    onChange={(e) => setFormActivity({ ...formActivity, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea 
                    placeholder="Describe the purpose of this form..."
                    value={formActivity.description}
                    onChange={(e) => setFormActivity({ ...formActivity, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Questions</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addQuestion}>
                      <Plus className="h-4 w-4 mr-1" /> Add Question
                    </Button>
                  </div>
                  {formActivity.questions.map((question, index) => (
                    <div key={index} className="space-y-3 p-4 border border-slate-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-slate-700">Question #{index + 1}</span>
                        {formActivity.questions.length > 1 && (
                          <Button type="button" size="sm" variant="ghost" onClick={() => removeQuestion(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Input 
                        placeholder="Question text"
                        value={question.question}
                        onChange={(e) => {
                          const newQuestions = [...formActivity.questions]
                          newQuestions[index].question = e.target.value
                          setFormActivity({ ...formActivity, questions: newQuestions })
                        }}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Question Type</Label>
                          <Select 
                            value={question.type} 
                            onValueChange={(v) => {
                              const newQuestions = [...formActivity.questions]
                              newQuestions[index].type = v as "text" | "checkbox" | "rating" | "slider"
                              if (v === "checkbox") {
                                newQuestions[index].options = ["Option 1", "Option 2"]
                              } else {
                                newQuestions[index].options = []
                              }
                              setFormActivity({ ...formActivity, questions: newQuestions })
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text Input</SelectItem>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                              <SelectItem value="rating">Rating (1-10)</SelectItem>
                              <SelectItem value="slider">Slider</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={question.required}
                            onCheckedChange={(checked) => {
                              const newQuestions = [...formActivity.questions]
                              newQuestions[index].required = checked
                              setFormActivity({ ...formActivity, questions: newQuestions })
                            }}
                          />
                          <Label className="text-xs mb-0">Required</Label>
                        </div>
                      </div>
                      {question.type === "checkbox" && question.options && (
                        <div className="space-y-2">
                          <Label className="text-xs">Options</Label>
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex gap-2">
                              <Input 
                                placeholder={`Option ${optIndex + 1}`}
                                value={option}
                                onChange={(e) => {
                                  const newQuestions = [...formActivity.questions]
                                  const newOptions = [...(newQuestions[index].options || [])]
                                  newOptions[optIndex] = e.target.value
                                  newQuestions[index].options = newOptions
                                  setFormActivity({ ...formActivity, questions: newQuestions })
                                }}
                              />
                              {(question.options?.length || 0) > 1 && (
                                <Button 
                                  type="button" 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => {
                                    const newQuestions = [...formActivity.questions]
                                    const newOptions = [...(newQuestions[index].options || [])]
                                    newOptions.splice(optIndex, 1)
                                    newQuestions[index].options = newOptions
                                    setFormActivity({ ...formActivity, questions: newQuestions })
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              const newQuestions = [...formActivity.questions]
                              const newOptions = [...(newQuestions[index].options || []), ""]
                              newQuestions[index].options = newOptions
                              setFormActivity({ ...formActivity, questions: newQuestions })
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Option
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-600" />
                    <Label className="mb-0">Exclude Weekends</Label>
                  </div>
                  <Switch 
                    checked={formActivity.excludeWeekends}
                    onCheckedChange={(checked) => setFormActivity({ ...formActivity, excludeWeekends: checked })}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateActivity} className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                Create Activity
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Activities List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity) => (
          <Card key={activity.id} className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="p-4 border-b border-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {activity.type === "video" ? (
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                        <Video className="h-3 w-3 mr-1" /> Video
                      </Badge>
                    ) : (
                      <Badge className="bg-pink-100 text-pink-700 border-pink-200">
                        <FileText className="h-3 w-3 mr-1" /> Form
                      </Badge>
                    )}
                    {activity.excludeWeekends && (
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" /> No Weekends
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base font-semibold text-slate-900 line-clamp-2">{activity.title}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4 text-slate-600" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDeleteActivity(activity.id)}>
                    <Trash2 className="h-4 w-4 text-rose-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 line-clamp-3 mb-4">{activity.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Created: {activity.createdAt}</span>
                {activity.type === "video" && (
                  <span className="flex items-center gap-1">
                    {activity.source === "youtube" ? <Youtube className="h-3 w-3" /> : <Music className="h-3 w-3" />}
                    {activity.source === "youtube" ? "YouTube" : "MP3"}
                  </span>
                )}
                {activity.type === "form" && (
                  <span>{(activity as FormActivity).questions.length} questions</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
