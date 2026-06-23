"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Ban, Users, AlertTriangle, ShieldAlert, UserX, ArrowLeft } from "lucide-react"
import type { UserModeration } from "@/types/community"

// Mock data
const mockUsers: UserModeration[] = Array.from({ length: 20 }, (_, i) => ({
  userId: `user-${i + 1}`,
  userName: `User ${i + 1}`,
  userAvatar: undefined,
  totalPosts: Math.floor(Math.random() * 100) + 10,
  hiddenPosts: i % 3 === 0 ? Math.floor(Math.random() * 10) : 0,
  deletedPosts: i % 5 === 0 ? Math.floor(Math.random() * 5) : 0,
  reportsCount: i % 4 === 0 ? Math.floor(Math.random() * 8) : 0,
  status: i % 10 === 0 ? "restricted" : i % 15 === 0 ? "banned" : "active",
  restrictedUntil: i % 10 === 0 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  lastViolation: i % 3 === 0 ? new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString() : undefined,
}))

export default function UserActivityPage() {
  const [users, setUsers] = useState<UserModeration[]>(mockUsers)
  const [selectedUser, setSelectedUser] = useState<UserModeration | null>(null)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [restrictionType, setRestrictionType] = useState<string>("24h")
  const [showActivateDialog, setShowActivateDialog] = useState(false)
  const [userToActivate, setUserToActivate] = useState<string | null>(null)

  const stats = useMemo(() => {
    const totalActive = users.filter((u) => u.status === "active").length
    const withHidden = users.filter((u) => u.hiddenPosts > 0).length
    const withDeleted = users.filter((u) => u.deletedPosts > 0).length
    const frequentViolators = users.filter((u) => u.reportsCount >= 3).length

    return { totalActive, withHidden, withDeleted, frequentViolators }
  }, [users])

  const handleDeactivate = () => {
    if (!selectedUser) return

    let restrictedUntil: string | undefined
    const now = Date.now()

    switch (restrictionType) {
      case "24h":
        restrictedUntil = new Date(now + 24 * 60 * 60 * 1000).toISOString()
        break
      case "7d":
        restrictedUntil = new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString()
        break
      case "permanent":
        restrictedUntil = undefined
        break
    }

    setUsers((prev) =>
      prev.map((user) =>
        user.userId === selectedUser.userId
          ? {
              ...user,
              status: restrictionType === "permanent" ? "banned" : "restricted",
              restrictedUntil,
            }
          : user
      )
    )

    setShowDeactivateModal(false)
    setSelectedUser(null)
  }

  const handleActivate = () => {
    if (!userToActivate) return
    
    setUsers((prev) =>
      prev.map((user) =>
        user.userId === userToActivate
          ? { ...user, status: "active", restrictedUntil: undefined }
          : user
      )
    )
    
    setShowActivateDialog(false)
    setUserToActivate(null)
  }

  const getStatusBadge = (status: string, restrictedUntil?: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
      case "restricted":
        return (
          <div className="space-y-1">
            <Badge className="bg-amber-50 text-amber-700 border-amber-200">Restricted</Badge>
            {restrictedUntil && (
              <p className="text-xs text-[var(--muted-foreground)]">
                Until {new Date(restrictedUntil).toLocaleDateString()}
              </p>
            )}
          </div>
        )
      case "banned":
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200">Banned</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getViolationLevel = (user: UserModeration) => {
    const violationScore = user.hiddenPosts + user.deletedPosts * 2 + user.reportsCount * 1.5
    if (violationScore >= 10) return { level: "high", color: "text-rose-600" }
    if (violationScore >= 5) return { level: "medium", color: "text-amber-600" }
    return { level: "low", color: "text-emerald-600" }
  }

  return (
    <div className="space-y-6 p-8 min-h-screen bg-gradient-to-br from-[var(--muted)] via-blue-50/30 to-[var(--muted)] rounded-[50px]">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/community">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Community Dashboard
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-[var(--foreground)]"></div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)] font-medium">
            Admin Portal / Community Management / User Activity
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] tracking-tight">
              User Activity Monitoring
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">
              Monitor users posting problematic content and manage restrictions
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
                  Total Active Authors
                </p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{stats.totalActive}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
                  With Hidden Posts
                </p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{stats.withHidden}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider mb-2">
                  With Deleted Posts
                </p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{stats.withDeleted}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
                <UserX className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-violet-50 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-2">
                  Frequent Violators
                </p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{stats.frequentViolators}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg">
                <ShieldAlert className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="p-6 border-b border-[var(--border)]">
          <CardTitle className="text-lg font-bold text-[var(--foreground)]">
            User Activity ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--muted)]">
                  <TableHead className="font-semibold">Author</TableHead>
                  <TableHead className="font-semibold">Total Posts</TableHead>
                  <TableHead className="font-semibold">Hidden Posts</TableHead>
                  <TableHead className="font-semibold">Deleted Posts</TableHead>
                  <TableHead className="font-semibold">Reports</TableHead>
                  <TableHead className="font-semibold">Violation Level</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const violation = getViolationLevel(user)
                  return (
                    <TableRow key={user.userId} className="hover:bg-[var(--muted)]/50">
                      <TableCell>
                        <div>
                          <p className="font-semibold text-[var(--foreground)]">{user.userName}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{user.userId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium text-[var(--foreground)]">{user.totalPosts}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium text-amber-600">{user.hiddenPosts}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium text-rose-600">{user.deletedPosts}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium text-purple-600">{user.reportsCount}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            violation.level === "high"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : violation.level === "medium"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }
                        >
                          {violation.level.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status, user.restrictedUntil)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                          {user.status === "active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setShowDeactivateModal(true)
                              }}
                              className="text-rose-600 hover:text-rose-700"
                            >
                              <Ban className="h-3.5 w-3.5 mr-1" />
                              Restrict
                            </Button>
                          )}
                          {(user.status === "restricted" || user.status === "banned") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setUserToActivate(user.userId)
                                setShowActivateDialog(true)
                              }}
                              className="text-emerald-600 hover:text-emerald-700"
                            >
                              Activate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Deactivate User Modal */}
      <Dialog open={showDeactivateModal} onOpenChange={setShowDeactivateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restrict User Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-slate-600">
                Restricting user: <span className="font-semibold">{selectedUser?.userName}</span>
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">{selectedUser?.userId}</p>
            </div>
            <div className="space-y-2">
              <Label>Restriction Duration</Label>
              <Select value={restrictionType} onValueChange={setRestrictionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="permanent">Permanent Ban</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-[var(--muted-foreground)]">
                User will be unable to post content during this period
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeactivate}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Confirm Restriction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate User Confirmation */}
      <AlertDialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to activate this user? They will regain full access to post content in the community.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivate}>Activate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
