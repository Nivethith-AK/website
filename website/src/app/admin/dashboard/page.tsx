"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Briefcase, CheckCircle, Clock, LogOut, Shield, BarChart, ExternalLink, UserCheck, ClipboardList } from "lucide-react";
import { get } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";

interface DashboardStats {
  totalDesigners: number;
  pendingDesigners: number;
  totalCompanies: number;
  totalRequests: number;
  activeProjects: number;
  completedProjects: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await get("/admin/stats");
      if (response.success) {
        setStats(response.data);
      } else {
        alert(response.message || "Failed to load stats");
        router.push("/login");
      }
      setIsLoading(false);
    };

    fetchStats();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-20 gap-8">
        <div className="w-16 h-[1px] bg-accent-purple animate-pulse" />
        <p className="text-muted-foreground animate-pulse tracking-[0.5em] text-[10px] uppercase font-black">Synchronizing Console...</p>
      </div>
    );
  }

  const statsCards = [
    { label: "Vetted Collective", value: stats?.totalDesigners || 0, icon: Users },
    { label: "Curation Queue", value: stats?.pendingDesigners || 0, icon: Clock },
    { label: "Luxury Partners", value: stats?.totalCompanies || 0, icon: Briefcase },
    { label: "Active Missions", value: stats?.activeProjects || 0, icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-20 left-0 right-0 bg-background/80 backdrop-blur-2xl border-b border-white/5 z-40 transition-all duration-1000">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex justify-between items-end">
          <div className="flex flex-col gap-6">
            <span className="text-accent-purple font-black tracking-[0.5em] uppercase text-[10px] mb-2 block">Administrative Control</span>
            <h1 className="text-6xl font-black text-foreground uppercase tracking-tighter leading-none">
              Console
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground hover:text-accent-purple transition-all duration-1000 pb-2 border-b border-transparent hover:border-accent-purple font-black"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="pt-80 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 mb-32 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-accent-purple/[0.03] -z-10" />
          {statsCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="bg-card p-12 flex flex-col items-center text-center group hover:bg-background transition-colors duration-1000"
              >
                <div className="text-accent-purple mb-8 group-hover:scale-110 transition-transform duration-1000">
                  <Icon size={20} strokeWidth={1.5} />
                </div>
                <p className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground mb-4">{card.label}</p>
                <p className="text-5xl font-black text-foreground tracking-tighter group-hover:text-accent transition-colors duration-1000">{card.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Section Title */}
        <div className="mb-16 border-l-2 border-accent-purple pl-6 ml-2">
          <h2 className="text-[10px] font-black tracking-[0.5em] uppercase text-foreground">Operational Modules</h2>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            { title: "Designers", desc: "Curate membership applications", action: "/admin/designers" },
            { title: "Inquiries", desc: "Orchestrate partner requests", action: "/admin/requests" },
            { title: "Projects", desc: "Monitor tactical operations", action: "/admin/projects" },
          ].map((action, idx) => (
            <div
              key={idx}
              className="group cursor-pointer space-y-10 p-2"
              onClick={() => router.push(action.action)}
            >
              <div className="h-[1px] w-16 bg-white/10 group-hover:bg-accent group-hover:w-full transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]" />
              <div>
                <h3 className="text-4xl font-black text-foreground uppercase tracking-tight group-hover:text-accent transition-colors duration-1000">{action.title}</h3>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mt-4 leading-relaxed">{action.desc}</p>
              </div>
              <button className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground border-b border-white/10 pb-2 group-hover:border-accent group-hover:text-accent transition-all duration-1000">
                Access Module
              </button>
            </div>
          ))}
        </div>

        {/* Platform Overview */}
        <div className="mt-60 pt-24 border-t border-white/5 bg-background relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-purple/20 to-transparent" />
           <div className="grid grid-cols-1 md:grid-cols-3 gap-32">
              <div className="space-y-6">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Cumulative Volume</p>
                <p className="text-7xl font-black text-foreground tracking-tighter">{stats?.totalRequests || 0}</p>
              </div>
              <div className="space-y-6">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Success Quotient</p>
                <p className="text-7xl font-black text-foreground tracking-tighter">
                  {stats?.totalRequests ? Math.round(((stats?.completedProjects || 0) / stats.totalRequests) * 100) : 0}<span className="text-3xl text-accent-purple">%</span>
                </p>
              </div>
              <div className="space-y-6">
                <p className="text-[10px] font-black text-accent-purple uppercase tracking-[0.5em]">Queue Alerts</p>
                <div className="flex items-end gap-6">
                  <p className="text-7xl font-black text-foreground tracking-tighter">{stats?.pendingDesigners || 0}</p>
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-3 pb-2 border-b border-white/10">Review Required</span>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
