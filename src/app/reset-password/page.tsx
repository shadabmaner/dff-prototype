"use client"

import * as React from "react"
import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Stethoscope,
  Lock,
  ArrowRight,
  HeartPulse,
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { z } from "zod"
import Image from "next/image"

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = React.useState(false)
  const [token, setToken] = React.useState("")
  const [isValid, setIsValid] = React.useState(false)

  React.useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
      setIsValid(true)
    } else {
      setIsValid(false)
      toast.error("Invalid Reset Link", {
        description: "Please request a new password reset.",
      })
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: data.newPassword,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success("Password Reset Successful", {
          description: result.message || "Your password has been reset successfully.",
        })
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      } else {
        toast.error("Error", {
          description: result.message || "Failed to reset password. Please try again.",
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

  if (!isValid) {
    return (
      <div className="flex min-h-screen w-full">
        {/* Left Branding Panel */}
        <div
          className="hidden lg:flex lg:w-[54%] relative overflow-hidden flex-col"
          style={{ background: "linear-gradient(160deg, #020617, #0f172a, #1e3a8a)" }}
        >
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

          <motion.div
            className="absolute top-[15%] right-[12%] opacity-[0.04]"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <HeartPulse className="w-28 h-28 text-white" />
          </motion.div>

          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.1]"
            style={{ background: "radial-gradient(circle, hsl(221 83% 50%) 0%, transparent 70%)" }}
          />

          <div className="relative z-10 flex flex-col justify-between flex-1 px-14 xl:px-20 py-10">
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
                          <Image width={42} height={42} alt="" src={"https://onpointnexus.com/logo-icon.png"}/>
                  
                </div>
                <div>
                  <span className="text-lg font-bold tracking-tight text-white block leading-tight">
                    Medikiz Nexus
                  </span>
                </div>
              </div>
            </motion.div>

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
                  Invalid Reset Link
                  <br />
                  <span className="text-white/60">Please request a new password reset.</span>
                </h1>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-1 flex-col bg-background">
          <div className="flex items-center justify-between px-8 py-5 lg:py-6">
            <div className="flex items-center gap-2.5 lg:hidden">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <Stethoscope className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-base font-bold tracking-tight text-foreground">
                Healthcare CRM
              </span>
            </div>
            <div className="hidden lg:block" />
          </div>

          <div className="flex flex-1 items-center justify-center px-6 sm:px-10 pb-10">
            <div className="w-full max-w-[380px]">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">
                  Invalid Reset Link
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  The reset link is invalid or has expired. Please request a new password reset.
                </p>
                <Button
                  onClick={() => router.push("/auth/forgot-password")}
                  className="w-full h-11 font-semibold cursor-pointer text-sm transition-all"
                >
                  Request New Reset Link
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Branding Panel */}
      <div
        className="hidden lg:flex lg:w-[54%] relative overflow-hidden flex-col"
        style={{ background: "linear-gradient(160deg, #020617, #0f172a, #1e3a8a)" }}
      >
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

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.1]"
          style={{ background: "radial-gradient(circle, hsl(221 83% 50%) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 flex flex-col justify-between flex-1 px-14 xl:px-20 py-10">
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
                Reset Password
                <br />
                <span className="text-white/60">Set a new secure password</span>
              </h1>
              <p className="text-[15px] text-white/35 max-w-sm leading-relaxed">
                Enter your new password below. Make sure it's at least 8 characters long.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Reset Password Panel */}
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
                Create new password
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                Your new password must be at least 8 characters long
              </p>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="space-y-5"
            >
              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-foreground text-[13px] font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <Input
                    id="newPassword"
                    type="password"
                    {...register("newPassword")}
                    placeholder="Enter new password"
                    minLength={8}
                    className={cn(
                      "pl-10 h-11 bg-background border-border hover:border-primary/30 focus:border-primary focus-visible:ring-primary/20 transition-all",
                      errors.newPassword && "border-destructive focus:border-destructive focus-visible:ring-destructive/20"
                    )}
                  />
                </div>
                {errors.newPassword && (
                  <p className="text-[11px] text-destructive font-medium mt-1">{errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-foreground text-[13px] font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register("confirmPassword")}
                    placeholder="Confirm new password"
                    minLength={8}
                    className={cn(
                      "pl-10 h-11 bg-background border-border hover:border-primary/30 focus:border-primary focus-visible:ring-primary/20 transition-all",
                      errors.confirmPassword && "border-destructive focus:border-destructive focus-visible:ring-destructive/20"
                    )}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-destructive font-medium mt-1">{errors.confirmPassword.message}</p>
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
                    Reset Password
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
