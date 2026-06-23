# Patient Details Components

This directory contains modular, reusable components for the Patient Details page, refactored following senior-level best practices.

## Architecture Principles

### 1. **Single Responsibility Principle (SRP)**
Each component has one clear purpose and manages its own presentation logic.

### 2. **Component Composition**
Large UI sections are broken down into smaller, composable components that can be easily tested and maintained.

### 3. **Props Interface**
Every component has well-defined TypeScript interfaces for props, ensuring type safety and clear contracts.

### 4. **Separation of Concerns**
- **Presentation Components**: Handle UI rendering only (all components in this directory)
- **Container Components**: Handle data fetching and business logic (parent page)
- **Business Logic**: Kept in hooks and utility functions

## Component Catalog

### PatientHeader
**Purpose**: Displays patient basic information and primary action buttons.

**Props**:
- `patient`: Patient demographic data
- `enrollment`: Enrollment status and program info
- `patientAge`: Calculated patient age
- `metricsData`: Latest health metrics
- `bodyMeasurementGoals`: Goal tracking data
- `activeDietPlan`: Current diet plan details
- `upcomingHistoryCall`: Next scheduled history call
- Event handlers for all actions

**Responsibilities**:
- Display patient name, contact info, demographics
- Show enrollment status and current metrics
- Render action buttons (Set Goal, Start Diet Plan, View Guidelines, etc.)

---

### CareTeamSection
**Purpose**: Displays the assigned healthcare team members.

**Props**:
- `enrollment`: Contains assigned staff information

**Responsibilities**:
- Show assigned Doctor, Nutritionist, and Fitness Coach
- Display contact information for each team member
- Handle "Not assigned" states

---

### ConsultationTracking
**Purpose**: Shows appointment statistics and metrics.

**Props**:
- `historyCalls`: Array of completed history calls
- `upcomingAppointments`: Array of scheduled appointments

**Responsibilities**:
- Display count of history calls, upcoming consultations, total appointments
- Show last/next appointment dates
- Visualize metrics with color-coded cards

---

### ExerciseLogsCard
**Purpose**: Displays patient's exercise completion logs.

**Props**:
- `exerciseLogs`: Array of exercise log entries

**Responsibilities**:
- Render list of completed/unlocked exercises
- Show exercise metadata (date, duration, progress percentage)
- Handle empty state
- Scrollable list for large datasets

---

### DietPlanProgressCard
**Purpose**: Shows diet plan journey progress and timeline.

**Props**:
- `activeDietPlan`: Current active diet plan with progress
- `getProgramDay`: Helper function to calculate current day

**Responsibilities**:
- Display progress percentage and visual progress bar
- Show journey start/end dates
- Render plan summary if available
- Handle "no diet plan" state

---

### AppointmentCard
**Purpose**: Reusable card for displaying individual appointment details.

**Props**:
- `appointment`: Appointment data object
- `onReschedule`: Callback for reschedule action
- `onClick`: Callback for viewing appointment details

**Responsibilities**:
- Render appointment info (type, status, mode, date/time)
- Show context badges (History Call, status, mode)
- Provide reschedule button for eligible appointments
- Display appointment timeline icon with status-based styling

## Usage Example

```tsx
import {
  PatientHeader,
  CareTeamSection,
  ConsultationTracking,
  ExerciseLogsCard,
  DietPlanProgressCard,
  AppointmentCard,
  AssessmentSubmissionsCard,
  WeightTrackingCard,
  AppointmentsTimeline,
  SalesCallLogsCard,
  MindsetLogsCard,
  GoalSettingDrawer,
  RescheduleSheet,
  AssessmentDrawer,
  DietPlanModal,
  GuidelinesModal
} from "@/components/dietitian/patient-details";

export default function PatientDetailsPage() {
  // ... data fetching and state management
  
  return (
    <div className="space-y-6">
      <PatientHeader
        patient={patient}
        enrollment={enrollment}
        patientAge={patientAge}
        metricsData={metricsData}
        bodyMeasurementGoals={bodyMeasurementGoals}
        activeDietPlan={activeDietPlan}
        upcomingHistoryCall={upcomingHistoryCall}
        patientId={id}
        onSetGoal={() => setShowSetGoalDrawer(true)}
        onViewGoal={() => setShowViewGoalDrawer(true)}
        onStartDietPlan={() => setShowMondayCalendar(true)}
        onSelectDietPlan={() => setShowDietPlanModal(true)}
        onViewGuidelines={() => setShowGuidelineModal(true)}
        onViewAssessment={() => setShowAssessmentDrawer(true)}
        onScheduleCall={() => setShowRescheduleSheet(true)}
      />
      
      <CareTeamSection enrollment={enrollment} />
      
      <ConsultationTracking
        historyCalls={patientClinicalData?.data?.history_calls || []}
        upcomingAppointments={upcomingAppointments}
      />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <ExerciseLogsCard exerciseLogs={exerciseLogs} />
        <DietPlanProgressCard
          activeDietPlan={activeDietPlan}
          getProgramDay={getProgramDay}
        />
      </div>
    </div>
  );
}
---

### GoalSettingDrawer
**Purpose**: Sheet for setting body measurement goals for patients.

**Props**:
- `open`: Whether the drawer is open
- `onOpenChange`: Function to handle open/close
- `patientName`: Patient's full name
- `goalForm`: Current goal form data
- `goalFormErrors`: Form validation errors
- `onGoalFormChange`: Handler for form field changes
- `onGoalFormErrorClear`: Handler for clearing field errors
- `onSave`: Function to save goals
- `onCancel`: Function to cancel and reset form
- `isLoading`: Loading state for save operation

**Responsibilities**:
- Display 7 measurement input fields (weight, chest, waist, hips, arm, calf, muscle mass)
- Handle form validation and error display
- Show loading states during save
- Reset form on cancel
- Provide save/cancel actions

---

### RescheduleSheet
**Purpose**: Sheet for scheduling or rescheduling patient appointments.

**Props**:
- `open`: Whether the sheet is open
- `onOpenChange`: Function to handle open/close
- `patientName`: Patient's full name
- `rescheduleForm`: Current appointment form data
- `availableSlots`: Array of available time slots
- `isLoadingSlots`: Loading state for slot fetching
- `isRescheduling`: Loading state for reschedule operation
- `hasExistingAppointment`: Whether editing existing appointment
- `onFormChange`: Handler for form field changes
- `onReschedule`: Function to submit reschedule
- `onCancel`: Function to cancel and reset form

**Responsibilities**:
- Display appointment booking form with date/time selection
- Show available time slots based on selected date
- Handle appointment type and mode selection
- Show meeting link field for video calls
- Display reason textarea for optional notes
- Handle both new scheduling and rescheduling workflows

---

### AssessmentDrawer
**Purpose**: Drawer for viewing patient assessment submissions and details.

**Props**:
- `open`: Whether the drawer is open
- `onOpenChange`: Function to handle open/close
- `assessmentSubmissions`: Array of assessment submissions
- `selectedAssessment`: Currently selected assessment for detailed view
- `onSelectAssessment`: Function to select/deselect assessment

**Responsibilities**:
- Display list of completed assessments with metadata
- Show Q&A pairs for each assessment
- Provide detailed view for individual assessments
- Handle empty states when no assessments exist
- Format and display assessment responses properly

---

### DietPlanModal
**Purpose**: Modal for selecting and assigning diet plan templates to patients.

**Props**:
- `open`: Whether the modal is open
- `onOpenChange`: Function to handle open/close
- `dietTemplates`: Array of available diet templates
- `selectedTemplateId`: Currently selected template ID
- `isLoadingTemplates`: Loading state for template fetching
- `onTemplateSelect`: Function to select a template
- `onAssignTemplate`: Function to assign selected template

**Responsibilities**:
- Display searchable list of diet templates
- Show template metadata (duration, calories, active status)
- Handle template selection with visual feedback
- Show loading and empty states
- Provide assign/cancel actions

---

### GuidelinesModal
**Purpose**: Modal for managing and assigning guideline PDFs to diet plans.

**Props**:
- `open`: Whether the modal is open
- `onOpenChange`: Function to handle open/close
- `dietPlanId`: ID of the current diet plan

**Responsibilities**:
- Display searchable list of guideline documents
- Show document metadata (title, category, file type)
- Handle document assignment/unassignment
- Provide external links to view documents
- Show loading and empty states with animations

## Benefits of This Structure

### Maintainability
- Each component can be modified independently
- Clear boundaries prevent cascading changes
- Easy to locate specific UI logic

### Testability
- Components can be unit tested in isolation
- Props interfaces make it easy to mock data
- Pure presentation logic simplifies test scenarios

### Reusability
- Components like `AppointmentCard` can be used in multiple contexts
- Consistent UI patterns across the application
- Shared components reduce code duplication

### Scalability
- New features can be added as new components
- Components can be refactored without affecting others
- Clear structure makes onboarding easier for new developers

### Code Review
- Smaller components are easier to review
- Changes are isolated and focused
- Clear props interfaces document component contracts

## Best Practices Followed

1. **TypeScript**: Full type safety with interface definitions
2. **Descriptive Naming**: Component and prop names clearly indicate purpose
3. **Consistent Patterns**: Similar components follow similar structures
4. **Error Handling**: Proper null/undefined checks and fallback states
5. **Accessibility**: Semantic HTML and proper ARIA attributes where needed
6. **Performance**: Avoided unnecessary re-renders with proper prop design
7. **Documentation**: Each component has clear documentation above
8. **Barrel Exports**: Clean imports via index.ts

## Next Steps for Full Refactoring

The main page file still contains:
- All data fetching logic (hooks)
- State management (useState, useEffect)
- Business logic (form handlers, mutations)
- Modal/Drawer management
- Diet plan editing logic

**Recommended Further Refactoring**:
1. Extract form handlers into custom hooks (`usePatientForms`, `useDietPlanActions`)
2. Create separate components for modals/drawers
3. Move diet plan rendering logic to dedicated components
4. Create a `PatientDetailsProvider` context for shared state
5. Extract appointment timeline into its own component
6. Create reusable form components for goal setting and meal editing

## File Structure
```
src/components/dietitian/patient-details/
├── README.md                      # This file
├── index.ts                       # Barrel export
├── PatientHeader.tsx              # Main patient info and actions
├── CareTeamSection.tsx            # Healthcare team display
├── ConsultationTracking.tsx       # Appointment metrics
├── ExerciseLogsCard.tsx           # Exercise log list
├── DietPlanProgressCard.tsx       # Diet plan progress
├── AppointmentCard.tsx            # Reusable appointment card
├── AssessmentSubmissionsCard.tsx  # Assessment submissions list
├── WeightTrackingCard.tsx         # Weight tracking and BMI
├── AppointmentsTimeline.tsx       # Appointments organized by status
├── SalesCallLogsCard.tsx          # Sales call history
├── MindsetLogsCard.tsx            # Mindset journey tracking
├── GoalSettingDrawer.tsx          # Body measurement goals form
├── RescheduleSheet.tsx            # Appointment scheduling sheet
├── AssessmentDrawer.tsx           # Assessment viewing drawer
├── DietPlanModal.tsx              # Diet template selection modal
└── GuidelinesModal.tsx             # Guidelines PDF management modal
```
