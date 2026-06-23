"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, FileText, Loader2, ExternalLink, CheckCircle2, Circle, X } from "lucide-react";
import { useSuggestedDocuments, useToggleDocumentAssignment } from "@/hooks/use-clinical-diet-plan";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface GuidelinesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dietPlanId: string;
}

export function GuidelinesModal({
  open,
  onOpenChange,
  dietPlanId,
}: GuidelinesModalProps) {
  const [search, setSearch] = useState("");

  const { data: documentsData, isLoading } = useSuggestedDocuments(dietPlanId, { enabled: open });
  const toggleMutation = useToggleDocumentAssignment();

  // Handle both array and object responses safely
  const documents = Array.isArray(documentsData)
    ? documentsData
    : (documentsData as any)?.data || [];

  const filteredDocuments = documents.filter((doc: any) =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = async (documentId: string) => {
    try {
      await toggleMutation.mutateAsync({ dietPlanId, documentId });
    } catch (error: any) {
      toast.error(error?.message || "Failed to update assignment");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-3xl max-h-[85vh]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Guidelines & PDFs
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Assign and manage guideline documents for this diet plan
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search guidelines..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10 border-slate-300 bg-white"
                />
              </div>

              {/* Documents List */}
              <ScrollArea className="max-h-[60vh]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    <span className="ml-3 text-slate-600">Loading guidelines...</span>
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">
                      {search ? "No guidelines found" : "No guidelines available"}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {search ? "Try a different search term" : "Add guidelines to this diet plan"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredDocuments.map((doc: any) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-slate-900 truncate">{doc.title}</h3>
                              {doc.is_assigned && (
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                  Assigned
                                </Badge>
                              )}
                            </div>
                            
                            {doc.description && (
                              <p className="text-sm text-slate-600 mb-2 line-clamp-2">{doc.description}</p>
                            )}

                            <div className="flex flex-wrap gap-1 text-xs">
                              {doc.category && (
                                <Badge variant="outline" className="border-slate-300 text-slate-600">
                                  {doc.category}
                                </Badge>
                              )}
                              {doc.file_type && (
                                <Badge variant="outline" className="border-slate-300 text-slate-600">
                                  {doc.file_type.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {doc.file_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(doc.file_url, "_blank")}
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggle(doc.id)}
                              disabled={toggleMutation.isPending}
                              className={`${
                                doc.is_assigned
                                  ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {toggleMutation.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : doc.is_assigned ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <Circle className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    {filteredDocuments.length} guideline{filteredDocuments.length !== 1 ? "s" : ""} found
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
