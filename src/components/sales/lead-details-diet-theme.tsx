"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useLeadTimeline } from "@/hooks/use-assessment-leads";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  MessageSquare,
  PhoneCall,
  BellRing,
  Clock,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  History,
  Loader2,
  CalendarClock,
  Timer,
  UserRound,
  ClipboardList,
  Stethoscope,
  Apple,
  HeartPulse,
  type LucideIcon,
  ChartColumnIncreasing,
} from "lucide-react";

import { usePatientClinicalDetails, useUserJourney } from "@/hooks/use-patient";
import { usePatientMetricsHistory } from "@/hooks/use-patient-metrics";
import { Skeleton } from "@/components/ui/skeleton";

import type { Lead } from "@/components/sales/types";
import { EnhancedCallLogForm } from "@/components/sales/enhanced-call-log-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { LeadTimelineEvent } from "@/lib/api/assessment-leads-client";
import { CallHistory } from "./call-history";

const stageConfig: Record<
  string,
  {
    label: string;
    gradient: string;
    iconGradient: string;
    textColor: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
  }
> = {
  NEW: {
    label: "New",
    gradient: "from-blue-50 to-indigo-50",
    iconGradient: "from-blue-500 to-indigo-500",
    textColor: "text-blue-700",
    badgeBg: "bg-blue-50",
    badgeBorder: "border-blue-200",
    badgeText: "text-blue-700",
  },
  UNASSIGNED: {
    label: "Unassigned",
    gradient: "from-slate-50 to-gray-50",
    iconGradient: "from-slate-400 to-gray-400",
    textColor: "text-slate-600",
    badgeBg: "bg-slate-50",
    badgeBorder: "border-slate-200",
    badgeText: "text-slate-600",
  },
  CONTACTED: {
    label: "Contacted",
    gradient: "from-purple-50 to-violet-50",
    iconGradient: "from-purple-500 to-violet-500",
    textColor: "text-purple-700",
    badgeBg: "bg-purple-50",
    badgeBorder: "border-purple-200",
    badgeText: "text-purple-700",
  },
  FOLLOW_UP: {
    label: "Follow-up",
    gradient: "from-amber-50 to-orange-50",
    iconGradient: "from-amber-500 to-orange-500",
    textColor: "text-amber-700",
    badgeBg: "bg-amber-50",
    badgeBorder: "border-amber-200",
    badgeText: "text-amber-700",
  },
  HOT: {
    label: "Hot",
    gradient: "from-rose-50 to-pink-50",
    iconGradient: "from-rose-500 to-pink-500",
    textColor: "text-rose-700",
    badgeBg: "bg-rose-50",
    badgeBorder: "border-rose-200",
    badgeText: "text-rose-700",
  },
  INTERESTED: {
    label: "Interested",
    gradient: "from-green-50 to-emerald-50",
    iconGradient: "from-green-500 to-emerald-500",
    textColor: "text-green-700",
    badgeBg: "bg-green-50",
    badgeBorder: "border-green-200",
    badgeText: "text-green-700",
  },
  NOT_INTERESTED: {
    label: "Not Interested",
    gradient: "from-slate-50 to-gray-50",
    iconGradient: "from-slate-400 to-gray-400",
    textColor: "text-slate-600",
    badgeBg: "bg-slate-50",
    badgeBorder: "border-slate-200",
    badgeText: "text-slate-600",
  },
  ASSESSMENT_PAID: {
    label: "Assessment Paid",
    gradient: "from-blue-50 to-cyan-50",
    iconGradient: "from-blue-500 to-cyan-500",
    textColor: "text-blue-700",
    badgeBg: "bg-blue-50",
    badgeBorder: "border-blue-200",
    badgeText: "text-blue-700",
  },
  ASSESSMENT_DONE: {
    label: "Assessment Done",
    gradient: "from-indigo-50 to-purple-50",
    iconGradient: "from-indigo-500 to-purple-500",
    textColor: "text-indigo-700",
    badgeBg: "bg-indigo-50",
    badgeBorder: "border-indigo-200",
    badgeText: "text-indigo-700",
  },
  CONVERTED: {
    label: "Converted",
    gradient: "from-emerald-50 to-teal-50",
    iconGradient: "from-emerald-500 to-teal-500",
    textColor: "text-emerald-700",
    badgeBg: "bg-emerald-50",
    badgeBorder: "border-emerald-200",
    badgeText: "text-emerald-700",
  },
  DROPPED: {
    label: "Dropped",
    gradient: "from-slate-50 to-gray-50",
    iconGradient: "from-slate-300 to-gray-300",
    textColor: "text-slate-500",
    badgeBg: "bg-slate-50",
    badgeBorder: "border-slate-200",
    badgeText: "text-slate-500",
  },
  HISTORY_CALL_DONE: {
    label: "History Call Done",
    gradient: "from-teal-50 to-cyan-50",
    iconGradient: "from-teal-500 to-cyan-500",
    textColor: "text-teal-700",
    badgeBg: "bg-teal-50",
    badgeBorder: "border-teal-200",
    badgeText: "text-teal-700",
  },
};

interface LeadDetailsDietThemeProps {
  lead: Lead;
  backHref?: string;
  backLabel?: string;
}

export function LeadDetailsDietTheme({
  lead,
  backHref = "/dashboard/sales/lead-assignment",
  backLabel = "Back to leads",
}: any) {
  const [hoveredTimelineItem, setHoveredTimelineItem] = useState<string | null>(
    null,
  );
  const [callLogRefreshKey, setCallLogRefreshKey] = useState(0);
  const [isCallLogSheetOpen, setIsCallLogSheetOpen] = useState(false);

  const stage = stageConfig[lead.stage] ?? stageConfig[lead.status?.toUpperCase()] ?? stageConfig.NEW;
  const leadName = lead.patientName || lead.name || "Lead";
  const createdDate = formatDate(lead.created_at);

  const convertedPatientId = lead.convertedPatientId || lead.converted_patient_id;
  const isConverted = !!convertedPatientId;

  // Clinical & Metrics Data (Only for converted leads)
  const { data: patientClinicalData, isLoading: isLoadingClinical } = usePatientClinicalDetails(convertedPatientId || "");
  const { data: metricsData } = usePatientMetricsHistory(convertedPatientId || "");
  const enrollment = patientClinicalData?.data?.enrollment;
  const upcomingAppointments = patientClinicalData?.data?.upcoming_appointments || [];
  const historyCallsList = patientClinicalData?.data?.history_calls || [];

  // Fetch User Journey Data (Only for converted leads)
  const { data: userJourney, isLoading: isJourneyLoading } = useUserJourney(convertedPatientId || "");

  // Fetch timeline data from API
  const {
    data: timelineData,
    isLoading: isTimelineLoading,
    error: timelineError,
    refetch: refetchTimeline,
  } = useLeadTimeline(lead.id);

  const timelineEvents = React.useMemo(() => {
    const apiEvents = timelineData?.data?.timeline || [];
    const leadData = timelineData?.data?.lead;
    const callLogs = timelineData?.data?.callLogs || [];

    // Create additional timeline items from lead object
    const additionalEvents: any[] = [];

    // Lead Created event
    if (leadData?.createdAt) {
      additionalEvents.push({
        id: `lead-created-${leadData.id}`,
        timestamp: leadData.createdAt,
        event_type: 'lead_created',
        notes: `Created by ${leadData.assignment?.assignedToName || 'user@sales.com'}`,
        performed_by_name: leadData.assignment?.assignedToName || 'user@sales.com',
        source: leadData.source || 'website',
        old_status: null,
        new_status: null,
      });
    }

    // Assignment Status event
    if (leadData?.assignment) {
      additionalEvents.push({
        id: `assignment-${leadData.id}`,
        timestamp: leadData.createdAt, // Use creation time as fallback
        event_type: 'status_change',
        notes: leadData.assignment.isAssigned
          ? `Assigned to ${leadData.assignment.assignedToName}`
          : 'Not assigned',
        performed_by_name: null,
        source: 'activity',
        old_status: null,
        new_status: leadData.assignment.isAssigned ? 'assigned' : 'not_assigned',
      });
    }

    // Representative info
    if (leadData?.assignment?.assignedToName) {
      additionalEvents.push({
        id: `representative-${leadData.id}`,
        timestamp: leadData.createdAt,
        event_type: 'assignment',
        notes: `Representative: ${leadData.assignment.assignedToName}`,
        performed_by_name: leadData.assignment.assignedToName,
        source: 'activity',
        old_status: null,
        new_status: null,
      });
    }


    // Assessment Payment event
    if (leadData?.assessment?.paidDate) {
      additionalEvents.push({
        id: `assessment-payment-${leadData.id}`,
        timestamp: leadData.assessment.paidDate,
        event_type: 'payment',
        notes: 'Assessment payment received',
        performed_by_name: null,
        source: 'payment',
        old_status: null,
        new_status: 'assessment_paid',
      });
    }

    // Assessment Completed event
    if (leadData?.assessment?.completedDate) {
      additionalEvents.push({
        id: `assessment-completed-${leadData.id}`,
        timestamp: leadData.assessment.completedDate,
        event_type: 'assessment',
        notes: 'Assessment completed',
        performed_by_name: null,
        source: 'activity',
        old_status: 'assessment_paid',
        new_status: 'assessment_done',
      });
    }

    // Combine API events with additional events
    const allEvents = [...apiEvents];

    // User Journey Events
    if (userJourney) {
      // Assessment Payment
      if (userJourney.assessment_payment?.paid_at) {
        allEvents.push({
          id: `journey-payment-${userJourney.assessment_payment.id}`,
          timestamp: userJourney.assessment_payment.paid_at,
          event_type: 'payment',
          notes: `Assessment payment of ${userJourney.assessment_payment.amount} ${userJourney.assessment_payment.currency} confirmed via ${userJourney.assessment_payment.payment_method || 'Razorpay'}.`,
          performed_by_name: null,
          source: 'journey',
          old_status: null,
          new_status: 'paid',
        });
      }

      // Assessment Submission
      if (userJourney.assessment_submission?.submitted_at) {
        allEvents.push({
          id: `journey-submission-${userJourney.assessment_submission.id}`,
          timestamp: userJourney.assessment_submission.submitted_at,
          event_type: 'assessment',
          notes: 'Detailed clinical assessment form submitted successfully.',
          performed_by_name: null,
          source: 'journey',
          old_status: 'paid',
          new_status: 'form_done',
        });
      }

      // History Call
      if (userJourney.history_call) {
        const hc = userJourney.history_call;
        const hcTime = hc.history_call_completed_at || `${hc.scheduled_date}T${hc.scheduled_time}`;
        allEvents.push({
          id: `journey-hc-${hc.appointment_id}`,
          timestamp: hcTime,
          event_type: 'history_call',
          notes: `History Call ${hc.status === 'completed' ? 'Successfully Completed' : 'Scheduled'}. Host: ${hc.host_staff?.first_name || 'Dr.'} ${hc.host_staff?.last_name || 'Clinical Team'}`,
          performed_by_name: hc.host_staff ? `${hc.host_staff.first_name} ${hc.host_staff.last_name}` : null,
          source: 'journey',
          old_status: 'form_done',
          new_status: hc.status,
        });
      }

      // Enrollment
      if (userJourney.enrollment?.enrolled_at) {
        allEvents.push({
          id: `journey-enrollment-${userJourney.enrollment.enrollment_id}`,
          timestamp: userJourney.enrollment.enrolled_at,
          event_type: 'program_enrolled',
          notes: `Program Enrollment Active: ${userJourney.enrollment.program?.name}. Plan selected: ${userJourney.enrollment.plan?.name}`,
          performed_by_name: null,
          source: 'journey',
          old_status: null,
          new_status: 'active_program',
        });
      }
    }

    if (!allEvents.length) return [];

    // Filter out duplicates (simple deduplication by ID)
    const uniqueEvents = Array.from(new Map(allEvents.map(event => [event.id, event])).values());

    return uniqueEvents.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [timelineData, userJourney]);

  const upcomingFollowUp = React.useMemo(() => {
    const followUps =
      timelineData?.data?.timeline?.filter(
        (event: any) => event.event_type === "follow_up",
      ) ?? [];
    if (!followUps.length) return undefined;
    return [...followUps]
      .sort(
        (a: any, b: any) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )
      .find((event: any) => !(event as any).completed_at);
  }, [timelineData]);
  const lastActivityDate = formatDate(
    timelineData?.data?.lead?.lastContactedAt || lead.lastContactedAt,
  );
  const assignedAgent = lead.assignee_name || lead.assignedTo || "Unassigned";
  const headerInsights = React.useMemo(() => {
    const latestEvent = timelineEvents[0];
    const nextFollowUpDate =
      (upcomingFollowUp as any)?.follow_up_date || upcomingFollowUp?.timestamp;

    return [
      {
        label: "Lead Created",
        value: createdDate,
        helper: "Initial intake",
      },
      {
        label: "Last Activity",
        value: lastActivityDate,
        helper: latestEvent
          ? getEventMeta(latestEvent.event_type).label
          : "Waiting for first touch",
      },
      {
        label: "Next Follow-up",
        value: nextFollowUpDate
          ? formatDateTime(nextFollowUpDate)
          : "Not scheduled",
        helper: upcomingFollowUp?.notes ? "Notes available" : "Add a reminder",
      },
    ];
  }, [createdDate, lastActivityDate, timelineEvents, upcomingFollowUp]);

  const insightChips = headerInsights;

  return (
    <div className="space-y-10 bg-gradient-to-br from-slate-50 via-white to-slate-50/70 p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 1, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4 rounded-3xl border border-slate-100 bg-white/95 p-4 md:p-5 shadow-[0_15px_40px_rgba(15,23,42,0.08)]"
      >
        <Button
          variant="ghost"
          asChild
          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 -ml-2 transition-all"
        >
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backLabel}
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse" />
            Lead Profile
          </div>
          <Separator orientation="vertical" className="hidden h-4 md:block" />
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden",
                `bg-gradient-to-br ${stage.iconGradient}`,
              )}
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <User className="w-10 h-10 text-white relative z-10" />
            </motion.div>
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                {leadName}
                {isConverted && (
                  <Badge className="bg-emerald-500 text-white border-emerald-400 shadow-sm">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Converted
                  </Badge>
                )}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {lead.phone || "No phone"}
                </div>
                {lead.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="truncate max-w-[200px]">{lead.email}</span>
                  </div>
                )}
                {metricsData?.data?.weight_logs?.[0] && (
                  <Badge variant="outline" className="border-blue-200 bg-blue-50/50 text-blue-700 font-bold">
                    <Activity className="w-3 h-3 mr-1" />
                    {metricsData.data.weight_logs[0].weight_kg} kg
                  </Badge>
                )}
                <Badge
                  className={cn(
                    "font-semibold px-3 py-0.5 shadow-sm",
                    stage.badgeBg,
                    stage.badgeBorder,
                    stage.badgeText,
                  )}
                >
                  {stage.label}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            {/* Message button hidden as requested */}
            {/* <Button
              variant="outline"
              className="border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300 hover:shadow-sm shadow-xs transition-all h-10"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button> */}
            <Sheet
              open={isCallLogSheetOpen}
              onOpenChange={setIsCallLogSheetOpen}
            >
              <SheetTrigger asChild>
                <Button className="h-10 bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800">
                  <PhoneCall className="mr-2 h-4 w-4" />
                  Log Call
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full sm:max-w-2xl overflow-y-auto"
              >
                <SheetHeader className="text-left space-y-2">
                  <SheetTitle className="text-2xl font-bold text-slate-900">
                    Log a Call
                  </SheetTitle>
                  <SheetDescription className="text-sm text-slate-500">
                    Capture this conversation without leaving the lead context.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 pb-10">
                  <EnhancedCallLogForm
                    defaultLeadId={lead.id}
                    onSuccess={() => {
                      refetchTimeline();
                      setCallLogRefreshKey((prev) => prev + 1);
                      setIsCallLogSheetOpen(false);
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-4 md:grid-cols-4 ${upcomingFollowUp ? 'grid-cols-5' : ''}`}>
          <div className="space-y-4 lg:col-span-1">
            {upcomingFollowUp && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="border border-amber-200 bg-white/90 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                        <BellRing className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                          Next Follow-up
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {formatDateTime(upcomingFollowUp.timestamp)}
                        </p>
                      </div>
                    </div>
                    {upcomingFollowUp.notes && (
                      <div className="rounded-xl bg-amber-50/60 p-3 text-xs text-amber-800">
                        {upcomingFollowUp.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="rounded-2xl border border-slate-100 bg-white/80 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-900/10 text-slate-900 flex items-center justify-center">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">
                        Current Status
                      </p>
                      <p className="mt-2 text-base font-semibold text-slate-900">
                        {stage.label}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          {insightChips.map((chip) => (
            <div
              key={chip.label}
              className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">
                {chip.label}
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {chip.value}
              </p>
              {/* <p className="text-xs text-slate-500">{chip.helper}</p> */}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Lead Overview Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
            <User className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Lead Overview</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">


          {/* Contact Information */}
          <Card className="lg:col-span-2 border border-white/70 bg-white/95 backdrop-blur-sm shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="p-6 border-b border-slate-100 relative z-10">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-white" />
                </div>
                Contact & Lead Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative z-10">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="block h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
                    <p className="text-sm font-bold text-slate-700">
                      Contact Details
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                      <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Lead Name
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {leadName}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                      <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Phone Number
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {lead.phone || "—"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                      <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Email Address
                      </p>
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {lead.email || "—"}
                      </p>
                    </div>
                    {lead.city && (
                      <div className="p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                        <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                          City
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {lead.city}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="block h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
                    <p className="text-sm font-bold text-slate-700">
                      Lead Details
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    {lead.source && (
                      <div className="p-3 rounded-lg bg-slate-50/50">
                        <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                          Source
                        </p>
                        <Badge className="bg-white border border-slate-200 capitalize text-slate-700 shadow-sm">
                          {lead.source}
                        </Badge>
                      </div>
                    )}
                    {lead.campaign && (
                      <div className="p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                        <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                          Campaign
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {lead.campaign}
                        </p>
                      </div>
                    )}
                    <div className="p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                      <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Assigned Agent
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {assignedAgent}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50/50">
                      <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Status
                      </p>
                      <Badge
                        className={cn(
                          "font-semibold border shadow-sm",
                          stage.badgeBg,
                          stage.badgeBorder,
                          stage.badgeText,
                        )}
                      >
                        {stage.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                {lead.notes && (
                  <div className="pt-6 border-t border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="block h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
                      <p className="text-sm font-bold text-slate-700">Notes</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {lead.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Quick Stats */}
        </div>
      </motion.div>

      {/* Clinical Care Team & Metrics (Only for converted patients) */}
      {isConverted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Clinical Oversight</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-0 bg-gradient-to-br from-rose-50 to-pink-50 shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 duration-300">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center">
                    <Stethoscope className="h-5 w-5 text-rose-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Assigned Doctor</h3>
                </div>
                {enrollment?.assigned_staff?.doctor ? (
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">{enrollment.assigned_staff.doctor.name}</p>
                    <p className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                      <Phone className="h-3 w-3" />
                      {enrollment.assigned_staff.doctor.phone}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 font-medium">Not assigned</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 duration-300">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Apple className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Assigned Nutritionist</h3>
                </div>
                {enrollment?.assigned_staff?.nutritionist ? (
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">{enrollment.assigned_staff.nutritionist.name}</p>
                    <p className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                      <Phone className="h-3 w-3" />
                      {enrollment.assigned_staff.nutritionist.phone}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 font-medium">Not assigned</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 duration-300">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <HeartPulse className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Fitness Coach</h3>
                </div>
                {enrollment?.assigned_staff?.fitness_coach ? (
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">{enrollment.assigned_staff.fitness_coach.name}</p>
                    <p className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                      <Phone className="h-3 w-3" />
                      {enrollment.assigned_staff.fitness_coach.phone}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 font-medium">Not assigned</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 bg-white/60 backdrop-blur-md shadow-xl overflow-hidden rounded-[2rem]">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200/50">
                <div className="bg-white/80 p-8 flex flex-col items-center justify-center text-center group">
                  <div className="mb-4 relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-150 transition-transform group-hover:scale-200" />
                    <p className="text-5xl font-black text-blue-600 relative z-10">{historyCallsList?.length || 0}</p>
                  </div>
                  <p className="text-xs uppercase font-black tracking-[0.3em] text-slate-400 mt-2">Clinical History Calls</p>
                  {historyCallsList?.length > 0 && (
                    <p className="text-[10px] font-bold text-blue-500 mt-2 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
                      Last check-in: {new Date(historyCallsList[0].appointment_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="bg-white/80 p-8 flex flex-col items-center justify-center text-center group">
                  <div className="mb-4 relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-150 transition-transform group-hover:scale-200" />
                    <p className="text-5xl font-black text-emerald-600 relative z-10">{upcomingAppointments?.length || 0}</p>
                  </div>
                  <p className="text-xs uppercase font-black tracking-[0.3em] text-slate-400 mt-2">Upcoming Consultations</p>
                  {upcomingAppointments?.length > 0 && (
                    <p className="text-[10px] font-bold text-emerald-500 mt-2 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
                      Next: {new Date(upcomingAppointments[0].appointment_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Activity Timeline & Call History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <ChartColumnIncreasing className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Activity & Communication
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/30">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <History className="w-4 h-4 text-white" />
                </div>
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {timelineError ? (
                <Alert variant="destructive">
                  <AlertTitle>Failed to load timeline</AlertTitle>
                  <AlertDescription>
                    {timelineError instanceof Error
                      ? timelineError.message
                      : "Please try again"}
                  </AlertDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchTimeline()}
                    className="mt-3"
                  >
                    Retry
                  </Button>
                </Alert>
              ) : isTimelineLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
                    <p className="mt-3 text-sm text-slate-500">
                      Loading timeline...
                    </p>
                  </div>
                </div>
              ) : timelineEvents.length ? (
                <div className="relative">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200"></div>

                  <div className="space-y-6">
                    {timelineEvents.map((event: any) => {
                      const isHovered = hoveredTimelineItem === event.id;
                      const meta = getEventMeta(event.event_type);

                      return (
                        <div
                          key={event.id}
                          className="relative pl-16 group"
                          onMouseEnter={() => setHoveredTimelineItem(event.id)}
                          onMouseLeave={() => setHoveredTimelineItem(null)}
                        >
                          {/* Timeline Dot */}
                          <div
                            className={cn(
                              "absolute left-4 top-2 w-5 h-5 rounded-full border-4 border-white shadow-lg transition-all duration-300",
                              meta.dotClass,
                              isHovered && "scale-125 shadow-xl",
                            )}
                          ></div>

                          {/* Timeline Item */}
                          <div className="transition-all duration-300">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center shadow-md transition-all duration-300",
                                    `bg-gradient-to-br ${meta.iconGradient}`,
                                    isHovered && "scale-110 shadow-lg",
                                  )}
                                >
                                  <meta.icon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                    {meta.label}
                                  </p>
                                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                                    {formatDateTime(event.timestamp)}
                                  </p>
                                  {event.performed_by_name && (
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      Created by {event.performed_by_name}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {(event.old_status || event.new_status) && (
                                <Badge
                                  variant="outline"
                                  className="text-xs font-semibold border-amber-300 bg-amber-50 text-amber-700 uppercase"
                                >
                                  {event.new_status?.replace(/_/g, ' ') || 'NOT ASSIGNED'}
                                </Badge>
                              )}
                            </div>
                            {event.notes && (
                              <p className="text-sm text-slate-600 mt-2 ml-13">
                                {event.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-sm font-medium text-slate-900">
                    No Activity Yet
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Timeline will populate as interactions occur
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-purple-50/30">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4 text-white" />
                </div>
                Call History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <CallHistory key={callLogRefreshKey} leadId={lead.id} />
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

// Timeline Event Metadata
type TimelineVisual = {
  icon: LucideIcon;
  gradient: string;
  iconGradient: string;
  dotClass: string;
  textColor: string;
  label: string;
};

const EVENT_META: Record<string, TimelineVisual> = {
  lead_created: {
    icon: User,
    gradient: "from-blue-50 to-indigo-50",
    iconGradient: "from-blue-500 to-indigo-500",
    dotClass: "bg-blue-500",
    textColor: "text-blue-700",
    label: "LEAD CREATED",
  },
  status_change: {
    icon: Activity,
    gradient: "from-purple-50 to-violet-50",
    iconGradient: "from-purple-500 to-violet-500",
    dotClass: "bg-purple-500",
    textColor: "text-purple-700",
    label: "ASSIGNMENT STATUS",
  },
  follow_up: {
    icon: BellRing,
    gradient: "from-amber-50 to-orange-50",
    iconGradient: "from-amber-500 to-orange-500",
    dotClass: "bg-amber-500",
    textColor: "text-amber-700",
    label: "Follow-up Reminder",
  },
  call: {
    icon: PhoneCall,
    gradient: "from-slate-50 to-gray-50",
    iconGradient: "from-slate-500 to-gray-500",
    dotClass: "bg-slate-500",
    textColor: "text-slate-700",
    label: "CALL LOGS",
  },
  assignment: {
    icon: UserRound,
    gradient: "from-purple-50 to-violet-50",
    iconGradient: "from-purple-500 to-violet-500",
    dotClass: "bg-purple-500",
    textColor: "text-purple-700",
    label: "REPRESENTATIVE",
  },
  payment: {
    icon: CheckCircle2,
    gradient: "from-emerald-50 to-green-50",
    iconGradient: "from-emerald-500 to-green-500",
    dotClass: "bg-emerald-500",
    textColor: "text-emerald-700",
    label: "ASSESSMENT PAYMENT",
  },
  assessment: {
    icon: CheckCircle2,
    gradient: "from-emerald-50 to-green-50",
    iconGradient: "from-emerald-500 to-green-500",
    dotClass: "bg-emerald-500",
    textColor: "text-emerald-700",
    label: "ASSESSMENT COMPLETED",
  },
  activity: {
    icon: Activity,
    gradient: "from-purple-50 to-violet-50",
    iconGradient: "from-purple-500 to-violet-500",
    dotClass: "bg-purple-500",
    textColor: "text-purple-700",
    label: "Status Update",
  },
  call_log: {
    icon: PhoneCall,
    gradient: "from-blue-50 to-indigo-50",
    iconGradient: "from-blue-500 to-indigo-500",
    dotClass: "bg-blue-500",
    textColor: "text-blue-700",
    label: "Call Logged",
  },
  history_call: {
    icon: Stethoscope,
    gradient: "from-blue-50 to-indigo-50",
    iconGradient: "from-blue-600 to-indigo-600",
    dotClass: "bg-blue-600",
    textColor: "text-blue-800",
    label: "HISTORY CALL",
  },
  program_enrolled: {
    icon: Target,
    gradient: "from-emerald-50 to-teal-50",
    iconGradient: "from-emerald-600 to-teal-600",
    dotClass: "bg-emerald-600",
    textColor: "text-emerald-800",
    label: "PROGRAM ENROLLED",
  },
};

const DEFAULT_EVENT_META: TimelineVisual = {
  icon: ClipboardList,
  gradient: "from-slate-50 to-gray-50",
  iconGradient: "from-slate-400 to-gray-400",
  dotClass: "bg-slate-400",
  textColor: "text-slate-600",
  label: "Activity",
};

function getEventMeta(type?: string) {
  if (!type) return DEFAULT_EVENT_META;
  return EVENT_META[type] ?? DEFAULT_EVENT_META;
}

function toReadable(value?: string | null) {
  if (!value) return undefined;
  return value
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatDuration(seconds?: number | null) {
  if (!seconds) return undefined;
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return remaining ? `${minutes}m ${remaining}s` : `${minutes}m`;
}

function formatDate(date?: string | Date | null) {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(date?: string | Date | null) {
  if (!date) return "—";
  const d = new Date(date);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
}
