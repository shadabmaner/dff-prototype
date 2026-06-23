"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/service/data-table";
import {
  Edit,
  MoreVertical,
  Trash2,
  Send,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
} from "lucide-react";
import {
  Announcement,
  AnnouncementStatus,
} from "@/types/announcement";
import { formatDate } from "@/lib/utils";

interface AnnouncementListProps {
  data: Announcement[];
  searchValue: string;
  onSearch: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onEdit: (announcement: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
  onSendNow: (announcement: Announcement) => void;
}

const statusConfig: Record<
  AnnouncementStatus,
  { label: string; className: string }
> = {
  [AnnouncementStatus.SCHEDULED]: { label: "Scheduled", className: "bg-blue-100 text-blue-800" },
  [AnnouncementStatus.SENT]: { label: "Sent", className: "bg-emerald-100 text-emerald-800" },
  [AnnouncementStatus.FAILED]: { label: "Failed", className: "bg-red-100 text-red-800" },
  [AnnouncementStatus.CANCELLED]: { label: "Cancelled", className: "bg-slate-100 text-slate-800" },
};

const priorityConfig = {
  low: { label: "Low", className: "bg-green-100 text-green-800" },
  normal: { label: "Normal", className: "bg-blue-100 text-blue-800" },
  high: { label: "High", className: "bg-orange-100 text-orange-800" },
  urgent: { label: "Urgent", className: "bg-red-100 text-red-800" },
};

export function AnnouncementList({
  data,
  searchValue,
  onSearch,
  selectedStatus,
  onStatusChange,
  onEdit,
  onDelete,
  onSendNow,
}: AnnouncementListProps) {
  const columns: Column<Announcement>[] = [
    {
      header: "Title",
      cell: (row) => (
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">{row.title}</p>
          <p className="text-xs text-slate-500 line-clamp-1">{row.description}</p>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => {
        const config = statusConfig[row.status] || { label: row.status, className: "bg-slate-100 text-slate-800" };
        return (
          <Badge className={config.className + " font-medium"}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      header: "Priority",
      cell: (row) => {
        if (!row.priority) return <span className="text-slate-400">-</span>;
        const config = priorityConfig[row.priority] || { label: row.priority, className: "bg-slate-100 text-slate-800" };
        return (
          <Badge className={config.className + " font-medium"}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      header: "Scheduled",
      cell: (row) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-sm text-slate-700">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(row.scheduled_at, "MMM dd, yyyy")}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="h-3 w-3" />
            {formatDate(row.scheduled_at, "HH:mm")}
          </div>
        </div>
      ),
    },
    {
      header: "Channel",
      cell: (row) => (
        <p className="text-sm text-slate-700">{row.channel || "-"}</p>
      ),
    },
    {
      header: "Audience",
      cell: (row) => (
        <p className="text-sm text-slate-700 capitalize">
          {row.target_audience?.replace("_", " ").toLowerCase() || "-"}
        </p>
      ),
    },
    {
      header: "Location",
      cell: (row) => {
        const hasLocation = row.city || row.state || row.address || row.location_url;
        if (!hasLocation) {
          return <span className="text-slate-400">-</span>;
        }

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-slate-700">
              <MapPin className="h-3 w-3" />
              {row.city && row.state ? `${row.city}, ${row.state}` : row.city || row.state}
            </div>
            {row.pincode && (
              <p className="text-xs text-slate-500">{row.pincode}</p>
            )}
            {row.location_url && (
              <a
                href={row.location_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                View Map
              </a>
            )}
          </div>
        );
      },
    },
    {
      header: "Sent",
      cell: (row) => (
        <div className="text-center text-sm font-medium text-slate-700">
          {row.sent_count || 0}
        </div>
      ),
    },
    {
      header: "Read",
      cell: (row) => (
        <div className="text-center text-sm font-medium text-slate-700">
          {row.read_count || 0}
        </div>
      ),
    },
    {
      header: "Actions",
      cell: (row) => {
        const canEdit = row.status === AnnouncementStatus.SCHEDULED;
        const canSendNow = row.status === AnnouncementStatus.SCHEDULED;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit(row)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {canSendNow && (
                <DropdownMenuItem onClick={() => onSendNow(row)}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Now
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(row)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={AnnouncementStatus.SCHEDULED}>Scheduled</SelectItem>
            <SelectItem value={AnnouncementStatus.SENT}>Sent</SelectItem>
            <SelectItem value={AnnouncementStatus.FAILED}>Failed</SelectItem>
            <SelectItem value={AnnouncementStatus.CANCELLED}>Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={data}
        columns={columns}
        searchPlaceholder="Search announcements by title, description..."
        searchValue={searchValue}
        onSearch={onSearch}
        enablePagination={false}
      />
    </div>
  );
}
