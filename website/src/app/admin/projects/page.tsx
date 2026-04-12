"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Shield, ArrowLeft, Briefcase, CheckCircle, Clock, Trash2, Layout, MoreVertical, ExternalLink, Calendar, Users, Globe } from "lucide-react";
import { get, post } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";

interface Project {
  _id: string;
  projectTitle: string;
  description: string;
  budget?: number;
  status: string;
  createdAt: string;
  company: {
    companyName: string;
    email: string;
  };
  designers: Array<{
    designer: {
      firstName: string;
      lastName: string;
    };
    status: string;
  }>;
}

export default function AdminProjects() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchProjects = async () => {
    setIsLoading(true);
    const response = await get("/admin/projects");
    if (response.success) {
      setProjects(response.data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const response = await post(`/admin/update-project-status/${id}`, { status: newStatus });
    if (response.success) {
      setProjects(projects.map(p => p._id === id ? { ...p, status: newStatus } : p));
    } else {
      alert(response.message || "Failed to update project status");
    }
  };

  const filteredProjects = projects.filter(p => 
    (filterStatus === "All" || p.status === filterStatus) &&
    (p.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.company.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Fixed Header */}
      <div className="fixed top-20 left-0 right-0 bg-background/90 backdrop-blur-2xl border-b border-border/40 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push("/admin/dashboard")} 
              className="border-border hover:border-accent-purple hover:bg-accent-purple/5 transition-all duration-700"
            >
              <ArrowLeft size={14} className="text-muted-foreground" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Active <span className="text-accent-purple italic font-light font-serif">Deployments</span></h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent-purple opacity-70 mt-1">Global Platform Oversight</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex bg-muted/50 p-1 border border-border/40">
              {["All", "Active", "Completed"].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-700 ${
                    filterStatus === status 
                      ? "bg-accent-purple text-white shadow-[0_0_25px_-5px_rgba(75,0,130,0.3)]" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-56 max-w-7xl mx-auto px-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-48 gap-6">
            <div className="w-12 h-12 border border-accent-purple/30 border-t-accent-purple rounded-full animate-spin" />
            <p className="text-muted-foreground animate-pulse tracking-[0.5em] text-[10px] uppercase font-bold">Synchronizing Grid...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-48 border border-border/40 bg-white/50 backdrop-blur-sm">
            <Briefcase size={32} className="mx-auto mb-8 text-muted/30" />
            <h3 className="text-[11px] uppercase tracking-[0.4em] font-bold text-muted-foreground mb-3 font-sans">No Active Deployments</h3>
            <div className="h-[1px] w-12 bg-border mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => (
                <motion.div
                  key={project._id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: idx * 0.1 }}
                >
                  <Card variant="premium" className="group flex flex-col h-full border-border/40 bg-white/80 backdrop-blur-sm rounded-none relative overflow-hidden transition-all duration-1000 hover:border-accent-purple/30 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)]">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-purple/10 to-transparent group-hover:via-accent-purple/40 transition-all duration-1000" />
                    
                    <div className="p-10 border-b border-border/40 flex justify-between items-start">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${
                            project.status === "Active" 
                              ? "text-accent-purple bg-accent-purple/5 border border-accent-purple/20" 
                              : "text-muted-foreground bg-muted border border-border"
                          }`}>
                            {project.status}
                          </span>
                          <span className="text-[9px] text-muted-foreground font-mono tracking-tighter uppercase">Ref: {project._id.slice(-8)}</span>
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight text-foreground group-hover:text-accent-purple transition-colors duration-700 font-sans">{project.projectTitle}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent opacity-80">{project.company.companyName}</p>
                      </div>
                      <div className="p-2 border border-border/40 text-muted-foreground group-hover:text-accent-purple group-hover:border-accent-purple/30 transition-all duration-700 cursor-pointer">
                        <MoreVertical size={18} />
                      </div>
                    </div>

                    <div className="p-10 flex-1 space-y-10">
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-3">
                          <Users size={12} className="text-accent-purple" /> Assigned Talent
                        </p>
                        <div className="flex flex-wrap gap-4">
                          {project.designers.map((d, i) => (
                            <div key={i} className="flex items-center gap-3 pr-4 py-1.5 border-r border-border/40 last:border-0 group/talent transition-all duration-500">
                              <div className="w-6 h-6 border border-accent-purple/30 text-accent-purple flex items-center justify-center font-bold text-[9px] uppercase italic bg-accent-purple/5 font-serif">
                                {d.designer.firstName[0]}{d.designer.lastName[0]}
                              </div>
                              <span className="text-[11px] font-medium text-muted-foreground group-hover/talent:text-foreground transition-colors font-sans">
                                {d.designer.firstName} {d.designer.lastName}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-12 pt-8 border-t border-border/40">
                        <div className="space-y-2">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Commencement</p>
                          <div className="flex items-center gap-3 text-foreground text-[11px] font-bold tracking-wider">
                            <Calendar size={12} className="text-accent-purple/50" />
                            {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Valuation</p>
                          <p className="text-foreground text-[11px] font-bold tracking-widest italic font-serif">
                            {project.budget ? `$${project.budget.toLocaleString()}` : "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {project.status === "Active" && (
                      <div className="p-8 bg-muted/30 border-t border-border/40">
                        <Button
                          variant="primary"
                          onClick={() => handleUpdateStatus(project._id, "Completed")}
                          className="w-full bg-transparent border border-border/60 hover:border-accent-purple hover:bg-accent-purple/5 rounded-none text-[10px] tracking-[0.4em] font-bold uppercase py-5 transition-all duration-700"
                        >
                          <CheckCircle size={14} className="mr-3 text-accent-purple" />
                          Finalize Mission
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
