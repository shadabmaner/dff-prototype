"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NotificationTemplate,
  NotificationChannel,
} from "@/types/notification-template";
import {
  Edit,
  Copy,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useUpdateNotificationTemplate,
  useCloneNotificationTemplate,
  useDeleteNotificationTemplate,
} from "@/hooks/use-notification-templates";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TemplateListProps {
  data: NotificationTemplate[];
  isLoading: boolean;
  total: number;
  page: number;
  limit: number;
  onParamsChange: (params: any) => void;
}

export function TemplateList({
  data,
  isLoading,
  total,
  page,
  limit,
  onParamsChange,
}: TemplateListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  
  // Clone state
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [cloningTemplateId, setCloningTemplateId] = useState<string | null>(null);
  const [newCloneCode, setNewCloneCode] = useState("");
  const [newCloneChannel, setNewCloneChannel] = useState<NotificationChannel>(NotificationChannel.FCM);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);

  const { mutate: updateTemplate } = useUpdateNotificationTemplate();
  const { mutate: cloneTemplate } = useCloneNotificationTemplate();
  const { mutate: deleteTemplate, isPending: isDeleting } = useDeleteNotificationTemplate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onParamsChange({ code: searchTerm || undefined });
  };

  const handleChannelChange = (value: string) => {
    setSelectedChannel(value);
    onParamsChange({ channel: value === "all" ? undefined : value });
  };

  const toggleStatus = (template: NotificationTemplate) => {
    updateTemplate({
      id: template.id,
      data: { isActive: !template.isActive },
    });
  };

  const handleCloneClick = (id: string, code: string, channel: NotificationChannel) => {
    setCloningTemplateId(id);
    setNewCloneCode(`${code}`);
    setNewCloneChannel(channel);
    setCloneDialogOpen(true);
  };

  const confirmClone = () => {
    if (cloningTemplateId) {
      cloneTemplate({
        id: cloningTemplateId,
        data: { newCode: newCloneCode, newChannel: newCloneChannel },
      });
      setCloneDialogOpen(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingTemplateId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingTemplateId) {
      deleteTemplate(deletingTemplateId, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setDeletingTemplateId(null);
        },
      });
    }
  };

  const columns: ColumnDef<NotificationTemplate>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <div className="font-mono text-xs font-bold">{row.getValue("code")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "channel",
      header: "Channel",
      cell: ({ row }) => {
        const channel = row.getValue("channel") as string;
        return (
          <Badge variant="outline" className="capitalize">
            {channel}
          </Badge>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground capitalize">
          {row.getValue("category") || "General"}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive");
        return (
          <div className="flex items-center gap-2">
            {isActive ? (
              <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-slate-500/10 text-slate-500 border-slate-500/20">
                <XCircle className="mr-1 h-3 w-3" /> Inactive
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const template = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/admin/notification-templates/${template.id}`)
                }
              >
                <Edit className="mr-2 h-4 w-4" /> Edit Template
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  handleCloneClick(template.id, template.code, template.channel)
                }
              >
                <Copy className="mr-2 h-4 w-4" /> Clone to Channel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleStatus(template)}>
                {template.isActive ? (
                  <><XCircle className="mr-2 h-4 w-4" /> Deactivate</>
                ) : (
                  <><CheckCircle2 className="mr-2 h-4 w-4" /> Activate</>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-primary"
                onClick={() =>
                  router.push(`/dashboard/admin/notification-templates/${template.id}?preview=true`)
                }
              >
                <Eye className="mr-2 h-4 w-4" /> Preview
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDeleteClick(template.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
    manualPagination: true,
    pageCount: Math.ceil(total / limit),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search by code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Select value={selectedChannel} onValueChange={handleChannelChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              {Object.values(NotificationChannel).map((channel) => (
                <SelectItem key={channel} value={channel}>
                  {channel.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading templates...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No templates found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{data.length}</span> of{" "}
          <span className="font-medium">{total}</span> templates
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onParamsChange({ page: page - 1 })}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <div className="text-sm font-medium">Page {page}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onParamsChange({ page: page + 1 })}
            disabled={page * limit >= total}
          >
            Next
          </Button>
        </div>
      </div>


      {/* Clone Dialog */}
      <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clone Template</DialogTitle>
            <DialogDescription>
              Duplicate this template to a different communication channel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Template Code</label>
              <Input
                value={newCloneCode}
                onChange={(e) => setNewCloneCode(e.target.value.toUpperCase())}
                disabled
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Channel</label>
              <Select
                value={newCloneChannel}
                onValueChange={(v) => setNewCloneChannel(v as NotificationChannel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(NotificationChannel).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloneDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmClone}>Clone Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
