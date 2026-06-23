"use client"

import { useAdmin } from "@/components/admin/admin-context"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function CommunityModerationPage() {
  const { posts, userControls, moderatePost, toggleBanUser } = useAdmin()

  const pending = posts.filter((p) => p.status === "PENDING")

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight">Community Moderation</h1>
        <p className="text-[13px] text-[var(--muted-foreground)] mt-0.5">Approve / reject posts and manage users.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.length ? (
                  pending.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.authorName}</TableCell>
                      <TableCell>
                        <div className="font-medium">{p.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">{p.body}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{p.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => moderatePost(p.id, "APPROVED")}>
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => moderatePost(p.id, "REJECTED")}>
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                      No pending posts.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userControls.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.userName}</TableCell>
                    <TableCell>
                      <Badge variant={u.isBanned ? "destructive" : "secondary"}>{u.isBanned ? "BANNED" : "ACTIVE"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => toggleBanUser(u.userId)}>
                        {u.isBanned ? "Unban" : "Ban"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
