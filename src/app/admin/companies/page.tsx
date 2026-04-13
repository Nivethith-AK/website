"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { get, patch } from "@/lib/api";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";

interface CompanyUser {
  _id: string;
  name: string;
  email: string;
  companyName: string;
  contactPerson: string;
  industry: string;
  isVerified: boolean;
  isApproved: boolean;
  rejectionReason?: string;
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyUser[]>([]);
  const [query, setQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    const response = await get<any>("/admin/users?role=company&limit=300");
    if (response.success) {
      const list = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setCompanies(list);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchCompanies();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchCompanies]);

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return companies.filter((company) => {
      return (
        (company.companyName || company.name || "").toLowerCase().includes(normalized) ||
        company.email.toLowerCase().includes(normalized) ||
        (company.contactPerson || "").toLowerCase().includes(normalized)
      );
    });
  }, [companies, query]);

  const pendingCount = filtered.filter((c) => c.isVerified && !c.isApproved).length;

  const approve = async (id: string) => {
    setProcessingId(id);
    const response = await patch("/admin/approve-user", { userId: id, isApproved: true });
    if (response.success) {
      await fetchCompanies();
    }
    setProcessingId(null);
  };

  const reject = async (id: string) => {
    const reason = prompt("Rejection reason:");
    if (reason === null) return;

    setProcessingId(id);
    const response = await patch("/admin/approve-user", {
      userId: id,
      isApproved: false,
      rejectionReason: reason,
    });

    if (response.success) {
      await fetchCompanies();
    }

    setProcessingId(null);
  };

  return (
    <AdminShell
      title="Company Access Review"
      subtitle="Approve or reject verified company accounts. Decision emails are sent automatically."
      rightSlot={<Badge variant="warning">{pendingCount} Pending</Badge>}
    >
      <div className="mb-4 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45" size={14} />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search companies" className="pl-9" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="lux-glass overflow-hidden rounded-2xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-white/60">
                    No company accounts found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((company) => {
                  const readyForReview = company.isVerified && !company.isApproved;
                  return (
                    <TableRow key={company._id}>
                      <TableCell>
                        <p className="font-semibold uppercase">{company.companyName || company.name}</p>
                        <p className="text-xs text-white/55">{company.industry || "Fashion"}</p>
                      </TableCell>
                      <TableCell>
                        <p>{company.contactPerson || "Not set"}</p>
                        <p className="text-xs text-white/55">{company.email}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={company.isVerified ? "success" : "warning"}>
                          {company.isVerified ? "Verified" : "Pending Email"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={company.isApproved ? "success" : "warning"}>
                          {company.isApproved ? "Approved" : "Pending Admin"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => reject(company._id)}
                            disabled={processingId === company._id || !company.isVerified}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            isLoading={processingId === company._id}
                            onClick={() => approve(company._id)}
                            disabled={!readyForReview}
                          >
                            Approve
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </AdminShell>
  );
}
