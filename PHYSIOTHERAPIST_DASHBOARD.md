# Physiotherapist Web Dashboard

A comprehensive Exercise & Rehabilitation Management Module designed for physiotherapists to manage patients, exercise plans, follow-ups, and track compliance.

## Features

### 🔐 Authentication
- Secure login with email and password validation
- Session management and logout functionality
- Demo credentials for testing

### 📊 Dashboard
- **Widgets Overview:**
  - Assigned Patients Count
  - Pending Exercise Plan Creation
  - Today's Follow-up Sessions
  - Overdue Follow-ups
- Clickable widgets that navigate to filtered patient lists
- Recent activities feed
- Quick action buttons
- Compliance overview with trends

### 👥 Patient Master
- **Table View** with comprehensive patient information
- **Advanced Search:** Search by name, ID, mobile number, or batch
- **Multi-level Filtering:**
  - Batch (Dropdown)
  - Specialty
  - Program Status
  - Compliance % Range
  - Follow-up Status
  - Date Range (Enrollment)
- **Sorting:** Sort by name, age, compliance %, follow-up date, program status
- **Pagination:** 10/25/50/100 records per page
- **Default sorting:** Next Follow-up Date (Ascending)

### 📋 Patient Detail View
- **Overview Section:**
  - Demographics (age, gender, contact info)
  - Medical Condition Summary
  - Doctor Prescription (Read-only)
  - Diet Plan (Read-only)
  - Current Exercise Plan
  - Exercise Plan History
  - Compliance % with visual indicators
  - Payment Status (Read-only)
- **Tabbed Interface:**
  - Overview
  - Exercise Plan
  - Compliance Tracking
  - Prescription
  - Diet Plan
  - Payment

### 🏋️ Exercise Plan Management
- **Create Exercise Plan:**
  - Patient selection
  - Plan name and description
  - Date range configuration
  - Multiple exercise addition
  - Weekly schedule definition
  - Workout video assignment
  - Contraindication notes
- **Update Exercise Plan:**
  - Modify existing exercises
  - Update repetitions and sets
  - Add/remove workouts
  - Replace entire plan
  - Automatic archiving of old plans
- **Save & Notification System:**
  - Instant patient mobile app notification
  - Real-time exercise plan updates
  - Compliance reset for new cycles

### 📈 Compliance Tracking
- **Visual Metrics:**
  - Daily completion percentage
  - Weekly trend charts
  - Missed sessions tracking
  - Duration logged vs planned
  - Activity history graphs
- **Alert System:**
  - Configurable low compliance threshold
  - Visual indicators for compliance levels
  - Color-coded status (green/yellow/red)

### 📅 Follow-up Session Management
- **Schedule Follow-ups:**
  - Patient selection
  - Date and time scheduling
  - Duration configuration (30/45/60 minutes)
  - Session type (Video/In-person/Phone)
  - Purpose notes
- **Session Management:**
  - Join video consultations
  - Add session notes
  - Mark session complete
  - Cancel sessions
  - No-show tracking
- **Follow-up Fields:**
  - Session type
  - Scheduled date/time
  - Duration
  - Status tracking
  - Session notes
  - Video conference links

### 🔔 Notifications
- **Notification Types:**
  - New patient assigned
  - Exercise plan pending
  - Upcoming follow-up reminders
  - Low compliance alerts
  - Missed consultation alerts
  - System notifications
- **Features:**
  - Priority levels (Low/Medium/High/Urgent)
  - Read/unread status
  - Filtering by type and priority
  - Direct navigation to related pages
  - Bulk actions (mark all as read, clear all)

### 👤 Profile Management
- **Personal Information:**
  - Name, email, phone
  - Specialization
  - Bio and address
- **Professional Details:**
  - License number
  - Qualifications
  - Department
  - Languages spoken
  - Years of experience
- **Availability Settings:**
  - Weekly working hours
  - Day-wise schedule
- **Security:**
  - Password change
  - Account security settings

### 🔒 Cross-Role Visibility
- **Read-only Access:**
  - Doctor prescriptions
  - Diet plans
  - Medication adherence %
  - Overall compliance summary
- **Restricted Editing:**
  - No editing allowed outside exercise module
  - Clear role-based permissions

## Technical Implementation

### Technology Stack
- **Framework:** Next.js 16 with TypeScript
- **UI Components:** Radix UI + Tailwind CSS
- **Styling:** TailwindCSS with shadcn/ui components
- **Icons:** Lucide React
- **State Management:** React Hooks
- **Forms:** React Hook Form with Zod validation
- **Authentication:** NextAuth.js (mock implementation)

### File Structure
```
src/app/physiotherapist/
├── layout.tsx              # Main layout with navigation
├── login/page.tsx          # Authentication page
├── page.tsx               # Dashboard
├── patients/
│   ├── page.tsx           # Patient master list
│   └── [id]/page.tsx      # Patient detail view
├── exercise-plans/
│   └── page.tsx           # Exercise plan management
├── follow-ups/
│   └── page.tsx           # Follow-up session management
├── notifications/
│   └── page.tsx           # Notifications center
└── profile/
    └── page.tsx           # Profile management
```

### Key Features Implemented
- ✅ Responsive design for all screen sizes
- ✅ Real-time search with ≤2 second response time
- ✅ Advanced filtering and sorting
- ✅ Pagination with configurable page sizes
- ✅ Modal dialogs for create/edit operations
- ✅ Form validation with error handling
- ✅ Loading states and error boundaries
- ✅ Accessibility compliance
- ✅ Cross-browser compatibility

## Demo Credentials
- **Email:** physio@demo.com
- **Password:** password123

## Getting Started

1. Navigate to the physiotherapist module:
   ```
   http://localhost:3000/physiotherapist
   ```

2. Login with demo credentials

3. Explore the dashboard and all features

## User Flow

1. **Login** → Authentication with email/password
2. **Dashboard** → Overview of practice metrics and quick actions
3. **Patient Master** → Search, filter, and view patient lists
4. **Patient Details** → Comprehensive patient information and history
5. **Exercise Plans** → Create and manage rehabilitation programs
6. **Follow-ups** → Schedule and conduct consultation sessions
7. **Notifications** → Stay updated with alerts and reminders
8. **Profile** → Manage personal and professional information

## Performance Optimizations
- Efficient data fetching with loading states
- Optimized search with debouncing
- Lazy loading for large datasets
- Responsive images and assets
- Minimal bundle size with tree shaking

## Security Considerations
- Role-based access control
- Input validation and sanitization
- XSS protection
- Secure session management
- Password strength requirements

## Future Enhancements
- Real-time video integration
- Advanced analytics dashboard
- Mobile app synchronization
- Automated reporting
- Integration with EMR systems
- Multi-language support

---

This physiotherapist dashboard provides a complete solution for managing patient rehabilitation programs with an intuitive interface and comprehensive functionality designed to improve patient outcomes and streamline clinical workflows.
