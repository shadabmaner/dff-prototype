export interface KnowledgeBase {
  id: string
  order: number
  name: string
  description: string
  videoUrl?: string
  pdfUrl?: string
  imageUrl?: string
  docUrl?: string
  recipeDescription?: string
  status: "active" | "hidden"
  faqs: FAQ[]
  createdAt: Date
  updatedAt: Date
}

export interface FAQ {
  id: string
  question: string
  answer: string
}

export interface Course {
  id: string
  name: string
  image: string
  duration: string
  price: number
  description: string
  priority: number
  status: "active" | "hidden" | "draft"
  modules: CourseModule[]
  faqs: FAQ[]
  createdAt: Date
  updatedAt: Date
}

export interface CourseModule {
  id: string
  courseId: string
  name: string
  coverImage: string
  introVideo: string
  order: number
  contents: ModuleContent[]
  createdAt: Date
  updatedAt: Date
}

export interface ModuleContent {
  id: string
  moduleId: string
  title: string
  description: string
  type: "video" | "pdf" | "text" | "document"
  fileUrl?: string
  textContent?: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Exercise {
  id: string
  name: string
  description: string
  coverImage: string
  status: "active" | "hidden"
  months: ExerciseMonth[]
  createdAt: Date
  updatedAt: Date
}

export interface ExerciseMonth {
  id: string
  exerciseId: string
  monthNumber: number
  videos: ExerciseVideo[]
  createdAt: Date
  updatedAt: Date
}

export interface ExerciseVideo {
  id: string
  monthId: string
  title: string
  videoUrl: string
  thumbnailUrl: string
  description: string
  executionSteps: string[]
  duration: number
  caloriesBurn?: number
  difficultyLevel?: "beginner" | "intermediate" | "advanced"
  bodyPartTarget?: "abs" | "legs" | "chest" | "arms" | "back" | "shoulders" | "full-body"
  reps?: number
  sets?: number
  restTime?: number
  status: "active" | "hidden"
  order: number
  createdAt: Date
  updatedAt: Date
}
