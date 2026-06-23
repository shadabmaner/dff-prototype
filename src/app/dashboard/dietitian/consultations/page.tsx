"use client"

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from "framer-motion"
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  MessageSquare,
  ClipboardList,
  User,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  ArrowLeft,
  LayoutGrid,
  ShieldCheck,
  Zap,
  History,
  Target,
  FlaskConical,
  Scale
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function ConsultationManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('id') || 'APT-2001';

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-20 px-4 md:px-0 bg-slate-50/50 min-h-screen">
      {/* Premium Session Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0c1425] p-6 md:p-10 shadow-2xl border border-white/5 mx-1">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -right-[10%] h-[160%] w-[70%] rounded-full bg-blue-500/10 blur-[130px]" />
          <div className="absolute -bottom-[30%] -left-[10%] h-[160%] w-[70%] rounded-full bg-rose-500/10 blur-[130px]" />
        </div>

        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-10 w-10 rounded-full bg-white/5 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Badge variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white/40 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 shadow-inner italic">ENCRYPTED TELE-HEALTH HUB</Badge>
              <div className="flex items-center gap-3 bg-rose-500/20 px-4 py-1.5 rounded-full border border-rose-500/30">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 tabular-nums">LIVE SESSION: {formatTime(sessionTime)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[1.5rem] bg-slate-800 border border-white/5 flex items-center justify-center relative overflow-hidden group">
                <User className="w-8 h-8 text-white/20" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1 italic">Active Participant Profile</p>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-none italic uppercase">Amit Patel</h1>
                <div className="flex items-center gap-3 text-white/40 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] font-mono">P-1001</span>
                  <span className="text-white/20">/</span>
                  <Badge className="bg-blue-600 text-white border-none text-[8px] font-black tracking-widest px-3 py-0.5 italic">DIABETES</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="h-12 rounded-2xl border-white/5 bg-white/5 text-white hover:bg-white/10 font-black uppercase text-[10px] tracking-widest px-8 italic">
                <ClipboardList className="w-4 h-4 mr-2" /> Clinical File
              </Button>
              <Button className="h-12 rounded-2xl bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-rose-600/20 hover:scale-[1.02] transform transition-all italic">
                <PhoneOff className="w-4 h-4 mr-2 capitalize" /> Terminate Session
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Video Interface & Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-1">
        {/* Video Interface */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="relative aspect-video rounded-[3rem] bg-slate-900 overflow-hidden shadow-2xl border border-slate-800 group">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mx-auto ring-8 ring-slate-800/50">
                  <User className="w-12 h-12 text-slate-700" />
                </div>
                <p className="text-xs font-black uppercase text-slate-500 tracking-widest">Waiting for patient stream...</p>
              </div>
            </div>

            {/* Local Video Thumbnail */}
            <div className="absolute top-8 right-8 w-48 aspect-video rounded-3xl bg-slate-800 border border-white/10 shadow-2xl overflow-hidden pointer-events-none group-hover:scale-110 transition-transform duration-500">
              <div className="absolute inset-0 flex items-center justify-center">
                <User className="w-8 h-8 text-slate-700" />
              </div>
              <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-black/40 backdrop-blur-md">
                <p className="text-[8px] font-black uppercase tracking-widest text-white/60">Nutritionist (You)</p>
              </div>
            </div>

            {/* Control Overlay */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 px-8 py-4 rounded-[2.5rem] bg-black/40 backdrop-blur-2xl border border-white/5 shadow-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-2xl transition-all",
                  isMuted ? "bg-rose-500 text-white" : "text-white hover:bg-white/10"
                )}
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-2xl transition-all",
                  isVideoOff ? "bg-rose-500 text-white" : "text-white hover:bg-white/10"
                )}
                onClick={() => setIsVideoOff(!isVideoOff)}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </Button>
              <div className="w-px h-6 bg-white/10 mx-2" />
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-white hover:bg-white/10">
                <MessageSquare className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-white hover:bg-white/10">
                <LayoutGrid className="w-5 h-5" />
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Target HbA1c", value: "< 5.7%", icon: Target, color: "text-rose-500", bg: "bg-rose-50" },
              { label: "Avg Compliance", value: "92%", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
              { label: "Weight Goal", value: "72 kg", icon: Scale, color: "text-blue-500", bg: "bg-blue-50" }
            ].map((stat, i) => (
              <Card key={i} className="fresh-card-alt border-none shadow-sm rounded-[2rem] bg-white p-6 flex flex-col items-center text-center">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-4", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
                <p className="text-lg font-black italic text-slate-900">{stat.value}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Side Panel: Notes & Clinical Context */}
        <div className="space-y-6">
          <Card className="fresh-card-alt border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden flex flex-col h-full min-h-[600px]">
            <div className="p-8 border-b border-slate-50">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-slate-400" />
                  <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-900 italic">Intervention Interface</h2>
                </div>
                <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[8px] uppercase tracking-widest px-3 italic">AUTO-SAVING</Badge>
              </div>

              <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl mb-8">
                {['notes', 'alerts', 'vitals'].map((tab) => (
                  <Button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    variant="ghost"
                    className={cn(
                      "flex-1 h-10 rounded-xl font-black uppercase text-[10px] tracking-widest italic transition-all",
                      activeTab === tab ? "bg-white text-slate-950 shadow-sm" : "text-slate-400"
                    )}
                  >
                    {tab}
                  </Button>
                ))}
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Real-time Clinical Observation</Label>
                  <Textarea
                    placeholder="Log active session observations here..."
                    rows={10}
                    className="border-none bg-slate-50/50 rounded-[1.5rem] font-bold italic p-6 resize-none focus-visible:ring-1 focus-visible:ring-blue-500/20 shadow-inner"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Global Protocol Update</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Search templates..." className="h-11 rounded-xl border-slate-100 bg-slate-50/50 text-xs font-bold" />
                    <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl bg-slate-50">
                      <Plus className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto p-8 bg-slate-50/50">
              <div className="flex flex-col gap-3">
                <Button className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:scale-[1.02] transition-all italic">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Finalize Session Summary
                </Button>
                <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">A copy will be pushed to the patient mobile app</p>
              </div>
            </div>
          </Card>

          <Card className="fresh-card-alt border-none shadow-sm rounded-[2rem] bg-rose-50 border border-rose-100 p-8 group overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-rose-500 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Action Sequence</p>
                  <p className="text-lg font-black italic text-rose-900 uppercase">Emergency Protocol</p>
                </div>
              </div>
              <p className="text-xs font-bold text-rose-600 italic leading-relaxed mb-6">
                Triggering this will immediately alert the patient's primary doctor and medical support team.
              </p>
              <Button variant="outline" className="w-full h-12 rounded-xl border-rose-200 bg-white text-rose-600 font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 hover:text-white transition-all italic">
                Flag Clinical Risk Node
              </Button>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700">
              <AlertTriangle className="w-32 h-32" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
