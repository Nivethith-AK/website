"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { get, put } from "@/lib/api";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";

interface RequestItem {
  _id: string;
  projectTitle: string;
  description: string;
  requiredDesigners: number;
  duration: string;
  budget?: number;
  status: string;
  createdAt?: string;
  company?: {
    companyName: string;
    contactPerson: string;
    email: string;
  };
}

const statusOrder: Record<string, number> = {
  New: 0,
  Pending: 1,
  Approved: 2,
  "In Progress": 3,
  Completed: 4,
  Rejected: 5,
};

export default function AdminRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [query, setQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [tab, setTab] = useState("new");

  useEffect(() => {
    const fetchRequests = async () => {
      const response = await get<any>("/admin/requests?limit=200");
      if (response.success) {
        const list = Array.isArray(response.data) ? response.data : response.data?.data || [];
        const sorted = [...list].sort((a, b) => (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999));
        setRequests(sorted);
      }
    };
    fetchRequests();
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const q = query.toLowerCase();
      const companyName = r.company?.companyName || "";
      const matches = r.projectTitle.toLowerCase().includes(q) || companyName.toLowerCase().includes(q);
      const byStatus = tab === "all" ? true : r.status.toLowerCase() === tab;
      return matches && byStatus;
    });
  }, [requests, query, tab]);

  const approve = async (id: string) => {
    setProcessingId(id);
    const response = await put(`/admin/requests/${id}/approve`, {});
    if (response.success) setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status: "Approved" } : r)));
    setProcessingId(null);
  };

  const reject = async (id: string) => {
    const reason = prompt("Rejection reason:");
    if (reason === null) return;
    setProcessingId(id);
    const response = await put(`/admin/requests/${id}/reject`, { rejectionReason: reason });
    if (response.success) setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status: "Rejected" } : r)));
    setProcessingId(null);
  };

  return (
    <AdminShell
      title="Request Control"
      subtitle="Approve, reject, and route requests to assignment."
      rightSlot={<Badge variant="accent">{filtered.length} Records</Badge>}
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45" size={14} />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search requests" className="pl-9" />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="lux-glass overflow-hidden rounded-2xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Need</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-white/60">
                        No requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((r) => (
                      <TableRow key={r._id}>
                        <TableCell>
                          <p className="font-semibold uppercase">{r.projectTitle}</p>
                          <p className="text-xs text-white/55">{r.description ? `${r.description.slice(0, 70)}...` : "No description."}</p>
                        </TableCell>
                        <TableCell>{r.company?.companyName || "Unknown Company"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              r.status === "New"
                                ? "warning"
                                : r.status === "Approved"
                                ? "success"
                                : r.status === "Rejected"
                                ? "purple"
                                : "default"
                            }
                          >
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{r.requiredDesigners}</TableCell>
                        <TableCell>{r.budget ? `$${r.budget.toLocaleString()}` : "-"}</TableCell>
                        <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>
                          {r.status === "New" ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => reject(r._id)}
                                disabled={processingId === r._id}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => approve(r._id)}
                                isLoading={processingId === r._id}
                              >
                                Approve
                              </Button>
                            </div>
                          ) : r.status === "Approved" ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => router.push(`/admin/projects/assign?requestId=${r._id}`)}
                            >
                              Assign
                            </Button>
                          ) : (
                            <span className="text-xs text-white/45">Closed</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}
