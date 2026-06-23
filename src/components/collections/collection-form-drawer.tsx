"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useCreateCollection, useUpdateCollection } from "@/hooks/use-collections"
import { useSpecialities } from "@/hooks/use-dropdowns"
import type { Collection } from "@/types/collection-api"
import { cn } from "@/lib/utils"

const collectionSchema = z.object({
  speciality_id: z.string().min(1, "Speciality is required"),
  program_id: z.string().nullable().optional(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be under 200 characters"),
  description: z
    .string()
    .max(1000, "Description can’t exceed 1000 characters")
    .nullable()
    .optional(),
  collection_unlock_strategy: z.enum(["immediate", "after_previous_complete", "on_journey_day", "manual"]).optional(),
  collection_unlock_day: z.number().nullable().optional(),
  item_unlock_strategy: z.enum(["sequential", "all_open", "day_based", "manual"]).optional(),
  notification_channels: z.array(z.enum(["push", "email", "sms"])).optional(),
  is_active: z.enum(["active", "inactive"]).optional(),
  skip_weekends: z.boolean().optional(),
})

type CollectionFormData = z.infer<typeof collectionSchema>

interface CollectionFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collection?: Collection | null
  defaultSpecialityId?: string
}

export function CollectionFormDrawer({
  open,
  onOpenChange,
  collection,
  defaultSpecialityId,
}: CollectionFormDrawerProps) {
  const createMutation = useCreateCollection()
  const updateMutation = useUpdateCollection()
  const { data: specialitiesResponse } = useSpecialities()
  const specialities = specialitiesResponse || []
  const isEditing = Boolean(collection)

  const form = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      speciality_id:  "",
      program_id: null,
      name: "",
      description: "",
      collection_unlock_strategy: "immediate",
      item_unlock_strategy: "sequential",
      notification_channels: ["push"],
      is_active: "active",
      skip_weekends: false,
    },
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form

  const specialityIdValue = watch("speciality_id")

  const selectedSpecialityName = React.useMemo(() => {
    if (!specialityIdValue) return "Speciality not selected"
    return specialities.find((speciality) => speciality.id === specialityIdValue)?.name || "Speciality not available"
  }, [specialities, specialityIdValue])

  React.useEffect(() => {
    if (collection) {
      reset({
        speciality_id: collection.speciality_id,
        program_id: collection.program_id,
        name: collection.name,
        description: collection.description,
        collection_unlock_strategy: collection.collection_unlock_strategy,
        collection_unlock_day: collection.collection_unlock_day,
        item_unlock_strategy: collection.item_unlock_strategy,
        notification_channels: collection.notification_channels,
        is_active: collection.is_active ? "active" : "inactive",
        skip_weekends: collection.skip_weekends ?? false,
      })
    } else {
      reset({
        speciality_id: "",
        program_id: null,
        name: "",
        description: "",
        collection_unlock_strategy: "immediate",
        item_unlock_strategy: "sequential",
        notification_channels: ["push"],
        is_active: "active",
        skip_weekends: false,
      })
    }
  }, [collection, reset])

  React.useEffect(() => {
    if (isEditing) return
    if (!specialityIdValue && specialities.length > 0) {
      setValue("speciality_id", specialities[0].id)
    }
  }, [isEditing, specialityIdValue, setValue, specialities])

  const onSubmit = async (data: CollectionFormData) => {
    const basePayload = {
      ...data,
      is_active: (data.is_active || "active") === "active",
    }

    if (isEditing && collection) {
      const { speciality_id: _omitSpeciality, program_id: _omitProgram, ...updatePayload } = basePayload
      await updateMutation.mutateAsync({
        collectionId: collection.id,
        payload: updatePayload,
      })
    } else {
      await createMutation.mutateAsync(basePayload)
    }
    onOpenChange(false)
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="">
        <DrawerHeader>
          <DrawerTitle>{isEditing ? "Edit Collection" : "Create Collection"}</DrawerTitle>
          <DrawerDescription>
            {isEditing ? "Update collection details" : "Create a new month/phase collection"}
          </DrawerDescription>
        </DrawerHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full overflow-auto w-full">
            <div className="flex-1 overflow-y-auto px-4 space-y-4 w-full">
              <FormField
                control={control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Month 1 — 21-Day Collection"
                        className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="description"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Foundation phase: breathing, posture, basic movement"
                        rows={3}
                        className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="speciality_id"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Speciality *</FormLabel>
                    {isEditing ? (
                      <>
                        <FormControl>
                          <Input value={selectedSpecialityName} disabled readOnly className="bg-muted" />
                        </FormControl>
                        <input type="hidden" {...field} value={field.value || ""} />
                      </>
                    ) : (
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl className="w-full">
                          <SelectTrigger className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40 w-full")}>
                            <SelectValue placeholder="Select speciality" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {specialities.map((speciality) => (
                            <SelectItem key={speciality.id} value={speciality.id}>
                              {speciality.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="collection_unlock_strategy"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Collection Unlock Strategy</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "immediate"}>
                      <FormControl className="w-full">
                        <SelectTrigger className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40 w-full")}>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="after_previous_complete">After Previous Complete</SelectItem>
                        <SelectItem value="on_journey_day">On Journey Day</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="item_unlock_strategy"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Item Unlock Strategy</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "sequential"}>
                      <FormControl className="w-full">
                        <SelectTrigger className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40 w-full")}>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sequential">Sequential</SelectItem>
                        <SelectItem value="all_open">All Open</SelectItem>
                        <SelectItem value="day_based">Day Based</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="is_active"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "active"}>
                      <FormControl className="w-full">
                        <SelectTrigger className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40 w-full")}>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Skip Weekends</Label>
                <div className="flex items-center space-x-4 w-full mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="skip_weekends_yes"
                      checked={watch("skip_weekends") === true}
                      onChange={() => setValue("skip_weekends", true)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <Label htmlFor="skip_weekends_yes" className="font-normal cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="skip_weekends_no"
                      checked={watch("skip_weekends") === false}
                      onChange={() => setValue("skip_weekends", false)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <Label htmlFor="skip_weekends_no" className="font-normal cursor-pointer">
                      No
                    </Label>
                  </div>
                </div>
              </div>
            </div>

          <DrawerFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </DrawerFooter>
        </form>
        </Form>
      </DrawerContent>
    </Drawer>
  )
}
