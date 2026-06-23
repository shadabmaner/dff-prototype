"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/service/stats-card";
import { Bell, Calendar, CheckCircle2, Send, Loader2, Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AnnouncementList } from "@/components/admin/announcements/announcement-list";
import { AnnouncementForm } from "@/components/admin/announcements/announcement-form";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  useSendAnnouncementNow,
} from "@/hooks/use-announcements";
import type {
  Announcement,
  AnnouncementListParams,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  AnnouncementStatus,
} from "@/types/announcement";

export default function AnnouncementsPage() {
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  const [sendNowDialogOpen, setSendNowDialogOpen] = useState(false);
  const [announcementToSend, setAnnouncementToSend] = useState<Announcement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: response, isLoading: loading } = useAnnouncements({
    page,
    limit: 20,
  });
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const sendNowMutation = useSendAnnouncementNow();

  const rawAnnouncements = response?.data && response.data.length > 0 ? response.data : [];

  const announcements = useMemo(() => {
    let filtered = rawAnnouncements;

    if (filterStatus !== "all") {
      filtered = filtered.filter(a => a.status === filterStatus);
    }

    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(term) || 
        a.description.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [rawAnnouncements, filterStatus, debouncedSearchTerm]);

  const meta = response || { total: announcements.length, page: 1, limit: 20 };
  const totalPages = Math.ceil(meta.total / meta.limit) || 1;


  const handleCreate = () => {
    setSelectedAnnouncement(null);
    setFormOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormOpen(true);
  };

  const handleDelete = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement);
    setDeleteDialogOpen(true);
  };

  const handleSendNow = (announcement: Announcement) => {
    setAnnouncementToSend(announcement);
    setSendNowDialogOpen(true);
  };

  const handleFormSubmit = (formData: CreateAnnouncementDto | UpdateAnnouncementDto) => {
    if (selectedAnnouncement) {
      updateMutation.mutate(
        {
          id: selectedAnnouncement.id,
          dto: formData as UpdateAnnouncementDto,
        },
        {
          onSuccess: () => {
            setFormOpen(false);
            setSelectedAnnouncement(null);
          },
        }
      );
    } else {
      createMutation.mutate(formData as CreateAnnouncementDto, {
        onSuccess: () => {
          setFormOpen(false);
        },
      });
    }
  };

  const confirmDelete = () => {
    if (announcementToDelete) {
      deleteMutation.mutate(announcementToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setAnnouncementToDelete(null);
        },
      });
    }
  };

  const confirmSendNow = () => {
    if (announcementToSend) {
      sendNowMutation.mutate(announcementToSend.id, {
        onSuccess: () => {
          setSendNowDialogOpen(false);
          setAnnouncementToSend(null);
        },
      });
    }
  };

  const totalAnnouncements = meta?.total || 0;
  const scheduledCount = rawAnnouncements.filter(a => a.status === "SCHEDULED").length;
  const sentCount = rawAnnouncements.filter(a => a.status === "SENT").length;
  const totalSent = rawAnnouncements.reduce((sum, a) => sum + (a.sent_count || 0), 0);

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-[var(--muted)] via-blue-50/30 to-[var(--muted)] rounded-[50px]">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-[var(--foreground)]"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)] font-medium">
            Control Center / Announcements
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] tracking-tight">
              Announcements
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">
              Create and manage targeted announcements across all channels
            </p>
          </div>
          <Button onClick={handleCreate} size="lg" className="shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Announcement
          </Button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Announcements"
          value={totalAnnouncements.toString()}
          subtitle="All announcements"
          icon={Bell}
          colorScheme="blue"
        />
        <StatsCard
          title="Scheduled"
          value={scheduledCount.toString()}
          subtitle="Pending delivery"
          icon={Calendar}
          colorScheme="amber"
        />
        <StatsCard
          title="Sent"
          value={sentCount.toString()}
          subtitle="Successfully delivered"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <StatsCard
          title="Total Reach"
          value={totalSent.toString()}
          subtitle="Users notified"
          icon={Send}
          colorScheme="purple"
        />
      </div>

      <Card className="border-[var(--border)]/80 bg-[var(--card)]/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-[var(--foreground)]">
              Announcement List
              {loading && <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin" />}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <AnnouncementList
                data={announcements}
                searchValue={searchTerm}
                onSearch={setSearchTerm}
                selectedStatus={filterStatus}
                onStatusChange={setFilterStatus}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSendNow={handleSendNow}
              />

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Showing {announcements.length} of {meta.total} announcements
                    {totalPages > 1 && (
                      <span className="ml-2">(Page {meta.page} of {totalPages})</span>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={meta.page === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={meta.page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            className="w-9"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={meta.page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AnnouncementForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedAnnouncement(null);
        }}
        onSubmit={handleFormSubmit}
        announcement={selectedAnnouncement}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Announcement"
        description={`Are you sure you want to delete "${announcementToDelete?.title}"? This will cancel the announcement and set its status to CANCELLED.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />

      <ConfirmDialog
        open={sendNowDialogOpen}
        onOpenChange={setSendNowDialogOpen}
        title="Send Announcement Now"
        description={`Are you sure you want to send "${announcementToSend?.title}" immediately? This will bypass the scheduled time and deliver the announcement to all targeted users.`}
        confirmText="Send Now"
        cancelText="Cancel"
        onConfirm={confirmSendNow}
        variant="default"
        isLoading={sendNowMutation.isPending}
      />
    </div>
  );
}
