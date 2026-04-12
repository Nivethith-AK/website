"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LogOut, Briefcase, Send, Layout, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { get, post } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";

interface Request {
  _id: string;
  projectTitle: string;
  description: string;
  requiredDesigners: number;
  duration: string;
  budget?: number;
  status: string;
  createdAt: string;
  assignedDesigners?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

export default function ClientDashboard() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    projectTitle: "",
    description: "",
    requiredDesigners: 1,
    duration: "1 month",
    budget: 0,
  });

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await get("/clients/projects");
      if (response.success) {
        setRequests(response.data || []);
      } else {
        alert(response.message || "Failed to load requests");
        router.push("/login");
      }
      setIsLoading(false);
    };

    fetchRequests();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await post("/clients/requests", formData);
    if (response.success) {
      setRequests([...requests, response.data]);
      setFormData({
        projectTitle: "",
        description: "",
        requiredDesigners: 1,
        duration: "1 month",
        budget: 0,
      });
      setShowForm(false);
    } else {
      alert(response.message || "Failed to create request");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-20 gap-8">
        <div className="w-16 h-[1px] bg-accent-purple animate-pulse" />
        <p className="text-muted-foreground animate-pulse tracking-[0.5em] text-[10px] uppercase font-black">Synchronizing Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-20 left-0 right-0 bg-background/80 backdrop-blur-2xl border-b border-white/5 z-40 transition-all duration-1000">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex justify-between items-end">
          <div className="flex flex-col gap-6">
            <span className="text-accent-purple font-black tracking-[0.5em] uppercase text-[10px] mb-2 block">Client Portal</span>
            <h1 className="text-6xl font-black text-foreground uppercase tracking-tighter leading-none">
              Dashboard
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
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5 mb-32 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-accent-purple/[0.03] -z-10" />
          {[
            { label: "Active Requests", value: requests.filter(r => r.status !== "Completed").length },
            { label: "Total Projects", value: requests.length },
            { label: "Talent Match Rate", value: "94%" }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-card p-12 flex flex-col items-center text-center group hover:bg-background transition-colors duration-1000"
            >
              <p className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground mb-4">{stat.label}</p>
              <p className="text-5xl font-black text-foreground tracking-tighter group-hover:text-accent transition-colors duration-1000">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Header Section */}
        <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-8 border-l-2 border-accent-purple pl-6 ml-2">
          <div>
            <h2 className="text-5xl font-black text-foreground tracking-tighter uppercase leading-none">Project <br /><span className="text-accent-purple">Inventory</span></h2>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground border-b border-white/5 pb-2 hover:border-accent hover:text-accent transition-all duration-1000"
          >
            {showForm ? "Cancel Request" : "New Request"}
          </button>
        </div>

        {/* Create Request Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-32 p-16 border border-white/5 bg-card/40 backdrop-blur-xl"
            >
              <form onSubmit={handleSubmit} className="space-y-16">
                <div className="space-y-6">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Project Title</label>
                  <input
                    type="text"
                    value={formData.projectTitle}
                    onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                    required
                    className="w-full bg-transparent border-b border-white/5 py-4 outline-none focus:border-accent-purple transition-all duration-1000 text-foreground text-sm uppercase tracking-widest font-black placeholder:text-muted-foreground/20"
                    placeholder="E.G. AUTUMN 2026 COLLECTION"
                  />
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    className="w-full bg-transparent border-b border-white/5 py-4 outline-none focus:border-accent-purple transition-all duration-1000 text-foreground text-sm uppercase tracking-[0.2em] font-black resize-none leading-relaxed placeholder:text-muted-foreground/20"
                    placeholder="DESCRIBE YOUR REQUIREMENTS..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                  <div className="space-y-6">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Required Designers</label>
                    <input
                      type="number"
                      value={formData.requiredDesigners}
                      onChange={(e) => setFormData({ ...formData, requiredDesigners: parseInt(e.target.value) })}
                      min="1"
                      className="w-full bg-transparent border-b border-white/5 py-4 outline-none focus:border-accent-purple transition-all duration-1000 text-foreground text-sm font-black"
                    />
                  </div>

                  <div className="space-y-6">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Duration</label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full bg-transparent border-b border-white/5 py-4 outline-none focus:border-accent-purple transition-all duration-1000 text-foreground text-[11px] font-black uppercase tracking-[0.2em] cursor-pointer appearance-none"
                    >
                      <option className="bg-background">1 week</option>
                      <option className="bg-background">2 weeks</option>
                      <option className="bg-background">1 month</option>
                      <option className="bg-background">2 months</option>
                      <option className="bg-background">3 months</option>
                      <option className="bg-background">6 months</option>
                    </select>
                  </div>

                  <div className="space-y-6">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Budget ($)</label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                      className="w-full bg-transparent border-b border-white/5 py-4 outline-none focus:border-accent-purple transition-all duration-1000 text-foreground text-sm font-black"
                      placeholder="0"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-8 bg-accent-purple text-white text-[10px] font-black uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all duration-1000 shadow-xl">
                  Submit Request
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Requests List */}
        <div className="space-y-12">
          {requests.length === 0 ? (
            <div className="py-60 border border-dashed border-white/5 flex flex-col items-center justify-center group hover:bg-card/30 transition-all duration-1000">
              <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground mb-12 font-black">No project inventory found.</p>
              <button onClick={() => setShowForm(true)} className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground border-b border-white/10 pb-2 hover:border-accent transition-all duration-1000">Submit Initial Request</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32">
              {requests.map((request, idx) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                >
                  <div className="space-y-10 p-12 border border-white/5 bg-card hover:border-accent hover:shadow-2xl transition-all duration-1000 group relative overflow-hidden">
                    <div className="flex justify-between items-start relative z-10">
                       <span className={`text-[9px] font-black uppercase tracking-[0.4em] px-3 py-1 border ${
                        request.status === "New" ? "text-accent-purple border-accent-purple/20 bg-accent-purple/5" :
                        request.status === "Approved" ? "text-foreground border-white/10 bg-white/5" :
                        "text-muted-foreground border-white/5"
                      }`}>
                        {request.status}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-mono font-black tracking-widest uppercase opacity-40">#{request._id.slice(-6).toUpperCase()}</span>
                    </div>
                    
                    <div className="relative z-10">
                      <h3 className="text-5xl font-black text-foreground uppercase tracking-tighter leading-tight mb-4 group-hover:text-accent transition-colors duration-1000">
                        {request.projectTitle}
                      </h3>
                      <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.4em]">{new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</p>
                    </div>

                    <p className="text-muted-foreground text-[11px] font-black uppercase leading-relaxed tracking-widest line-clamp-2 relative z-10">
                      {request.description}
                    </p>

                    <div className="space-y-4 relative z-10">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] border-b border-white/5 pb-2">Assigned Talent</p>
                      <div className="flex flex-wrap gap-4">
                        {request.assignedDesigners && request.assignedDesigners.length > 0 ? (
                          request.assignedDesigners.map((d, i) => (
                            <div key={i} className="text-foreground text-[10px] font-black uppercase tracking-widest bg-white/5 px-3 py-1">
                               {d.firstName} {d.lastName}
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40 italic">Review Pending...</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-10 border-t border-white/5 flex justify-between items-center relative z-10">
                      <div className="flex gap-12">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Required</p>
                          <p className="text-foreground font-black text-xs">{request.requiredDesigners}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Duration</p>
                          <p className="text-foreground font-black text-xs uppercase tracking-tighter">{request.duration}</p>
                        </div>
                      </div>
                      <button className="text-[9px] font-black uppercase tracking-[0.5em] text-foreground border-b border-white/5 pb-2 hover:border-accent hover:text-accent transition-all duration-1000">
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
