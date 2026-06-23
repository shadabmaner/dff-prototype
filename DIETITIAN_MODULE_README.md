# Dietitian Module - Complete Implementation

## Overview
Comprehensive dietitian module for managing patient consultations, diet plans, appointments, and adherence tracking.

## 📁 Module Structure

```
src/
├── app/dashboard/dietitian/
│   ├── dashboard/page.tsx              # Dashboard with stats, charts, quick actions
│   ├── appointments/                   # Today's Appointments management
│   │   ├── page.tsx
│   │   └── appointments-client.tsx     # Tabs: Confirmed, Completed, Cancelled
│   ├── reschedule-requests/page.tsx    # Handle patient reschedule requests
│   ├── availability/page.tsx           # Calendar with drag-drop scheduling
│   ├── patients/                       # Patient Management
│   │   ├── page.tsx
│   │   ├── patients-list-client.tsx    # Filters: Active, Stage, Risk Level
│   │   ├── [id]/page.tsx              # Individual patient profile
│   │   └── patient-profile-integrated.tsx
│   ├── diet-plans/page.tsx            # Diet Plan Management
│   └── reports/page.tsx               # Analytics and reporting
│
└── components/dietitian/
    ├── stats-card.tsx                 # Reusable stats card component
    ├── add-consultation-link-modal.tsx # Video link management
    ├── quick-actions.tsx              # Dashboard quick actions
    ├── patient-profile.tsx            # Patient overview & health info
    ├── consultation-history.tsx       # Past consultations timeline
    ├── diet-plan-editor.tsx          # Weekly diet plan editor
    ├── diet-plan-templates.tsx       # Pre-built diet templates
    ├── diet-plan-pdf.tsx             # PDF generation & sharing
    ├── progress-charts.tsx           # Weight & BMI charts
    └── index.ts                      # Component exports
```

## 🎯 Features by Page

### 1. Dashboard (`/dashboard/dietitian/dashboard`)
**Features:**
- Summary cards: Total Patients, Active Patients, Today's Appointments, Adherence %
- Charts: Weight Progress, Diet Adherence, Appointment Trends, Program Stages
- Quick actions: Add Availability, Create Diet Plan, View Appointments

**Components:**
- `StatsCard` - Displays metrics with trends
- `QuickActions` - Action shortcuts
- Chart components using Recharts

### 2. Today's Appointments (`/dashboard/dietitian/appointments`)
**Features:**
- **Tabs:** Confirmed Appointments, Completed, Cancelled
- Add/Generate consultation links (video meetings)
- Start consultations
- Reschedule/Cancel appointments
- Add consultation notes
- View patient profiles

**Key Functionality:**
- Generate meeting links automatically
- Copy link to clipboard
- Send link to patient via notification
- Track appointment status

### 3. Reschedule Requests (`/dashboard/dietitian/reschedule-requests`)
**Features:**
- View all reschedule requests
- Filter by status: Pending, Approved, Rejected
- Actions: Approve, Reject, Suggest New Slot
- View patient details and reason
- Real-time status updates

### 4. Patient Management (`/dashboard/dietitian/patients`)
**Patient List Features:**
- Search by patient name
- Filters: Status (Active/Completed/Inactive), Program Stage (Month 1/2/3), Risk Level
- Summary cards: Active Patients, Completed Programs, High Risk Count
- Actions: View Profile, Book Appointment, Add Notes

**Patient Profile Features (with Tabs):**
- **Overview Tab:**
  - Basic information (name, age, contact)
  - Health details (height, weight, BMI, blood group)
  - Adherence tracking (Diet, Water, Exercise, Stress, Sleep)
  - Weight progress visualization

- **Diet Plan Tab:**
  - Weekly diet editor
  - Edit meals by day
  - Apply changes: Today only, All Mondays, Next 15 days
  - Calorie tracking per meal and daily total

- **Consultations Tab:**
  - Consultation history timeline
  - Notes from each session
  - Diet plan updates tracking
  - Next follow-up dates

- **Progress Tab:**
  - Weight change chart
  - BMI progress chart
  - Historical data visualization

- **Documents Tab:**
  - Generate diet plan PDF
  - Preview PDF
  - Send via App/WhatsApp/Email
  - Download PDF

### 5. Availability (`/dashboard/dietitian/availability`)
**Features:**
- Weekly calendar view
- Add/edit/delete time slots
- Drag & drop appointments to reschedule
- Slots by day with status (Available, Booked, Blocked)
- Visual status indicators

### 6. Diet Plan Management (`/dashboard/dietitian/diet-plans`)
**Features:**
- Pre-built templates:
  - Weight Loss Plan
  - Obesity Program
  - PCOS Diet
  - Diabetes Diet
  - Thyroid Care Plan
- Create custom templates
- Preview templates
- Duplicate templates
- Assign to patients
- Track usage statistics

### 7. Reports (`/dashboard/dietitian/reports`)
**Features:**
- Average diet compliance across portfolio
- Medication adherence metrics
- Exercise compliance stats
- Cohort breakdown (High Performers, On Track, Below Threshold)
- Top performing patients
- Export reports (PDF/Excel/CSV)

## 🔧 Technical Implementation

### State Management
- React hooks (`useState`, `useEffect`)
- Client-side filtering and sorting
- Real-time updates with toast notifications

### UI Components
All components use shadcn/ui:
- Cards, Badges, Buttons
- Tables with sorting
- Dialogs/Modals
- Tabs for organized navigation
- Progress bars
- Select dropdowns
- Checkboxes

### Charts & Visualization
- Recharts library
- Line charts (weight, BMI)
- Bar charts (adherence)
- Pie charts (program distribution)

### PDF Generation
- Diet plan PDF includes:
  - Patient information
  - Complete meal schedule
  - Calorie breakdown
  - Water intake guidelines
  - Special instructions

### Multi-channel Delivery
- App notifications
- WhatsApp integration
- Email delivery

## 🎨 Design System

### Color Coding
- **Green:** Success, Active, Good adherence
- **Yellow/Amber:** Warning, Medium risk
- **Red:** High risk, Critical
- **Blue:** Primary actions, Information

### Responsive Design
- Mobile-first approach
- Grid layouts adapt to screen size
- Touch-friendly controls

## 📊 Data Flow

### Diet Plan Editing Logic
When editing a meal (e.g., Monday breakfast):
1. Dietitian opens diet plan editor
2. Selects day and meal
3. Modifies meal items and calories
4. Chooses application scope:
   - **Today only:** Changes apply to current day
   - **All Mondays:** Changes apply to all future Mondays
   - **Next 15 days:** Patient receives same diet for 15 days
5. System updates plan and notifies patient

### Consultation Workflow
1. Patient books appointment
2. Appears in "Today's Appointments" (Confirmed tab)
3. Dietitian adds consultation link
4. Patient receives notification with link
5. Consultation happens (video/phone)
6. Dietitian updates diet plan during/after call
7. Diet plan sent to patient as PDF
8. Appointment moves to "Completed" tab
9. Patient tracks adherence
10. Dietitian monitors progress via dashboard

## 🔐 Access Control
- Role-based: Only `user_type: "dietitian"` can access
- Sidebar automatically shows dietitian-specific navigation

## 🚀 Next Steps / Future Enhancements

### Phase 2 Features
- [ ] Real-time chat with patients
- [ ] Meal photo uploads for verification
- [ ] AI-powered diet recommendations
- [ ] Integration with wearables (fitness trackers)
- [ ] Bulk actions for patient management
- [ ] Advanced analytics dashboard
- [ ] Custom report builder
- [ ] Appointment reminders (SMS/Email)
- [ ] Recipe library
- [ ] Grocery list generator

### Technical Improvements
- [ ] Add API integration
- [ ] Implement caching for better performance
- [ ] Add offline support
- [ ] Real-time updates with WebSockets
- [ ] Unit tests for components
- [ ] E2E tests for critical flows

## 📝 Notes

### Mock Data
Current implementation uses mock data. Replace with API calls:
- `mockPatients` → GET `/api/dietitian/patients`
- `mockAppointments` → GET `/api/dietitian/appointments`
- `templates` → GET `/api/dietitian/diet-templates`

### Environment Variables
No environment variables needed for frontend. Backend will require:
- Video meeting API keys (Zoom/Google Meet)
- WhatsApp Business API credentials
- Email service credentials (SendGrid/AWS SES)
- Storage for PDFs (AWS S3/CloudFlare R2)

## 🎓 Usage Guide

### For Dietitians

**Daily Workflow:**
1. Check Dashboard for overview
2. Review Today's Appointments
3. Add consultation links for upcoming appointments
4. Handle any reschedule requests
5. During consultations, update diet plans
6. Send updated diet plans to patients
7. Monitor patient adherence and progress
8. Review reports for high-risk patients

**Weekly Tasks:**
1. Update availability for next week
2. Review diet plan templates
3. Check patient progress charts
4. Generate weekly reports

**Monthly Tasks:**
1. Review overall portfolio performance
2. Update diet plan templates based on outcomes
3. Export monthly reports for management

## 🐛 Known Issues
None currently - this is a fresh implementation.

## 📞 Support
For issues or feature requests, contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** March 10, 2026  
**Module Status:** ✅ Complete & Ready for Testing
