"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NotificationChannel,
  NotificationTemplate,
  TemplateVariable,
} from "@/types/notification-template";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Info,
  ArrowLeft,
  Search,
  Check,
  ChevronRight,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCreateNotificationTemplate,
  useUpdateNotificationTemplate,
} from "@/hooks/use-notification-templates";

import { cn } from "@/lib/utils";

const formSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
  name: z.string().min(3, "Name must be at least 3 characters"),
  channel: z.nativeEnum(NotificationChannel),
  category: z.string().optional(),
  titleTemplate: z.string().min(1, "Title template is required"),
  bodyTemplate: z.string().min(1, "Body template is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface TemplateFormProps {
  initialData?: NotificationTemplate | null;
}

export function TemplateForm({ initialData }: TemplateFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"base" | "content">("base");
  const [variableSearch, setVariableSearch] = useState("");

  const isEditing = !!initialData;

  const { mutate: createTemplate, isPending: isCreating } = useCreateNotificationTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateNotificationTemplate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    shouldUnregister: false,
    values: {
      code: initialData?.code || "",
      name: initialData?.name || "",
      channel: initialData?.channel || NotificationChannel.FCM,
      category: initialData?.category || "general",
      titleTemplate: initialData?.titleTemplate || "",
      bodyTemplate: initialData?.bodyTemplate || "",
    },
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const onSubmit = (values: FormValues) => {
    if (isEditing && initialData) {
      // Exclude code and channel from update request (immutable)
      const { code, channel, ...updateData } = values;
      updateTemplate(
        { id: initialData.id, data: updateData as any },
        { onSuccess: () => router.push("/dashboard/admin/notification-templates") }
      );
    } else {
      createTemplate(values, {
        onSuccess: () => router.push("/dashboard/admin/notification-templates"),
      });
    }
  };

  const filteredVariables = Object.values(TemplateVariable).filter((v) =>
    v.toLowerCase().includes(variableSearch.toLowerCase())
  );

  const insertVariable = (variable: string) => {
    const fieldName = activeTab === "content" ? "bodyTemplate" : "titleTemplate";
    const currentValue = form.getValues(fieldName as any) || "";
    form.setValue(fieldName as any, `${currentValue}{{${variable}}}`, { shouldDirty: true, shouldValidate: true });
  };

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
              className="rounded-full h-11 w-11 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              <Link href="/dashboard/admin/notification-templates">
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Edit Template
              </h1>
              <p className="text-slate-500 mt-1 flex items-center gap-2 font-medium">
                {initialData && (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" /> 
                    Modifying <code className="text-blue-600 font-mono bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{initialData.code}</code>
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              className="text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              onClick={() => router.push("/dashboard/admin/notification-templates")}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isUpdating} 
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 px-8 h-11 font-semibold rounded-xl transition-all active:scale-95"
            >
              <Check className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Config & Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-slate-200 bg-white overflow-hidden shadow-xl shadow-slate-200/40 rounded-2xl border-t-4 border-t-blue-600">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">General Configuration</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Define the unique identity and scope</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2 pb-8">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-slate-700 font-semibold text-sm">Unique Code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="APPOINTMENT_REMINDER"
                          disabled={isEditing}
                          className="font-mono text-xs uppercase bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/10 h-12 transition-all rounded-xl"
                        />
                      </FormControl>
                      <FormDescription className="text-[11px] text-slate-400 font-medium">
                        Immutable system identifier.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-slate-700 font-semibold text-sm">Friendly Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Appt Reminder Push" className="bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/10 h-12 transition-all rounded-xl" />
                      </FormControl>
                      <FormDescription className="text-[11px] text-slate-400 font-medium">Displayed in admin dashboards.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="channel"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-slate-700 font-semibold text-sm">Delivery Channel</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isEditing}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-50 border-slate-200 h-12 transition-all rounded-xl focus:ring-blue-500/10">
                            <SelectValue placeholder="Select channel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl">
                          {Object.values(NotificationChannel).map((c) => (
                            <SelectItem key={c} value={c} className="hover:bg-blue-50 transition-colors py-2.5">
                              {c.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-50 border-slate-200 h-12 transition-all rounded-xl focus:ring-blue-500/10">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl">
                          <SelectItem value="general" className="py-2.5">General</SelectItem>
                          <SelectItem value="clinical" className="py-2.5">Clinical</SelectItem>
                          <SelectItem value="marketing" className="py-2.5">Marketing</SelectItem>
                          <SelectItem value="billing" className="py-2.5">Billing</SelectItem>
                          <SelectItem value="auth" className="py-2.5">Auth / OTP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white overflow-hidden shadow-xl shadow-slate-200/40 rounded-2xl relative border-t-4 border-t-amber-500">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                 <Send className="h-32 w-32 text-slate-900" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                    <Check className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Content Template</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">
                      Craft your message with dynamic variables
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-1 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60 shadow-inner">
                   <Button 
                    type="button"
                    variant={activeTab === 'base' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className={cn(
                      "h-9 px-5 text-[11px] uppercase tracking-widest font-bold rounded-lg transition-all",
                      activeTab === 'base' 
                        ? "bg-white text-blue-600 border border-slate-200 shadow-sm hover:bg-white" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-transparent"
                    )}
                    onClick={() => setActiveTab('base')}
                   >
                     Title
                   </Button>
                   <Button 
                    type="button"
                    variant={activeTab === 'content' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className={cn(
                      "h-9 px-5 text-[11px] uppercase tracking-widest font-bold rounded-lg transition-all",
                      activeTab === 'content' 
                        ? "bg-white text-blue-600 border border-slate-200 shadow-sm hover:bg-white" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-transparent"
                    )}
                    onClick={() => setActiveTab('content')}
                   >
                     Body
                   </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-8 pb-8">
                {/* Field persistence optimized: avoid unmounting component to keep values/focus */}
                <div className={cn(activeTab !== 'base' && "hidden")}>
                  <FormField
                    control={form.control}
                    name="titleTemplate"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-slate-800 font-bold text-base">Title Template</FormLabel>
                          <Badge variant="outline" className="bg-blue-50 border-blue-100 text-blue-600 text-[10px] h-6 font-bold px-2.5">
                            EMAIL SUBJECT / PUSH TITLE
                          </Badge>
                        </div>
                        <FormControl>
                          <Input {...field} placeholder="Hi {{patient_name}}, appointment confirmed!" className="bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/10 h-14 text-xl font-semibold transition-all rounded-xl text-slate-900" />
                        </FormControl>
                        <FormDescription className="text-xs text-slate-400 font-medium">
                          Supports double curly braces for dynamic variables.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className={cn(activeTab !== 'content' && "hidden")}>
                  <FormField
                    control={form.control}
                    name="bodyTemplate"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                         <div className="flex items-center justify-between">
                            <FormLabel className="text-slate-800 font-bold text-base">Body Template</FormLabel>
                            <Badge variant="outline" className="bg-amber-50 border-amber-100 text-amber-600 text-[10px] h-6 font-bold px-2.5">
                              MESSAGE BODY
                            </Badge>
                          </div>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Your appointment with {{doctor_name}} is confirmed for {{date}} at {{time}}." 
                            className="min-h-[300px] font-sans bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/10 text-lg leading-relaxed transition-all resize-none p-6 rounded-2xl text-slate-800 shadow-inner"
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-slate-400 font-medium">
                          This is the main payload of your notification. Markdown is supported for some channels.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Variable Picker */}
          <div className="space-y-6">
            <Card className="border-slate-200 bg-white/70 backdrop-blur-xl sticky top-6 overflow-hidden shadow-2xl shadow-slate-200/50 rounded-2xl border-l-4 border-l-blue-600">
              <CardHeader className="pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-600 text-white hover:bg-blue-700 h-6 px-3 border-none flex items-center gap-1.5 font-bold rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    LIVE PAYLOAD
                  </Badge>
                </div>
                <CardTitle className="text-xl mt-4 font-bold text-slate-900 tracking-tight">Variable Picker</CardTitle>
                <CardDescription className="text-slate-500 font-medium">Inject data into the current editor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 px-4 pb-8 pt-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search variables..."
                    className="pl-11 h-12 bg-slate-50/50 border-slate-200 focus:border-blue-500/50 transition-all rounded-2xl shadow-inner text-sm font-medium"
                    value={variableSearch}
                    onChange={(e) => setVariableSearch(e.target.value)}
                  />
                </div>
                
                <ScrollArea className="h-[480px]">
                  <div className="space-y-2.5 pr-3 pb-6">
                    {filteredVariables.length > 0 ? (
                      filteredVariables.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => insertVariable(v)}
                          className="flex w-full items-center justify-between rounded-2xl px-5 py-4 text-sm font-semibold transition-all bg-white border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 group shadow-sm hover:shadow-md active:scale-[0.97]"
                        >
                          <div className="flex flex-col items-start gap-1">
                             <code className="text-blue-600 font-mono text-[13px] group-hover:text-blue-700 transition-colors">
                              {`{{${v}}}`}
                            </code>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest group-hover:text-blue-400 transition-colors">
                               Inject Tag
                            </span>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-slate-50 group-hover:bg-blue-100/50 flex items-center justify-center transition-colors">
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition-all group-hover:translate-x-0.5" />
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-300 gap-4">
                        <Search className="h-12 w-12 opacity-20" />
                        <span className="text-sm font-bold uppercase tracking-widest opacity-40">No matches found</span>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/60 relative overflow-hidden group shadow-inner">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
                  <div className="flex gap-4 relative z-10">
                    <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                      <Info className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="space-y-1.5">
                       <p className="text-[13px] font-bold text-slate-900">
                         Integration Hint
                       </p>
                       <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                        Inserting into <strong>{activeTab.toUpperCase()}</strong>. Variables must be mapped in the backend controller for this channel.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>

  );
}
