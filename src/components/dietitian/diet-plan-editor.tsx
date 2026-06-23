"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Copy, Trash2, Calendar } from "lucide-react"
import { toast } from "sonner"

interface Meal {
  time: string
  items: string[]
  calories: number
  notes?: string
}

interface DayPlan {
  day: string
  breakfast: Meal
  lunch: Meal
  snacks: Meal
  dinner: Meal
}

export function DietPlanEditor() {
  const [selectedWeek, setSelectedWeek] = useState("1")
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMeal, setEditingMeal] = useState<{ day: string; mealType: string } | null>(null)
  const [applyOption, setApplyOption] = useState<"today" | "all-mondays" | "next-15">( "today")

  const weekPlan: DayPlan[] = [
    {
      day: "Monday",
      breakfast: {
        time: "8:00 AM",
        items: ["Oats with milk", "1 banana", "Green tea"],
        calories: 350
      },
      lunch: {
        time: "1:00 PM",
        items: ["Brown rice", "Dal", "Mixed vegetables", "Salad"],
        calories: 450
      },
      snacks: {
        time: "4:00 PM",
        items: ["Handful of nuts", "Green tea"],
        calories: 150
      },
      dinner: {
        time: "7:00 PM",
        items: ["Roti (2)", "Grilled chicken", "Vegetable soup"],
        calories: 400
      }
    },
  ]

  const handleEditMeal = (day: string, mealType: string) => {
    setEditingMeal({ day, mealType })
    setShowEditModal(true)
  }

  const handleSaveMeal = () => {
    if (!editingMeal) return
    
    let message = ""
    if (applyOption === "today") {
      message = "Meal updated for today only"
    } else if (applyOption === "all-mondays") {
      message = `Meal updated for all ${editingMeal.day}s`
    } else if (applyOption === "next-15") {
      message = "Meal updated for next 15 days"
    }
    
    toast.success(message)
    setShowEditModal(false)
    setEditingMeal(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Diet Plan Editor</h2>
          <p className="text-muted-foreground">Create and manage weekly diet plans</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Week 1</SelectItem>
              <SelectItem value="2">Week 2</SelectItem>
              <SelectItem value="3">Week 3</SelectItem>
              <SelectItem value="4">Week 4</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="Monday" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
            <TabsTrigger key={day} value={day}>{day.slice(0, 3)}</TabsTrigger>
          ))}
        </TabsList>

        {weekPlan.map((dayPlan) => (
          <TabsContent key={dayPlan.day} value={dayPlan.day} className="space-y-4">
            <MealCard
              title="Breakfast"
              meal={dayPlan.breakfast}
              onEdit={() => handleEditMeal(dayPlan.day, "breakfast")}
            />
            <MealCard
              title="Lunch"
              meal={dayPlan.lunch}
              onEdit={() => handleEditMeal(dayPlan.day, "lunch")}
            />
            <MealCard
              title="Snacks"
              meal={dayPlan.snacks}
              onEdit={() => handleEditMeal(dayPlan.day, "snacks")}
            />
            <MealCard
              title="Dinner"
              meal={dayPlan.dinner}
              onEdit={() => handleEditMeal(dayPlan.day, "dinner")}
            />

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Daily Calories</span>
                  <Badge variant="default" className="text-base">
                    {dayPlan.breakfast.calories + dayPlan.lunch.calories + dayPlan.snacks.calories + dayPlan.dinner.calories} kcal
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Meal</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Meal Items</Label>
              <Textarea
                placeholder="Enter meal items (one per line)"
                rows={5}
                defaultValue="Oats with milk\n1 banana\nGreen tea"
              />
            </div>

            <div className="space-y-2">
              <Label>Calories</Label>
              <Input type="number" defaultValue="350" />
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add any special instructions"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Apply Changes To</Label>
              <Select value={applyOption} onValueChange={(v) => setApplyOption(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Apply only today</SelectItem>
                  <SelectItem value="all-mondays">Apply to all {editingMeal?.day}s</SelectItem>
                  <SelectItem value="next-15">Apply for next 15 days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {applyOption === "today" && "Changes will apply to this day only"}
                {applyOption === "all-mondays" && `Changes will apply to all ${editingMeal?.day}s in this month`}
                {applyOption === "next-15" && "Patient will receive same diet for 15 days"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMeal}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MealCard({ title, meal, onEdit }: { title: string; meal: Meal; onEdit: () => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">{meal.time}</Badge>
            <Badge variant="outline">{meal.calories} kcal</Badge>
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1">
          {meal.items.map((item, index) => (
            <li key={index} className="text-sm flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {item}
            </li>
          ))}
        </ul>
        {meal.notes && (
          <p className="text-sm text-muted-foreground mt-2 italic">Note: {meal.notes}</p>
        )}
      </CardContent>
    </Card>
  )
}
