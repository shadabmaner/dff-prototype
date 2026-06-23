# Admin Panel - Content Management System

## Overview
Comprehensive admin panel with 3 main content management modules for Knowledge Base, Courses, and Exercise Content.

## Features Implemented

### 1. Knowledge Base Management

#### Routes
- **List Page**: `/dashboard/admin/knowledge-base`
- **Create Page**: `/dashboard/admin/knowledge-base/create`
- **Edit Page**: `/dashboard/admin/knowledge-base/edit/[id]`

#### Features
- ✅ List all knowledge base entries with drag & drop ordering
- ✅ Edit, Delete, Hide/Unhide functionality
- ✅ Multi-media upload support (Video, PDF, Image, DOC)
- ✅ Recipe description field (optional)
- ✅ FAQ section with dynamic add/remove
- ✅ Status management (Active/Hidden)
- ✅ Visual table with order, name, description, status, and actions

#### Components
- `DraggableList` - Handles drag & drop reordering using @dnd-kit
- `FileUpload` - Universal file upload with preview support
- `FAQBuilder` - Dynamic FAQ management with checkbox toggle

---

### 2. Course Management

#### Routes
- **List Page**: `/dashboard/admin/courses`
- **Create Page**: `/dashboard/admin/courses/create`
- **Edit Page**: `/dashboard/admin/courses/edit/[id]`
- **Manage Course**: `/dashboard/admin/courses/manage/[id]`
- **Module Content**: `/dashboard/admin/courses/modules/[id]/content`

#### Features
- ✅ Grid-based course listing with visual cards
- ✅ Course fields: name, image, duration, price, description, priority
- ✅ Edit, Delete, Hide/Unhide functionality
- ✅ Module management system
- ✅ Module fields: name, cover image, intro video
- ✅ Content management per module (Video, PDF, Text, Document)
- ✅ Course-level FAQ management
- ✅ Drag & drop reordering for module content
- ✅ Status management (Active/Hidden)

#### Module Structure
```
Course
├── Basic Info (name, image, duration, price, priority)
├── Modules
│   ├── Module 1
│   │   ├── Cover Image
│   │   ├── Intro Video
│   │   └── Content Items (Video/PDF/Text/Document)
│   └── Module 2
└── Course FAQs
```

---

### 3. Exercise Content Management

#### Routes
- **List Page**: `/dashboard/admin/exercise-content`
- **Create Page**: `/dashboard/admin/exercise-content/create`
- **Detail Page**: `/dashboard/admin/exercise-content/[id]`
- **Edit Page**: `/dashboard/admin/exercise-content/edit/[id]`

#### Features
- ✅ Exercise listing with clickable cards
- ✅ Exercise fields: name, description, cover image
- ✅ Month-based organization (Month 1, 2, 3)
- ✅ Video upload with enhanced metadata
- ✅ Maximum 21 videos per month restriction
- ✅ Video fields:
  - Title
  - Video upload
  - Thumbnail image
  - Description
  - Execution steps (dynamic array)
  - Duration (seconds)
  - Calories burn (optional)
  - Status (Active/Hidden)
- ✅ Drag & drop reordering per month
- ✅ Visual video cards with thumbnails
- ✅ Video count tracking: "Uploaded Videos: X / 21"

#### Exercise Structure
```
Exercise
├── Basic Info (name, description, cover image)
└── Months
    ├── Month 1 (max 21 videos)
    │   ├── Video 1 (with all metadata)
    │   ├── Video 2
    │   └── Video 3
    ├── Month 2 (max 21 videos)
    └── Month 3 (max 21 videos)
```

---

## Navigation Structure

### Admin Sidebar
Located at: `src/components/admin/admin-sidebar.tsx`

Collapsible sections with icons:
- 📚 **Knowledge Base**
  - All Knowledge Base
  - Create New
- 🎓 **Course Management**
  - All Courses
  - Create Course
- 💪 **Exercise Content**
  - All Exercises
  - Create Exercise

---

## Reusable Components

### 1. FileUpload (`src/components/admin/file-upload.tsx`)
- Supports all file types
- Image preview functionality
- Drag & drop support
- Remove/replace files
- Props: `label`, `accept`, `value`, `onChange`, `preview`

### 2. FAQBuilder (`src/components/admin/faq-builder.tsx`)
- Dynamic FAQ management
- Add/remove FAQ items
- Question & Answer fields
- Optional toggle to enable/disable section
- Props: `faqs`, `onChange`, `showToggle`

### 3. DraggableList (`src/components/admin/draggable-list.tsx`)
- Generic drag & drop list component
- Uses @dnd-kit/core and @dnd-kit/sortable
- Visual drag handle with GripVertical icon
- Smooth animations
- Props: `items`, `onReorder`, `renderItem`, `getItemId`

### 4. AdminSidebar (`src/components/admin/admin-sidebar.tsx`)
- Collapsible navigation sections
- Active route highlighting
- Icon-based navigation
- Responsive design

---

## Type Definitions

Located at: `src/types/admin.ts`

### Interfaces
- `KnowledgeBase` - Knowledge base entry with media URLs and FAQs
- `FAQ` - Question/answer pair
- `Course` - Course with modules and FAQs
- `CourseModule` - Module with cover, video, and content
- `ModuleContent` - Content item (video/pdf/text/document)
- `Exercise` - Exercise with months
- `ExerciseMonth` - Month container for videos
- `ExerciseVideo` - Video with full metadata

---

## Technology Stack

- **Framework**: Next.js 16.1.6 with App Router
- **UI Library**: React 19.2.3
- **Styling**: TailwindCSS 4
- **Components**: shadcn/ui with Radix UI primitives
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Icons**: lucide-react
- **Forms**: React Hook Form (optional integration)

---

## Key Features

### Drag & Drop
All list pages support drag & drop reordering:
- Knowledge Base entries
- Course modules
- Module content items
- Exercise videos (per month)

Uses `@dnd-kit` library for smooth, accessible drag & drop.

### Status Management
All content types support Active/Hidden status:
- Visual badges showing current status
- Toggle buttons (Eye/EyeOff icons)
- Instant status updates

### File Upload
Universal file upload component supports:
- Images (with preview)
- Videos
- PDFs
- Documents (.doc, .docx)
- Drag & drop functionality
- File removal and replacement

### Dynamic Forms
- Dynamic FAQ builder
- Dynamic execution steps
- Dynamic module content addition
- Dynamic video uploads per month

---

## Usage Guide

### Starting the Development Server
```bash
npm run dev
# or
npm run build && npm start
```

### Accessing Admin Panel
Navigate to: `http://localhost:3000/dashboard/admin/knowledge-base`

The sidebar will be visible on all admin pages for easy navigation.

### Creating Content

#### Knowledge Base
1. Navigate to Knowledge Base
2. Click "Add Knowledge Base"
3. Fill in name and description
4. Upload media files (optional)
5. Add recipe description (optional)
6. Enable FAQ and add questions/answers
7. Click "Create"

#### Course
1. Navigate to Courses
2. Click "Create Course"
3. Fill in course details (name, image, duration, price, priority)
4. Click "Create Course"
5. Navigate to "Manage" on the course card
6. Add modules with cover image and intro video
7. Click "Manage Content" on each module
8. Add content items (video, pdf, text, document)
9. Add course FAQs in the FAQs tab

#### Exercise
1. Navigate to Exercise Content
2. Click "Create Exercise"
3. Fill in exercise details and upload cover image
4. Click "Create Exercise"
5. Click on the exercise to open detail page
6. Select a month tab (Month 1, 2, or 3)
7. Click "Upload Exercise Video"
8. Fill in all video details (max 21 per month)
9. Click "Save Exercise"

---

## API Integration Points

All pages currently use mock data. To integrate with backend:

### Knowledge Base
- `GET /api/admin/knowledge-base` - List all
- `POST /api/admin/knowledge-base` - Create
- `PUT /api/admin/knowledge-base/[id]` - Update
- `DELETE /api/admin/knowledge-base/[id]` - Delete
- `PATCH /api/admin/knowledge-base/[id]/order` - Reorder

### Courses
- `GET /api/admin/courses` - List all
- `POST /api/admin/courses` - Create
- `PUT /api/admin/courses/[id]` - Update
- `DELETE /api/admin/courses/[id]` - Delete
- `POST /api/admin/courses/[id]/modules` - Add module
- `POST /api/admin/courses/modules/[id]/content` - Add content

### Exercises
- `GET /api/admin/exercises` - List all
- `POST /api/admin/exercises` - Create
- `PUT /api/admin/exercises/[id]` - Update
- `DELETE /api/admin/exercises/[id]` - Delete
- `POST /api/admin/exercises/[id]/months/[month]/videos` - Add video
- `PATCH /api/admin/exercises/videos/[id]/order` - Reorder videos

---

## Notes

- All forms include validation (required fields marked with *)
- File uploads need backend implementation for storage
- Drag & drop updates order field automatically
- Month video limit (21) is enforced client-side
- Status toggles provide immediate visual feedback
- All pages are fully responsive
- TypeScript types ensure type safety throughout

---

## Future Enhancements

- [ ] Backend API integration
- [ ] File upload to cloud storage (AWS S3, Cloudinary)
- [ ] Search and filter functionality
- [ ] Bulk actions (delete, hide/show multiple items)
- [ ] Preview mode for content
- [ ] Analytics and usage statistics
- [ ] Version history and rollback
- [ ] Content duplication feature
- [ ] Advanced permissions and roles
