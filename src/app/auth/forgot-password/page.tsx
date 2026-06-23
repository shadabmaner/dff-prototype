"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Stethoscope,
  Mail,
  ArrowRight,
  HeartPulse,
  BrainCircuit,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { z } from "zod"

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success("Reset Link Sent", {
          description: result.message || "If an account exists with this email, you will receive a password reset link shortly.",
        })
      } else {
        toast.error("Error", {
          description: result.message || "Something went wrong. Please try again.",
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "An error occurred. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Branding Panel — Dark medical theme */}
      <div
        className="hidden lg:flex lg:w-[54%] relative overflow-hidden flex-col"
        style={{ background: "linear-gradient(160deg, #020617, #0f172a, #1e3a8a)" }}
      >
        {/* ECG line animation */}
        <svg className="absolute bottom-[30%] left-0 w-full h-32 opacity-[0.06]" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <motion.path
            d="M0,60 L200,60 L230,60 L240,20 L250,100 L260,40 L270,80 L280,60 L400,60 L430,60 L440,15 L450,105 L460,35 L470,85 L480,60 L700,60 L730,60 L740,20 L750,100 L760,40 L770,80 L780,60 L1000,60 L1030,60 L1040,20 L1050,100 L1060,40 L1070,80 L1080,60 L1200,60"
            fill="none"
            stroke="hsl(221 83% 53%)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </svg>

        {/* Floating medical icons */}
        <motion.div
          className="absolute top-[15%] right-[12%] opacity-[0.04]"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <HeartPulse className="w-28 h-28 text-white" />
        </motion.div>
        <motion.div
          className="absolute bottom-[18%] right-[8%] opacity-[0.03]"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <BrainCircuit className="w-20 h-20 text-white" />
        </motion.div>

        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.1]"
          style={{ background: "radial-gradient(circle, hsl(221 83% 50%) 0%, transparent 70%)" }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between flex-1 px-14 xl:px-20 py-10">
          {/* Top: Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center w-11 h-11 rounded-2xl border border-white/10"
                style={{ background: "linear-gradient(135deg, hsl(221 83% 36% / 0.3), hsl(221 83% 36% / 0.1))" }}
              >
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white block leading-tight">
                  Medikiz Nexus
                </span>
              </div>
            </div>
          </motion.div>

          {/* Center: Main content */}
          <div className="flex-1 flex flex-col justify-center -mt-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="h-px w-8" style={{ background: "hsl(221 83% 36%)" }} />
                <p
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ color: "hsl(221 83% 50%)" }}
                >
                  Clinical Intelligence Platform
                </p>
              </div>
              <h1 className="text-[2.75rem] xl:text-5xl font-extrabold leading-[1.08] text-white mb-5">
                Forgot Password?
                <br />
                <span className="text-white/60">No worries, we'll help you reset it.</span>
              </h1>
              <p className="text-[15px] text-white/35 max-w-sm leading-relaxed">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Forgot Password Panel */}
      <div className="flex flex-1 flex-col bg-background">
        {/* Top bar on right side */}
        <div className="flex items-center justify-between px-8 py-5 lg:py-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Stethoscope className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              Healthcare CRM
            </span>
          </div>
          <div className="hidden lg:block" />
          <p className="text-xs text-muted-foreground">
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => router.push("/auth/login")}
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center px-6 sm:px-10 pb-10">
          <div className="w-full max-w-[380px]">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                Reset your password
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                We'll send you a reset link to your email
              </p>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="space-y-5"
            >
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-foreground text-[13px] font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="name@clinic.com"
                    maxLength={254}
                    className={cn(
                      "pl-10 h-11 bg-background border-border hover:border-primary/30 focus:border-primary focus-visible:ring-primary/20 transition-all",
                      errors.email && "border-destructive focus:border-destructive focus-visible:ring-destructive/20"
                    )}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-destructive font-medium mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-semibold cursor-pointer text-sm transition-all"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </motion.form>
          </div>
        </div>
      </div>
    </div>
  )
}
