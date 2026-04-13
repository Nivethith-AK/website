"use client";

import { useEffect, useMemo, useState } from "react";
import { get } from "@/lib/api";
import { Card } from "@/components/Card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserSummary {
  _id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  isVerified: boolean;
  rejectionReason?: string;
}

interface UserOverviewData {
  user: UserSummary;
  requests: Array<{
    _id: string;
    projectTitle: string;
    status: string;
    budget?: number;
    createdAt: string;
  }>;
  projects: Array<{
    _id: string;
    projectTitle: string;
    status: string;
    createdAt: string;
  }>;
  messages: Array<{
    _id: string;
    message: string;
    createdAt: string;
    senderId: {
      name?: string;
      email?: string;
      role?: string;
    };
    receiverId: {
      name?: string;
      email?: string;
      role?: string;
    };
  }>;
  metrics: {
    sentCount: number;
    receivedCount: number;
  };
}

interface AdminUserOverviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

export function AdminUserOverviewDialog({ open, onOpenChange, userId }: AdminUserOverviewDialogProps) {
  const [overview, setOverview] = useState<UserOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!open || !userId) {
        return;
      }

      setIsLoading(true);
      const response = await get<UserOverviewData>(`/admin/users/${userId}/overview`);
      if (response.success && response.data) {
        setOverview(response.data);
      } else {
        setOverview(null);
      }
      setIsLoading(false);
    };

    load();
  }, [open, userId]);

  const title = useMemo(() => {
    if (!overview?.user) return "User Overview";
    return `${overview.user.name || overview.user.email}`;
  }, [overview]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>User 360 View</DialogTitle>
          <DialogDescription>Inspect profile, requests, projects, and message activity in one place.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/60">Loading user overview...</div>
        ) : !overview ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/60">Unable to load user overview.</div>
        ) : (
          <div className="space-y-4">
            <Card className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-black uppercase">{title}</p>
                  <p className="text-sm text-white/65">{overview.user.email}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="default">{overview.user.role}</Badge>
                  <Badge variant={overview.user.isVerified ? "success" : "warning"}>{overview.user.isVerified ? "Verified" : "Unverified"}</Badge>
                  <Badge variant={overview.user.isApproved ? "success" : "warning"}>{overview.user.isApproved ? "Approved" : "Pending"}</Badge>
                </div>
              </div>
              {overview.user.rejectionReason ? (
                <p className="mt-3 text-sm text-amber-200">Rejection reason: {overview.user.rejectionReason}</p>
              ) : null}
            </Card>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Messages Sent</p>
                <p className="mt-2 text-3xl font-black">{overview.metrics.sentCount}</p>
              </Card>
              <Card className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Messages Received</p>
                <p className="mt-2 text-3xl font-black">{overview.metrics.receivedCount}</p>
              </Card>
            </div>

            <Tabs defaultValue="requests">
              <TabsList>
                <TabsTrigger value="requests">Requests</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="messages">Recent Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="requests">
                <Card className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  {(overview.requests || []).length === 0 ? (
                    <p className="text-sm text-white/60">No requests found.</p>
                  ) : (
                    <div className="space-y-2">
                      {overview.requests.map((item) => (
                        <div key={item._id} className="rounded-lg border border-white/10 p-3">
                          <p className="font-semibold uppercase">{item.projectTitle}</p>
                          <p className="text-xs text-white/60">{item.status} • {new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="projects">
                <Card className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  {(overview.projects || []).length === 0 ? (
                    <p className="text-sm text-white/60">No projects found.</p>
                  ) : (
                    <div className="space-y-2">
                      {overview.projects.map((item) => (
                        <div key={item._id} className="rounded-lg border border-white/10 p-3">
                          <p className="font-semibold uppercase">{item.projectTitle}</p>
                          <p className="text-xs text-white/60">{item.status} • {new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="messages">
                <Card className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  {(overview.messages || []).length === 0 ? (
                    <p className="text-sm text-white/60">No messages found.</p>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {overview.messages.map((item) => (
                        <div key={item._id} className="rounded-lg border border-white/10 p-3">
                          <p className="text-sm">{item.message}</p>
                          <p className="mt-1 text-xs text-white/60">
                            {item.senderId?.email || "Unknown"} -> {item.receiverId?.email || "Unknown"} • {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
