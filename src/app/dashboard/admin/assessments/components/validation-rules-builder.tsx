"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Info } from "lucide-react"

interface ValidationRulesBuilderProps {
  type: string
  value: Record<string, any>
  onChange: (value: Record<string, any>) => void
}

export function ValidationRulesBuilder({ type, value, onChange }: ValidationRulesBuilderProps) {
  const updateRule = (key: string, val: any) => {
    onChange({ ...value, [key]: val })
  }

  const renderNumberRules = () => (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min" className="text-[11px] font-black uppercase tracking-wider text-slate-400">Min Value</Label>
          <Input
            id="min"
            type="number"
            value={value.min ?? ""}
            onChange={(e) => updateRule("min", e.target.value !== "" ? Number(e.target.value) : undefined)}
            className="h-10 bg-white border-slate-200 focus:border-indigo-500 font-bold"
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max" className="text-[11px] font-black uppercase tracking-wider text-slate-400">Max Value</Label>
          <Input
            id="max"
            type="number"
            value={value.max ?? ""}
            onChange={(e) => updateRule("max", e.target.value !== "" ? Number(e.target.value) : undefined)}
            className="h-10 bg-white border-slate-200 focus:border-indigo-500 font-bold"
            placeholder="100"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 py-2">
        <div className="flex items-center justify-between border border-slate-100 bg-white p-3 rounded-xl">
          <Label htmlFor="allowDecimal" className="text-xs font-bold text-slate-600">Allow Decimals</Label>
          <Switch
            id="allowDecimal"
            checked={!!value.allowDecimal}
            onCheckedChange={(checked) => updateRule("allowDecimal", checked)}
          />
        </div>
        <div className="flex items-center justify-between border border-slate-100 bg-white p-3 rounded-xl">
          <Label htmlFor="isInteger" className="text-xs font-bold text-slate-600">Integer Only</Label>
          <Switch
            id="isInteger"
            checked={!!value.isInteger}
            onCheckedChange={(checked) => updateRule("isInteger", checked)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit" className="text-[11px] font-black uppercase tracking-wider text-slate-400">Display Unit</Label>
        <Input
          id="unit"
          value={value.unit ?? ""}
          onChange={(e) => updateRule("unit", e.target.value)}
          className="h-10 bg-white border-slate-200 focus:border-indigo-500 font-bold"
          placeholder="e.g., kg, cm, years"
        />
      </div>
    </div>
  )

  const renderTextRules = () => (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minLength" className="text-[11px] font-black uppercase tracking-wider text-slate-400">Min Length</Label>
          <Input
            id="minLength"
            type="number"
            value={value.minLength ?? ""}
            onChange={(e) => updateRule("minLength", e.target.value !== "" ? Number(e.target.value) : undefined)}
            className="h-10 bg-white border-slate-200 focus:border-indigo-500 font-bold"
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxLength" className="text-[11px] font-black uppercase tracking-wider text-slate-400">Max Length</Label>
          <Input
            id="maxLength"
            type="number"
            value={value.maxLength ?? ""}
            onChange={(e) => updateRule("maxLength", e.target.value !== "" ? Number(e.target.value) : undefined)}
            className="h-10 bg-white border-slate-200 focus:border-indigo-500 font-bold"
            placeholder="500"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="regex" className="text-[11px] font-black uppercase tracking-wider text-slate-400">Regex Pattern</Label>
        <Input
          id="regex"
          value={value.regex ?? ""}
          onChange={(e) => updateRule("regex", e.target.value)}
          className="h-10 bg-white border-slate-200 focus:border-indigo-500 font-bold font-mono text-[11px]"
          placeholder="e.g., ^[A-Z]{3}$"
        />
      </div>
    </div>
  )

  const renderCheckboxRules = () => (
    <div className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label htmlFor="maxSelections" className="text-[11px] font-black uppercase tracking-wider text-slate-400">Max Selections</Label>
        <Input
          id="maxSelections"
          type="number"
          value={value.maxSelections ?? ""}
          onChange={(e) => updateRule("maxSelections", e.target.value !== "" ? Number(e.target.value) : undefined)}
          className="h-10 bg-white border-slate-200 focus:border-indigo-500 font-bold"
          placeholder="e.g., 3"
        />
      </div>
    </div>
  )

  const renderRadioRules = () => (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center justify-between border border-slate-100 bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-0.5">
            <Label htmlFor="allow_other" className="text-xs font-black text-slate-700">Allow "Other" Option</Label>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Add an extra custom option</p>
          </div>
          <Switch
            id="allow_other"
            checked={!!value.allow_other}
            onCheckedChange={(checked) => updateRule("allow_other", checked)}
          />
        </div>
        
        {value.allow_other && (
          <div className="flex items-center justify-between border border-slate-100 bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-0.5">
              <Label htmlFor="other_description_required" className="text-xs font-black text-slate-700">Description Required</Label>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Make details mandatory for "Other"</p>
            </div>
            <Switch
              id="other_description_required"
              checked={!!value.other_description_required}
              onCheckedChange={(checked) => updateRule("other_description_required", checked)}
            />
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="bg-slate-50/80 p-5 rounded-2xl border-2 border-slate-100 space-y-5">
      <div className="flex items-center gap-2 text-indigo-600 mb-1">
        <Info className="h-4 w-4" />
        <h4 className="text-xs font-black uppercase tracking-[0.1em]">Validation Logic</h4>
      </div>

      {type === "number" && renderNumberRules()}
      {type === "text" && renderTextRules()}
      {type === "checkbox" && renderCheckboxRules()}
      {type === "radio" && renderRadioRules()}

      <div className="space-y-2 pt-2 border-t border-slate-200/60">
        <Label htmlFor="customMessage" className="text-[11px] font-black uppercase tracking-wider text-slate-400">Custom Error Message</Label>
        <Textarea
          id="customMessage"
          value={value.customMessage ?? ""}
          onChange={(e) => updateRule("customMessage", e.target.value)}
          className="bg-white border-slate-200 focus:border-indigo-500 font-bold text-xs"
          placeholder="e.g., Please enter a valid age between 18 and 100"
          rows={2}
        />
      </div>
    </div>
  )
}
