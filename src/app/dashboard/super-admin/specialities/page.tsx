"use client"

import * as React from "react"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Search,
  Filter,
  Plus,
  Languages,
  Settings2,
  Edit3,
  Trash2,
  RotateCcw,
  Loader2,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react"
import { toast } from "sonner"

import { useSuperAdmin } from "@/components/super-admin/super-admin-context"
import type { SuperAdminSpecialty } from "@/components/super-admin/types"
import { LANGUAGE_OPTIONS, LANGUAGE_OPTION_VALUES, LANGUAGE_LABEL_LOOKUP } from "@/components/super-admin/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Drawer, DrawerContent, DrawerHeader, DrawerFooter } from "@/components/ui/drawer"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { uploadSpecialityAsset } from "@/lib/upload-asset"

const NAME_REGEX = /^[A-Za-z ]+$/
const CODE_REGEX = /^[A-Za-z-]+$/

const specialtySchema = z.object({
  name: z
    .string()
    .min(2, "Name is required")
    .refine((value) => NAME_REGEX.test(value.trim()), {
      message: "Only letters and spaces are allowed",
    }),
  description: z.string().optional(),
  code: z
    .string()
    .max(10, "Code should be shorter than 10 characters")
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || CODE_REGEX.test(value), {
      message: "Code can only contain letters and hyphen",
    }),
  category: z.string().optional().or(z.literal("")),
  icon_url: z.string().optional().or(z.literal("")),
  cover_image_url: z.string().optional().or(z.literal("")),
})

const editSchema = specialtySchema.extend({
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]),
})

const deliverySchema = z.object({
  languages: z.array(z.string()).min(1, "Select at least one language"),
  virtual: z.boolean(),
  inPerson: z.boolean(),
  homeVisit: z.boolean(),
})

type AssetField = "icon_url" | "cover_image_url"

export default function ManageMedicalSpecialitiesPage() {
  const router = useRouter()

  const {
    specialties,
    setFilters,
    createSpecialty,
    updateSpecialty,
    softDeleteSpecialty,
    restoreSpecialty,
  } = useSuperAdmin()

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<SuperAdminSpecialty | null>(null)
  const [deliveryTarget, setDeliveryTarget] = React.useState<SuperAdminSpecialty | null>(null)
  const [confirmArchive, setConfirmArchive] = React.useState<SuperAdminSpecialty | null>(null)
  const [assetUploading, setAssetUploading] = React.useState<Record<"icon_url" | "cover_image_url", boolean>>({
    icon_url: false,
    cover_image_url: false,
  })
  const [statusUpdating, setStatusUpdating] = React.useState(false)

  const { data, loading, filters } = specialties


  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchesQuery = filters.query
        ? item.name.toLowerCase().includes(filters.query.toLowerCase()) ||
        item.description?.toLowerCase().includes(filters.query.toLowerCase())
        : true
      const matchesStatus = filters.status === "ALL" ? true : item.status === filters.status
      return matchesQuery && matchesStatus
    })
  }, [data, filters])

  const createForm = useForm<z.infer<typeof specialtySchema>>({
    resolver: zodResolver(specialtySchema),
    defaultValues: { name: "", description: "", code: "", category: "", icon_url: "", cover_image_url: "" },
  })

  const handleAssetUpload = async (
    file: File | undefined,
    field: AssetField,
    setValue: (value: string) => void,
  ) => {
    if (!file) return
    setAssetUploading((prev) => ({ ...prev, [field]: true }))
    try {
      const fileUrl = await uploadSpecialityAsset(file, field === "icon_url" ? "icon" : "cover", {
        prefix: `specialities/${field === "icon_url" ? "icons" : "covers"}`,
      })
      setValue(fileUrl)
      toast.success(`${field === "icon_url" ? "Icon" : "Cover"} uploaded`)
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message ?? "Upload failed. Please try again.")
    } finally {
      setAssetUploading((prev) => ({ ...prev, [field]: false }))
    }
  }

  const editForm = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: "",
      description: "",
      code: "",
      category: "",
      icon_url: "",
      cover_image_url: "",
      status: "ACTIVE",
    },
  })

  const defaultDeliveryLanguages = React.useMemo(() => (LANGUAGE_OPTION_VALUES.length ? [LANGUAGE_OPTION_VALUES[0]] : []), [])

  const deliveryForm = useForm<z.infer<typeof deliverySchema>>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      languages: defaultDeliveryLanguages,
      virtual: true,
      inPerson: false,
      homeVisit: false,
    },
  })

  const handleCreate = async (values: z.infer<typeof specialtySchema>) => {
    try {
      await createSpecialty({
        name: values.name,
        description: values.description,
        category: values.category,
        code: values.code,
        icon_url: values.icon_url || undefined,
        cover_image_url: values.cover_image_url || undefined,
      })
      toast.success("Speciality created")
      createForm.reset()
      setCreateOpen(false)
    } catch (err: any) {
      toast.error(err?.message ?? "Unable to create specialty")
    }
  }

  const handleEdit = async (values: z.infer<typeof editSchema>) => {
    if (!editTarget) return
    try {
      await updateSpecialty(editTarget.id, {
        name: values.name,
        description: values.description,
        code: values.code,
        category: values.category,
        is_active: values.status === "ACTIVE",
        icon_url: values.icon_url?.trim() ? values.icon_url : null,
        cover_image_url: values.cover_image_url?.trim() ? values.cover_image_url : null,
      })
      toast.success("Speciality updated")
      setEditTarget(null)
    } catch (err: any) {
      toast.error(err?.message ?? "Unable to update specialty")
    }
  }

  const handleStatusChange = async (value: z.infer<typeof editSchema>["status"]) => {
    if (!editTarget) return
    setStatusUpdating(true)
    try {
      await updateSpecialty(editTarget.id, {
        status: value,
        is_active: value === "ACTIVE",
      })
      editForm.setValue("status", value, { shouldDirty: true })
      toast.success(`Status updated to ${value}`)
    } catch (err: any) {
      toast.error(err?.message ?? "Unable to update status")
    } finally {
      setStatusUpdating(false)
    }
  }

  const handleDeliverySave = async (values: z.infer<typeof deliverySchema>) => {
    if (!deliveryTarget) return
    try {
      await updateSpecialty(deliveryTarget.id, {
        languages: values.languages,
        deliveryModes: {
          virtual: values.virtual,
          inPerson: values.inPerson,
          homeVisit: values.homeVisit,
        },
      })
      toast.success("Delivery settings updated")
      setDeliveryTarget(null)
    } catch (err: any) {
      toast.error(err?.message ?? "Unable to update delivery settings")
    }
  }

  const handleArchive = async () => {
    if (!confirmArchive) return
    try {
      await softDeleteSpecialty(confirmArchive.id)
      toast.success("Speciality archived", {
        action: {
          label: "Undo",
          onClick: async () => {
            await restoreSpecialty(confirmArchive.id)
          },
        },
      })
      setConfirmArchive(null)
    } catch {
      toast.error("Unable to archive speciality")
    }
  }

  const handleRestore = async (item: SuperAdminSpecialty) => {
    try {
      await restoreSpecialty(item.id)
      toast.success("Speciality restored")
    } catch {
      toast.error("Unable to restore speciality")
    }
  }

  const statusBadgeClasses: Record<string, string> = {
    ACTIVE: "bg-blue-500/10 text-blue-600",
    INACTIVE: "bg-amber-500/10 text-amber-600",
    ARCHIVED: "bg-slate-100 text-slate-500",
  }

  const openEditDrawer = (item: SuperAdminSpecialty) => {
    setEditTarget(item)
    editForm.reset({
      name: item.name,
      description: item.description ?? "",
      code: item.code ?? "",
      category: item.category ?? "",
      icon_url: item.iconUrl ?? "",
      cover_image_url: item.coverImageUrl ?? "",
      status: item.status,
    })
  }

  const openDeliveryDialog = (item: SuperAdminSpecialty) => {
    setDeliveryTarget(item)
    deliveryForm.reset({
      languages: item.languages?.length ? item.languages : defaultDeliveryLanguages,
      virtual: item.deliveryModes.virtual,
      inPerson: item.deliveryModes.inPerson,
      homeVisit: item.deliveryModes.homeVisit,
    })
  }

  const renderEmpty = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={5} className="py-12 text-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading specialties...
            </div>
          </td>
        </tr>
      )
    }

    if (!filtered.length) {
      return (
        <tr>
          <td colSpan={5} className="py-12 text-center">
            <div className="flex flex-col items-center gap-2">
              <Languages className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">No specialties found</p>
              <p className="text-xs text-muted-foreground">Adjust your search or filters to discover more.</p>
              <Button variant="outline" onClick={() => setFilters({ query: "", status: "ALL", category: "ALL" })}>
                Reset filters
              </Button>
            </div>
          </td>
        </tr>
      )
    }
  }

  const catalogueQuery = React.useMemo(() => {
    const params = new URLSearchParams()
    if (filters.query) params.set("query", filters.query)
    if (filters.status && filters.status !== "ALL") params.set("status", filters.status)
    if (filters.category && filters.category !== "ALL") params.set("category", filters.category)
    return params.toString()
  }, [filters])
console.log(filtered,"filtered")
  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-900"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-medium">Super Admin / Medical Specialities</p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Medical Specialities</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Manage clinical service lines and specialty configurations across the platform.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setFilters({ status: "ACTIVE" })}>
              <Filter className="mr-2 h-4 w-4" /> Active Only
            </Button>
            <Button className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Speciality
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200 shadow-lg">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search specialities..."
            className="h-12 pl-11 rounded-xl border-slate-200 bg-white focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={filters.query}
            onChange={(event) => setFilters({ query: event.target.value })}
          />
        </div>
        <Select
          value={filters.status ?? "ALL"}
          onValueChange={(value) => setFilters({ status: value as any })}
        >
          <SelectTrigger className="h-12 w-full md:w-[200px] rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200">
            <SelectItem value="ALL">All States</SelectItem>
            <SelectItem value="ACTIVE">Active Only</SelectItem>
            <SelectItem value="INACTIVE">Inactive Only</SelectItem>
            <SelectItem value="ARCHIVED">Archived Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Specialities Table */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Specialities Catalogue</h2>
            </div>
            <Badge variant="outline" className="text-xs font-semibold">
              {filtered.length} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="pl-6 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Speciality Details
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Languages
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold text-center">
                  Programs
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Status
                </TableHead>
                <TableHead className="text-right pr-6 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderEmpty()}
              {filtered.map((item) => (
                <TableRow
                  key={item.id}
                  className="group border-slate-50 transition-colors cursor-pointer hover:bg-blue-50/30"
                  onClick={() => router.push(`/dashboard/super-admin/specialities/${item.id}/languages${catalogueQuery ? `?${catalogueQuery}` : ""}`)}
                >
                  <TableCell className="pl-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">{item.name}</p>
                        <ArrowUpRight className="h-3 w-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <span className="text-xs text-slate-500">CODE: {item.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                      {item.languages.slice(0, 3).map((language) => {
                        const label = LANGUAGE_LABEL_LOOKUP[language] ?? language
                        return (
                          <Badge key={language} variant="secondary" className="text-xs bg-slate-100 text-slate-700 border-slate-200">
                            {label}
                          </Badge>
                        )
                      })}
                      {item.languages.length > 3 && (
                        <Badge variant="outline" className="text-xs border-slate-200 text-slate-500">
                          +{item.languages.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex flex-col items-center">
                      <div className="text-lg font-bold text-slate-900 tabular-nums">{item.programs_count}</div>
                      <p className="text-xs text-slate-500">Programs</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("px-3 py-1 text-xs font-semibold", statusBadgeClasses[item.status])}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-slate-100">
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200 shadow-lg p-2">
                        {/* <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer">
                          <Link
                            href={`/dashboard/super-admin/specialities/${item.id}/languages${catalogueQuery ? `?${catalogueQuery}` : ""}`}
                            className="flex items-center font-bold text-slate-700"
                          >
                            <Languages className="mr-3 h-4 w-4 text-primary" /> View Intelligence
                          </Link>
                        </DropdownMenuItem> */}
                        {/* <DropdownMenuSeparator className="mx-2" /> */}
                        <DropdownMenuItem onClick={() => openEditDrawer(item)} className="rounded-xl py-3 cursor-pointer font-bold text-slate-700">
                          <Edit3 className="mr-3 h-4 w-4 text-primary" /> Edit Parameters
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem onClick={() => openDeliveryDialog(item)} className="rounded-xl py-3 cursor-pointer font-bold text-slate-700">
                          <Languages className="mr-3 h-4 w-4 text-primary" /> Surface Controls
                        </DropdownMenuItem> */}
                        <DropdownMenuSeparator className="mx-2" />
                        {item.status === "ARCHIVED" ? (
                          <DropdownMenuItem onClick={() => handleRestore(item)} className="rounded-xl py-3 cursor-pointer font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                            <RotateCcw className="mr-3 h-4 w-4" /> Finalize Restore
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => setConfirmArchive(item)} className="rounded-xl py-3 cursor-pointer font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                            <Trash2 className="mr-3 h-4 w-4" /> Depot Archive
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Drawer */}
      <Drawer
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) createForm.reset()
        }}
        direction="right"
      >
        <DrawerContent className="h-full min-w-lg max-w-3xl overflow-y-auto border-l bg-white/95 shadow-2xl backdrop-blur-xl sm:max-w-3xl">
          <DrawerHeader className="px-10 pt-10 pb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Medical Speciality</h2>
            <p className="text-[11px] uppercase font-black tracking-[0.2em] text-slate-400 mt-1">
              Capture essential clinical metadata to initialize the record.
            </p>
          </DrawerHeader>
          <div className="px-10 py-6">
            <Form {...createForm}>
              <form className="space-y-4" onSubmit={createForm.handleSubmit(handleCreate)}>
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500">Speciality name</FormLabel>
                      <FormControl>
                        <Input className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium" placeholder="e.g. Endocrinology" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500">Description</FormLabel>
                      <FormControl>
                        <Textarea className="rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium" rows={3} placeholder="Add a short clinical overview" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={createForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500">Catalogue Code</FormLabel>
                        <FormControl>
                          <Input className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium" placeholder="e.g. WM" {...field} />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500">Category (optional)</FormLabel>
                        <FormControl>
                          <Input className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium" placeholder="Leave blank for now" {...field} />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-1">
                  <FormField
                    control={createForm.control}
                    name="icon_url"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500">Icon Image</FormLabel>
                        <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4">
                          {field.value ? (
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 overflow-hidden rounded-xl border border-slate-200 bg-white">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={field.value} alt="Icon preview" className="h-full w-full object-cover" />
                                </div>
                                <span className="text-xs font-semibold text-slate-600">Preview ready</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-[11px] font-black uppercase tracking-widest"
                                onClick={() => field.onChange("")}
                                disabled={assetUploading.icon_url}
                              >
                                Clear
                              </Button>
                            </div>
                          ) : (
                            <FormControl>
                              <Input
                                type="file"
                                accept="image/*"
                                className="border-none cursor-pointer bg-transparent p-0 text-xs font-semibold text-slate-500"
                                onChange={(event) => {
                                  void handleAssetUpload(event.target.files?.[0], "icon_url", (value) =>
                                    createForm.setValue("icon_url", value, { shouldDirty: true }),
                                  )
                                  event.target.value = ""
                                }}
                                disabled={assetUploading.icon_url}
                              />
                            </FormControl>
                          )}
                        </div>
                        {assetUploading.icon_url && <p className="text-[10px] font-semibold text-primary">Uploading icon…</p>}
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="cover_image_url"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500">Cover Image</FormLabel>
                        <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4">
                          {field.value ? (
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="h-16 w-24 overflow-hidden rounded-xl border border-slate-200 bg-white">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={field.value} alt="Cover preview" className="h-full w-full object-cover" />
                                </div>
                                <span className="text-xs font-semibold text-slate-600">Preview ready</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-[11px] font-black uppercase tracking-widest"
                                onClick={() => field.onChange("")}
                                disabled={assetUploading.cover_image_url}
                              >
                                Clear
                              </Button>
                            </div>
                          ) : (
                            <FormControl>
                              <Input
                                type="file"
                                accept="image/*"
                                className="border-none cursor-pointer bg-transparent p-0 text-xs font-semibold text-slate-500"
                                onChange={(event) => {
                                  void handleAssetUpload(event.target.files?.[0], "cover_image_url", (value) =>
                                    createForm.setValue("cover_image_url", value, { shouldDirty: true }),
                                  )
                                  event.target.value = ""
                                }}
                                disabled={assetUploading.cover_image_url}
                              />
                            </FormControl>
                          )}
                        </div>
                        {assetUploading.cover_image_url && <p className="text-[10px] font-semibold text-primary">Uploading cover…</p>}
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="cursor-pointer w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]" disabled={createForm.formState.isSubmitting}>
                  {createForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Finalize and Create
                </Button>
              </form>
            </Form>
          </div>
          <DrawerFooter className="px-10 pb-10 pt-2">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Settings2 className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                You can enrich languages and delivery modes in the governance panel after creation.
              </p>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Edit Drawer */}
      <Drawer
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null)
        }}
        direction="right"
      >
        <DrawerContent className="h-full min-w-lg max-w-3xl overflow-y-auto border-l bg-white/95 shadow-2xl backdrop-blur-xl sm:max-w-3xl">
          <DrawerHeader className="px-10 pt-10 pb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Speciality</h2>
            <p className="text-[11px] uppercase font-black tracking-[0.2em] text-slate-400 mt-1">Refine catalogue parameters and clinical coverage.</p>
          </DrawerHeader>
          <div className="px-10 py-6">
            <Form {...editForm}>
              <form className="space-y-4" onSubmit={editForm.handleSubmit(handleEdit)}>
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500">Catalogue Name</FormLabel>
                      <FormControl>
                        <Input className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-bold" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={editForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500">Catalogue Code</FormLabel>
                        <FormControl>
                          <Input className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium" placeholder="e.g. WM" {...field} />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500">Category (optional)</FormLabel>
                        <FormControl>
                          <Input className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium" placeholder="Leave blank for now" {...field} />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-1">
                  <FormField
                    control={editForm.control}
                    name="icon_url"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500">Icon Image</FormLabel>
                        <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4">
                          {field.value ? (
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 overflow-hidden rounded-xl border border-slate-200 bg-white">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={field.value} alt="Icon preview" className="h-full w-full object-cover" />
                                </div>
                                <span className="text-xs font-semibold text-slate-600">Preview ready</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-[11px] font-black uppercase tracking-widest"
                                onClick={() => field.onChange("")}
                                disabled={assetUploading.icon_url}
                              >
                                Clear
                              </Button>
                            </div>
                          ) : (
                            <FormControl>
                              <Input
                                type="file"
                                accept="image/*"
                                className="border-none cursor-pointer bg-transparent p-0 text-xs font-semibold text-slate-500"
                                onChange={(event) => {
                                  void handleAssetUpload(event.target.files?.[0], "icon_url", (value) =>
                                    editForm.setValue("icon_url", value, { shouldDirty: true }),
                                  )
                                  event.target.value = ""
                                }}
                                disabled={assetUploading.icon_url}
                              />
                            </FormControl>
                          )}
                        </div>
                        {assetUploading.icon_url && <p className="text-[10px] font-semibold text-primary">Uploading icon…</p>}
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="cover_image_url"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[11px] font-black uppercase tracking-widest text-slate-500">Cover Image</FormLabel>
                        <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4">
                          {field.value ? (
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="h-16 w-24 overflow-hidden rounded-xl border border-slate-200 bg-white">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={field.value} alt="Cover preview" className="h-full w-full object-cover" />
                                </div>
                                <span className="text-xs font-semibold text-slate-600">Preview ready</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-[11px] font-black uppercase tracking-widest"
                                onClick={() => field.onChange("")}
                                disabled={assetUploading.cover_image_url}
                              >
                                Clear
                              </Button>
                            </div>
                          ) : (
                            <FormControl>
                              <Input
                                type="file"
                                accept="image/*"
                                className="border-none cursor-pointer bg-transparent p-0 text-xs font-semibold text-slate-500"
                                onChange={(event) => {
                                  void handleAssetUpload(event.target.files?.[0], "cover_image_url", (value) =>
                                    editForm.setValue("cover_image_url", value, { shouldDirty: true }),
                                  )
                                  event.target.value = ""
                                }}
                                disabled={assetUploading.cover_image_url}
                              />
                            </FormControl>
                          )}
                        </div>
                        {assetUploading.cover_image_url && <p className="text-[10px] font-semibold text-primary">Uploading cover…</p>}
                        <FormMessage className="text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        disabled={statusUpdating}
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          void handleStatusChange(value as z.infer<typeof editSchema>["status"])
                        }}
                      >
                        <FormControl className="w-full cursor-pointer">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
               
                <Button type="submit" className="w-full h-12 cursor-pointer rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]" disabled={editForm.formState.isSubmitting}>
                  {editForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Commit Changes
                </Button>
              </form>
            </Form>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Delivery Dialog */}
      <Dialog
        open={!!deliveryTarget}
        onOpenChange={(open) => {
          if (!open) setDeliveryTarget(null)
        }}
      >
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden max-w-lg">
          <DialogHeader className="p-10 pb-6 bg-slate-50 border-b border-slate-100">
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Surface Experience</DialogTitle>
            <DialogDescription className="text-[11px] uppercase font-black tracking-[0.2em] text-slate-400 mt-1">
              Configure patient-facing delivery vectors per speciality.
            </DialogDescription>
          </DialogHeader>
          <div className="p-10 pt-6">
            <Form {...deliveryForm}>
              <form className="space-y-4" onSubmit={deliveryForm.handleSubmit(handleDeliverySave)}>
                <FormField
                  control={deliveryForm.control}
                  name="languages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supported languages</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {LANGUAGE_OPTIONS.map((option) => {
                          const active = field.value.includes(option.value)
                          return (
                            <Button
                              key={option.value}
                              type="button"
                              variant={active ? "default" : "outline"}
                              size="sm"
                              className={cn("rounded-full px-3", active ? "bg-primary text-white" : "text-muted-foreground")}
                              onClick={() => {
                                if (active) {
                                  field.onChange(field.value.filter((item) => item !== option.value))
                                } else {
                                  field.onChange([...field.value, option.value])
                                }
                              }}
                            >
                              {option.label}
                            </Button>
                          )
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="rounded-xl border border-border/40 p-4">
                  <p className="mb-3 text-sm font-semibold">Delivery modes</p>
                  <div className="space-y-3">
                    {(
                      [
                        { label: "Virtual", key: "virtual" },
                        { label: "In-person", key: "inPerson" },
                        { label: "Home visit", key: "homeVisit" },
                      ] as const
                    ).map((mode) => (
                      <FormField
                        key={mode.key}
                        control={deliveryForm.control}
                        name={mode.key}
                        render={({ field }) => (
                          <div className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2">
                            <div>
                              <p className="text-sm font-medium">{mode.label}</p>
                              <p className="text-xs text-muted-foreground">
                                Enable if speciality delivers via {mode.label.toLowerCase()}.
                              </p>
                            </div>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </div>
                        )}
                      />
                    ))}
                  </div>
                </div>
                <DialogFooter className="mt-8 pt-6 border-t border-slate-100">
                  <Button variant="ghost" type="button" onClick={() => setDeliveryTarget(null)} className="h-11 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">Cancel</Button>
                  <Button type="submit" className="h-11 rounded-xl px-10 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20" disabled={deliveryForm.formState.isSubmitting}>
                    {deliveryForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Preferences
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Archive confirm */}
      <Dialog
        open={!!confirmArchive}
        onOpenChange={(open) => {
          if (!open) setConfirmArchive(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Archive speciality
            </DialogTitle>
            <DialogDescription>
              Archived specialities disappear from quoting flows but can be restored later.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to archive <span className="font-semibold text-foreground">{confirmArchive?.name}</span>?
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button className="cursor-pointer" variant="outline" onClick={() => setConfirmArchive(null)}>
              Cancel
            </Button>
            <Button className="cursor-pointer" variant="destructive" onClick={handleArchive}>
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
