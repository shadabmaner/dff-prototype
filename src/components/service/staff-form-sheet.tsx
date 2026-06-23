"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreateStaff, useUpdateStaff } from "@/hooks/use-service-api"
import { useRolesDropdown } from "@/hooks/use-roles-dropdown"
import { Loader2, Plus, User, Award, MapPin, Languages, Shield } from "lucide-react"
import { toast } from "sonner"
import type { CreateStaffRequest, StaffMember } from "@/types/service-api"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ScrollArea } from "@/components/ui/scroll-area"

const LANGUAGE_OPTIONS = ["English", "Hindi", "Marathi", "Tamil", "Telugu", "Kannada", "Bengali", "Gujarati"]

const staffSchema = z.object({
  role_id: z.string().min(1, "Role is required"),
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Invalid email format"),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits"),
  password: z.string().optional(),
  specialization: z.string().optional(),
  qualification: z.string().optional(),
  experience_years: z.number().min(0).optional(),
  bio: z.string().optional(),
  languages: z.array(z.string()),
  address: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().trim().min(1, "Country is required"),
  pincode: z.string().optional(),
})

type StaffFormValues = z.infer<typeof staffSchema>

interface StaffFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff?: StaffMember | null
}

export function StaffFormSheet({ open, onOpenChange, staff }: StaffFormSheetProps) {
  // const { toast } = useToast()
  const createStaffMutation = useCreateStaff()
  const updateStaffMutation = useUpdateStaff()
  const { data: roles = [], isLoading: rolesLoading } = useRolesDropdown()

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      role_id: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      // specialization: "",
      // qualification: "",
      // experience_years: 0,
      // bio: "",
      languages: [],
      address: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
    },
  })

  useEffect(() => {
    if (open) {
      if (staff) {
        form.reset({
          role_id: staff.role_id || "",
          first_name: staff.first_name || "",
          last_name: staff.last_name || "",
          email: staff.email || "",
          phone: staff.phone || "",
          password: "",
          specialization: staff.specialization || "",
          qualification: staff.qualification || "",
          experience_years: Number(staff.experience_years) || 0,
          bio: staff.bio || "",
          languages: staff.languages || [],
          address: staff.address || "",
          city: staff.city || "",
          state: staff.state || "",
          country: staff.country || "India",
          pincode: staff.pincode || "",
        })
      } else {
        form.reset({
          role_id: "",
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          password: "",
          specialization: "",
          qualification: "",
          experience_years: 0,
          bio: "",
          languages: [],
          address: "",
          city: "",
          state: "",
          country: "India",
          pincode: "",
        })
      }
    }
  }, [open, staff, form])

  const onSubmit = async (values: StaffFormValues) => {
    try {
      if (staff) {
        const { password, ...updateValues } = values
        await updateStaffMutation.mutateAsync({ staffId: staff.id, data: updateValues as any })
        toast.success("Profile updated", { description: "The staff profile has been updated successfully." })
      } else {
        if (!values.password?.trim()) {
          form.setError("password", { message: "Password is required" })
          return
        }
        if (values.password.trim().length < 8) {
          form.setError("password", { message: "Password must be at least 8 characters" })
          return
        }
        await createStaffMutation.mutateAsync({ ...values, password: values.password.trim() } as CreateStaffRequest)
        toast.success("Staff member added", { description: "The new staff member has been added successfully." })
        setTimeout(() => {
          toast.info("Reminder: Availability not yet configured", {
            description: `${values.first_name} ${values.last_name} must log in and add their availability slots before history calls can be assigned to them.`,
          })
        }, 800)
      }
      onOpenChange(false)
    } catch (error: any) {
      const apiErrors = error?.response?.data?.errors;
      const errorMessage = Array.isArray(apiErrors) && apiErrors.length > 0 
        ? apiErrors.join(". ") 
        : error?.response?.data?.message || "Please check the form and try again.";

      toast.error("Unable to save staff details", {
        description: errorMessage,
      })
    }
  }

  const toggleLanguage = (lang: string) => {
    const current = form.getValues("languages")
    if (current.includes(lang)) {
      form.setValue("languages", current.filter(l => l !== lang))
    } else {
      form.setValue("languages", [...current, lang])
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl p-0 h-full flex flex-col border-l shadow-2xl overflow-hidden bg-white">
        <SheetHeader className="p-8 border-b bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl rotate-3">
               <Plus className="h-6 w-6 -rotate-3" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-slate-900 tracking-tight">
                {staff ? "Edit Staff Profile" : "Add New Staff"}
              </SheetTitle>
              <SheetDescription className="text-slate-500 font-medium">
                Enter the staff member's details to create or update their profile.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 px-8 py-6">
              <div className="space-y-12 pb-12">
                {/* Section 1: Demographics */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                     <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Basic Information</h3>
                     </div>
                     <span className="text-[9px] font-bold text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full">Section 01</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black text-slate-700 uppercase tracking-wider">First Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="John" className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all px-5 font-medium" {...field} />
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-black tracking-tight" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black text-slate-700 uppercase tracking-wider">Last Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all px-5 font-medium" {...field} />
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-black tracking-tight" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="role_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black text-slate-700 uppercase tracking-wider">Role <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all px-5 font-medium">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {rolesLoading ? (
                              <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : roles.length === 0 ? (
                              <div className="p-4 text-sm text-slate-500">No roles available</div>
                            ) : (
                              roles.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  {role.label}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px] uppercase font-black tracking-tight" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black text-slate-700 uppercase tracking-wider">Email Address <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="john@hospital.com" type="email" className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all px-5 font-medium" {...field} />
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-black tracking-tight" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black text-slate-700 uppercase tracking-wider">Phone Number <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="+91 98765 43210" className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all px-5 font-medium" {...field} />
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-black tracking-tight" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {!staff && (
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black text-slate-700 uppercase tracking-wider">Password <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="••••••••" type="password" className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all px-5 font-medium" {...field} />
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-black tracking-tight" />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Section 2: Professional Logistics */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                     <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-purple-600" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Work Settings</h3>
                     </div>
                     <span className="text-[9px] font-bold text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full">Section 02</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-slate-400" />
                      <Label className="text-xs font-black text-slate-700 uppercase tracking-wider">Languages</Label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {LANGUAGE_OPTIONS.map(lang => {
                          const isSelected = form.watch("languages").includes(lang)
                          return (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => toggleLanguage(lang)}
                              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black transition-all border uppercase tracking-widest ${
                                isSelected 
                                  ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-105" 
                                  : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                              }`}
                            >
                              {lang}
                            </button>
                          )
                       })}
                    </div>
                  </div>
                </div>

                {/* Section 3: Location */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                     <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-rose-600" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Address Details</h3>
                     </div>
                     <span className="text-[9px] font-bold text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full">Section 03</span>
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black text-slate-700 uppercase tracking-wider">Address <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full address" className="h-14 rounded-2xl bg-slate-50 border-slate-200 px-5" {...field} />
                        </FormControl>
                        <FormMessage className="text-[10px] uppercase font-black tracking-tight" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black text-slate-700 uppercase tracking-wider">City <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Mumbai" className="h-14 rounded-2xl bg-slate-50 border-slate-200 px-5 focus:ring-4 focus:ring-rose-50" {...field} />
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-black tracking-tight" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black text-slate-700 uppercase tracking-wider">Pincode</FormLabel>
                          <FormControl>
                            <Input placeholder="400001" className="h-14 rounded-2xl bg-slate-50 border-slate-200 px-5" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>

            <SheetFooter className="p-8 border-t bg-slate-50/50">
              <div className="flex gap-4 w-full">
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  variant="ghost"
                  className="flex-1 h-16 rounded-2xl font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest text-[11px]"
                  disabled={createStaffMutation.isPending || updateStaffMutation.isPending}
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  className="flex-[2] h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black shadow-2xl shadow-slate-900/20 transition-all active:scale-95 group overflow-hidden relative"
                  disabled={createStaffMutation.isPending || updateStaffMutation.isPending}
                >
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    {createStaffMutation.isPending || updateStaffMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="uppercase tracking-[0.2em] text-[11px]">Saving...</span>
                      </>
                    ) : (
                      <>
                        <span className="uppercase tracking-[0.2em] text-[11px]">
                          {staff ? "Save Changes" : "Add Staff Member"}
                        </span>
                      </>
                    )}
                  </div>
                </Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
