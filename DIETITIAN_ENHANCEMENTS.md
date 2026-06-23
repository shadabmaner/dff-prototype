# Dietitian Module Enhancements - Implementation Guide

## Overview
This document outlines the comprehensive enhancements made to the dietitian module, including new features for diet plan management, doctor referrals, patient requests, and consultation tracking.

---

## 1. Session Page Enhancements

### Location
`src/app/dashboard/dietitian/consultation/[id]/page.tsx`

### New Features

#### A. Action Buttons Added
- **Start Diet Plan** - Opens Monday-only calendar picker
- **Refer to Doctor** - Opens doctor referral modal
- Existing "Send Diet Plan" and "View History" buttons remain unchanged

#### B. Editable Diet Plan
- First diet plan is now editable by default
- **Edit Diet Plan** button - Makes diet plan fields editable
- **Confirm Diet Plan & Send to Patient** button - Locks editing and sends plan
- Individual meal edit buttons disabled after confirmation
- Visual confirmation badge shown when plan is confirmed

### Implementation Details
```typescript
// State management
const [isDietPlanEditable, setIsDietPlanEditable] = useState(true)
const [isDietPlanConfirmed, setIsDietPlanConfirmed] = useState(false)
const [showMondayCalendar, setShowMondayCalendar] = useState(false)
const [showReferDoctorModal, setShowReferDoctorModal] = useState(false)
```

---

## 2. Start Diet Plan Feature

### Monday-Only Calendar Picker

#### Component
`src/components/dietitian/monday-calendar-picker.tsx`

#### Features
- **Monday-only selection** - All other days disabled
- **Quick select options**:
  - This Monday
  - Next Monday
- Full calendar view with Monday highlighting
- Diet cycle schedule preview showing all 6 cycles
- Automatic cycle calculation based on selected Monday

#### Diet Plan Cycle Rules
| Cycle | Duration |
|-------|----------|
| Cycle 1 | 8 Days |
| Cycle 2 | 15 Days |
| Cycle 3 | 15 Days |
| Cycle 4 | 15 Days |
| Cycle 5 | 15 Days |
| Cycle 6 | 15 Days |
| **Total** | **83 Days (≈12 weeks)** |

### Cycle Calculation Logic
```typescript
// Cycle 1: Start Date + 8 Days
Cycle 1 End = Start Date + 8 Days

// Cycles 2-6: Each 15 Days
Cycle 2 End = Cycle 1 End + 15 Days
Cycle 3 End = Cycle 2 End + 15 Days
// ... and so on
```

---

## 3. Diet Plan Cycle Tracker

### Component
`src/components/dietitian/diet-plan-cycle-tracker.tsx`

### Features
- Visual timeline showing all 6 cycles
- Progress tracking for each cycle
- Status indicators: Completed, Active, Upcoming
- Days remaining counter for active cycle
- Overall progress percentage
- Color-coded cycle status:
  - **Green** - Completed
  - **Dark** - Active
  - **Gray** - Upcoming

### Usage
```tsx
<DietPlanCycleTracker
  startDate={new Date('2024-03-11')}
  currentDate={new Date()}
/>
```

---

## 4. Refer to Doctor Feature

### Component
`src/components/dietitian/refer-doctor-modal.tsx`

### Fields
- **Select Doctor** (Required) - Dropdown with doctor list
- **Consultation Reason** (Required) - Textarea for detailed reason
- **Additional Notes** (Optional) - Extra context
- **Priority** (Optional):
  - Low - Routine follow-up
  - Medium - Within a week
  - High - Urgent attention

### Doctor List
- Dr. Rajesh Kumar - Endocrinologist
- Dr. Priya Sharma - Cardiologist
- Dr. Amit Patel - General Physician
- Dr. Sneha Rao - Gastroenterologist

### Workflow
1. Dietitian clicks "Refer to Doctor" in session
2. Fills out referral form
3. Sends referral
4. Doctor receives notification
5. Creates consultation assignment

---

## 5. Consultation History Enhancement

### Component
`src/components/dietitian/consultation-timeline.tsx`

### Timeline Format
Enhanced history display with:
- **Event Types**:
  - 🗓️ Consultation
  - 🍎 Diet Plan
  - 📄 Follow-up
  - 👨‍⚕️ Referral
  - 📈 Progress

### Timeline Features
- Chronological event display
- Color-coded event types
- Expandable event details
- Metadata display (doctor, plan type, weight, notes)
- Export functionality
- Load more pagination

### Example Timeline
```
Jan 10 – Initial Consultation
Jan 18 – Diet Plan Sent (15-day Custom Plan)
Feb 02 – Follow-up Consultation
Feb 18 – Diet Plan Updated (Modified 15-day Plan)
Mar 05 – Doctor Referral (Dr. Rajesh Kumar)
```

---

## 6. Patient Requests Module

### Route
`/dashboard/dietitian/patient-requests`

### Page
`src/app/dashboard/dietitian/patient-requests/page.tsx`

### Components
- `PatientRequestList` - Main request table
- `RequestActionModal` - Confirm/Reschedule modal

### Features

#### Request Table
| Patient | Request Date | Reason | Priority | Status | Actions |
|---------|-------------|--------|----------|--------|---------|
| Patient name | Date | Consultation reason | Low/Med/High | Pending/Confirmed | Confirm/Reschedule |

#### Statistics Cards
- **Pending Requests** - Count of pending
- **Confirmed** - Count of confirmed
- **Total Requests** - Overall count

#### Actions Available

##### 1. Confirm Request
- Select Date (calendar picker)
- Select Time (dropdown with time slots)
- Assign To (Doctor/Dietitian dropdown)
- Sends confirmation notification

##### 2. Reschedule Request
- New Date selection
- New Time selection
- Reason for rescheduling (required)
- Sends reschedule notification

### Time Slots Available
```
09:00 AM, 09:30 AM, 10:00 AM, 10:30 AM, 11:00 AM, 11:30 AM
12:00 PM, 12:30 PM, 02:00 PM, 02:30 PM, 03:00 PM, 03:30 PM
04:00 PM, 04:30 PM, 05:00 PM, 05:30 PM
```

---

## 7. Patient Management Enhancement

### Location
`src/app/dashboard/dietitian/patients/[id]/page.tsx`

### New Button Added
**Start Diet Plan** button in patient details header

### Features
- Same Monday calendar picker functionality
- Starts diet cycle for patient
- Tracks diet plan cycles
- Shows in patient overview

### Button Location
Next to "Message" and "Schedule" buttons in patient header

---

## 8. New Components Created

### Complete Component List

1. **MondayCalendarPicker** (`monday-calendar-picker.tsx`)
   - Monday-only date selection
   - Quick select options
   - Cycle schedule preview

2. **DietPlanCycleTracker** (`diet-plan-cycle-tracker.tsx`)
   - Visual cycle timeline
   - Progress tracking
   - Status indicators

3. **ReferDoctorModal** (`refer-doctor-modal.tsx`)
   - Doctor selection
   - Referral form
   - Priority setting

4. **ConsultationTimeline** (`consultation-timeline.tsx`)
   - Event timeline
   - Color-coded events
   - Expandable details

5. **PatientRequestList** (`patient-request-list.tsx`)
   - Request table
   - Search and filter
   - Action buttons

6. **RequestActionModal** (`request-action-modal.tsx`)
   - Confirm/Reschedule forms
   - Date/Time selection
   - Provider assignment

### Component Exports
All components exported from `src/components/dietitian/index.ts`

---

## 9. API Integration

### Types
`src/types/dietitian-api.ts`

### API Endpoints

#### POST /api/dietitian/doctor-referral
Create doctor referral
```typescript
Request: {
  patientId: string
  doctorId: string
  consultationReason: string
  notes?: string
  priority: "low" | "medium" | "high"
}
```

#### POST /api/dietitian/diet-plan/start
Start diet plan cycle
```typescript
Request: {
  patientId: string
  startDate: Date
  planType: "15days" | "90days" | "custom"
}
```

#### PUT /api/dietitian/diet-plan/update
Update diet plan
```typescript
Request: {
  dietPlanId: string
  meals?: DietMeal[]
  isConfirmed?: boolean
}
```

#### GET /api/dietitian/consultation-history
Get consultation history
```typescript
Query: {
  patientId: string
  limit?: number
  offset?: number
}
```

#### POST /api/dietitian/patient-request/confirm
Confirm patient request
```typescript
Request: {
  requestId: string
  scheduledDate: Date
  scheduledTime: string
  assignedTo: string
}
```

#### POST /api/dietitian/patient-request/reschedule
Reschedule patient request
```typescript
Request: {
  requestId: string
  newDate: Date
  newTime: string
  reason: string
}
```

### Custom Hook
`src/hooks/use-dietitian-api.ts`

#### Available Methods
```typescript
const {
  loading,
  error,
  createDoctorReferral,
  startDietPlan,
  updateDietPlan,
  getConsultationHistory,
  confirmPatientRequest,
  reschedulePatientRequest
} = useDietitianApi()
```

---

## 10. Existing Features Preserved

### No Changes To
- ✅ Appointment list
- ✅ Start Session button
- ✅ Existing routing
- ✅ Video consultation interface
- ✅ Adherence tracking
- ✅ Patient information display
- ✅ Consultation notes
- ✅ Existing diet plan display

---

## 11. UI/UX Improvements

### Design System
- Consistent color scheme with existing design
- Modern gradient backgrounds
- Smooth animations with Framer Motion
- Responsive layouts
- Accessible components
- Toast notifications for user feedback

### Color Coding
- **Emerald/Green** - Diet plans, confirmations
- **Blue** - Referrals, information
- **Amber/Orange** - Pending, warnings
- **Rose/Red** - Urgent, high priority
- **Slate** - Primary actions, neutral

### Icons
Using Lucide React icons throughout:
- Calendar, Clock - Scheduling
- Apple, Utensils - Diet plans
- UserPlus - Referrals
- CheckCircle2 - Confirmations
- TrendingUp - Progress

---

## 12. Testing Checklist

### Session Page
- [ ] Start Diet Plan button opens Monday calendar
- [ ] Refer to Doctor button opens referral modal
- [ ] Edit Diet Plan makes fields editable
- [ ] Confirm Diet Plan locks editing
- [ ] Confirmed badge shows after confirmation
- [ ] Individual meal edit buttons disabled after confirm

### Monday Calendar
- [ ] Only Mondays are selectable
- [ ] This Monday quick select works
- [ ] Next Monday quick select works
- [ ] Cycle schedule calculates correctly
- [ ] Confirm button starts diet plan

### Doctor Referral
- [ ] Doctor selection required
- [ ] Consultation reason required
- [ ] Priority selection works
- [ ] Referral sends successfully

### Patient Requests
- [ ] Request list displays correctly
- [ ] Search filters work
- [ ] Status filters work
- [ ] Confirm modal opens with correct data
- [ ] Reschedule modal opens with correct data
- [ ] Date/time selection works
- [ ] Provider assignment works

### Patient Details
- [ ] Start Diet Plan button visible
- [ ] Monday calendar opens
- [ ] Diet cycle starts correctly

---

## 13. Future Enhancements

### Potential Additions
1. Real-time notifications for referrals
2. Diet plan templates library
3. Automated cycle progression
4. Patient progress analytics
5. Bulk request management
6. Calendar integration (Google, Outlook)
7. WhatsApp/SMS notifications
8. Diet plan versioning
9. Collaborative diet planning
10. AI-powered meal suggestions

---

## 14. Summary

### Features Implemented ✅
1. ✅ Session page enhanced with new action buttons
2. ✅ Monday-only calendar picker for diet plan start
3. ✅ Diet plan cycle tracker (8 + 15×5 days)
4. ✅ Doctor referral system
5. ✅ Editable diet plan with confirmation
6. ✅ Enhanced consultation timeline
7. ✅ Patient requests module
8. ✅ Patient details page enhancements
9. ✅ API integration types and hooks
10. ✅ 6 new reusable components

### Total Files Created/Modified
- **New Components**: 6
- **Enhanced Pages**: 3
- **New Types**: 1
- **New Hooks**: 1
- **New Module**: 1 (Patient Requests)

### Lines of Code Added
- Components: ~2,000 lines
- Types: ~150 lines
- Hooks: ~200 lines
- Page enhancements: ~300 lines
- **Total**: ~2,650 lines

---

## 15. Developer Notes

### Component Architecture
All components follow React best practices:
- Functional components with hooks
- TypeScript for type safety
- Proper prop interfaces
- Error handling
- Loading states
- Responsive design

### State Management
- Local state with useState
- No global state needed (can be added later)
- Props drilling minimized
- Event handlers properly typed

### Styling
- Tailwind CSS utility classes
- Custom gradients for visual hierarchy
- Consistent spacing and sizing
- Dark mode ready (can be enabled)

### Performance
- Lazy loading ready
- Optimized re-renders
- Memoization where needed
- Efficient date calculations

---

## Contact & Support

For questions or issues with these enhancements, please refer to:
- Component documentation in code
- TypeScript interfaces for API contracts
- This README for feature overview

**Last Updated**: March 12, 2026
**Version**: 1.0.0
