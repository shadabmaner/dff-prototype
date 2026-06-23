"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DrawerContent, DrawerFooter, DrawerHeader } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export type PricingDrawerMode = "list" | "create" | "edit";

export type PricingWindowFormState = {
  currency: string;
  basePrice: string;
  enrollmentFee: string;
  enrollmentFeeAdjustable: boolean;
  maxDiscountPercent: string;
  maxDiscountAmount: string;
  effectiveFrom: string;
  effectiveTo: string;
};

interface PricingWindowDrawerLayoutProps {
  programName?: string | null;
  programLanguage?: string | null;
  programCode?: string | null;
  mode: PricingDrawerMode;
  children: React.ReactNode;
}

const DRAWER_TITLES: Record<PricingDrawerMode, string> = {
  list: "Pricing windows",
  create: "Create pricing window",
  edit: "Edit pricing window",
};

const DRAWER_DESCRIPTIONS: Record<PricingDrawerMode, string> = {
  list: "Review, activate, or retire pricing windows for this workflow program.",
  create: "Send a new pricing entry for this workflow program.",
  edit: "Update enrollment and discount settings for this window.",
};

export function PricingWindowDrawerLayout({
  children,
  mode,
  programCode,
  programLanguage,
  programName,
}: PricingWindowDrawerLayoutProps) {
  return (
    <DrawerContent className="flex flex-col bg-gradient-to-b from-white via-slate-50 to-slate-100/70">
      <DrawerHeader className="gap-2 border-b border-slate-100 bg-white/80">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">
          {programName ?? "Workflow program"}
        </p>
        <h3 className="text-2xl font-black text-slate-900">{DRAWER_TITLES[mode]}</h3>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <Badge variant="outline" className="rounded-full border-slate-200 text-slate-500">
            {programLanguage ?? "Locale"}
          </Badge>
          <span>Program code {programCode ?? "—"}</span>
        </div>
        <p className="text-xs text-slate-500">{DRAWER_DESCRIPTIONS[mode]}</p>
      </DrawerHeader>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </DrawerContent>
  );
}

interface PricingWindowFormProps {
  mode: Extract<PricingDrawerMode, "create" | "edit">;
  form: PricingWindowFormState;
  setForm: React.Dispatch<React.SetStateAction<PricingWindowFormState>>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isPending?: boolean;
  cancelLabel?: string;
  submitLabel?: string;
}

export function PricingWindowForm({
  form,
  isPending,
  mode,
  onCancel,
  onSubmit,
  setForm,
  cancelLabel = "Cancel",
  submitLabel,
}: PricingWindowFormProps) {
  const effectiveSubmitLabel = submitLabel ?? (mode === "edit" ? "Save changes" : "Save pricing");

  return (
    <form className="space-y-5 px-6 py-6" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Currency</Label>
          <Input
            value={form.currency}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Base price</Label>
          <Input
            type="number"
            min={0}
            value={form.basePrice}
            onChange={(event) => setForm((prev) => ({ ...prev, basePrice: event.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Enrollment fee</Label>
          <Input
            type="number"
            min={0}
            value={form.enrollmentFee}
            onChange={(event) => setForm((prev) => ({ ...prev, enrollmentFee: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Effective from</Label>
          <Input
            type="date"
            value={form.effectiveFrom}
            onChange={(event) => setForm((prev) => ({ ...prev, effectiveFrom: event.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Effective to</Label>
          <Input
            type="date"
            value={form.effectiveTo}
            onChange={(event) => setForm((prev) => ({ ...prev, effectiveTo: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Max discount %</Label>
          <Input
            type="number"
            min={0}
            value={form.maxDiscountPercent}
            onChange={(event) => setForm((prev) => ({ ...prev, maxDiscountPercent: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Max discount amount</Label>
          <Input
            type="number"
            min={0}
            value={form.maxDiscountAmount}
            onChange={(event) => setForm((prev) => ({ ...prev, maxDiscountAmount: event.target.value }))}
          />
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Enrollment fee adjustable</p>
            <p className="text-xs text-muted-foreground">Allow coordinators to adjust per enrollment.</p>
          </div>
          <Switch
            checked={form.enrollmentFeeAdjustable}
            onCheckedChange={(checked) =>
              setForm((prev) => ({ ...prev, enrollmentFeeAdjustable: checked }))
            }
          />
        </div>
      </div>
      <DrawerFooter className="border-t border-slate-100 pt-4">
        <Button
          type="button"
          variant="ghost"
          className="rounded-full"
          onClick={onCancel}
          disabled={isPending}
        >
          {cancelLabel}
        </Button>
        <Button type="submit" className="rounded-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {effectiveSubmitLabel}
        </Button>
      </DrawerFooter>
    </form>
  );
}
