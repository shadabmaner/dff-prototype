"use client"

import { useState } from "react"
import {
    Plus,
    Search,
    Copy,
    Eye,
    Loader2,
    Zap,
    Clock,
    FileText,
    Trash2,
    Brain,
    Sparkles,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { DataTable } from "@/components/shared/DataTable"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import {
    useMindsetTemplates,
    useCreateMindsetTemplate,
    useDeleteMindsetTemplate,
} from "@/hooks/use-mindset-template"

export default function MindsetManagementPage() {
    const router = useRouter()
    const { data: templates, isLoading, error } = useMindsetTemplates()
    const createMutation = useCreateMindsetTemplate()
    const deleteMutation = useDeleteMindsetTemplate()

    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [totalDays, setTotalDays] = useState("21")
    const [programType, setProgramType] = useState("")
    const [theme, setTheme] = useState("")
    const [tagline, setTagline] = useState("")
    const [languageCode, setLanguageCode] = useState("en")
    const [searchQuery, setSearchQuery] = useState("")

    const handleCreate = async () => {
        if (!title || !totalDays) {
            toast.error("Please fill all required fields")
            return
        }

        try {
            const payload = {
                title,
                description: description || undefined,
                total_days: Number(totalDays),
                program_type: programType || undefined,
                theme: theme || undefined,
                tagline: tagline || undefined,
                language_code: languageCode || undefined,
            }

            await createMutation.mutateAsync(payload)
            toast.success("Mindset template created successfully")
            setShowCreateDialog(false)
            resetForm()
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || "Failed to create mindset template"
            )
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id)
            toast.success("Mindset template deleted successfully")
            setShowDeleteDialog(null)
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || "Failed to delete mindset template"
            )
        }
    }

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setTotalDays("21")
        setProgramType("")
        setTheme("")
        setTagline("")
        setLanguageCode("en")
    }
    console.log(templates, "templates")
    const templateList = templates?.data?.templates ?? templates?.data ?? []
    const pagination = templates?.data?.pagination ?? null
    const filteredTemplates = Array.isArray(templateList)
        ? templateList.filter(
            (t: any) =>
                t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.theme?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : []

    const activeCount = Array.isArray(templateList)
        ? templateList.filter((t: any) => t.is_active).length
        : 0
    const totalCount = pagination?.total ?? (Array.isArray(templateList) ? templateList.length : 0)

    const columns = [
        {
            key: "title",
            header: "Template Details",
            render: (item: any) => (
                <div className="py-2">
                    <p className="font-extrabold text-[var(--foreground)] uppercase italic tracking-tight">
                        {item.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[var(--muted-foreground)] mt-1">
                        <Badge
                            variant="outline"
                            className="text-[8px] font-black border-[var(--border)] rounded-lg px-2 py-0"
                        >
                            {item.total_days} Days
                        </Badge>
                        {item.program_type && (
                            <>
                                <span>/</span>
                                <Badge
                                    variant="outline"
                                    className="text-[8px] font-black border-indigo-100 text-indigo-500 rounded-lg px-2 py-0"
                                >
                                    {item.program_type}
                                </Badge>
                            </>
                        )}
                        {item.theme && (
                            <>
                                <span>/</span>
                                <span className="text-purple-500/60 uppercase truncate max-w-[200px]">
                                    {item.theme}
                                </span>
                            </>
                        )}
                    </div>
                    {item.tagline && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-1 italic">
                            &ldquo;{item.tagline}&rdquo;
                        </p>
                    )}
                </div>
            ),
        },
        {
            key: "language",
            header: "Language",
            render: (item: any) => (
                <Badge
                    variant="secondary"
                    className="text-[10px] font-bold uppercase tracking-wider"
                >
                    {item.language_code || "en"}
                </Badge>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (item: any) => (
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            item.is_active ? "bg-emerald-500" : "bg-[var(--muted-foreground)]"
                        )}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] italic">
                        {item.is_active ? "Active" : "Inactive"}
                    </span>
                </div>
            ),
        },
        {
            key: "modified",
            header: "Last Modified",
            render: (item: any) => (
                <p className="text-[10px] font-bold text-[var(--muted-foreground)] tabular-nums uppercase whitespace-nowrap">
                    {new Date(item.updated_at).toLocaleDateString()}
                </p>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            render: (item: any) => (
                <div className="flex items-center gap-2">
                    <Link href={`/dashboard/admin/mindset-management/${item.id}`}>
                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)/80] hover:from-[var(--primary)/90] hover:to-[var(--primary)/70] text-white shadow-lg shadow-[var(--primary)]/20 h-9 px-3"
                        >
                            <Eye className="w-4 h-4 mr-1.5" />
                            View
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 shadow-sm h-9 w-9 p-0"
                        onClick={() => setShowDeleteDialog(item.id)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-[var(--muted)] via-purple-50/30 to-[var(--muted)]">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-[var(--foreground)]"></div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)] font-medium">
                        Admin Portal / Mindset Management
                    </p>
                </div>
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] tracking-tight">
                            Mindset Programs
                        </h1>
                        <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-2xl">
                            Create and manage mindset challenge templates for patients across
                            specialties.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            className="border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--card)] hover:border-[var(--border)] shadow-sm"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Templates
                        </Button>
                        <Button
                            onClick={() => setShowCreateDialog(true)}
                            className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)/80] hover:from-[var(--primary)/90] hover:to-[var(--primary)/70] text-white shadow-lg shadow-[var(--primary)]/20"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Program
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-5 md:grid-cols-2">
                <Card className="border-0 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
                                    <p className="text-[10px] uppercase tracking-[0.15em] text-purple-700 font-semibold">
                                        Active Programs
                                    </p>
                                </div>
                                <p className="text-3xl font-bold text-[var(--foreground)] mb-2">
                                    {activeCount}
                                </p>
                                <p className="text-xs text-purple-700/80 font-medium">
                                    Live mindset templates
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <Brain className="h-3 w-3 text-amber-600" />
                                    <p className="text-[10px] uppercase tracking-[0.15em] text-amber-700 font-semibold">
                                        Total Programs
                                    </p>
                                </div>
                                <p className="text-3xl font-bold text-[var(--foreground)] mb-2">
                                    {totalCount}
                                </p>
                                <p className="text-xs text-amber-700/80 font-medium">
                                    All mindset templates
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Clock className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search Bar */}
            <Card className="border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm shadow-md">
                <CardContent className="p-5">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                        <Input
                            placeholder="Search mindset templates by title, description, or theme..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 h-11 bg-[var(--card)] border-[var(--border)] focus-visible:ring-2 focus-visible:ring-[var(--foreground)]/10 focus-visible:border-[var(--foreground)] rounded-lg"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm shadow-lg overflow-hidden">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-red-600">
                                Error loading templates: {error.message}
                            </p>
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                                <Brain className="h-8 w-8 text-purple-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-[var(--foreground)]">
                                    No mindset programs yet
                                </p>
                                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                                    Create your first mindset challenge template
                                </p>
                            </div>
                            <Button
                                onClick={() => setShowCreateDialog(true)}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Template
                            </Button>
                        </div>
                    ) : (
                        <DataTable data={filteredTemplates} columns={columns} />
                    )}
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-[var(--foreground)]">
                            Create Mindset Program
                        </DialogTitle>
                        <DialogDescription className="text-[var(--muted-foreground)]">
                            Create a new mindset challenge template that can be assigned to
                            patients.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="mindset-title"
                                className="text-sm font-semibold text-[var(--muted-foreground)]"
                            >
                                Title *
                            </Label>
                            <Input
                                id="mindset-title"
                                placeholder="e.g., Body Respect Challenge"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="h-11 border-[var(--border)] bg-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="mindset-desc"
                                className="text-sm font-semibold text-[var(--muted-foreground)]"
                            >
                                Description
                            </Label>
                            <Textarea
                                id="mindset-desc"
                                placeholder="A 21-day journey to build body respect and positive mindset..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-[80px] border-[var(--border)] bg-white resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="mindset-days"
                                    className="text-sm font-semibold text-[var(--muted-foreground)]"
                                >
                                    Total Days *
                                </Label>
                                <Select value={totalDays} onValueChange={setTotalDays}>
                                    <SelectTrigger
                                        id="mindset-days"
                                        className="h-11 border-[var(--border)] bg-white"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">7 Days</SelectItem>
                                        <SelectItem value="14">14 Days</SelectItem>
                                        <SelectItem value="21">21 Days</SelectItem>
                                        <SelectItem value="30">30 Days</SelectItem>
                                        <SelectItem value="60">60 Days</SelectItem>
                                        <SelectItem value="90">90 Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="mindset-program-type"
                                    className="text-sm font-semibold text-[var(--muted-foreground)]"
                                >
                                    Program Type
                                </Label>
                                <Input
                                    id="mindset-program-type"
                                    placeholder="e.g., weight_management"
                                    value={programType}
                                    onChange={(e) => setProgramType(e.target.value)}
                                    className="h-11 border-[var(--border)] bg-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="mindset-theme"
                                    className="text-sm font-semibold text-[var(--muted-foreground)]"
                                >
                                    Theme
                                </Label>
                                <Input
                                    id="mindset-theme"
                                    placeholder="e.g., Body Positivity"
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    className="h-11 border-[var(--border)] bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="mindset-lang"
                                    className="text-sm font-semibold text-[var(--muted-foreground)]"
                                >
                                    Language
                                </Label>
                                <Select value={languageCode} onValueChange={setLanguageCode}>
                                    <SelectTrigger
                                        id="mindset-lang"
                                        className="h-11 border-[var(--border)] bg-white"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="hi">Hindi</SelectItem>
                                        <SelectItem value="te">Telugu</SelectItem>
                                        <SelectItem value="ta">Tamil</SelectItem>
                                        <SelectItem value="kn">Kannada</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="mindset-tagline"
                                className="text-sm font-semibold text-[var(--muted-foreground)]"
                            >
                                Tagline
                            </Label>
                            <Input
                                id="mindset-tagline"
                                placeholder="e.g., Transform your relationship with your body"
                                value={tagline}
                                onChange={(e) => setTagline(e.target.value)}
                                className="h-11 border-[var(--border)] bg-white"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowCreateDialog(false)
                                resetForm()
                            }}
                            className="border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                            disabled={createMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            className="bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground)]/90 hover:from-[var(--foreground)]/90 hover:to-[var(--foreground)]/80 text-white shadow-lg"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Template"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={!!showDeleteDialog}
                onOpenChange={() => setShowDeleteDialog(null)}
            >
                <DialogContent className="sm:max-w-[400px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-[var(--foreground)]">
                            Delete Template
                        </DialogTitle>
                        <DialogDescription className="text-[var(--muted-foreground)]">
                            Are you sure you want to delete this mindset template? This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(null)}
                            className="border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                            disabled={deleteMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => showDeleteDialog && handleDelete(showDeleteDialog)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
