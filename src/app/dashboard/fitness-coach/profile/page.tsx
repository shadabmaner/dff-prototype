"use client"

import * as React from "react"
import { useState } from "react"
import {
    User,
    Mail,
    Phone,
    Briefcase,
    ShieldCheck,
    Save,
    Camera,
    Lock,
    Stethoscope,
    GraduationCap,
    Clock,
    Fingerprint
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function FitnessCoachProfilePage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
            toast.success("Profile updated successfully")
        }, 1000)
    }

    return (
        <div className="space-y-8 pb-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Coach <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">Profile</span></h1>
                    <p className="text-[13px] text-slate-500 font-medium mt-1">
                        Manage your personal details, credentials, and access settings.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 px-6 rounded-xl font-bold border-slate-200">Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading} className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary text-white shadow-lg hover:bg-primary/90 transition-all">
                        {isLoading ? "Saving..." : <><Save className="mr-2 h-3.5 w-3.5" /> Save Changes</>}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Quick Stats */}
                <div className="space-y-6">
                    <Card className="fresh-card-alt border-none shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden bg-white">
                        <CardContent className="p-8 flex flex-col items-center text-center relative">
                            <div className="absolute top-0 right-0 p-6">
                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border-none shadow-none px-3 py-1">Active</Badge>
                            </div>
                            <div className="relative group mt-4 mb-6">
                                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-slate-50 shadow-xl relative bg-slate-100 flex items-center justify-center">
                                    <User className="h-12 w-12 text-slate-300" />
                                </div>
                                <button className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                                    <Camera className="h-4 w-4" />
                                </button>
                            </div>
                            <h2 className="text-xl font-black text-slate-900">Coach Alex Johnson</h2>
                            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-4">Certified Performance Specialist</p>

                            <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-6 border-t border-slate-100">
                                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                                    <span className="text-xl font-black text-slate-900">14</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Yrs Exp</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                                    <span className="text-xl font-black text-slate-900">4.9</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Rating</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="fresh-card-alt border-none shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden bg-white">
                        <CardHeader className="p-6 pb-2">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-primary" /> Verification
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                        <Mail className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-widest">Email</span>
                                </div>
                                <span className="text-[10px] font-bold">Verified</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                        <Phone className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-widest">Phone</span>
                                </div>
                                <span className="text-[10px] font-bold">Verified</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                        <Fingerprint className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-widest">Biometric</span>
                                </div>
                                <button className="text-[10px] font-bold text-primary hover:underline">Setup Now</button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Forms */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="fresh-card-alt border-none shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden bg-white">
                        <CardHeader className="p-8 border-b border-slate-50">
                            <CardTitle className="text-lg font-black tracking-tight text-slate-900">Personal Information</CardTitle>
                            <CardDescription className="text-xs font-medium text-slate-500">Update your basic profile details visible to clients.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">First Name</Label>
                                        <Input id="firstName" defaultValue="Alex" className="h-11 rounded-xl bg-slate-50/50 border-slate-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Last Name</Label>
                                        <Input id="lastName" defaultValue="Johnson" className="h-11 rounded-xl bg-slate-50/50 border-slate-200" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Email Address</Label>
                                        <Input id="email" type="email" defaultValue="alex.johnson@performanceportal.com" className="h-11 rounded-xl bg-slate-50/50 border-slate-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Phone Number</Label>
                                        <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" className="h-11 rounded-xl bg-slate-50/50 border-slate-200" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Professional Bio</Label>
                                    <Textarea id="bio" rows={4} defaultValue="NASM-certified performance specialist with over 10 years of experience in strength training, metabolic conditioning, and athletic performance. Dedicated to evidence-based coaching and personalized transformation journeys." className="rounded-xl bg-slate-50/50 border-slate-200 resize-none p-4" />
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="fresh-card-alt border-none shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden bg-white">
                        <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-black tracking-tight text-slate-900">Coaching Credentials</CardTitle>
                                <CardDescription className="text-xs font-medium text-slate-500">Your professional qualifications and expertise.</CardDescription>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Stethoscope className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="specialty" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Primary Specialty</Label>
                                        <Input id="specialty" defaultValue="Strength & Performance" className="h-11 rounded-xl bg-slate-50/50 border-slate-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="license" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Certification ID</Label>
                                        <Input id="license" defaultValue="NASM-CPT-102938" className="h-11 rounded-xl bg-slate-50/50 border-slate-200" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="education" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Education & Degrees</Label>
                                    <Input id="education" defaultValue="BSc Sports Science - University of Florida, NASM PES & CPT" className="h-11 rounded-xl bg-slate-50/50 border-slate-200" />
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="fresh-card-alt border-none shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden bg-white">
                        <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-black tracking-tight text-slate-900">Security Settings</CardTitle>
                                <CardDescription className="text-xs font-medium text-slate-500">Manage your password and platform access.</CardDescription>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                                <Lock className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="current-pass" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Current Password</Label>
                                    <Input id="current-pass" type="password" placeholder="••••••••" className="h-11 rounded-xl bg-slate-50/50 border-slate-200" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-pass" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">New Password</Label>
                                        <Input id="new-pass" type="password" className="h-11 rounded-xl bg-slate-50/50 border-slate-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-pass" className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Confirm Password</Label>
                                        <Input id="confirm-pass" type="password" className="h-11 rounded-xl bg-slate-50/50 border-slate-200" />
                                    </div>
                                </div>
                                <Button type="button" variant="outline" className="w-full sm:w-auto h-11 px-8 rounded-xl font-bold border-slate-200 hover:bg-slate-50">
                                    Update Password
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
