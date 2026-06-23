# Assessment Module - Implementation Documentation

## 📋 Overview

The Assessment Module has been successfully implemented for the **Admin role only**. This module allows administrators to create, manage, and configure assessment questions and forms for different medical specialities.

---

## 🎯 Features Implemented

### ✅ Questions Management
- Create assessment questions with various types (text, number, boolean, radio, checkbox, dropdown)
- Add validation rules for number fields (min, max, unit)
- Mark questions as required/optional
- Add voice prompts for voice-based interfaces
- Manage options for selection-type questions (radio, checkbox, dropdown)
- Edit and delete questions
- Filter questions by speciality

### ✅ Forms Management
- Create assessment forms for specific specialities
- Link multiple questions to forms
- Configure form metadata (description, estimated time)
- Version control for forms
- Activate/deactivate forms (only one active form per speciality)
- View form details with all linked questions
- Edit and delete forms

---

## 📁 Files Created

### 1. Type Definitions
**Location:** `src/types/assessment.ts`
- Defines all TypeScript interfaces for assessment data structures
- Includes types for questions, options, forms, submissions, and API requests

### 2. API Client
**Location:** `src/lib/api/assessment-client.ts`
- Contains all API endpoint functions
- Handles admin endpoints (create, update, delete, activate)
- Handles patient endpoints (get active form, submit assessment)
- Uses axios with authentication interceptors

### 3. React Hooks
**Location:** `src/hooks/use-assessment.ts`
- Custom hooks using React Query for data fetching and mutations
- Automatic cache invalidation on mutations
- Hooks for questions, forms, options, and submissions

### 4. UI Components

#### Main Page
**Location:** `src/app/dashboard/admin/assessments/page.tsx`
- Tab-based interface for Questions and Forms
- Consistent with existing admin UI patterns

#### Questions Management
**Location:** `src/app/dashboard/admin/assessments/components/questions-management.tsx`
- Full CRUD operations for questions
- Options manager for selection-type questions
- Validation rules editor for number fields
- Speciality filter

#### Forms Management
**Location:** `src/app/dashboard/admin/assessments/components/forms-management.tsx`
- Full CRUD operations for forms
- Question linker to associate questions with forms
- Form viewer to preview form structure
- Form activation/deactivation

### 5. Navigation Update
**Location:** `src/components/layout/sidebar.tsx`
- Added "Assessment Management" menu item to Admin section
- Icon: ClipboardList
- Route: `/dashboard/admin/assessments`

---

## 🔗 API Endpoints Used

### Admin Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/admin/assessment/questions` | Create question |
| POST | `/admin/assessment/questions/:id/options` | Add option to question |
| PATCH | `/admin/assessment/questions/:id` | Update question |
| DELETE | `/admin/assessment/questions/:id` | Delete question |
| GET | `/admin/assessment/questions?speciality_id=:id` | Get questions by speciality |
| POST | `/admin/assessment/forms` | Create form |
| PATCH | `/admin/assessment/forms/:id` | Update form |
| DELETE | `/admin/assessment/forms/:id` | Delete form |
| POST | `/admin/assessment/forms/:id/questions` | Link questions to form |
| PATCH | `/admin/assessment/forms/:id/activate` | Activate form |
| GET | `/admin/assessment/forms?speciality_id=:id` | Get forms by speciality |
| GET | `/admin/assessment/forms/:id` | Get form details |

### Helper Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/specialities` | Get all specialities |

---

## 🎨 UI Components Used

The implementation uses the existing UI component library:

- **Card, CardContent, CardHeader, CardTitle, CardDescription** - Layout
- **Button** - Actions
- **Sheet, SheetContent, SheetHeader, SheetFooter** - Drawer/Modal
- **Input, Textarea** - Form inputs
- **Label** - Form labels
- **Select, SelectContent, SelectItem, SelectTrigger, SelectValue** - Dropdowns
- **Switch** - Toggle switches
- **Checkbox** - Checkboxes
- **Badge** - Status indicators
- **AlertDialog** - Confirmation dialogs
- **Tabs, TabsList, TabsTrigger, TabsContent** - Tab navigation

---

## 🚀 How to Use

### For Admin Users

1. **Navigate to Assessment Management**
   - Login as admin user
   - Go to sidebar → Admin → Assessment Management

2. **Create Questions**
   - Select "Questions" tab
   - Choose a speciality from dropdown
   - Click "Add Question"
   - Fill in question details:
     - Field Key (unique identifier)
     - Label (display text)
     - Type (text, number, boolean, radio, checkbox, dropdown)
     - Required (yes/no)
     - Voice Prompt (optional)
     - Validation rules (for number type)
   - Click "Create"
   - For selection types (radio, checkbox, dropdown):
     - Click settings icon on question card
     - Add options with text and value
     - Options can be reordered and deleted

3. **Create Forms**
   - Select "Forms" tab
   - Choose a speciality from dropdown
   - Click "Create Form"
   - Fill in form details:
     - Form Name
     - Version
     - Description (optional)
     - Estimated Time (optional)
   - Click "Create"
   - Click settings icon on form card to link questions
   - Select questions to include in form
   - Click "Save"

4. **Activate Forms**
   - Only one form can be active per speciality
   - Click "Activate Form" button on desired form
   - Previous active form will be automatically deactivated

5. **View Form Details**
   - Click list icon on form card
   - View all linked questions in order
   - See question types, options, and requirements

---

## 🔐 Access Control

- **Admin Role Only**: All assessment management features are restricted to users with `admin` or `superadmin` role
- **Role Hierarchy**: Defined in `src/contexts/auth-context.tsx`
- **Protected Routes**: Admin dashboard routes are protected by authentication middleware

---

## 🎯 Question Types

| Type | Description | Use Case |
|------|-------------|----------|
| **text** | Free text input | Names, descriptions, comments |
| **number** | Numeric input with validation | Height, weight, age, measurements |
| **boolean** | Yes/No toggle | Binary questions (Do you smoke?) |
| **radio** | Single selection from options | Gender, marital status |
| **checkbox** | Multiple selections | Medical conditions, symptoms |
| **dropdown** | Dropdown selection | Long list of options |

---

## 📊 Data Flow

```
Admin Creates Question
    ↓
Question stored in database
    ↓
Admin Creates Form
    ↓
Admin Links Questions to Form
    ↓
Admin Activates Form
    ↓
Form becomes available to patients (via patient endpoints)
    ↓
Patient Submits Assessment
    ↓
Responses stored in database
```

---

## 🔄 State Management

- **React Query** for server state management
- **Automatic cache invalidation** on mutations
- **Optimistic updates** for better UX
- **Loading states** for all async operations
- **Error handling** with toast notifications

---

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop and mobile
- **Loading States**: Spinners during API calls
- **Error Messages**: User-friendly error notifications
- **Confirmation Dialogs**: Prevent accidental deletions
- **Empty States**: Helpful messages when no data exists
- **Form Validation**: Client-side validation before submission
- **Toast Notifications**: Success/error feedback
- **Consistent Styling**: Matches existing admin UI patterns

---

## 🧪 Testing Checklist

### Questions Management
- ✅ Can select speciality
- ✅ Can create questions of all types
- ✅ Can add validation rules for number fields
- ✅ Can mark questions as required
- ✅ Can add voice prompts
- ✅ Can edit questions
- ✅ Can delete questions
- ✅ Can add options to selection-type questions
- ✅ Can delete options
- ✅ Options display in correct order

### Forms Management
- ✅ Can select speciality
- ✅ Can create forms
- ✅ Can add metadata (description, estimated time)
- ✅ Can link questions to forms
- ✅ Can unlink questions from forms
- ✅ Can view form details
- ✅ Can edit forms
- ✅ Can delete forms
- ✅ Can activate forms
- ✅ Only one form active per speciality
- ✅ Questions display in correct order

### Navigation
- ✅ Assessment Management appears in admin sidebar
- ✅ Route works correctly
- ✅ Only visible to admin users

---

## 🔧 Environment Variables

Ensure the following environment variable is set:

```env
NEXT_PUBLIC_API_URL=https://dev-api.drapp.onpointsoft.com
```

Or for local development:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 📝 API Response Examples

### Create Question Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "speciality_id": "uuid-of-speciality",
  "field_key": "height",
  "label": "What is your height?",
  "type": "number",
  "required": true,
  "voice_prompt": "Please tell me your height in centimeters",
  "validation_json": {
    "min": 100,
    "max": 250,
    "unit": "cm"
  },
  "created_at": "2026-03-24T06:28:00.000Z",
  "updated_at": "2026-03-24T06:28:00.000Z"
}
```

### Get Active Form Response
```json
{
  "id": "form-uuid",
  "speciality_id": "speciality-uuid",
  "name": "Initial Health Assessment",
  "version": 1,
  "is_active": true,
  "metadata": {
    "description": "Basic health questionnaire",
    "estimated_time": "10 minutes"
  },
  "questions": [
    {
      "id": "question-uuid-1",
      "field_key": "height",
      "label": "What is your height?",
      "type": "number",
      "required": true,
      "display_order": 1,
      "options": []
    }
  ]
}
```

---

## 🐛 Known Issues & Limitations

1. **Lint Warning**: `bg-gradient-to-br` class warning can be ignored - it's a false positive from the linter
2. **Question Reordering**: Currently questions are ordered by display_order, but drag-and-drop reordering is not implemented
3. **Bulk Operations**: No bulk delete or bulk edit functionality
4. **Question Templates**: No template system for commonly used questions
5. **Form Duplication**: No ability to duplicate existing forms

---

## 🚀 Future Enhancements

1. **Drag-and-Drop Reordering**: Allow admins to reorder questions visually
2. **Question Templates**: Pre-built question templates for common assessments
3. **Form Duplication**: Clone existing forms to create new versions
4. **Conditional Logic**: Show/hide questions based on previous answers
5. **Form Preview**: Preview form as patients would see it
6. **Analytics Dashboard**: View submission statistics and completion rates
7. **Export/Import**: Export forms as JSON and import them
8. **Multi-language Support**: Translate questions and forms
9. **Rich Text Editor**: Support formatting in questions and descriptions
10. **File Upload Questions**: Allow patients to upload documents

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: Questions not loading
- **Solution**: Check if speciality is selected and API endpoint is correct

**Issue**: Cannot activate form
- **Solution**: Ensure form has at least one question linked

**Issue**: Options not appearing
- **Solution**: Verify question type is radio, checkbox, or dropdown

**Issue**: API errors
- **Solution**: Check network tab, verify authentication token, check API base URL

### Debug Mode

To enable debug logging, open browser console and check:
- Network requests to `/api/v1/admin/assessment/*`
- React Query DevTools (if installed)
- Console errors and warnings

---

## 📚 Related Documentation

- Main API Documentation: `ASSESSMENT_MODULE_DOCUMENTATION.md`
- Frontend Integration Guide: Provided in the original MD file
- Authentication: `src/contexts/auth-context.tsx`
- API Client: `src/lib/api-client.ts`

---

## ✅ Implementation Summary

The Assessment Module is now fully functional for admin users with the following capabilities:

1. ✅ **Complete CRUD operations** for questions and forms
2. ✅ **Speciality-based filtering** for better organization
3. ✅ **Multiple question types** with validation support
4. ✅ **Options management** for selection-type questions
5. ✅ **Form activation system** with single active form per speciality
6. ✅ **Modern, responsive UI** consistent with existing design
7. ✅ **Type-safe implementation** with TypeScript
8. ✅ **Optimized data fetching** with React Query
9. ✅ **User-friendly error handling** and notifications
10. ✅ **Integrated navigation** in admin sidebar

---

**Last Updated**: March 24, 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Access**: Admin Role Only
