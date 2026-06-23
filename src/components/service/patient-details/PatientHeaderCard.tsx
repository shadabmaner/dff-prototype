"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, Target, ClipboardList, Plus } from "lucide-react";
import { toast } from "sonner";

interface PatientHeaderCardProps {
  patient: any;
  id: string;
  enrollment: any;
  patientAge: number | null;
  bodyMeasurementGoals: any[];
  metricsData: any;
  assessmentSubmissions: any[];
  isHistoryCallShow: boolean;
  onShowViewGoalDrawer: () => void;
  onShowAssessmentDrawer: () => void;
  onScheduleHistoryCall: () => void;
}

export function PatientHeaderCard({
  patient,
  id,
  enrollment,
  patientAge,
  bodyMeasurementGoals,
  metricsData,
  assessmentSubmissions,
  isHistoryCallShow,
  onShowViewGoalDrawer,
  onShowAssessmentDrawer,
  onScheduleHistoryCall,
}: PatientHeaderCardProps) {
  const [showProgramDialog, setShowProgramDialog] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<string>("")
  const [programStatus, setProgramStatus] = useState<"recommended" | "accepted" | "assigned" | null>(null)
  const [recommendedProgram, setRecommendedProgram] = useState<string | null>(null)

  const handleAssignProgram = () => {
    if (!selectedProgram) {
      toast.error("Please select a program to assign")
      return
    }
    toast.success(`Program "${selectedProgram}" assigned successfully`)
    setProgramStatus("assigned")
    setShowProgramDialog(false)
  }

  return (
    <>
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {patient?.first_name?.[0]}{patient?.last_name?.[0]}
              </div>
              <div className="space-y-3">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                    {patient?.first_name} {patient?.last_name}
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">Patient ID: {id.slice(0, 8)}...</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {patient?.phone || "N/A"}
                  </div>
                  {patient?.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {patient.email}
                    </div>
                  )}
                  {patient?.city && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">📍</span>
                      {patient.city}, {patient.country}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {enrollment && (
                    <Badge className={`${enrollment.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      enrollment.status === "completed" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-slate-50 text-slate-700 border-slate-200"
                      }`}>
                      {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                    </Badge>
                  )}
                  {programStatus && (
                    <Badge className={
                      programStatus === "recommended" ? "bg-purple-50 text-purple-700 border-purple-200" :
                      programStatus === "accepted" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }>
                      {programStatus === "recommended" && recommendedProgram ? `Recommended: ${recommendedProgram}` :
                       programStatus === "accepted" ? "Program Accepted" :
                       "Program Assigned"}
                    </Badge>
                  )}
                  {metricsData?.data?.weight_logs && metricsData.data.weight_logs.length > 0 && (
                    <Badge variant="outline" className="border-slate-300 text-slate-700">
                      Weight: {metricsData.data.weight_logs[0].weight_kg} kg
                    </Badge>
                  )}
                  {patientAge && (
                    <Badge variant="outline" className="border-slate-300 text-slate-700">
                      Age: {patientAge} years
                    </Badge>
                  )}
                  {patient?.gender && (
                    <Badge variant="outline" className="border-slate-300 text-slate-700 capitalize">
                      {patient.gender}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {programStatus === "recommended" ? (
                <Button
                  onClick={() => setShowProgramDialog(true)}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Assign Program
                </Button>
              ) : programStatus === "assigned" ? (
                <Button
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Program Assigned
                </Button>
              ) : (
                <Button
                  onClick={() => setShowProgramDialog(true)}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Assign Program
                </Button>
              )}
              {bodyMeasurementGoals.length > 0 && (
                <Button
                  onClick={onShowViewGoalDrawer}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Assigned Goals
                </Button>
              )}

              {assessmentSubmissions.length > 0 ? <Button
                onClick={onShowAssessmentDrawer}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                View Assessment
              </Button> : <Button className="cursor-default">Assessment Pending</Button>}

              {assessmentSubmissions.length > 0 && !isHistoryCallShow && <Button
                variant="outline"
                onClick={onScheduleHistoryCall}
                className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-white shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule History Call
              </Button>}

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Program Assignment Dialog */}
      <Dialog open={showProgramDialog} onOpenChange={setShowProgramDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Assign Program to Patient
            </DialogTitle>
            <DialogDescription>
              {programStatus === "recommended" 
                ? "Doctor has recommended a program. You can assign the recommended program or select a different one."
                : "Select a program to assign to this patient."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {programStatus === "recommended" && recommendedProgram && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Doctor's Recommendation:</strong> {recommendedProgram}
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-900">Select Program</Label>
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a program to assign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dfs_standard">DFS Standard Care Program - ₹15,000</SelectItem>
                  <SelectItem value="dfs_vip">DFS VIP Care Program - ₹25,000</SelectItem>
                  <SelectItem value="premium">Premium Care Program - ₹40,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedProgram === "dfs_standard" ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"}`}
                onClick={() => setSelectedProgram("dfs_standard")}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">DFS Standard Care Program</h4>
                    <p className="text-sm text-slate-600 mt-1">Basic diabetes management with standard support</p>
                    <p className="text-lg font-bold text-blue-600 mt-2">₹15,000</p>
                  </div>
                  <Badge variant="outline" className="border-slate-300">Standard</Badge>
                </div>
              </div>
              
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedProgram === "dfs_vip" ? "border-purple-500 bg-purple-50" : "border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"}`}
                onClick={() => setSelectedProgram("dfs_vip")}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">DFS VIP Care Program</h4>
                    <p className="text-sm text-slate-600 mt-1">Enhanced diabetes management with priority support</p>
                    <p className="text-lg font-bold text-purple-600 mt-2">₹25,000</p>
                  </div>
                  <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50">VIP</Badge>
                </div>
              </div>
              
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedProgram === "premium" ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:border-amber-300 hover:bg-amber-50/50"}`}
                onClick={() => setSelectedProgram("premium")}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">Premium Care Program</h4>
                    <p className="text-sm text-slate-600 mt-1">Comprehensive care with all premium features</p>
                    <p className="text-lg font-bold text-amber-600 mt-2">₹40,000</p>
                  </div>
                  <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">Premium</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-900">Assignment Notes</Label>
              <Textarea 
                placeholder="Add notes explaining why this program is being assigned..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProgramDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              onClick={handleAssignProgram}
            >
              <Target className="h-4 w-4 mr-2" /> Assign Program
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
