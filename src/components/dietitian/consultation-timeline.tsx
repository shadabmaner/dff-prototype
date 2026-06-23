"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  FileText, 
  Apple, 
  UserPlus, 
  TrendingUp, 
  Clock,
  ChevronRight
} from "lucide-react"

interface TimelineEvent {
  id: string
  type: "consultation" | "diet_plan" | "follow_up" | "referral" | "progress"
  date: Date
  title: string
  description: string
  metadata?: {
    doctor?: string
    planType?: string
    weight?: number
    notes?: string
  }
}

interface ConsultationTimelineProps {
  patientId?: string
}

export function ConsultationTimeline({ patientId }: ConsultationTimelineProps) {
  // Mock timeline data
  const timelineEvents: TimelineEvent[] = [
    {
      id: "1",
      type: "consultation",
      date: new Date("2024-03-10"),
      title: "Initial Consultation",
      description: "First consultation session completed. Discussed health goals and current lifestyle.",
      metadata: {
        notes: "Patient motivated and ready to start program"
      }
    },
    {
      id: "2",
      type: "diet_plan",
      date: new Date("2024-03-12"),
      title: "Diet Plan Sent",
      description: "15-day custom diet plan sent to patient",
      metadata: {
        planType: "15-day Custom Plan"
      }
    },
    {
      id: "3",
      type: "progress",
      date: new Date("2024-03-20"),
      title: "Progress Update",
      description: "Weight reduced by 2kg. Patient showing good adherence.",
      metadata: {
        weight: 83
      }
    },
    {
      id: "4",
      type: "follow_up",
      date: new Date("2024-03-25"),
      title: "Follow-up Consultation",
      description: "Reviewed progress and adjusted meal portions",
      metadata: {
        notes: "Increased protein intake recommended"
      }
    },
    {
      id: "5",
      type: "diet_plan",
      date: new Date("2024-03-27"),
      title: "Diet Plan Updated",
      description: "Updated diet plan with increased protein portions",
      metadata: {
        planType: "Modified 15-day Plan"
      }
    },
    {
      id: "6",
      type: "referral",
      date: new Date("2024-04-02"),
      title: "Doctor Referral",
      description: "Referred to endocrinologist for blood sugar management",
      metadata: {
        doctor: "Dr. Rajesh Kumar"
      }
    }
  ]

  const getEventIcon = (type: string) => {
    switch (type) {
      case "consultation":
        return <Calendar className="h-5 w-5 text-white" />
      case "diet_plan":
        return <Apple className="h-5 w-5 text-white" />
      case "follow_up":
        return <FileText className="h-5 w-5 text-white" />
      case "referral":
        return <UserPlus className="h-5 w-5 text-white" />
      case "progress":
        return <TrendingUp className="h-5 w-5 text-white" />
      default:
        return <Clock className="h-5 w-5 text-white" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "consultation":
        return "bg-blue-600"
      case "diet_plan":
        return "bg-emerald-600"
      case "follow_up":
        return "bg-amber-600"
      case "referral":
        return "bg-purple-600"
      case "progress":
        return "bg-indigo-600"
      default:
        return "bg-slate-600"
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Consultation History</h3>
            <p className="text-sm text-slate-600 mt-1">Complete timeline of patient interactions</p>
          </div>
          <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
            <FileText className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Timeline */}
        <div className="relative space-y-6">
          {/* Vertical Line */}
          <div className="absolute left-[19px] top-[20px] bottom-[20px] w-0.5 bg-slate-200" />

          {timelineEvents.map((event, index) => (
            <div key={event.id} className="relative flex gap-4">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${getEventColor(event.type)}`}>
                {getEventIcon(event.type)}
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900">{event.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(event.date)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs border-slate-300 text-slate-600">
                    {formatDate(event.date)}
                  </Badge>
                </div>

                <p className="text-sm text-slate-700 mb-3">{event.description}</p>

                {/* Metadata */}
                {event.metadata && (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="space-y-1 text-xs">
                      {event.metadata.doctor && (
                        <p className="text-slate-700">
                          <strong>Doctor:</strong> {event.metadata.doctor}
                        </p>
                      )}
                      {event.metadata.planType && (
                        <p className="text-slate-700">
                          <strong>Plan Type:</strong> {event.metadata.planType}
                        </p>
                      )}
                      {event.metadata.weight && (
                        <p className="text-slate-700">
                          <strong>Weight:</strong> {event.metadata.weight} kg
                        </p>
                      )}
                      {event.metadata.notes && (
                        <p className="text-slate-700">
                          <strong>Notes:</strong> {event.metadata.notes}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* View Details Link */}
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-slate-600 hover:text-slate-900 p-0 h-auto mt-2"
                >
                  View Details
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-6 text-center">
          <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
            Load Earlier History
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
