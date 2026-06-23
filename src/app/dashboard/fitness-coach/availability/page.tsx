"use client"

import { useMemo, useState, useEffect } from "react"
import {
    CalendarDays,
    Clock,
    Plus,
    Save,
    Trash2,
    Calendar as CalendarIcon,
    Loader2,
    X,
    MapPin
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { generateFitnessCoachSlots, getGroupedSlots, syncFitnessCoachSlots, type GenerateSlotsRequest } from "@/lib/api/fitness-coach-client"
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isPast, isToday, getDay, startOfWeek, endOfWeek } from "date-fns"

interface ScheduleItem {
    date: string
    active: boolean
    slots: { start: string; end: string }[]
}

const PREDEFINED_LOCATIONS = {
    head_office: {
        address: "Diabetes Free Forever Clinic, Shree Ganesh Ace Arcade, Office no 514 to 517 S.N. 6/1b, Opp Mirchandani Palms, Near, Kokane Chowk, Rahatani, Pune, Maharashtra 411017.",
        city: "Pune",
        pincode: "411017",
        displayName: "Head Office - Rahatani"
    },
    chinchwad: {
        address: "Diabetes Free Forever Clinic, SR No. 268/5, Shakuntala Building, First Floor, Link Road, Laxmi Nagar, Pimpri Chinchwad, Pune - 411033",
        city: "Pune",
        pincode: "411033",
        displayName: "Chinchwad Branch"
    },
    kothrud: {
        address: "Diabetes Free Forever Clinic, Deshpande Puram, Patliputra Housing society, office no -1, Ground Floor, Paud Phata, Behind Dashbhuja Ganpati, Off Karve Road, Kothrud, Pune - 411038",
        city: "Pune",
        pincode: "411038",
        displayName: "Kothrud Branch"
    }
}

export default function DietitianAvailabilityPage() {
    const [schedule, setSchedule] = useState<ScheduleItem[]>([])
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [isSaving, setIsSaving] = useState(false)
    const [isGeneratingBulk, setIsGeneratingBulk] = useState(false)
    const [isLoadingSlots, setIsLoadingSlots] = useState(true)

    // Bulk Generation State
    const [bulkConfig, setBulkConfig] = useState({
        month: startOfMonth(new Date()),
        scope: "month" as "month" | "week",
        selectedWeek: "1", // "1" to "5"
        excludeWeekends: true,
        mode: "online" as "online" | "offline",
        offlineLocationId: "head_office" as keyof typeof PREDEFINED_LOCATIONS,
        offlineLocation: PREDEFINED_LOCATIONS.head_office,
        slots: [{ start: "09:00", end: "13:00" }, { start: "14:00", end: "17:00" }]
    })

    const [isDayModalOpen, setIsDayModalOpen] = useState(false)
    const [tempSlots, setTempSlots] = useState<{
        start: string;
        end: string;
        mode: "online" | "offline";
        offlineLocationId: keyof typeof PREDEFINED_LOCATIONS;
    }[]>([])

    // Update temp slots when selectedDate changes or modal opens
    useEffect(() => {
        if (selectedDate) {
            const dateStr = format(selectedDate, "yyyy-MM-dd")
            const existing = schedule.find(s => s.date === dateStr)
            setTempSlots(existing?.slots?.map((s: any) => ({
                start: s.start,
                end: s.end,
                mode: s.mode || "online",
                offlineLocationId: s.offlineLocationId || "head_office"
            })) || [])
        }
    }, [selectedDate, schedule])

    const fetchSlots = async () => {
        try {
            setIsLoadingSlots(true)
            const response = await getGroupedSlots()
            const groupedSlots = response.data
            const slotsMap = new Map<string, { start: string; end: string }[]>()

            groupedSlots.forEach((slot: any) => {
                const dateStr = new Date(slot.date).toISOString().split('T')[0]
                const startTime = slot.startTime.substring(0, 5)
                const endTime = slot.endTime.substring(0, 5)

                if (!slotsMap.has(dateStr)) {
                    slotsMap.set(dateStr, [])
                }

                // Detect mode and infer location ID from the object if present
                const mode = slot.offlineLocation ? "offline" : (slot.mode || "online")
                let locId: keyof typeof PREDEFINED_LOCATIONS = "head_office"

                if (slot.offlineLocation) {
                    const found = Object.entries(PREDEFINED_LOCATIONS).find(([_, v]) =>
                        v.pincode === slot.offlineLocation.pincode ||
                        v.displayName === slot.offlineLocation.displayName
                    )
                    if (found) locId = found[0] as any
                }

                slotsMap.get(dateStr)!.push({
                    start: startTime,
                    end: endTime,
                    //@ts-ignore
                    mode: mode,
                    //@ts-ignore
                    offlineLocationId: locId
                })
            })

            const fetchedSchedule = Array.from(slotsMap.entries()).map(([date, slots]) => ({
                date,
                active: true,
                slots
            }))

            setSchedule(fetchedSchedule)
        } catch (error: any) {
            console.error("Error fetching slots:", error)
            toast.error("Failed to load existing slots")
        } finally {
            setIsLoadingSlots(false)
        }
    }

    useEffect(() => {
        fetchSlots()
    }, [])

    const handleBulkGenerate = async () => {
        for (let i = 0; i < bulkConfig.slots.length; i++) {
            const slot = bulkConfig.slots[i];
            if (!slot.start || !slot.end) {
                toast.error("Start and end times are required");
                return;
            }
            if (slot.start >= slot.end) {
                toast.error("End time must be greater than start time");
                return;
            }
            for (let j = i + 1; j < bulkConfig.slots.length; j++) {
                const other = bulkConfig.slots[j];
                if (slot.start < other.end && other.start < slot.end) {
                    toast.error("Time slots cannot overlap");
                    return;
                }
            }
        }

        let start = startOfMonth(bulkConfig.month)
        let end = endOfMonth(bulkConfig.month)

        if (bulkConfig.scope === "week") {
            const weekIndex = parseInt(bulkConfig.selectedWeek) - 1
            const firstDayOfMonth = startOfMonth(bulkConfig.month)
            const targetDateInWeek = new Date(firstDayOfMonth)
            targetDateInWeek.setDate(firstDayOfMonth.getDate() + (weekIndex * 7))

            start = startOfWeek(targetDateInWeek, { weekStartsOn: 1 })
            end = endOfWeek(targetDateInWeek, { weekStartsOn: 1 })

            // Constrain to the month exactly
            if (start < firstDayOfMonth) start = firstDayOfMonth
            const lastDayOfMonth = endOfMonth(bulkConfig.month)
            if (end > lastDayOfMonth) end = lastDayOfMonth
        }

        const days = eachDayOfInterval({ start, end })

        const datesToGenerate = days
            .filter(date => {
                if (isPast(date) && !isToday(date)) return false
                if (bulkConfig.excludeWeekends) {
                    const day = getDay(date)
                    return day !== 0 && day !== 6
                }
                return true
            })
            .map(date => format(date, "yyyy-MM-dd"))

        if (datesToGenerate.length === 0) {
            toast.warning("No valid dates found in the selected range")
            return
        }

        setIsGeneratingBulk(true)
        try {
            const dateBatches: string[][] = []
            for (let i = 0; i < datesToGenerate.length; i += 7) {
                dateBatches.push(datesToGenerate.slice(i, i + 7))
            }

            for (const slot of bulkConfig.slots) {
                for (const datesBatch of dateBatches) {
                    const request: GenerateSlotsRequest = {
                        dates: datesBatch,
                        startTime: slot.start,
                        endTime: slot.end,
                        ...(bulkConfig.mode === "offline" ? { offlineLocation: bulkConfig.offlineLocation } : {})
                    }
                    await generateFitnessCoachSlots(request)
                }
            }
            toast.success(`Generated slots for ${datesToGenerate.length} days with ${bulkConfig.slots.length} windows each`)
            fetchSlots()
        } catch (error: any) {
            toast.error("Failed to generate bulk slots")
        } finally {
            setIsGeneratingBulk(false)
        }
    }

    const handleUpdateDaySlots = async () => {
        if (!selectedDate) return

        for (let i = 0; i < tempSlots.length; i++) {
            const slot = tempSlots[i];
            if (!slot.start || !slot.end) {
                toast.error("Start and end times are required");
                return;
            }
            if (slot.start >= slot.end) {
                toast.error("End time must be greater than start time");
                return;
            }
            for (let j = i + 1; j < tempSlots.length; j++) {
                const other = tempSlots[j];
                if (slot.start < other.end && other.start < slot.end) {
                    toast.error("Time slots cannot overlap");
                    return;
                }
            }
        }

        const dateStr = format(selectedDate, "yyyy-MM-dd")

        setIsSaving(true)
        try {
            await syncFitnessCoachSlots({
                date: dateStr,
                blocks: tempSlots.map(slot => ({
                    startTime: slot.start,
                    endTime: slot.end,
                    ...(slot.mode === "offline" ? {
                        offlineLocation: PREDEFINED_LOCATIONS[slot.offlineLocationId]
                    } : {})
                }))
            })
            toast.success("Availability synchronized for " + dateStr)
            setIsDayModalOpen(false)
            fetchSlots()
        } catch (error) {
            toast.error("Failed to synchronize slots")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoadingSlots) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-lg font-bold text-slate-700">Loading your availability...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-10 p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Schedule Management</h1>
                        <p className="text-sm text-slate-600 mt-2 max-w-2xl">Define your clinical working hours and manage appointment windows with precision.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 p-5 rounded-2xl flex flex-row items-center gap-6 shadow-sm ring-1 ring-slate-900/5">
                            <div className="text-center">
                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Active Dates</p>
                                <p className="text-2xl font-black text-blue-600">{schedule.length}</p>
                            </div>
                            <div className="w-px h-10 bg-slate-200" />
                            <div className="text-center">
                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Total Slots</p>
                                <p className="text-2xl font-black text-indigo-600">{schedule.reduce((acc, curr) => acc + curr.slots.length, 0)}</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12 px-2">
                {/* Left Column: Calendar */}
                <Card className="lg:col-span-5 p-6 border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden w-full">
                    <div className="mb-6">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-xl">
                                <CalendarDays className="h-6 w-6 text-blue-600" />
                            </div>
                            Schedule Calendar
                        </h2>
                        <p className="text-sm text-slate-500 font-bold mt-1">Select a date to view or manage specific time slots.</p>
                    </div>

                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                            setSelectedDate(date)
                            if (date) setIsDayModalOpen(true)
                        }}
                        onMonthChange={(month) => {
                            setBulkConfig(prev => ({ ...prev, month: startOfMonth(month) }))
                        }}
                        className="rounded-3xl border border-slate-100 p-4 w-full"
                        modifiers={{
                            hasSlots: (date) => schedule.some(s => s.date === format(date, "yyyy-MM-dd")),
                        }}
                        modifiersStyles={{
                            hasSlots: { fontWeight: 'bold', color: '#2563eb', textDecoration: 'underline' }
                        }}
                    />

                    <div className="mt-8 p-6 bg-slate-50 rounded-3xl space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Calendar Legend</h3>
                        <div className="flex items-center gap-6 text-xs font-bold text-slate-600">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-600" />
                                <span>Availability Set</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-slate-200 rounded-full bg-white" />
                                <span>No Slots</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Right Column: Bulk Slot Management */}
                <div className="lg:col-span-7 space-y-8">
                    <Card className="p-8 border-none shadow-2xl bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] text-white">
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                                        <Plus className="h-6 w-6 text-blue-400" />
                                    </div>
                                    Slot Management
                                </h2>
                                <p className="text-sm text-slate-400 font-bold mt-1 ml-14">Confirm Your Availability</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="grid md:grid-cols-1 gap-8">
                                <div className="space-y-4">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-100">Target Month</p>
                                    <div className="flex items-center gap-4">
                                        <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 rounded-xl flex-1" onClick={() => setBulkConfig(prev => ({ ...prev, month: addMonths(prev.month, -1) }))}>Prev</Button>
                                        <span className="font-bold min-w-[100px] text-center">{format(bulkConfig.month, "MMMM yyyy")}</span>
                                        <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 rounded-xl flex-1" onClick={() => setBulkConfig(prev => ({ ...prev, month: addMonths(prev.month, 1) }))}>Next</Button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-100">Generation Scope</p>
                                    <Tabs value={bulkConfig.scope} onValueChange={(v) => setBulkConfig(prev => ({ ...prev, scope: v as any }))} className="w-full">
                                        <TabsList className="grid grid-cols-2 bg-white/5 border border-white/10 rounded-xl p-1">
                                            <TabsTrigger value="month" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs font-bold text-slate-100 transition-all">Whole Month</TabsTrigger>
                                            <TabsTrigger value="week" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs font-bold text-slate-100 transition-all">Specific Week</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {bulkConfig.scope === "week" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="grid md:grid-cols-2 gap-8 border-t border-white/5 pt-8"
                                    >
                                        <div className="space-y-4">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Select Target Week</p>
                                            <Select value={bulkConfig.selectedWeek} onValueChange={(v) => setBulkConfig(prev => ({ ...prev, selectedWeek: v }))}>
                                                <SelectTrigger className="h-11 bg-white/5 border-white/10 rounded-xl text-white font-bold">
                                                    <SelectValue placeholder="Select Week" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-800 border-white/10 text-white">
                                                    <SelectItem value="1">First Week (1st - 7th)</SelectItem>
                                                    <SelectItem value="2">Second Week (8th - 14th)</SelectItem>
                                                    <SelectItem value="3">Third Week (15th - 21st)</SelectItem>
                                                    <SelectItem value="4">Fourth Week (22nd - 28th)</SelectItem>
                                                    <SelectItem value="5">Fifth Week (Remaining)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Day Constraints</p>
                                            <div className="flex items-center gap-4 h-11 bg-white/5 border border-white/10 px-4 rounded-xl">
                                                <Switch checked={bulkConfig.excludeWeekends} onCheckedChange={(checked) => setBulkConfig(prev => ({ ...prev, excludeWeekends: checked }))} />
                                                <span className="text-sm font-bold">Mon - Fri Only</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {bulkConfig.scope === "month" && (
                                <div className="space-y-4">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-100">Working Days</p>
                                    <div className="flex items-center gap-4 h-11 bg-white/5 border border-white/10 px-4 rounded-xl w-fit">
                                        <Switch checked={bulkConfig.excludeWeekends} onCheckedChange={(checked) => setBulkConfig(prev => ({ ...prev, excludeWeekends: checked }))} />
                                        <span className="text-sm font-bold pr-4">Mon - Fri Only</span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6 bg-slate-900/50 p-6 rounded-[2rem] border border-white/10 shadow-inner">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full animate-pulse",
                                            bulkConfig.mode === 'online' ? "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                        )} />
                                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-100">Consultation Setting</p>
                                    </div>
                                    <Tabs value={bulkConfig.mode} onValueChange={(v) => setBulkConfig(prev => ({ ...prev, mode: v as any }))} className="w-[200px]">
                                        <TabsList className="grid grid-cols-2 bg-slate-950/50 border border-white/50 rounded-xl p-1">
                                            <TabsTrigger value="online" className="rounded-lg data-[state=active]:bg-indigo-600 text-white hover:text-white data-[state=active]:text-white text-xs font-bold transition-all">Online</TabsTrigger>
                                            <TabsTrigger value="offline" className="rounded-lg text-slate-100 hover:text-white data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs font-bold transition-all">Offline</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>

                                <AnimatePresence mode="wait">
                                    {bulkConfig.mode === "offline" ? (
                                        <motion.div
                                            key="offline-ui"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="space-y-4 pt-4 border-t border-white/10"
                                        >
                                            <div className="space-y-2">
                                                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Select Branch Location</p>
                                                <Select
                                                    value={bulkConfig.offlineLocationId}
                                                    onValueChange={(id: keyof typeof PREDEFINED_LOCATIONS) => setBulkConfig(p => ({
                                                        ...p,
                                                        offlineLocationId: id,
                                                        offlineLocation: PREDEFINED_LOCATIONS[id]
                                                    }))}
                                                >
                                                    <SelectTrigger className="h-12 bg-slate-950 border-white/10 rounded-xl text-white font-bold hover:bg-slate-800 transition-colors">
                                                        <SelectValue placeholder="Choose Branch" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-900 border-white/20 text-white shadow-2xl">
                                                        <SelectItem value="head_office">Head Office - Rahatani</SelectItem>
                                                        <SelectItem value="chinchwad">Chinchwad Branch</SelectItem>
                                                        <SelectItem value="kothrud">Kothrud Branch</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <motion.div
                                                layout
                                                className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-5 rounded-2xl border border-emerald-500/20 flex gap-4 items-start"
                                            >
                                                <div className="p-2.5 bg-emerald-500/20 rounded-xl shrink-0">
                                                    <MapPin className="h-5 w-5 text-emerald-400" />
                                                </div>
                                                <div className="space-y-1.5 flex-1 text-left">
                                                    <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest leading-none">Registered Address</p>
                                                    <p className="text-sm text-slate-300 font-semibold leading-relaxed">
                                                        {bulkConfig.offlineLocation.address}
                                                    </p>
                                                    <div className="flex gap-6 pt-2">
                                                        <div className="space-y-0.5">
                                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">City</p>
                                                            <p className="text-xs font-bold text-white uppercase">{bulkConfig.offlineLocation.city}</p>
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Pincode</p>
                                                            <p className="text-xs font-bold text-white tracking-widest">{bulkConfig.offlineLocation.pincode}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="online-ui"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="pt-4 border-t border-white/10 flex items-center gap-4 text-indigo-400"
                                        >
                                            <div className="p-3 bg-indigo-500/10 rounded-2xl">
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-white">Full-Automation Protocol</p>
                                                <p className="text-xs text-slate-400">Meeting links will be auto-synchronized for booked slots.</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg">
                                            <Clock className="h-4 w-4 text-blue-400" />
                                        </div>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Available Slots</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 h-8 px-3 text-[10px] font-black uppercase tracking-widest bg-blue-500/5 rounded-lg border border-blue-500/10" onClick={() => setBulkConfig(prev => ({ ...prev, slots: [...prev.slots, { start: "09:00", end: "17:00" }] }))}>
                                        <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Slot
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    {bulkConfig.slots.map((slot, idx) => (
                                        <div key={idx} className="flex items-center gap-4 group">
                                            <div className="flex-1 grid grid-cols-2 gap-4">
                                                <Input type="time" value={slot.start} onChange={(e) => {
                                                    const newSlots = [...bulkConfig.slots]; newSlots[idx].start = e.target.value;
                                                    setBulkConfig(prev => ({ ...prev, slots: newSlots }))
                                                }} className="h-11 bg-white/5 border-white/10 rounded-xl text-white font-bold" />
                                                <Input type="time" value={slot.end} onChange={(e) => {
                                                    const newSlots = [...bulkConfig.slots]; newSlots[idx].end = e.target.value;
                                                    setBulkConfig(prev => ({ ...prev, slots: newSlots }))
                                                }} className="h-11 bg-white/5 border-white/10 rounded-xl text-white font-bold" />
                                            </div>
                                            {bulkConfig.slots.length > 1 && (
                                                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setBulkConfig(prev => ({ ...prev, slots: prev.slots.filter((_, i) => i !== idx) }))}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full mt-10 h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest shadow-2xl shadow-blue-500/20"
                            onClick={handleBulkGenerate}
                            disabled={isGeneratingBulk}
                        >
                            {isGeneratingBulk ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-5 w-5" />}
                            Confirm {format(bulkConfig.month, "MMMM")} Availability
                        </Button>
                    </Card>

                    <Sheet open={isDayModalOpen} onOpenChange={setIsDayModalOpen}>
                        <SheetContent side="right" className="bg-white border-none shadow-2xl sm:max-w-xl overflow-y-auto p-0 flex flex-col">
                            <SheetHeader className="px-8 pt-10 pb-6 border-b border-slate-100 bg-slate-50/50">
                                <SheetTitle className="text-3xl font-black text-slate-900 flex items-center gap-3">
                                    <div className="p-2.5 bg-slate-900 rounded-2xl shadow-lg shadow-slate-900/10">
                                        <CalendarIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-blue-600 uppercase tracking-widest leading-none mb-1.5">Daily Availability</p>
                                        {selectedDate && format(selectedDate, "EEEE, MMMM dd")}
                                    </div>
                                </SheetTitle>
                                <SheetDescription className="text-slate-500 font-bold px-1">
                                    Define available slots and consultation modes for this date.
                                </SheetDescription>
                            </SheetHeader>

                            <div className="px-8 py-8 space-y-6 flex-1 overflow-y-auto bg-white">
                                {tempSlots.length === 0 ? (
                                    <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                        <div className="relative mx-auto w-16 h-16 mb-6">
                                            <div className="absolute inset-0 bg-slate-200 blur-2xl rounded-full animate-pulse" />
                                            <Clock className="relative z-10 mx-auto h-16 w-16 text-slate-300" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">No windows configured</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {tempSlots.map((slot, idx) => (
                                            <div key={idx} className="group space-y-5 bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm transition-all hover:shadow-xl hover:border-slate-200 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900" />

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-xs font-black text-white shadow-lg">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex flex-row gap-1">
                                                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Slot -</p>
                                                            <p className="text-xs font-bold text-slate-900"> {idx + 1}</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={() => setTempSlots(t => t.filter((_, i) => i !== idx))} className="h-9 w-9 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="h-4 w-4" /></Button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Arrival</p>
                                                        <Input type="time" value={slot.start} onChange={(e) => { const n = [...tempSlots]; n[idx].start = e.target.value; setTempSlots(n) }} className="h-12 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:ring-2 focus:ring-slate-900/5 transition-all" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Departure</p>
                                                        <Input type="time" value={slot.end} onChange={(e) => { const n = [...tempSlots]; n[idx].end = e.target.value; setTempSlots(n) }} className="h-12 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:ring-2 focus:ring-slate-900/5 transition-all" />
                                                    </div>
                                                </div>

                                                <div className="space-y-4 pt-2">
                                                    <div className="flex items-center justify-between bg-slate-50/50 p-3 rounded-2xl">
                                                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1 font-bold">Mode</p>
                                                        <Tabs value={slot.mode} onValueChange={(v) => { const n = [...tempSlots]; n[idx].mode = v as any; setTempSlots(n) }} className="w-[180px]">
                                                            <TabsList className="grid grid-cols-2 bg-slate-200/50 border border-slate-200 rounded-xl p-1 h-9">
                                                                <TabsTrigger value="online" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm text-[10px] font-black">Online</TabsTrigger>
                                                                <TabsTrigger value="offline" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm text-[10px] font-black">Offline</TabsTrigger>
                                                            </TabsList>
                                                        </Tabs>
                                                    </div>

                                                    <AnimatePresence mode="wait">
                                                        {slot.mode === 'offline' && (
                                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Target Branch</p>
                                                                <Select
                                                                    value={slot.offlineLocationId}
                                                                    onValueChange={(lid: any) => { const n = [...tempSlots]; n[idx].offlineLocationId = lid; setTempSlots(n) }}
                                                                >
                                                                    <SelectTrigger className="h-12 bg-emerald-50 border-emerald-100 rounded-2xl text-xs font-bold shadow-sm text-emerald-900">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="bg-white border-slate-200 shadow-2xl rounded-2xl">
                                                                        <SelectItem value="head_office">Head Office - Rahatani</SelectItem>
                                                                        <SelectItem value="chinchwad">Chinchwad Branch</SelectItem>
                                                                        <SelectItem value="kothrud">Kothrud Branch</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <div className="p-3 bg-emerald-50/30 rounded-xl border border-emerald-100/50">
                                                                    <p className="text-[9px] text-emerald-600 font-bold leading-relaxed">
                                                                        {PREDEFINED_LOCATIONS[slot.offlineLocationId].address}
                                                                    </p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Button variant="outline" className="w-full h-14 rounded-3xl border-slate-200 border-2 font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 mt-4 shadow-sm hover:border-slate-300 transition-all hover:scale-[1.01]" onClick={() => setTempSlots(prev => [...prev, { start: "09:00", end: "17:00", mode: "online", offlineLocationId: "head_office" }])}>
                                    <Plus className="mr-2 h-5 w-5" /> Add Slot
                                </Button>
                            </div>

                            <SheetFooter className="px-8 pb-10 pt-6 border-t border-slate-100 bg-slate-50/30 grid grid-cols-2 gap-4">
                                <SheetClose asChild>
                                    <Button variant="ghost" className="h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-100" disabled={isSaving}>
                                        Cancel
                                    </Button>
                                </SheetClose>
                                <Button className="h-14 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-2xl transition-all group" onClick={handleUpdateDaySlots} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />}
                                    Update Availability
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </div>
    )
}
