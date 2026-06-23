# Lead Details - Dietitian Theme Implementation

## Overview
Restructured the lead details page to match the dietitian patient details theme with gradient cards, hover animations, and modern UI patterns.

---

## 🎨 Design Elements Applied

### **1. Background & Layout**
- **Background**: `bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50`
- **Spacing**: Consistent padding (p-8) and gap spacing (gap-5, gap-6)
- **Card Style**: Borderless with gradient backgrounds and shadow effects

### **2. Header Section**
Matches dietitian page header structure:
- Breadcrumb with dot separator
- User avatar with gradient background (based on lead stage)
- Large title (3xl/4xl) with tracking-tight
- Metadata badges with proper spacing
- Action buttons (Message, Call Lead)

### **3. Info Cards Grid**
4-column responsive grid with gradient cards:
- **Contact**: Blue gradient (`from-blue-50 to-indigo-50`)
- **Assigned To**: Emerald gradient (`from-emerald-50 to-teal-50`)
- **Created**: Amber gradient (`from-amber-50 to-orange-50`)
- **Last Contact**: Rose gradient (`from-rose-50 to-pink-50`)

Each card features:
- Hover shadow transition (`hover:shadow-xl`)
- Icon with uppercase label
- Primary value in bold
- Secondary value in lighter color

### **4. Timeline with Hover Effects**
Professional timeline matching dietitian journey:
- Vertical line: `bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200`
- Timeline dots: Color-coded, scale on hover
- Event cards: Translate on hover
- Expandable details: Motion animation with gradient backgrounds
- Event type icons in gradient circles

### **5. Color Scheme by Event Type**

| Event Type | Gradient | Icon Gradient | Dot Color | Text Color |
|------------|----------|---------------|-----------|------------|
| Follow-up | amber-50 to orange-50 | amber-500 to orange-500 | bg-amber-500 | text-amber-700 |
| Call | blue-50 to indigo-50 | blue-500 to indigo-500 | bg-blue-500 | text-blue-700 |
| Activity | purple-50 to violet-50 | purple-500 to violet-500 | bg-purple-500 | text-purple-700 |
| Default | slate-50 to gray-50 | slate-400 to gray-400 | bg-slate-400 | text-slate-600 |

---

## 📁 Files Modified

### **1. Page Component**
**File**: `src/app/dashboard/sales/leads/[id]/page.tsx`

Changed import from:
```tsx
import { LeadDetails } from "@/components/sales/lead-details"
```

To:
```tsx
import { LeadDetailsDietTheme } from "@/components/sales/lead-details-diet-theme"
```

### **2. New Component**
**File**: `src/components/sales/lead-details-diet-theme.tsx`

Complete redesign with:
- Framer Motion animations
- Gradient-based design system
- Timeline hover states
- API integration with loading states
- Responsive grid layouts

---

## 🎯 Key Features

### **Gradient Card System**
All cards use gradient backgrounds with matching themes:
```tsx
bg-gradient-to-br from-{color}-50 to-{color2}-50
```

Icon containers:
```tsx
bg-gradient-to-br from-{color}-500 to-{color2}-500
```

### **Timeline Hover Interactions**
On hover:
1. Timeline dot scales to 125% with enhanced shadow
2. Event card translates 8px to the right
3. Icon container scales to 110%
4. Detail card expands with motion animation

### **Framer Motion Integration**
```tsx
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
>
  {/* Hover details */}
</motion.div>
```

### **Stage-Based Avatar Colors**
Lead stage determines avatar gradient:
- **NEW**: Blue to Indigo
- **CONTACTED**: Purple to Violet
- **FOLLOW_UP**: Amber to Orange
- **HOT**: Rose to Pink
- **CONVERTED**: Emerald to Teal
- **DROPPED**: Slate to Gray

---

## 🚀 Usage

The component automatically replaces the old LeadDetails when the page loads. No additional configuration needed.

### Props
```tsx
interface LeadDetailsDietThemeProps {
  lead: Lead
  backHref: string
  backLabel?: string
}
```

### Example
```tsx
<LeadDetailsDietTheme 
  lead={lead} 
  backHref="/dashboard/sales/leads" 
  backLabel="Back to leads"
/>
```

---

## 📊 Layout Structure

```
┌─────────────────────────────────────────────┐
│ Header (Avatar, Name, Badges, Actions)      │
└─────────────────────────────────────────────┘

┌───────┬───────┬───────┬───────┐
│Contact│Assign │Created│Contact│  Info Cards (4 col)
└───────┴───────┴───────┴───────┘

┌──────────────────┬──────┐
│ Lead Information │Follow│  Overview Section
│                  │ Up   │  (2:1 grid)
└──────────────────┴──────┘

┌──────────────────────────┐
│ Activity Timeline         │  Timeline with hover
│ (Vertical with dots)      │  effects and details
└──────────────────────────┘

┌──────────────────────────┐
│ Call History              │  Call logs table
└──────────────────────────┘
```

---

## 🎨 Design Patterns from Dietitian Page

### **1. Typography**
- **Page Title**: `text-3xl md:text-4xl font-bold text-slate-900 tracking-tight`
- **Section Headers**: `text-lg font-bold text-slate-900`
- **Card Labels**: `text-[10px] uppercase tracking-[0.15em] font-semibold`
- **Values**: `text-sm font-bold text-slate-900`

### **2. Spacing**
- **Container**: `space-y-6` (24px vertical gaps)
- **Section**: `space-y-4` (16px vertical gaps)
- **Grid gaps**: `gap-5` or `gap-6` (20-24px)
- **Card padding**: `p-6` (24px all sides)

### **3. Shadows**
- **Default cards**: `shadow-lg`
- **Hover state**: `hover:shadow-xl`
- **Timeline dots**: `shadow-lg` (xl on hover)
- **Icon containers**: `shadow-md` (lg on hover)

### **4. Borders**
- **Cards**: `border-0` (borderless design)
- **Sections**: `border border-slate-200/80` (subtle borders)
- **Separators**: `border-t border-slate-100`

### **5. Transitions**
All interactive elements:
```tsx
transition-all duration-300
```

Hover transforms:
```tsx
hover:shadow-xl transition-shadow
isHovered && "transform translate-x-2"
isHovered && "scale-110 shadow-lg"
```

---

## 🔄 Timeline Event Display

### **Event Card Structure**
```tsx
┌─────────────────────────────────────┐
│ ● [Icon] Event Title   [Badges]     │
│   Timestamp                          │
│                                      │
│ [Hover: Expanded Details Card]      │
│ - Notes                              │
│ - Performed By | Duration            │
│ - Follow-up Date | Outcome           │
└─────────────────────────────────────┘
```

### **Hover State**
- Background changes to event-specific gradient
- Shows additional metadata
- Animates in smoothly with Framer Motion

---

## 🎨 Color Palette

### **Background Gradients**
- **Blue**: `from-blue-50 to-indigo-50`
- **Emerald**: `from-emerald-50 to-teal-50`
- **Amber**: `from-amber-50 to-orange-50`
- **Rose**: `from-rose-50 to-pink-50`
- **Purple**: `from-purple-50 to-violet-50`
- **Slate**: `from-slate-50 to-gray-50`

### **Icon Gradients**
- **Blue**: `from-blue-500 to-indigo-500`
- **Emerald**: `from-emerald-500 to-teal-500`
- **Amber**: `from-amber-500 to-orange-500`
- **Rose**: `from-rose-500 to-pink-500`
- **Purple**: `from-purple-500 to-violet-500`
- **Slate**: `from-slate-400 to-gray-400`

---

## 📦 Dependencies

All dependencies already installed:
- `framer-motion` - Animations
- `@tanstack/react-query` - Data fetching
- `lucide-react` - Icons
- `@/lib/call-desk-api` - Timeline API
- `@/components/ui/*` - UI primitives

---

## ✨ Animations & Interactions

### **1. Timeline Hover**
```tsx
onMouseEnter={() => setHoveredTimelineItem(event.id)}
onMouseLeave={() => setHoveredTimelineItem(null)}
```

### **2. Scale Animation**
```tsx
isHovered && "scale-125 shadow-xl"
isHovered && "scale-110 shadow-lg"
```

### **3. Translate Animation**
```tsx
isHovered && "transform translate-x-2"
```

### **4. Framer Motion**
```tsx
initial={{ opacity: 0, y: -10 }}
animate={{ opacity: 1, y: 0 }}
```

---

## 🔧 Customization

### Change Event Colors
Edit the `EVENT_META` object:
```tsx
const EVENT_META: Record<string, TimelineVisual> = {
  new_event: {
    icon: YourIcon,
    gradient: "from-color-50 to-color2-50",
    iconGradient: "from-color-500 to-color2-500",
    dotClass: "bg-color-500",
    textColor: "text-color-700",
    label: "Your Label",
  },
}
```

### Modify Stage Colors
Update `stageConfig`:
```tsx
const stageConfig: Record<string, {...}> = {
  YOUR_STAGE: {
    label: "Stage Name",
    gradient: "from-color-50 to-color2-50",
    iconGradient: "from-color-500 to-color2-500",
    textColor: "text-color-700"
  },
}
```

---

## 🎯 Benefits

### **Visual Consistency**
- Matches dietitian patient details exactly
- Unified design language across modules
- Professional gradient-based aesthetics

### **Better UX**
- Hover interactions provide context
- Smooth animations enhance feel
- Clear visual hierarchy

### **Modern Design**
- Borderless card design
- Gradient backgrounds
- Professional shadows and spacing
- Responsive grid layouts

---

## 📝 Notes

- The component uses the same API integration as `LeadDetailsEnhanced`
- Timeline data fetches from `/api/v1/sales/leads/{leadId}/timeline`
- Loading and error states match dietitian page patterns
- All animations use CSS transitions and Framer Motion
- Fully responsive with mobile-optimized layouts

---

## ✅ Implementation Checklist

- [x] Apply gradient background to page
- [x] Create 4-column info cards with gradients
- [x] Add stage-based avatar colors
- [x] Implement hover effects on timeline
- [x] Add Framer Motion animations
- [x] Match typography styles
- [x] Apply shadow hierarchy
- [x] Create expandable timeline details
- [x] Integrate API with loading states
- [x] Make fully responsive
- [x] Match dietitian color scheme

---

## 🚀 Result

A completely redesigned lead details page that perfectly matches the dietitian patient details theme with:
- Professional gradient-based design
- Interactive timeline with hover states
- Smooth Framer Motion animations
- API-integrated real-time data
- Responsive layout
- Modern, borderless card design

The new design provides a cohesive experience across the application while maintaining all functionality from the original component.
