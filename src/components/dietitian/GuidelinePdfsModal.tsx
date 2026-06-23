"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileText, Loader2, ExternalLink, CheckCircle2, Circle, X, PlusCircle } from "lucide-react"
import { useSuggestedDocuments, useToggleDocumentAssignment } from "@/hooks/use-clinical-diet-plan"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface GuidelinePdfsModalProps {
  isOpen: boolean
  onClose: () => void
  dietPlanId: string
}

export function GuidelinePdfsModal({
  isOpen,
  onClose,
  dietPlanId,
}: GuidelinePdfsModalProps) {
  const [search, setSearch] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingDocument, setPendingDocument] = useState<any>(null)

  const { data: documentsData, isLoading } = useSuggestedDocuments(dietPlanId, { enabled: isOpen })
  const toggleMutation = useToggleDocumentAssignment()

  // Handle both array and object responses safely
  //@ts-ignore
  const documents = Array.isArray(documentsData)
    ? documentsData
    : (documentsData as any)?.data || []

  const filteredDocuments = documents.filter((doc: any) =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggleClick = (doc: any) => {
    setPendingDocument(doc)
    setShowConfirmDialog(true)
  }

  const handleConfirmToggle = async () => {
    if (!pendingDocument) return
    
    try {
      await toggleMutation.mutateAsync({ dietPlanId, documentId: pendingDocument.id })
      setShowConfirmDialog(false)
      setPendingDocument(null)
    } catch (error: any) {
      toast.error(error?.message || "Failed to update assignment")
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-slate-50/95 backdrop-blur-xl border-none shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-[2rem] max-h-[90vh]">
            <DialogHeader className="p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-24 -mb-24" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-3xl font-black text-white tracking-tight mb-1">Clinical Guidelines</DialogTitle>
                      <DialogDescription className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        Asset & Resource Management
                      </DialogDescription>
                    </div>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="p-8 space-y-6">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-all" />
                <Input
                  placeholder="Search clinical library..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-14 h-16 font-bold border-none shadow-sm focus:shadow-md focus:ring-4 focus:ring-indigo-100 transition-all rounded-2xl bg-white"
                />
              </div>

              <div className=" px-1 pr-4 -mx-1 overflow-y-auto h-[300px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4 py-24">
                    <div className="relative">
                      <Loader2 className="h-16 w-16 text-indigo-600 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-indigo-200" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Library Syncing</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 italic tracking-wider uppercase">Loading clinical guidelines...</p>
                    </div>
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                    <div className="h-20 w-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                      <Search className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2 font-mono uppercase tracking-tighter">Empty Library</h3>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-wider text-center max-w-[240px]">
                      Your search returned no documents from the clinical repository.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                      {filteredDocuments.map((doc: any) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          key={doc.id}
                          className={`group flex items-center justify-between p-1 border transition-all duration-300 rounded-[2rem] shadow-sm hover:shadow-md ${doc.is_assigned
                            ? "bg-indigo-600 border-indigo-500"
                            : "bg-white border-transparent hover:border-indigo-100"
                            }`}
                        >
                          <div className="flex items-center gap-5 min-w-0 p-4 pl-6">
                            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${doc.is_assigned
                              ? "bg-white/10 shadow-inner"
                              : "bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                              }`}>
                              <FileText className={`h-8 w-8 ${doc.is_assigned ? "text-white" : ""}`} />
                            </div>
                            <div className="min-w-0">
                              <h4 className={`font-black truncate tracking-tight text-lg transition-colors leading-tight ${doc.is_assigned ? "text-white" : "text-slate-900 group-hover:text-indigo-600 font-sans"
                                }`}>
                                {doc.title}
                              </h4>
                              <div className="flex items-center gap-4 mt-2">
                                {doc.is_assigned ? (
                                  <Badge className="bg-white/20 text-white border-none text-[9px] font-black uppercase tracking-widest backdrop-blur-sm px-2.5 py-1">
                                    Assigned
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-transparent text-slate-400 border-slate-200 text-[9px] font-black uppercase tracking-widest px-2.5 py-1">
                                    Library
                                  </Badge>
                                )}
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${doc.is_assigned ? "text-white/80 hover:text-white" : "text-indigo-600 hover:text-indigo-800"
                                    }`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  Preview
                                </a>
                              </div>
                            </div>
                          </div>
                          <div className="pr-6">
                            <Button
                              onClick={() => handleToggleClick(doc)}
                              disabled={toggleMutation.isPending}
                              className={`h-12 w-12 p-0 rounded-2xl transition-all duration-300 transform active:scale-90 ${doc.is_assigned
                                ? "bg-white text-indigo-600 hover:bg-slate-50 shadow-xl"
                                : "bg-slate-50 text-slate-300 hover:bg-white hover:text-indigo-600 hover:shadow-md"
                                }`}
                            >
                              {toggleMutation.isPending && toggleMutation.variables?.documentId === doc.id ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                              ) : doc.is_assigned ? (
                                <CheckCircle2 className="h-8 w-8" />
                              ) : (
                                <PlusCircle className="h-8 w-8" />
                              )}
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDocument?.is_assigned ? "Unassign" : "Assign"} Guideline PDF?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDocument?.is_assigned ? (
                <>
                  Are you sure you want to unassign <span className="font-semibold text-slate-900">{pendingDocument?.title}</span>? 
                  The patient will no longer have access to this guideline.
                </>
              ) : (
                <>
                  Are you sure you want to assign <span className="font-semibold text-slate-900">{pendingDocument?.title}</span>? 
                  The patient will receive access to this guideline document.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowConfirmDialog(false)
              setPendingDocument(null)
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmToggle} className="bg-slate-900 hover:bg-slate-800">
              {pendingDocument?.is_assigned ? "Unassign" : "Assign"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatePresence>
  )
}
