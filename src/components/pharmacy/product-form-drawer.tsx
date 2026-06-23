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
import { cn } from "@/lib/utils"

const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200, "Name must be under 200 characters"),
  category: z.string().min(1, "Category is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.string().min(1, "Price is required"),
  stock: z.string().min(1, "Stock is required"),
  minStock: z.string().min(1, "Minimum stock is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ProductFormData) => void
  editData?: ProductFormData | null
}

const categories = [
  "Diabetes",
  "Cardiovascular",
  "Thyroid",
  "Gastric",
  "Respiratory",
  "Allergy",
  "Pain Management",
  "Antibiotics",
]

const manufacturers = [
  "Sun Pharma",
  "Pfizer",
  "Abbott",
  "Dr. Reddy's",
  "Cipla",
  "Torrent",
  "Lupin",
  "Zydus",
]

export function ProductFormDrawer({ open, onOpenChange, onSubmit, editData }: ProductFormDrawerProps) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      manufacturer: "",
      sku: "",
      price: "",
      stock: "",
      minStock: "",
      expiryDate: "",
    },
  })

  React.useEffect(() => {
    if (editData) {
      form.reset(editData)
    } else {
      form.reset({
        name: "",
        category: "",
        manufacturer: "",
        sku: "",
        price: "",
        stock: "",
        minStock: "",
        expiryDate: "",
      })
    }
  }, [editData, form])

  const handleSubmit = (data: ProductFormData) => {
    onSubmit(data)
    form.reset()
    onOpenChange(false)
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>{editData ? "Edit Product" : "Add New Product"}</DrawerTitle>
          <DrawerDescription>
            {editData ? "Update product details" : "Add a new pharmaceutical product to inventory"}
          </DrawerDescription>
        </DrawerHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full overflow-auto w-full">
            <div className="flex-1 overflow-y-auto px-4 space-y-4 w-full">
              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Metformin 500mg"
                        className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl className="w-full">
                        <SelectTrigger className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40 w-full")}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
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
                name="manufacturer"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Manufacturer *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl className="w-full">
                        <SelectTrigger className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40 w-full")}>
                          <SelectValue placeholder="Select manufacturer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {manufacturers.map((manufacturer) => (
                          <SelectItem key={manufacturer} value={manufacturer}>
                            {manufacturer}
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
                name="sku"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>SKU *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="MET-500-100"
                        className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Price (₹) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          placeholder="45.50"
                          className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Stock *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          placeholder="150"
                          className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minStock"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Min Stock *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          placeholder="20"
                          className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Expiry Date *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive/40")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DrawerFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editData ? "Update" : "Add Product"}
              </Button>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  )
}
