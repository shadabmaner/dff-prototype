"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { FAQ } from "@/types/admin"

interface FAQBuilderProps {
  faqs: FAQ[]
  onChange: (faqs: FAQ[]) => void
  showToggle?: boolean
}

export function FAQBuilder({ faqs, onChange, showToggle = true }: FAQBuilderProps) {
  const [enabled, setEnabled] = useState(faqs.length > 0)

  const addFAQ = () => {
    onChange([
      ...faqs,
      {
        id: crypto.randomUUID(),
        question: "",
        answer: "",
      },
    ])
  }

  const updateFAQ = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...faqs]
    updated[index][field] = value
    onChange(updated)
  }

  const removeFAQ = (index: number) => {
    onChange(faqs.filter((_, i) => i !== index))
  }

  const handleToggle = (checked: boolean) => {
    setEnabled(checked)
    if (!checked) {
      onChange([])
    }
  }

  return (
    <div className="space-y-4 border rounded-lg p-4">
      {showToggle && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-faq"
            checked={enabled}
            onCheckedChange={handleToggle}
          />
          <Label htmlFor="enable-faq" className="text-sm font-medium">
            Enable FAQ Section
          </Label>
        </div>
      )}

      {(enabled || !showToggle) && (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={faq.id} className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">FAQ #{index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFAQ(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  placeholder="Enter question"
                  value={faq.question}
                  onChange={(e) => updateFAQ(index, "question", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea
                  placeholder="Enter answer"
                  value={faq.answer}
                  onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addFAQ}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add More FAQ
          </Button>
        </div>
      )}
    </div>
  )
}
