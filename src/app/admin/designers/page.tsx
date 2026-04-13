"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { get, put } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminUserOverviewDialog } from "@/components/admin/AdminUserOverviewDialog";
import { Search } from "lucide-react";

interface Designer {
  _id: string;
  name?: string;
  firstName: string;
  lastName: string;
  email: string;
  experienceLevel: string;
  skills: string[];
  isVerified?: boolean;
  isApproved?: boolean;
  rejectionReason?: string;
}

export default function AdminDesignersPage() {
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [query, setQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);

  useEffect(() => {
    const fetchDesigners = async () => {
      const response = await get<Designer[]>("/admin/designers/pending");
      if (response.success && response.data) setDesigners(response.data);
    };
    fetchDesigners();
  }, []);

  const approve = async (id: string) => {
    setProcessingId(id);
    const response = await put(`/admin/designers/${id}/approve`, {});
    if (response.success) setDesigners((prev) => prev.filter((d) => d._id !== id));
    setProcessingId(null);
  };

  const reject = async (id: string) => {
    const reason = prompt("Rejection reason:");
    if (reason === null) return;
    setProcessingId(id);
    const response = await put(`/admin/designers/${id}/reject`, { rejectionReason: reason });
    if (response.success) setDesigners((prev) => prev.filter((d) => d._id !== id));
    setProcessingId(null);
  };

  const filtered = useMemo(() => {
    const v = query.toLowerCase();

    return designers.filter((d) => {
      const fullName = d.firstName && d.lastName ? `${d.firstName} ${d.lastName}` : d.name || "";
      return fullName.toLowerCase().includes(v) || d.email.toLowerCase().includes(v);
    });
  }, [designers, query]);

  return (
    <AdminShell
      title="Designer Review"
      subtitle="Approve or reject incoming designer applications."
      rightSlot={<Badge variant="warning">{filtered.length} Pending</Badge>}
    >
      <div className="mb-4 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45" size={14} />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search designers" className="pl-9" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="lux-glass overflow-hidden rounded-2xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Designer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-white/60">
                    No pending applications.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((designer) => (
                  <TableRow key={designer._id}>
                    <TableCell className="font-semibold uppercase">{designer.firstName} {designer.lastName}</TableCell>
                    <TableCell className="text-white/70">{designer.email}</TableCell>
                    <TableCell>
                      <Badge variant="purple">{designer.experienceLevel}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {(designer.skills || []).slice(0, 3).map((skill) => (
                          <Badge key={skill}>{skill}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reject(designer._id)}
                          disabled={processingId === designer._id}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUserId(designer._id);
                            setIsOverviewOpen(true);
                          }}
                        >
                          View 360
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          isLoading={processingId === designer._id}
                          onClick={() => approve(designer._id)}
                        >
                          Approve
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      <AdminUserOverviewDialog open={isOverviewOpen} onOpenChange={setIsOverviewOpen} userId={selectedUserId} />
    </AdminShell>
  );
}
