"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Pill,
  Plus,
  Trash2,
  Save,
  Printer,
  Send,
  Calendar,
  Clock,
  X,
  History,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface MedicineItem {
  id: string
  name: string
  quantity: string
  timeToEat: string
}

interface PrescriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  patientName: string
  patientAge?: number
  patientGender?: string
}

// Static medicines data (in production, this would come from API)
const medicines = [
  { id: "MED-001", name: "Metformin 500mg", category: "Diabetes", manufacturer: "Sun Pharma" },
  { id: "MED-002", name: "Atorvastatin 20mg", category: "Cardiovascular", manufacturer: "Pfizer" },
  { id: "MED-003", name: "Levothyroxine 75mcg", category: "Thyroid", manufacturer: "Abbott" },
  { id: "MED-004", name: "Omeprazole 20mg", category: "Gastric", manufacturer: "Dr. Reddy's" },
  { id: "MED-005", name: "Amlodipine 5mg", category: "Cardiovascular", manufacturer: "Cipla" },
  { id: "MED-006", name: "Losartan 50mg", category: "Cardiovascular", manufacturer: "Torrent" },
  { id: "MED-007", name: "Cetirizine 10mg", category: "Allergy", manufacturer: "Cipla" },
  { id: "MED-008", name: "Pantoprazole 40mg", category: "Gastric", manufacturer: "Sun Pharma" },
  { id: "MED-009", name: "Ibuprofen 400mg", category: "Pain Relief", manufacturer: "Cipla" },
  { id: "MED-010", name: "Paracetamol 500mg", category: "Pain Relief", manufacturer: "Dolo" },
]

export function PrescriptionModal({
  open,
  onOpenChange,
  patientId,
  patientName,
  patientAge,
  patientGender,
}: PrescriptionModalProps) {
  const [medicinesList, setMedicinesList] = useState<MedicineItem[]>([])
  const [medicineSearch, setMedicineSearch] = useState("")
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false)
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(medicineSearch.toLowerCase())
  )

  const addMedicine = (medicine: typeof medicines[0]) => {
    const newMedicine: MedicineItem = {
      id: medicine.id,
      name: medicine.name,
      quantity: "",
      timeToEat: "",
    }
    setMedicinesList([...medicinesList, newMedicine])
    setMedicineSearch("")
    setShowMedicineDropdown(false)
  }

  const removeMedicine = (id: string) => {
    setMedicinesList(medicinesList.filter((m) => m.id !== id))
  }

  const updateMedicine = (id: string, field: keyof MedicineItem, value: string) => {
    setMedicinesList(medicinesList.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
  }

  const handleSave = async () => {
    if (medicinesList.length === 0) {
      toast.error("Please add at least one medicine")
      return
    }

    // Validate all medicines have required fields
    const invalidMedicine = medicinesList.find(m => !m.quantity || !m.timeToEat)
    if (invalidMedicine) {
      toast.error("Please fill in quantity and time to eat for all medicines")
      return
    }

    setIsSaving(true)
    try {
      // In production, this would call your API
      // await apiClient.post("/prescriptions", {
      //   patientId,
      //   medicines: medicinesList,
      //   notes,
      //   date: new Date().toISOString(),
      // })
      
      toast.success("Prescription issued successfully!")
      onOpenChange(false)
      setMedicinesList([])
      setNotes("")
    } catch (error) {
      toast.error("Failed to issue prescription")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePrint = () => {
    if (medicinesList.length === 0) {
      toast.error("Please add at least one medicine")
      return
    }
    // In production, this would trigger print
    toast.info("Printing prescription...")
  }

  const handleSendToPharmacy = () => {
    if (medicinesList.length === 0) {
      toast.error("Please add at least one medicine")
      return
    }
    // In production, this would send to pharmacy
    toast.success("Prescription sent to pharmacy!")
  }

  const handleClose = () => {
    onOpenChange(false)
    setMedicinesList([])
    setNotes("")
    setMedicineSearch("")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Issue Prescription
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Write and issue prescription for {patientName}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-6 mt-6">
            {/* Patient Details Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                  {patientName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{patientName}</p>
                  <div className="flex items-center gap-3 text-sm text-slate-600 mt-1">
                    {patientAge && <span>{patientAge} years</span>}
                    {patientGender && <span>• {patientGender}</span>}
                    <span>• ID: {patientId.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  Date
                </Label>
                <Input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Time
                </Label>
                <Input
                  type="time"
                  defaultValue={new Date().toTimeString().slice(0, 5)}
                  className="h-10"
                />
              </div>
            </div>

            {/* Add Medicine */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <Pill className="h-3 w-3 inline mr-1" />
                Add Medicine
              </Label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search medicines..."
                  value={medicineSearch}
                  onChange={(e) => {
                    setMedicineSearch(e.target.value)
                    setShowMedicineDropdown(true)
                  }}
                  onFocus={() => setShowMedicineDropdown(true)}
                  className="w-full h-10 pl-10 pr-4 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <Pill className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                {showMedicineDropdown && medicineSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredMedicines.length > 0 ? (
                      filteredMedicines.map((medicine) => (
                        <div
                          key={medicine.id}
                          onClick={() => addMedicine(medicine)}
                          className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                        >
                          <p className="font-semibold text-slate-900">{medicine.name}</p>
                          <p className="text-xs text-slate-500">{medicine.category} • {medicine.manufacturer}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-slate-500">No medicines found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Medicines List */}
            {medicinesList.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Prescribed Medicines ({medicinesList.length})
                  </Label>
                </div>
                {medicinesList.map((medicine, idx) => (
                  <motion.div
                    key={medicine.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Input
                          placeholder="Medicine name"
                          value={medicine.name}
                          onChange={(e) => updateMedicine(medicine.id, "name", e.target.value)}
                          className="font-bold text-slate-900 h-9"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeMedicine(medicine.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-500 uppercase tracking-wide">Quantity</label>
                        <Input
                          placeholder="e.g., 2 tablets"
                          value={medicine.quantity}
                          onChange={(e) => updateMedicine(medicine.id, "quantity", e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-500 uppercase tracking-wide">Time to Eat</label>
                        <select
                          value={medicine.timeToEat}
                          onChange={(e) => updateMedicine(medicine.id, "timeToEat", e.target.value)}
                          className="w-full h-9 px-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        >
                          <option value="">Select</option>
                          <option value="Before breakfast">Before breakfast</option>
                          <option value="After breakfast">After breakfast</option>
                          <option value="Before lunch">Before lunch</option>
                          <option value="After lunch">After lunch</option>
                          <option value="Before dinner">Before dinner</option>
                          <option value="After dinner">After dinner</option>
                          <option value="Empty stomach">Empty stomach</option>
                          <option value="Before bed">Before bed</option>
                          <option value="After waking up">After waking up</option>
                          <option value="With food">With food</option>
                          <option value="Without food">Without food</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Additional Notes
              </Label>
              <Textarea
                placeholder="Add any additional instructions or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-24 resize-none"
              />
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-6">
            <div className="text-center py-12">
              <History className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No prescription history</p>
              <p className="text-sm text-slate-400 mt-1">Previous prescriptions will appear here</p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
          <Button
            onClick={handleSave}
            disabled={medicinesList.length === 0 || isSaving}
            className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-lg shadow-slate-900/20"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Prescription"}
          </Button>
          <Button
            onClick={handlePrint}
            disabled={medicinesList.length === 0}
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            onClick={handleSendToPharmacy}
            disabled={medicinesList.length === 0}
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400"
          >
            <Send className="mr-2 h-4 w-4" />
            Send to Pharmacy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
