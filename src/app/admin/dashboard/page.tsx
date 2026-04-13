"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BarChart3, Briefcase, CheckCircle2, Clock3, Users } from "lucide-react";
import { get } from "@/lib/api";
import { Card } from "@/components/Card";
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

interface DashboardStats {
  totalDesigners: number;
  pendingDesigners: number;
  pendingCompanies: number;
  totalCompanies: number;
  totalRequests: number;
  activeProjects: number;
  completedProjects: number;
}

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [purgeEmail, setPurgeEmail] = useState("");
  const [purgeMessage, setPurgeMessage] = useState("");
  const [isPurging, setIsPurging] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await get<DashboardStats>("/admin/dashboard/stats");
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        router.push("/login");
      }
      setIsLoading(false);
    };

    fetchStats();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="lux-glass animate-pulse rounded-2xl px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/65">
          Loading Mission Console
        </div>
      </div>
    );
  }

  const metricCards = [
    { label: "Designers", value: stats?.totalDesigners || 0, icon: Users, tone: "accent" as const },
    { label: "Pending Designers", value: stats?.pendingDesigners || 0, icon: Clock3, tone: "warning" as const },
    { label: "Pending Companies", value: stats?.pendingCompanies || 0, icon: Users, tone: "warning" as const },
    { label: "Companies", value: stats?.totalCompanies || 0, icon: Briefcase, tone: "purple" as const },
    { label: "Active Projects", value: stats?.activeProjects || 0, icon: CheckCircle2, tone: "success" as const },
  ];

  const purgeByEmail = async () => {
    const email = purgeEmail.trim().toLowerCase();
    if (!email) {
      setPurgeMessage("Enter an email to purge.");
      return;
    }

    const confirmed = window.confirm(`Permanently purge user and related data for ${email}?`);
    if (!confirmed) {
      return;
    }

    setIsPurging(true);
    setPurgeMessage("");

    const response = await fetch("http://localhost:5000/api/admin/users/purge-by-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify({ email }),
    }).then((r) => r.json());

    if (response.success) {
      setPurgeMessage(`Purged ${email} successfully.`);
      setPurgeEmail("");
    } else {
      setPurgeMessage(response.message || "Failed to purge user.");
    }

    setIsPurging(false);
  };

  return (
    <AdminShell
      title="Admin Dashboard"
      subtitle="Track assignments, requests, and talent operations in real time."
      rightSlot={<Badge variant="accent">Access Everything</Badge>}
    >
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.4, ease }}
          >
            <Card className="lux-glass lux-glow-hover rounded-2xl p-5">
              <card.icon className="mb-3 h-5 w-5 text-accent" />
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/60">{card.label}</p>
              <p className="mt-2 text-3xl font-black">{card.value}</p>
              <div className="mt-3">
                <Badge variant={card.tone}>{card.label}</Badge>
              </div>
            </Card>
          </motion.div>
        ))}
      </section>

      <section className="mt-7 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="lux-glass rounded-2xl p-6 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-accent">Performance Snapshot</p>
            <BarChart3 className="h-5 w-5 text-accent/80" />
          </div>
          <div className="space-y-4">
            {[
              { label: "Total Requests", value: stats?.totalRequests || 0, ratio: 80 },
              { label: "Completed Projects", value: stats?.completedProjects || 0, ratio: 62 },
              { label: "Active Projects", value: stats?.activeProjects || 0, ratio: 46 },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-white/70">{row.label}</span>
                  <span className="font-black text-accent">{row.value}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${row.ratio}%` }}
                    transition={{ duration: 0.65, ease }}
                    className="h-2 rounded-full bg-gradient-to-r from-accent-purple to-accent"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lux-glass rounded-2xl p-6">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.26em] text-accent">Action Routing</p>
          <div className="space-y-3">
              {[
                { label: "Review Designers", href: "/admin/designers" },
                { label: "Review Companies", href: "/admin/companies" },
                { label: "Handle New Requests", href: "/admin/requests" },
                { label: "Manage Projects", href: "/admin/projects" },
                { label: "Create Project", href: "/admin/projects/create" },
                { label: "Manage Vacancies", href: "/admin/vacancies" },
                { label: "Private Messages", href: "/admin/messages" },
              ].map((action) => (
              <button
                key={action.href}
                onClick={() => router.push(action.href)}
                className="w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/75 hover:border-accent/35 hover:text-accent"
              >
                {action.label}
              </button>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-7">
        <Card className="mb-5 lux-glass rounded-2xl p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-accent">Emergency User Purge</p>
          <p className="mt-1 text-sm text-white/60">Delete user by email with one click for re-registration cleanup.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Input
              value={purgeEmail}
              onChange={(e) => setPurgeEmail(e.target.value)}
              placeholder="user@example.com"
              className="max-w-sm"
            />
            <Button variant="outline" onClick={purgeByEmail} isLoading={isPurging}>
              Purge Email
            </Button>
          </div>
          {purgeMessage ? <p className="mt-3 text-sm text-white/70">{purgeMessage}</p> : null}
        </Card>

        <Card className="lux-glass rounded-2xl p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold">Pending Designers</TableCell>
                <TableCell>{stats?.pendingDesigners || 0}</TableCell>
                <TableCell>
                  <Badge variant={(stats?.pendingDesigners || 0) > 0 ? "warning" : "success"}>
                    {(stats?.pendingDesigners || 0) > 0 ? "Needs Review" : "Stable"}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Pending Companies</TableCell>
                <TableCell>{stats?.pendingCompanies || 0}</TableCell>
                <TableCell>
                  <Badge variant={(stats?.pendingCompanies || 0) > 0 ? "warning" : "success"}>
                    {(stats?.pendingCompanies || 0) > 0 ? "Needs Review" : "Stable"}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Completed Projects</TableCell>
                <TableCell>{stats?.completedProjects || 0}</TableCell>
                <TableCell>
                  <Badge variant="success">Delivered</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </section>
    </AdminShell>
  );
}
