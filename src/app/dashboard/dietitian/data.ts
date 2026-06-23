export type DietPlanMeal = {
  slot: "Breakfast" | "Mid-morning" | "Lunch" | "Evening Snack" | "Dinner"
  items: string[]
  portion: string
  alternatives?: string[]
  notes?: string
}

export type DietPlan = {
  id: string
  patientId: string
  title: string
  startDate: string
  endDate: string
  dailyCalories: number
  notes: string
  restrictions: string[]
  attachments?: string[]
  meals: DietPlanMeal[]
  archived?: boolean
}

export type DietitianPatient = {
  id: string
  patientCode: string
  name: string
  age: number
  gender: "Male" | "Female"
  mobile: string
  batchName: string
  programName: string
  specialty: string
  programStatus: "Active" | "Pending" | "Completed" | "Paused"
  dietPlanStatus: "Created" | "Pending"
  compliancePercentage: number
  complianceGoal: number
  nextReviewDate: string
  reviewStatus: "Due" | "Overdue" | "Completed"
  enrollmentDate: string
  dietitianNotes: string
  doctorPrescription: string
  exercisePlan: string
  medicationAdherence: number
  exerciseCompliance: number
  paymentStatus: "Paid" | "Pending" | "Overdue"
  medicalSummary: string
  consultationNotes: string
  currentDietPlanId: string
  dietPlanHistoryIds: string[]
  complianceTrend: number[]
  weeklyCompliance: number[]
  missedMeals: string[]
  calorieVariance: number
  dailyMealCompliance: { label: string; percent: number }[]
  demographics: {
    city: string
    heightCm: number
    weightKg: number
  }
}

export type FollowUpReview = {
  id: string
  patientId: string
  patientName: string
  scheduledDate: string
  status: "Due" | "Completed" | "Overdue"
  notes: string
  nextReviewDate?: string
}

export type DietitianNotification = {
  id: string
  type: "assignment" | "plan" | "review" | "compliance"
  title: string
  description: string
  severity: "info" | "warning" | "critical"
  createdAt: string
  read?: boolean
}

export const dietPlans: DietPlan[] = [
  {
    id: "PLAN-901",
    patientId: "PDT-2401",
    title: "Metabolic Reset Phase 2",
    startDate: "2024-02-01",
    endDate: "2024-03-01",
    dailyCalories: 1500,
    notes: "Focus on high-fiber carbs and steady protein spikes.",
    restrictions: ["Refined sugar", "Fried food"],
    meals: [
      {
        slot: "Breakfast",
        items: ["Oats + flax", "Green smoothie"],
        portion: "320 kcal",
        alternatives: ["Millet porridge"],
      },
      {
        slot: "Lunch",
        items: ["Quinoa bowl", "Grilled fish"],
        portion: "420 kcal",
      },
      {
        slot: "Dinner",
        items: ["Lentil soup", "Sauteed greens"],
        portion: "380 kcal",
      },
    ],
  },
  {
    id: "PLAN-902",
    patientId: "PDT-2402",
    title: "Thyroid Harmony",
    startDate: "2024-02-10",
    endDate: "2024-03-20",
    dailyCalories: 1350,
    notes: "Stabilize energy dips; auto-alert on iodine sources.",
    restrictions: ["Soy", "Cruciferous veggies raw"],
    meals: [
      {
        slot: "Breakfast",
        items: ["Amaranth dosa", "Herbal tea"],
        portion: "280 kcal",
      },
      {
        slot: "Lunch",
        items: ["Brown rice", "Paneer bhurji"],
        portion: "410 kcal",
      },
      {
        slot: "Evening Snack",
        items: ["Foxnuts", "Fruit"],
        portion: "180 kcal",
      },
    ],
  },
  {
    id: "PLAN-903",
    patientId: "PDT-2403",
    title: "Cardio Shield",
    startDate: "2024-01-20",
    endDate: "2024-03-05",
    dailyCalories: 1600,
    notes: "Emphasis on omega-3 fats and sodium control.",
    restrictions: ["Processed meat"],
    meals: [
      {
        slot: "Breakfast",
        items: ["Chia pudding", "Mixed nuts"],
        portion: "300 kcal",
      },
      {
        slot: "Lunch",
        items: ["Buckwheat roti", "Mixed veg"],
        portion: "450 kcal",
      },
      {
        slot: "Dinner",
        items: ["Tofu stir fry", "Red rice"],
        portion: "420 kcal",
      },
    ],
  },
  {
    id: "PLAN-904",
    patientId: "PDT-2404",
    title: "Insulin Guard",
    startDate: "2024-02-18",
    endDate: "2024-03-25",
    dailyCalories: 1400,
    notes: "Low glycemic rotation; caution for hypoglycemia streaks.",
    restrictions: ["Sugary beverages"],
    meals: [
      {
        slot: "Breakfast",
        items: ["Moong chilla", "Mint chutney"],
        portion: "320 kcal",
      },
      {
        slot: "Lunch",
        items: ["Millet khichdi", "Curd"],
        portion: "390 kcal",
      },
      {
        slot: "Dinner",
        items: ["Veg stew", "Whole wheat bread"],
        portion: "360 kcal",
      },
    ],
  },
]

export const dietitianPatients: DietitianPatient[] = [
  {
    id: "PDT-2401",
    patientCode: "P-98231",
    name: "Riya Malhotra",
    age: 32,
    gender: "Female",
    mobile: "+91 98243 11123",
    batchName: "Alpha-12",
    programName: "Metabolic Reset",
    specialty: "Metabolic",
    programStatus: "Active",
    dietPlanStatus: "Created",
    compliancePercentage: 82,
    complianceGoal: 90,
    nextReviewDate: "2024-03-04",
    reviewStatus: "Due",
    enrollmentDate: "2024-01-02",
    dietitianNotes: "Noticed post-lunch cravings. Added chia pudding.",
    doctorPrescription: "Metformin 500mg OD",
    exercisePlan: "Pilates alt days, 8k steps",
    medicationAdherence: 95,
    exerciseCompliance: 88,
    paymentStatus: "Paid",
    medicalSummary: "Insulin resistance with PCOS background.",
    consultationNotes: "Sleep improved after magnesium.",
    currentDietPlanId: "PLAN-901",
    dietPlanHistoryIds: ["PLAN-901"],
    complianceTrend: [68, 74, 79, 82],
    weeklyCompliance: [78, 80, 84, 82],
    missedMeals: ["Dinner - 26 Feb"],
    calorieVariance: -120,
    dailyMealCompliance: [
      { label: "Mon", percent: 85 },
      { label: "Tue", percent: 90 },
      { label: "Wed", percent: 70 },
      { label: "Thu", percent: 88 },
      { label: "Fri", percent: 75 },
      { label: "Sat", percent: 82 },
      { label: "Sun", percent: 79 },
    ],
    demographics: {
      city: "Mumbai",
      heightCm: 162,
      weightKg: 64,
    },
  },
  {
    id: "PDT-2402",
    patientCode: "P-98244",
    name: "Neeraj Patel",
    age: 41,
    gender: "Male",
    mobile: "+91 99334 19923",
    batchName: "Beta-07",
    programName: "Thyroid Harmony",
    specialty: "Thyroid",
    programStatus: "Active",
    dietPlanStatus: "Created",
    compliancePercentage: 71,
    complianceGoal: 85,
    nextReviewDate: "2024-02-29",
    reviewStatus: "Overdue",
    enrollmentDate: "2023-12-15",
    dietitianNotes: "Prefers Gujarati meals; portioned thepla swaps.",
    doctorPrescription: "Thyroxine 75mcg",
    exercisePlan: "Cycling 3x week",
    medicationAdherence: 88,
    exerciseCompliance: 64,
    paymentStatus: "Pending",
    medicalSummary: "Hashimoto's with fluctuating TSH.",
    consultationNotes: "Fatigue spikes midday.",
    currentDietPlanId: "PLAN-902",
    dietPlanHistoryIds: ["PLAN-902"],
    complianceTrend: [65, 70, 73, 71],
    weeklyCompliance: [68, 70, 75, 71],
    missedMeals: ["Breakfast - 25 Feb", "Snack - 27 Feb"],
    calorieVariance: 210,
    dailyMealCompliance: [
      { label: "Mon", percent: 62 },
      { label: "Tue", percent: 74 },
      { label: "Wed", percent: 69 },
      { label: "Thu", percent: 70 },
      { label: "Fri", percent: 75 },
      { label: "Sat", percent: 68 },
      { label: "Sun", percent: 78 },
    ],
    demographics: {
      city: "Ahmedabad",
      heightCm: 168,
      weightKg: 82,
    },
  },
  {
    id: "PDT-2403",
    patientCode: "P-98252",
    name: "Sonal Thomas",
    age: 55,
    gender: "Female",
    mobile: "+91 98002 55443",
    batchName: "Gamma-03",
    programName: "Cardio Shield",
    specialty: "Cardio-metabolic",
    programStatus: "Active",
    dietPlanStatus: "Created",
    compliancePercentage: 88,
    complianceGoal: 88,
    nextReviewDate: "2024-03-02",
    reviewStatus: "Due",
    enrollmentDate: "2023-11-10",
    dietitianNotes: "Prefers warm dinners.",
    doctorPrescription: "Atorvastatin 10mg",
    exercisePlan: "Aqua aerobics",
    medicationAdherence: 99,
    exerciseCompliance: 91,
    paymentStatus: "Paid",
    medicalSummary: "Post angioplasty nutritional rehab.",
    consultationNotes: "BP steady last 2 weeks.",
    currentDietPlanId: "PLAN-903",
    dietPlanHistoryIds: ["PLAN-903"],
    complianceTrend: [80, 82, 86, 88],
    weeklyCompliance: [85, 86, 89, 88],
    missedMeals: [],
    calorieVariance: -40,
    dailyMealCompliance: [
      { label: "Mon", percent: 90 },
      { label: "Tue", percent: 88 },
      { label: "Wed", percent: 95 },
      { label: "Thu", percent: 84 },
      { label: "Fri", percent: 87 },
      { label: "Sat", percent: 91 },
      { label: "Sun", percent: 89 },
    ],
    demographics: {
      city: "Bengaluru",
      heightCm: 158,
      weightKg: 70,
    },
  },
  {
    id: "PDT-2404",
    patientCode: "P-98266",
    name: "Arjun Ghosh",
    age: 29,
    gender: "Male",
    mobile: "+91 97110 87543",
    batchName: "Delta-02",
    programName: "Insulin Guard",
    specialty: "Diabetes",
    programStatus: "Active",
    dietPlanStatus: "Pending",
    compliancePercentage: 62,
    complianceGoal: 80,
    nextReviewDate: "2024-03-06",
    reviewStatus: "Due",
    enrollmentDate: "2024-01-20",
    dietitianNotes: "Night shift BPO worker, chrono-nutrition focus.",
    doctorPrescription: "Basal insulin 10u",
    exercisePlan: "Walk post meals",
    medicationAdherence: 79,
    exerciseCompliance: 52,
    paymentStatus: "Paid",
    medicalSummary: "Prediabetes borderline HbA1c 6.3",
    consultationNotes: "Need snack ideas at 2 AM.",
    currentDietPlanId: "PLAN-904",
    dietPlanHistoryIds: ["PLAN-904"],
    complianceTrend: [55, 59, 60, 62],
    weeklyCompliance: [58, 60, 63, 62],
    missedMeals: ["Breakfast - 23 Feb", "Lunch - 24 Feb", "Dinner - 26 Feb"],
    calorieVariance: 320,
    dailyMealCompliance: [
      { label: "Mon", percent: 50 },
      { label: "Tue", percent: 58 },
      { label: "Wed", percent: 60 },
      { label: "Thu", percent: 55 },
      { label: "Fri", percent: 65 },
      { label: "Sat", percent: 68 },
      { label: "Sun", percent: 64 },
    ],
    demographics: {
      city: "Kolkata",
      heightCm: 175,
      weightKg: 86,
    },
  },
  {
    id: "PDT-2405",
    patientCode: "P-98272",
    name: "Maya Suresh",
    age: 37,
    gender: "Female",
    mobile: "+91 98401 44456",
    batchName: "Delta-05",
    programName: "Postpartum Recovery",
    specialty: "Women's Health",
    programStatus: "Active",
    dietPlanStatus: "Pending",
    compliancePercentage: 69,
    complianceGoal: 85,
    nextReviewDate: "2024-03-08",
    reviewStatus: "Due",
    enrollmentDate: "2024-01-28",
    dietitianNotes: "Breastfeeding friendly options.",
    doctorPrescription: "Iron + Calcium",
    exercisePlan: "Pelvic floor routines",
    medicationAdherence: 85,
    exerciseCompliance: 60,
    paymentStatus: "Paid",
    medicalSummary: "Gestational diabetes history.",
    consultationNotes: "Appetite fluctuates.",
    currentDietPlanId: "PLAN-904",
    dietPlanHistoryIds: ["PLAN-904"],
    complianceTrend: [60, 64, 70, 69],
    weeklyCompliance: [65, 68, 72, 69],
    missedMeals: ["Snack - 25 Feb"],
    calorieVariance: 140,
    dailyMealCompliance: [
      { label: "Mon", percent: 70 },
      { label: "Tue", percent: 68 },
      { label: "Wed", percent: 72 },
      { label: "Thu", percent: 65 },
      { label: "Fri", percent: 69 },
      { label: "Sat", percent: 74 },
      { label: "Sun", percent: 67 },
    ],
    demographics: {
      city: "Chennai",
      heightCm: 160,
      weightKg: 72,
    },
  },
  {
    id: "PDT-2406",
    patientCode: "P-98290",
    name: "Kabir Arora",
    age: 48,
    gender: "Male",
    mobile: "+91 98711 88900",
    batchName: "Omega-01",
    programName: "Corporate Vitality",
    specialty: "Lifestyle",
    programStatus: "Paused",
    dietPlanStatus: "Pending",
    compliancePercentage: 58,
    complianceGoal: 80,
    nextReviewDate: "2024-02-20",
    reviewStatus: "Overdue",
    enrollmentDate: "2023-10-03",
    dietitianNotes: "Travel heavy schedule, packable meals only.",
    doctorPrescription: "Vitamin D booster",
    exercisePlan: "HIIT + mobility",
    medicationAdherence: 60,
    exerciseCompliance: 48,
    paymentStatus: "Overdue",
    medicalSummary: "Obesity class I with NAFLD.",
    consultationNotes: "Needs compliance revival sprint.",
    currentDietPlanId: "PLAN-904",
    dietPlanHistoryIds: ["PLAN-903", "PLAN-904"],
    complianceTrend: [52, 55, 57, 58],
    weeklyCompliance: [54, 55, 57, 58],
    missedMeals: ["Lunch - 20 Feb", "Dinner - 21 Feb"],
    calorieVariance: 450,
    dailyMealCompliance: [
      { label: "Mon", percent: 48 },
      { label: "Tue", percent: 60 },
      { label: "Wed", percent: 55 },
      { label: "Thu", percent: 62 },
      { label: "Fri", percent: 57 },
      { label: "Sat", percent: 54 },
      { label: "Sun", percent: 52 },
    ],
    demographics: {
      city: "Delhi",
      heightCm: 172,
      weightKg: 92,
    },
  },
  {
    id: "PDT-2407",
    patientCode: "P-98301",
    name: "Farah Qureshi",
    age: 26,
    gender: "Female",
    mobile: "+91 98122 34002",
    batchName: "IRIS-09",
    programName: "PCOS Blueprint",
    specialty: "PCOS",
    programStatus: "Active",
    dietPlanStatus: "Created",
    compliancePercentage: 77,
    complianceGoal: 90,
    nextReviewDate: "2024-03-10",
    reviewStatus: "Due",
    enrollmentDate: "2024-02-05",
    dietitianNotes: "Prefers plant-based protein.",
    doctorPrescription: "Inositol",
    exercisePlan: "Alternate yoga + cardio",
    medicationAdherence: 92,
    exerciseCompliance: 74,
    paymentStatus: "Paid",
    medicalSummary: "Elevated androgen panel.",
    consultationNotes: "Acne reducing.",
    currentDietPlanId: "PLAN-901",
    dietPlanHistoryIds: ["PLAN-901"],
    complianceTrend: [70, 72, 75, 77],
    weeklyCompliance: [72, 74, 76, 77],
    missedMeals: ["Snack - 27 Feb"],
    calorieVariance: -60,
    dailyMealCompliance: [
      { label: "Mon", percent: 78 },
      { label: "Tue", percent: 74 },
      { label: "Wed", percent: 80 },
      { label: "Thu", percent: 72 },
      { label: "Fri", percent: 76 },
      { label: "Sat", percent: 79 },
      { label: "Sun", percent: 75 },
    ],
    demographics: {
      city: "Pune",
      heightCm: 158,
      weightKg: 60,
    },
  },
  {
    id: "PDT-2408",
    patientCode: "P-98320",
    name: "Nikhil Saxena",
    age: 35,
    gender: "Male",
    mobile: "+91 98202 11223",
    batchName: "ZEN-04",
    programName: "Gut Restore",
    specialty: "GI",
    programStatus: "Completed",
    dietPlanStatus: "Created",
    compliancePercentage: 91,
    complianceGoal: 90,
    nextReviewDate: "2024-02-10",
    reviewStatus: "Completed",
    enrollmentDate: "2023-09-09",
    dietitianNotes: "Maintenance phase, low FODMAP reintros.",
    doctorPrescription: "Probiotic course",
    exercisePlan: "Pilates core",
    medicationAdherence: 97,
    exerciseCompliance: 90,
    paymentStatus: "Paid",
    medicalSummary: "IBS with bloating triggers.",
    consultationNotes: "Completed elimination.",
    currentDietPlanId: "PLAN-903",
    dietPlanHistoryIds: ["PLAN-902", "PLAN-903"],
    complianceTrend: [85, 88, 89, 91],
    weeklyCompliance: [88, 89, 90, 91],
    missedMeals: [],
    calorieVariance: -30,
    dailyMealCompliance: [
      { label: "Mon", percent: 92 },
      { label: "Tue", percent: 93 },
      { label: "Wed", percent: 90 },
      { label: "Thu", percent: 91 },
      { label: "Fri", percent: 95 },
      { label: "Sat", percent: 89 },
      { label: "Sun", percent: 90 },
    ],
    demographics: {
      city: "Hyderabad",
      heightCm: 170,
      weightKg: 68,
    },
  },
  {
    id: "PDT-2409",
    patientCode: "P-98344",
    name: "Tanvi Deshpande",
    age: 31,
    gender: "Female",
    mobile: "+91 98333 77654",
    batchName: "IRIS-05",
    programName: "Hormone Harmony",
    specialty: "Endocrine",
    programStatus: "Pending",
    dietPlanStatus: "Pending",
    compliancePercentage: 48,
    complianceGoal: 85,
    nextReviewDate: "2024-03-12",
    reviewStatus: "Due",
    enrollmentDate: "2024-02-20",
    dietitianNotes: "Awaiting baseline labs.",
    doctorPrescription: "Vit D",
    exercisePlan: "Breathwork + walks",
    medicationAdherence: 0,
    exerciseCompliance: 30,
    paymentStatus: "Pending",
    medicalSummary: "Irregular cycles, mood drops.",
    consultationNotes: "Needs motivational call.",
    currentDietPlanId: "PLAN-901",
    dietPlanHistoryIds: ["PLAN-901"],
    complianceTrend: [0, 0, 0, 48],
    weeklyCompliance: [40, 45, 48, 48],
    missedMeals: ["All meals - 22 Feb"],
    calorieVariance: 600,
    dailyMealCompliance: [
      { label: "Mon", percent: 40 },
      { label: "Tue", percent: 45 },
      { label: "Wed", percent: 48 },
      { label: "Thu", percent: 42 },
      { label: "Fri", percent: 50 },
      { label: "Sat", percent: 46 },
      { label: "Sun", percent: 44 },
    ],
    demographics: {
      city: "Indore",
      heightCm: 164,
      weightKg: 78,
    },
  },
  {
    id: "PDT-2410",
    patientCode: "P-98355",
    name: "Vikram Singh",
    age: 59,
    gender: "Male",
    mobile: "+91 98110 65432",
    batchName: "PRIME-01",
    programName: "Senior Vital",
    specialty: "Geriatric",
    programStatus: "Active",
    dietPlanStatus: "Created",
    compliancePercentage: 75,
    complianceGoal: 80,
    nextReviewDate: "2024-03-01",
    reviewStatus: "Due",
    enrollmentDate: "2023-08-19",
    dietitianNotes: "Needs texture-friendly options.",
    doctorPrescription: "Blood thinner",
    exercisePlan: "Chair yoga",
    medicationAdherence: 92,
    exerciseCompliance: 70,
    paymentStatus: "Paid",
    medicalSummary: "Post cardiac rehab nutrition.",
    consultationNotes: "Appetite low evenings.",
    currentDietPlanId: "PLAN-903",
    dietPlanHistoryIds: ["PLAN-902", "PLAN-903"],
    complianceTrend: [70, 72, 74, 75],
    weeklyCompliance: [72, 73, 74, 75],
    missedMeals: ["Snack - 23 Feb"],
    calorieVariance: -80,
    dailyMealCompliance: [
      { label: "Mon", percent: 74 },
      { label: "Tue", percent: 76 },
      { label: "Wed", percent: 78 },
      { label: "Thu", percent: 72 },
      { label: "Fri", percent: 74 },
      { label: "Sat", percent: 76 },
      { label: "Sun", percent: 75 },
    ],
    demographics: {
      city: "Lucknow",
      heightCm: 167,
      weightKg: 74,
    },
  },
]

export const followUpReviews: FollowUpReview[] = [
  {
    id: "FR-401",
    patientId: "PDT-2401",
    patientName: "Riya Malhotra",
    scheduledDate: "2024-03-04",
    status: "Due",
    notes: "Discuss compliance plateau.",
    nextReviewDate: "2024-03-18",
  },
  {
    id: "FR-402",
    patientId: "PDT-2402",
    patientName: "Neeraj Patel",
    scheduledDate: "2024-02-29",
    status: "Overdue",
    notes: "TSH labs pending.",
  },
  {
    id: "FR-403",
    patientId: "PDT-2403",
    patientName: "Sonal Thomas",
    scheduledDate: "2024-03-02",
    status: "Due",
    notes: "Cardio vitals stable.",
    nextReviewDate: "2024-03-16",
  },
  {
    id: "FR-404",
    patientId: "PDT-2404",
    patientName: "Arjun Ghosh",
    scheduledDate: "2024-03-06",
    status: "Due",
    notes: "Shift worker meal timing.",
  },
  {
    id: "FR-405",
    patientId: "PDT-2406",
    patientName: "Kabir Arora",
    scheduledDate: "2024-02-20",
    status: "Overdue",
    notes: "Reactivation sprint.",
  },
  {
    id: "FR-406",
    patientId: "PDT-2408",
    patientName: "Nikhil Saxena",
    scheduledDate: "2024-02-10",
    status: "Completed",
    notes: "Maintenance confirmed.",
  },
]

export const dietitianNotifications: DietitianNotification[] = [
  {
    id: "NT-701",
    type: "assignment",
    title: "New patient assigned",
    description: "Tanvi Deshpande moved to your cohort.",
    severity: "info",
    createdAt: "2024-02-27T09:15:00Z",
  },
  {
    id: "NT-702",
    type: "plan",
    title: "Diet plan pending",
    description: "Kabir Arora has been without a plan for 6 days.",
    severity: "warning",
    createdAt: "2024-02-26T13:45:00Z",
  },
  {
    id: "NT-703",
    type: "review",
    title: "Upcoming review",
    description: "Riya Malhotra follow-up due in 48 hrs.",
    severity: "info",
    createdAt: "2024-02-28T07:30:00Z",
  },
  {
    id: "NT-704",
    type: "compliance",
    title: "Low compliance alert",
    description: "Arjun Ghosh dropped below 60%.",
    severity: "critical",
    createdAt: "2024-02-27T05:20:00Z",
  },
]

export const complianceThreshold = 75
