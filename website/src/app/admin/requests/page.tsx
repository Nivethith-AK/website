"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Shield, ArrowLeft, ClipboardList, CheckCircle, XCircle, Briefcase, Plus, SearchCheck, MoreHorizontal, UserCheck, Calendar } from "lucide-react";
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
  company: {
    companyName: string;
    contactPerson: string;
    email: string;
  };
}

export default function ClientRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    const response = await get("/admin/requests");
    if (response.success) {
      setRequests(response.data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const response = await post(`/admin/approve-request/${id}`, {});
    if (response.success) {
      setRequests(requests.map(r => r._id === id ? { ...r, status: "Approved" } : r));
    } else {
      alert(response.message || "Failed to approve request");
    }
    setProcessingId(null);
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter rejection reason:");
    if (reason === null) return;

    setProcessingId(id);
    const response = await post(`/admin/reject-request/${id}`, { rejectionReason: reason });
    if (response.success) {
      setRequests(requests.map(r => r._id === id ? { ...r, status: "Rejected" } : r));
    } else {
      alert(response.message || "Failed to reject request");
    }
    setProcessingId(null);
  };

  const filteredRequests = requests.filter(r => 
    r.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.company.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-20 gap-8">
        <div className="w-16 h-[1px] bg-accent-purple animate-pulse" />
        <p className="text-muted-foreground animate-pulse tracking-[0.5em] text-[10px] uppercase font-black">Synchronizing Mission Control...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Fixed Header */}
      <div className="fixed top-20 left-0 right-0 bg-background/80 backdrop-blur-2xl border-b border-white/5 z-40 transition-all duration-1000">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => router.push("/admin/dashboard")}
              className="p-2 hover:bg-card transition-all duration-1000 border border-white/5"
            >
              <ArrowLeft size={18} className="text-foreground" />
            </button>
            <div>
              <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">Mission Control</h1>
              <p className="text-accent-purple text-[9px] font-black uppercase tracking-[0.4em] mt-2">Operational Management</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-accent-purple transition-colors duration-1000" size={16} />
              <input
                type="text"
                placeholder="SEARCH MISSIONS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-4 bg-card border border-white/5 focus:border-accent-purple outline-none text-[10px] tracking-[0.3em] font-black transition-all duration-1000 w-72 uppercase"
              />
            </div>
            <div className="px-6 py-2 bg-accent-purple text-white text-[9px] font-black uppercase tracking-[0.3em]">
              {requests.length} Requests
            </div>
          </div>
        </div>
      </div>

      <div className="pt-80 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-60 border border-dashed border-white/5 flex flex-col items-center justify-center">
            <ClipboardList size={48} strokeWidth={1} className="mb-8 text-muted-foreground/20" />
            <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter mb-4">No Data</h3>
            <p className="text-muted-foreground max-w-xs mx-auto text-[11px] font-black uppercase">
              Mission requests will appear here once submitted.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <AnimatePresence mode="popLayout">
              {filteredRequests.map((request, idx) => (
                <motion.div
                  key={request._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.1, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="group bg-card border border-white/5 hover:border-accent hover:shadow-2xl transition-all duration-1000 flex flex-col h-full relative overflow-hidden">
                    <div className="p-10 border-b border-white/5 bg-white/5 flex justify-between items-start relative z-10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 mb-2">
                          <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${
                            request.status === "New" ? "bg-accent-purple/5 text-accent-purple border-accent-purple/20" :
                            request.status === "Approved" ? "bg-white/10 text-foreground border-white/10" :
                            "bg-muted text-muted-foreground border-white/5"
                          }`}>
                            {request.status}
                          </span>
                          <span className="text-[9px] text-muted-foreground font-mono font-black tracking-widest uppercase opacity-40">#REQ-{request._id.slice(-6).toUpperCase()}</span>
                        </div>
                        <h3 className="text-4xl font-black text-foreground uppercase tracking-tight group-hover:text-accent transition-colors duration-1000 leading-none">{request.projectTitle}</h3>
                        <p className="text-accent-purple text-[10px] font-black uppercase tracking-[0.4em]">{request.company.companyName}</p>
                      </div>
                    </div>

                    <div className="p-10 flex-1 space-y-10 relative z-10">
                      <p className="text-[11px] text-muted-foreground leading-relaxed font-black uppercase group-hover:text-foreground transition-colors duration-1000">
                        {request.description}
                      </p>

                      <div className="grid grid-cols-3 gap-8 pt-6 border-t border-white/5">
                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">Talent</p>
                          <p className="text-foreground text-xs font-black uppercase tracking-wider">{request.requiredDesigners}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">Timeline</p>
                          <p className="text-foreground text-xs font-black uppercase tracking-wider">{request.duration}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">Budget</p>
                          <p className="text-foreground text-xs font-black uppercase tracking-wider">${request.budget?.toLocaleString() || "0"}</p>
                        </div>
                      </div>
                    </div>

                    {request.status === "New" && (
                      <div className="p-8 bg-white/5 border-t border-white/5 grid grid-cols-2 gap-8 relative z-10">
                        <button
                          onClick={() => handleReject(request._id)}
                          disabled={processingId === request._id}
                          className="flex items-center justify-center border border-white/10 text-muted-foreground hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-1000 h-14 text-[9px] font-black uppercase tracking-[0.4em]"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(request._id)}
                          disabled={processingId === request._id}
                          className="flex items-center justify-center bg-accent-purple hover:bg-white hover:text-black transition-all duration-1000 h-14 text-[9px] font-black uppercase tracking-[0.4em]"
                        >
                          Approve
                        </button>
                      </div>
                    )}

                    {request.status === "Approved" && (
                      <div className="p-8 bg-white/5 border-t border-white/5 relative z-10">
                        <button
                          onClick={() => router.push(`/admin/projects/assign?requestId=${request._id}`)}
                          className="w-full flex items-center justify-center bg-foreground text-background hover:bg-accent-purple hover:text-white transition-all duration-1000 h-14 text-[9px] font-black uppercase tracking-[0.4em] shadow-xl"
                        >
                          Hire Talent
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
