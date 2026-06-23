"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  Upload,
  Download,
  Eye,
  ZoomIn,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  FileCheck,
  ClipboardList,
  Stethoscope,
  MessageSquare,
  X,
  Save,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// Types
type DocumentStatus = "Pending Upload" | "Uploaded" | "Under Review" | "Reviewed" | "Rejected" | "Expired"
type UploadSource = "Patient Mobile App" | "Doctor Portal" | "Service Portal" | "Assessment Form" | "Lab Request Submission"
type DocumentCategory = "Clinical Reports" | "Medical Records" | "General Documents"
type DocumentType = 
  | "HbA1c Report" | "Fasting Sugar Report" | "PP Sugar Report" | "CBC Report" | "Thyroid Profile" | "Lipid Profile" | "Vitamin D Report" | "ECG Report"
  | "Previous Prescription" | "Doctor Notes" | "Hospital Discharge Summary" | "Medical Certificate"
  | "Assessment Attachments" | "Body Scan Images" | "Progress Photos" | "Custom"
type Priority = "Low" | "Medium" | "High" | "Urgent"

interface Document {
  id: string
  name: string
  type: DocumentType
  category: DocumentCategory
  uploadSource: UploadSource
  uploadDate: string
  status: DocumentStatus
  uploadedBy: string
  fileUrl: string
  fileSize: string
  reviewNotes?: string
  rejectionReason?: string
}

interface DocumentRequest {
  id: string
  requestType: "Document Request" | "Lab Investigation"
  documentType?: DocumentType
  investigationType?: string
  priority: Priority
  dueDate: string
  requestedBy: string
  requestDate: string
  status: "Pending" | "Uploaded" | "Completed"
}

// Mock Data
const mockDocuments: Document[] = [
  {
    id: "1",
    name: "HbA1c Report - Jan 2026.pdf",
    type: "HbA1c Report",
    category: "Clinical Reports",
    uploadSource: "Patient Mobile App",
    uploadDate: "2026-01-15",
    status: "Reviewed",
    uploadedBy: "Patient",
    fileUrl: "#",
    fileSize: "2.4 MB",
    reviewNotes: "HbA1c reviewed. Current value: 8.2. Patient suitable for Diabetes Reversal Program.",
  },
  {
    id: "2",
    name: "CBC Report.jpg",
    type: "CBC Report",
    category: "Clinical Reports",
    uploadSource: "Doctor Portal",
    uploadDate: "2026-01-14",
    status: "Under Review",
    uploadedBy: "Dr. Bhagyesh Kulkarni",
    fileUrl: "#",
    fileSize: "1.2 MB",
  },
  {
    id: "3",
    name: "Previous Prescription.pdf",
    type: "Previous Prescription",
    category: "Medical Records",
    uploadSource: "Service Portal",
    uploadDate: "2026-01-13",
    status: "Uploaded",
    uploadedBy: "Rahul Verma",
    fileUrl: "#",
    fileSize: "856 KB",
  },
  {
    id: "4",
    name: "Thyroid Profile.pdf",
    type: "Thyroid Profile",
    category: "Clinical Reports",
    uploadSource: "Patient Mobile App",
    uploadDate: "2026-01-12",
    status: "Rejected",
    uploadedBy: "Patient",
    fileUrl: "#",
    fileSize: "1.8 MB",
    rejectionReason: "Report is unclear. Please upload a clearer copy.",
  },
  {
    id: "5",
    name: "Body Scan Image.jpg",
    type: "Body Scan Images",
    category: "General Documents",
    uploadSource: "Assessment Form",
    uploadDate: "2026-01-10",
    status: "Reviewed",
    uploadedBy: "Patient",
    fileUrl: "#",
    fileSize: "3.2 MB",
  },
]

const mockDocumentRequests: DocumentRequest[] = [
  {
    id: "1",
    requestType: "Lab Investigation",
    investigationType: "Lipid Profile",
    priority: "High",
    dueDate: "2026-01-25",
    requestedBy: "Dr. Bhagyesh Kulkarni",
    requestDate: "2026-01-18",
    status: "Pending",
  },
  {
    id: "2",
    requestType: "Document Request",
    documentType: "Hospital Discharge Summary",
    priority: "Medium",
    dueDate: "2026-01-22",
    requestedBy: "Dr. Bhagyesh Kulkarni",
    requestDate: "2026-01-17",
    status: "Pending",
  },
]

const clinicalReportTypes: DocumentType[] = [
  "HbA1c Report",
  "Fasting Sugar Report",
  "PP Sugar Report",
  "CBC Report",
  "Thyroid Profile",
  "Lipid Profile",
  "Vitamin D Report",
  "ECG Report",
]

const medicalRecordTypes: DocumentType[] = [
  "Previous Prescription",
  "Doctor Notes",
  "Hospital Discharge Summary",
  "Medical Certificate",
]

const generalDocumentTypes: DocumentType[] = [
  "Assessment Attachments",
  "Body Scan Images",
  "Progress Photos",
  "Custom",
]

const investigationTypes = [
  "HbA1c",
  "CBC",
  "TSH",
  "Vitamin D",
  "Fasting Sugar",
  "PP Sugar",
  "Lipid Profile",
  "Thyroid Profile",
  "ECG",
  "Liver Function Test",
  "Kidney Function Test",
]

const statusColors: Record<DocumentStatus, string> = {
  "Pending Upload": "bg-amber-100 text-amber-700 border-amber-200",
  "Uploaded": "bg-blue-100 text-blue-700 border-blue-200",
  "Under Review": "bg-purple-100 text-purple-700 border-purple-200",
  "Reviewed": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Rejected": "bg-red-100 text-red-700 border-red-200",
  "Expired": "bg-gray-100 text-gray-700 border-gray-200",
}

const priorityColors: Record<Priority, string> = {
  Low: "bg-slate-100 text-slate-700 border-slate-200",
  Medium: "bg-blue-100 text-blue-700 border-blue-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Urgent: "bg-red-100 text-red-700 border-red-200",
}

export default function DocumentsLabReportsTab({ patientId }: { patientId: string }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [documentCategory, setDocumentCategory] = useState<DocumentCategory>("Clinical Reports")
  const [documentType, setDocumentType] = useState<DocumentType>("HbA1c Report")
  const [requestType, setRequestType] = useState<"Document Request" | "Lab Investigation">("Document Request")
  const [requestDocumentType, setRequestDocumentType] = useState<DocumentType>("HbA1c Report")
  const [investigationType, setInvestigationType] = useState<string>("HbA1c")
  const [requestPriority, setRequestPriority] = useState<Priority>("Medium")
  const [requestDueDate, setRequestDueDate] = useState("")
  const [reviewNotes, setReviewNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateStr))
    } catch {
      return dateStr
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles: File[] = []
    
    files.forEach(file => {
      const extension = file.name.split('.').pop()?.toLowerCase()
      const isPdf = extension === 'pdf'
      const isImage = ['jpg', 'jpeg', 'png'].includes(extension || '')
      
      if (!isPdf && !isImage) {
        alert(`File ${file.name} is not supported. Only PDF, JPG, JPEG, and PNG files are allowed.`)
        return
      }
      
      const maxSize = isPdf ? 20 * 1024 * 1024 : 10 * 1024 * 1024 // 20MB for PDF, 10MB for images
      if (file.size > maxSize) {
        alert(`File ${file.name} exceeds the maximum allowed size (${isPdf ? '20MB' : '10MB'}).`)
        return
      }
      
      validFiles.push(file)
    })
    
    if (validFiles.length > 20) {
      alert("Maximum 20 files can be uploaded at a time.")
      setUploadFiles(validFiles.slice(0, 20))
    } else {
      setUploadFiles(validFiles)
    }
  }

  const handleUpload = () => {
    if (uploadFiles.length === 0) {
      alert("Please select files to upload.")
      return
    }
    if (!documentType) {
      alert("Please select a document type.")
      return
    }
    
    alert(`${uploadFiles.length} file(s) uploaded successfully.`)
    setUploadFiles([])
    setShowUploadDialog(false)
  }

  const handleCreateRequest = () => {
    if (requestType === "Document Request" && !requestDocumentType) {
      alert("Please select a document type.")
      return
    }
    if (requestType === "Lab Investigation" && !investigationType) {
      alert("Please select an investigation type.")
      return
    }
    if (!requestDueDate) {
      alert("Please select a due date.")
      return
    }
    
    alert("Document request created successfully.")
    setShowRequestDialog(false)
    setRequestDueDate("")
  }

  const handleMarkReviewed = () => {
    if (!reviewNotes) {
      alert("Please add review notes.")
      return
    }
    alert("Document marked as reviewed successfully.")
    setShowReviewDialog(false)
    setReviewNotes("")
  }

  const handleRejectDocument = () => {
    if (!rejectionReason) {
      alert("Please provide a reason for rejection.")
      return
    }
    alert("Document rejected successfully.")
    setShowRejectDialog(false)
    setRejectionReason("")
  }

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || doc.status === selectedStatus
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Documents & Lab Reports</h2>
          <p className="text-sm text-slate-600 mt-1">Manage patient clinical documents and lab reports</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowRequestDialog(true)} variant="outline" className="h-10 px-4 rounded-xl border-slate-200">
            <ClipboardList className="h-4 w-4 mr-2" />
            Request Document
          </Button>
          <Button onClick={() => setShowUploadDialog(true)} className="h-10 px-4 rounded-xl bg-primary text-white">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Pending Requests */}
      {mockDocumentRequests.length > 0 && (
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {mockDocumentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {request.requestType === "Lab Investigation" ? request.investigationType : request.documentType}
                      </p>
                      <p className="text-xs text-slate-500">
                        {request.requestType} · Due: {formatDate(request.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={cn("text-xs font-semibold border", priorityColors[request.priority])}>
                      {request.priority}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs font-semibold">
                      Pending
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by document name or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 rounded-xl border-slate-200"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending Upload">Pending Upload</SelectItem>
                  <SelectItem value="Uploaded">Uploaded</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Reviewed">Reviewed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Clinical Reports">Clinical Reports</SelectItem>
                  <SelectItem value="Medical Records">Medical Records</SelectItem>
                  <SelectItem value="General Documents">General Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Documents</CardTitle>
          <CardDescription>
            {filteredDocuments.length} documents found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {filteredDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-slate-500">{doc.type}</p>
                      <span className="text-xs text-slate-300">•</span>
                      <p className="text-xs text-slate-500">{doc.fileSize}</p>
                      <span className="text-xs text-slate-300">•</span>
                      <p className="text-xs text-slate-500">{formatDate(doc.uploadDate)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={cn("text-xs font-semibold border", statusColors[doc.status])}>
                    {doc.status}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => { setSelectedDocument(doc); setShowViewDialog(true) }}>
                      <Eye className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                      <Download className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                      <ZoomIn className="h-4 w-4 text-slate-600" />
                    </Button>
                    {doc.status === "Uploaded" || doc.status === "Under Review" ? (
                      <>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => { setSelectedDocument(doc); setShowReviewDialog(true) }}>
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => { setSelectedDocument(doc); setShowRejectDialog(true) }}>
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Upload Document</DialogTitle>
            <DialogDescription>
              Upload clinical documents or lab reports (PDF, JPG, JPEG, PNG)
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700">Document Category</Label>
              <Select value={documentCategory} onValueChange={(v) => setDocumentCategory(v as DocumentCategory)}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Clinical Reports">Clinical Reports</SelectItem>
                  <SelectItem value="Medical Records">Medical Records</SelectItem>
                  <SelectItem value="General Documents">General Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700">Document Type</Label>
              <Select value={documentType} onValueChange={(v) => setDocumentType(v as DocumentType)}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentCategory === "Clinical Reports" && clinicalReportTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                  {documentCategory === "Medical Records" && medicalRecordTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                  {documentCategory === "General Documents" && generalDocumentTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700">Select Files</Label>
              <div className="mt-2 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-400 mt-1">PDF (max 20MB), Images (max 10MB)</p>
                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="mt-3 inline-block">
                  <Button type="button" size="sm" variant="outline" className="rounded-lg">
                    Browse Files
                  </Button>
                </label>
              </div>
              {uploadFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {uploadFiles.map((file, index) => (
                    <div key={index} className="text-xs text-slate-600 flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span>{file.name}</span>
                      <span className="text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowUploadDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button onClick={handleUpload} className="h-10 px-6 rounded-xl bg-primary text-white">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Request Document</DialogTitle>
            <DialogDescription>
              Request documents or lab investigations from patient
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700">Request Type</Label>
              <Select value={requestType} onValueChange={(v) => setRequestType(v as "Document Request" | "Lab Investigation")}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Document Request">Document Request</SelectItem>
                  <SelectItem value="Lab Investigation">Lab Investigation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {requestType === "Document Request" ? (
              <div>
                <Label className="text-sm font-semibold text-slate-700">Document Type</Label>
                <Select value={requestDocumentType} onValueChange={(v) => setRequestDocumentType(v as DocumentType)}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {clinicalReportTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                    {medicalRecordTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label className="text-sm font-semibold text-slate-700">Investigation Type</Label>
                <Select value={investigationType} onValueChange={setInvestigationType}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {investigationTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label className="text-sm font-semibold text-slate-700">Priority</Label>
              <Select value={requestPriority} onValueChange={(v) => setRequestPriority(v as Priority)}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200 mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700">Due Date</Label>
              <Input
                type="date"
                value={requestDueDate}
                onChange={(e) => setRequestDueDate(e.target.value)}
                className="h-10 rounded-xl border-slate-200 mt-2"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowRequestDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button onClick={handleCreateRequest} className="h-10 px-6 rounded-xl bg-primary text-white">
              <ClipboardList className="h-4 w-4 mr-2" />
              Create Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Document Preview</DialogTitle>
            <DialogDescription>
              {selectedDocument?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-8 bg-slate-50 rounded-lg border border-slate-200 min-h-[400px] flex items-center justify-center">
            <p className="text-sm text-slate-600 text-center">Document preview would be displayed here</p>
          </div>
          {selectedDocument?.reviewNotes && (
            <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm font-semibold text-emerald-900 mb-1">Review Notes</p>
              <p className="text-sm text-emerald-700">{selectedDocument.reviewNotes}</p>
            </div>
          )}
          {selectedDocument?.rejectionReason && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm font-semibold text-red-900 mb-1">Rejection Reason</p>
              <p className="text-sm text-red-700">{selectedDocument.rejectionReason}</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowViewDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Close
            </Button>
            <Button className="h-10 px-6 rounded-xl bg-primary text-white">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Mark as Reviewed</DialogTitle>
            <DialogDescription>
              Add review notes for this document
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Label className="text-sm font-semibold text-slate-700">Review Notes</Label>
            <Textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Enter your review notes..."
              className="min-h-[120px] rounded-xl border-slate-200 resize-none mt-2"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowReviewDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button onClick={handleMarkReviewed} className="h-10 px-6 rounded-xl bg-primary text-white">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Reviewed
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Reject Document</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this document
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Label className="text-sm font-semibold text-slate-700">Rejection Reason</Label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
              className="min-h-[120px] rounded-xl border-slate-200 resize-none mt-2"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="h-10 px-6 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button onClick={handleRejectDocument} className="h-10 px-6 rounded-xl bg-red-600 text-white">
              <XCircle className="h-4 w-4 mr-2" />
              Reject Document
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
