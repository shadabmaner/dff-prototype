"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Info,
  ArrowLeft,
  Check,
  Code2,
  Settings2,
  FileJson,
  Trash2,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCreateSDUIConfig, useUpdateSDUIConfig } from "@/hooks/use-sdui-configs"
import { SDUIConfig } from "@/types/sdui-config"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  category: z.string().min(1, "Category is required"),
  config: z.string().refine((val) => {
    try {
      JSON.parse(val)
      return true
    } catch (e) {
      return false
    }
  }, "Invalid JSON format"),
  description: z.string().optional(),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface SDUIConfigFormProps {
  initialData?: SDUIConfig | null
}

export function SDUIConfigForm({ initialData }: SDUIConfigFormProps) {
  const router = useRouter()
  const [isFormatting, setIsFormatting] = useState(false)

  const isEditing = !!initialData

  const { mutate: createConfig, isPending: isCreating } = useCreateSDUIConfig()
  const { mutate: updateConfig, isPending: isUpdating } = useUpdateSDUIConfig()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      category: initialData?.category || "dashboard",
      config: initialData?.config
        ? typeof initialData.config === "string"
          ? JSON.stringify(JSON.parse(initialData.config), null, 2)
          : JSON.stringify(initialData.config, null, 2)
        : "{}",
      description: initialData?.description || "",
      is_active: initialData?.is_active ?? true,
    },
  })

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      config: JSON.parse(values.config),
    }

    if (isEditing && initialData) {
      updateConfig(
        { id: initialData.id, data: payload },
        { onSuccess: () => router.push("/dashboard/admin/sdui-configs") }
      )
    } else {
      createConfig(payload, {
        onSuccess: () => router.push("/dashboard/admin/sdui-configs"),
      })
    }
  }

  const formatJson = () => {
    setIsFormatting(true)
    try {
      const currentVal = form.getValues("config")
      const formatted = JSON.stringify(JSON.parse(currentVal), null, 2)
      form.setValue("config", formatted, { shouldDirty: true, shouldValidate: true })
    } catch (e) {
      // Ignore invalid JSON during formatting
    }
    setTimeout(() => setIsFormatting(false), 500)
  }
  console.log("hii")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between bg-white/40 p-6 rounded-2xl border border-slate-200/60 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-5">
            <Button
              variant="outline"
              size="icon"
              type="button"
              asChild
              className="rounded-full h-11 w-11 border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm"
            >
              <Link href="/dashboard/admin/sdui-configs">
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {isEditing ? "Edit Configuration" : "New Configuration"}
              </h1>
              <p className="text-slate-500 mt-1 flex items-center gap-2 font-medium">
                {isEditing ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    Modifying <code className="text-blue-600 font-mono bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{initialData.name}</code>
                  </span>
                ) : (
                  "Create a new Server-Driven UI template"
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              className="text-slate-500 hover:text-slate-900"
              onClick={() => router.push("/dashboard/admin/sdui-configs")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
              className="gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-lg px-8 h-11 font-semibold rounded-xl transition-all active:scale-95"
            >
              {isCreating || isUpdating ? (
                <Code2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {isEditing ? "Save Changes" : "Create Configuration"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Metadata */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="border-slate-200 bg-white shadow-xl rounded-2xl border-t-4 border-t-slate-900">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <Settings2 className="h-5 w-5 text-slate-900" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Metadata</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Basic identity and classification</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pb-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-slate-700 font-semibold text-sm">Unique Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. dashboard-diabetic"
                          className="bg-slate-50 border-slate-200 focus:ring-slate-900/5 h-12 transition-all rounded-xl font-mono text-sm"
                        />
                      </FormControl>
                      <FormDescription className="text-[11px] text-slate-400 font-medium">
                        Used as the identifier in mobile app requests.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-slate-700 font-semibold text-sm">Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-50 border-slate-200 h-12 transition-all rounded-xl">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl">
                          <SelectItem value="dashboard" className="py-2.5">Dashboard</SelectItem>
                          <SelectItem value="tracker" className="py-2.5">Tracker</SelectItem>
                          <SelectItem value="localization" className="py-2.5">Localization</SelectItem>
                          <SelectItem value="onboarding" className="py-2.5">Onboarding</SelectItem>
                          <SelectItem value="other" className="py-2.5">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-slate-700 font-semibold text-sm">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="What is this UI for?"
                          className="bg-slate-50 border-slate-200 focus:ring-slate-900/5 min-h-[100px] transition-all rounded-xl resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-100 p-4 bg-slate-50/50">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-bold text-slate-700 uppercase tracking-tight">Active Status</FormLabel>
                        <FormDescription className="text-[10px] font-medium text-slate-400">Enable or disable this config</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column: JSON Editor */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-slate-200 bg-white shadow-xl rounded-2xl border-t-4 border-t-blue-500 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                    <FileJson className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">UI Configuration</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Define the SDUI JSON structure</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={formatJson}
                    disabled={isFormatting}
                    className="h-9 px-4 rounded-xl border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all font-bold text-[11px] uppercase tracking-widest gap-2"
                  >
                    {isFormatting ? (
                      <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                    ) : (
                      <Code2 className="h-3.5 w-3.5" />
                    )}
                    Format JSON
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <FormField
                  control={form.control}
                  name="config"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <Textarea
                          {...field}
                          className="min-h-[600px] font-mono text-[13px] bg-slate-900 text-blue-100 border-none rounded-none focus-visible:ring-0 p-8 leading-relaxed selection:bg-blue-500/30 selection:text-white"
                          spellCheck={false}
                        />
                      </FormControl>
                      <FormMessage className="p-4 bg-red-50 text-red-600 font-bold text-xs m-0 rounded-none border-t border-red-100" />
                    </FormItem>
                  )}
                />
              </CardContent>
              <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  JSON Validated
                </div>
                <p className="text-[10px] font-bold text-slate-400 italic">
                  Changes will be instantly reflected in the mobile app upon saving.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  )
}
