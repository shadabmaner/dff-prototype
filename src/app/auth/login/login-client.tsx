"use client"
import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  Stethoscope,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Users,
  Globe,
  TrendingUp,
  HeartPulse,
  BrainCircuit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useLogin } from "@/hooks/use-login";
import { loginSchema, LoginFormValues } from "@/lib/validations/login";
import { getFCMToken } from "@/hooks/use-fcm";
import Image from "next/image";

const demo = [
  { label: "Super Admin", email: "superadmin@drapp.com", password: "SuperAdmin@9876", initials: "SA" },
  { label: "Marketing", email: "marketing@example.com", password: "marketing123", initials: "MK" },
  { label: "Admin", email: "admin@drapp.com", password: "Admin@1234", initials: "AD" },
  { label: "Doctor", email: "doctor@example.com", password: "doctor123", initials: "DR" },
  { label: "Dietitian", email: "dietitian@example.com", password: "dietitian123", initials: "DT" },
  { label: "Patient", email: "patient@example.com", password: "patient123", initials: "PT" },
  { label: "Sales", email: "sales@example.com", password: "sales123", initials: "SL" },
  { label: "Finance", email: "finance@example.com", password: "finance123", initials: "FN" },
  { label: "Service", email: "service@example.com", password: "service123", initials: "SV" },
  { label: "Pharmacy", email: "pharmacy@example.com", password: "pharmacy123", initials: "PH" },
  { label: "Pharmacy New", email: "pharmacynew@drapp.com", password: "StrongP@ss1", initials: "PN" },
  { label: "Physio", email: "physio@example.com", password: "physio123", initials: "PS" },
];

const LoginClient = ({ next }: { next: string }) => {
  const router = useRouter();
  const [showAllDemo, setShowAllDemo] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const { mutateAsync: login, isPending: loading } = useLogin(next);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const emailValue = watch("email");

  async function onSubmit(data: LoginFormValues) {
    try {
      await login(data);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid email or password. Please try again.";

      setError("email", { type: "manual", message });
      setError("password", { type: "manual", message });
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col"
        style={{ background: "linear-gradient(150deg, #04080f 0%, #080f20 45%, #0c1a38 100%)" }}
      >
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
        />
        {/* Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: "linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6)" }}
        />
        {/* Glow */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.08] blur-[100px] pointer-events-none"
          style={{ background: "#2563eb" }}
        />
        <div className="absolute bottom-0 right-0 w-[380px] h-[380px] rounded-full opacity-[0.07] blur-[80px] pointer-events-none"
          style={{ background: "#7c3aed" }}
        />

        <div className="relative z-10 flex flex-col flex-1 px-10 xl:px-14 py-10 overflow-y-auto">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.06] flex items-center justify-center">
              <Image width={40} height={40} alt="Medikiz" src="https://onpointnexus.com/logo-icon.png" />
            </div>
            <div>
              <p className="text-[15px] font-extrabold text-white tracking-tight leading-none">Medikiz Nexus</p>
              <div className="flex items-center gap-1 mt-0.5">
                {[
                  { label: "Healthcare", color: "#22d3ee", bg: "rgba(34,211,238,0.12)", border: "rgba(34,211,238,0.28)" },
                  { label: "Education",  color: "#c084fc", bg: "rgba(192,132,252,0.12)", border: "rgba(192,132,252,0.28)" },
                  { label: "Technology", color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.28)"  },
                ].map((chip) => (
                  <span key={chip.label}
                    className="px-1.5 py-0.5 rounded-full text-[7.5px] font-bold uppercase tracking-[0.16em] border"
                    style={{ color: chip.color, background: chip.bg, borderColor: chip.border }}
                  >
                    {chip.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="mt-10">
            <h1 className="text-[2.5rem] xl:text-[2.8rem] font-black leading-[1.06] text-white tracking-tight">
              Heal. Educate.
              <br />
              <span style={{ background: "linear-gradient(90deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Transform Lives.
              </span>
            </h1>
            <p className="mt-3 text-[13px] leading-relaxed max-w-[340px]" style={{ color: "rgba(255,255,255,0.30)" }}>
              India's leading diabetes reversal &amp; lifestyle medicine platform — blending clinical care, structured education, and intelligent digital tools.
            </p>
          </div>

          {/* Doctor — inline, no card */}
          <div className="mt-8 flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-[54px] h-[54px] rounded-full overflow-hidden border-2"
                style={{ borderColor: "rgba(59,130,246,0.4)" }}
              >
                <Image
                  src="https://drbhagyeshkulkarni.com/wp-content/uploads/2026/01/home.webp"
                  alt="Dr. Bhagyesh Kulkarni"
                  width={54}
                  height={54}
                  className="object-cover w-full h-full"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://onpointnexus.com/logo-icon.png" }}
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#080f20]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-white leading-tight">Dr. Bhagyesh Kulkarni</p>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: "#67e8f9" }}>MBBS, PGDDM, DPC · Diabetologist &amp; Lifestyle Medicine</p>
            </div>
          </div>

          {/* Stats row — no box */}
          <div className="mt-5 flex items-center gap-6">
            {[["5k+", "Patients"], ["10+", "Yrs Exp"], ["15+", "Programs"], ["99%", "Success"]].map(([val, lbl], i) => (
              <div key={i}>
                <p className="text-[18px] font-black text-white leading-none">{val}</p>
                <p className="text-[8.5px] uppercase tracking-wider mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>{lbl}</p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="mt-7 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

          {/* Platform modules — clean list, no cards */}
          <div className="mt-6">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] mb-5" style={{ color: "rgba(255,255,255,0.22)" }}>
              Platform Modules
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              {[
                { icon: HeartPulse,    c: "#f87171", label: "Clinical Management",  desc: "Consultations & care plans" },
                { icon: BrainCircuit, c: "#c084fc", label: "Patient Education",    desc: "Courses, diet & programs" },
                { icon: TrendingUp,   c: "#34d399", label: "Revenue & Billing",    desc: "Payments & finance ops" },
                { icon: Globe,        c: "#22d3ee", label: "Remote Healthcare",    desc: "Teleconsult & digital care" },
                { icon: Users,        c: "#60a5fa", label: "Team Workspace",       desc: "Doctors, coaches & staff" },
                { icon: Activity,     c: "#fbbf24", label: "Health Analytics",     desc: "Outcomes & reports" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${f.c}18` }}
                  >
                    <f.icon style={{ color: f.c }} className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold leading-tight text-white">{f.label}</p>
                    <p className="text-[10px] mt-0.5 leading-snug" style={{ color: "rgba(255,255,255,0.28)" }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quote */}
          <div className="mt-8 flex items-start gap-3">
            <div className="w-0.5 flex-shrink-0 self-stretch rounded-full" style={{ background: "rgba(96,165,250,0.45)" }} />
            <div>
              <p className="text-[11.5px] leading-relaxed italic" style={{ color: "rgba(255,255,255,0.38)" }}>
                "Our goal is to empower every patient with knowledge, tools, and personal care — reversing diabetes naturally without dependency on medication."
              </p>
              <p className="text-[11px] font-bold mt-2" style={{ color: "#93c5fd" }}>— Dr. Bhagyesh Kulkarni</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex flex-1 flex-col" style={{ background: "#f8fafc" }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-slate-900">Medikiz Nexus</span>
          </div>
          <div className="hidden lg:block" />
          <p className="text-xs text-slate-400">
            Need help?{" "}
            <button type="button" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors" suppressHydrationWarning>
              Contact Support
            </button>
          </p>
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center px-6 sm:px-10 pb-10">
          <div className="w-full max-w-[400px]">

            {/* Card wrapper */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 px-8 py-9">

              {/* Logo + header */}
              <div className="mb-7">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-100">
                    <Image width={36} height={36} alt="Medikiz" src="https://onpointnexus.com/logo-icon.png" />
                  </div>
                  <div>
                    <p className="text-[13px] font-extrabold text-slate-900 leading-none">Medikiz Nexus</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">Clinical Platform</p>
                  </div>
                </div>
                <h2 className="text-[1.6rem] font-black text-slate-900 tracking-tight leading-tight">
                  Welcome back
                </h2>
                <p className="text-[13px] text-slate-400 mt-1 font-medium">
                  Sign in to your clinical dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-slate-700 text-[13px] font-semibold">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="name@clinic.com"
                      maxLength={254}
                      className={cn(
                        "pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300 rounded-xl hover:border-blue-300 focus:border-blue-500 focus-visible:ring-blue-500/15 transition-all text-[14px]",
                        errors.email && "border-red-300 bg-red-50/50 focus:border-red-400 focus-visible:ring-red-400/15"
                      )}
                      suppressHydrationWarning
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-700 text-[13px] font-semibold">
                      Password
                    </Label>
                    <button type="button" onClick={() => router.push('/auth/forgot-password')}
                      className="text-[12px] text-blue-600 font-semibold cursor-pointer hover:text-blue-700 transition-colors"
                      suppressHydrationWarning
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      placeholder="Enter your password"
                      maxLength={64}
                      className={cn(
                        "pl-10 pr-10 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300 rounded-xl hover:border-blue-300 focus:border-blue-500 focus-visible:ring-blue-500/15 transition-all text-[14px]",
                        errors.password && "border-red-300 bg-red-50/50 focus:border-red-400 focus-visible:ring-red-400/15"
                      )}
                      suppressHydrationWarning
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
                      suppressHydrationWarning
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-red-500 font-medium mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl font-bold text-[14px] text-white cursor-pointer transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ background: loading ? "#3b82f6" : "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)", boxShadow: "0 4px 16px rgba(59,130,246,0.35)" }}
                  suppressHydrationWarning
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In to Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Trust footer */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3 text-slate-300" />
                <p className="text-[11px] text-slate-300 font-medium">256-bit SSL encrypted · HIPAA-aligned platform</p>
              </div>
            </div>

            {/* Below card note */}
            <p className="text-center text-[11px] text-slate-400 mt-4">
              Medikiz Healthcare LLP &middot; Pune, India
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginClient;

