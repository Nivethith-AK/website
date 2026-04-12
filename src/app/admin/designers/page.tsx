"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, UserX, Search, Shield, ArrowLeft, MoreVertical, Mail, ExternalLink, Filter } from "lucide-react";
import { get, post } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";

interface Designer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  experienceLevel: string;
  skills: string[];
  isApproved: boolean;
  profileImage?: string;
  portfolio: any[];
}

export default function PendingDesigners() {
  const router = useRouter();
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchDesigners = async () => {
    setIsLoading(true);
    const response = await get("/admin/pending-designers");
    if (response.success) {
      setDesigners(response.data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDesigners();
  }, []);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const response = await post(`/admin/approve-designer/${id}`, {});
    if (response.success) {
      setDesigners(designers.filter(d => d._id !== id));
    } else {
      alert(response.message || "Failed to approve designer");
    }
    setProcessingId(null);
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter rejection reason:");
    if (reason === null) return;

    setProcessingId(id);
    const response = await post(`/admin/reject-designer/${id}`, { rejectionReason: reason });
    if (response.success) {
      setDesigners(designers.filter(d => d._id !== id));
    } else {
      alert(response.message || "Failed to reject designer");
    }
    setProcessingId(null);
  };

  const filteredDesigners = designers.filter(d => 
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-20 gap-8">
        <div className="w-16 h-[1px] bg-accent-purple animate-pulse" />
        <p className="text-muted-foreground animate-pulse tracking-[0.5em] text-[10px] uppercase font-bold font-serif italic">Retrieving Talent Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Fixed Header */}
      <div className="fixed top-24 left-0 right-0 bg-background/80 backdrop-blur-2xl border-b border-border/40 z-40 transition-all duration-1000">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => router.push("/admin/dashboard")}
              className="p-2 hover:bg-muted transition-all duration-1000 rounded-none border border-transparent hover:border-border"
            >
              <ArrowLeft size={18} className="text-foreground" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground uppercase tracking-tighter">Curation Queue</h1>
              <p className="text-accent-purple text-[9px] font-bold uppercase tracking-[0.4em] font-serif italic mt-2">Pending Verification</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-accent-purple transition-colors duration-1000" size={16} />
              <input
                type="text"
                placeholder="SEARCH CANDIDATES..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-4 bg-white border border-border/40 focus:border-accent-purple outline-none text-[10px] tracking-[0.3em] font-bold transition-all duration-1000 w-72"
              />
            </div>
            <div className="px-6 py-2 bg-accent-purple text-white text-[9px] font-bold uppercase tracking-[0.3em]">
              {designers.length} Pending
            </div>
          </div>
        </div>
      </div>

      <div className="pt-80 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredDesigners.length === 0 ? (
          <div className="text-center py-60 border border-dashed border-border flex flex-col items-center justify-center">
            <Shield size={48} strokeWidth={1} className="mb-8 text-muted-foreground/20" />
            <h3 className="text-3xl font-bold text-foreground uppercase tracking-tighter mb-4">No Applications Found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto text-[11px] font-serif italic">
              All designer applications have been processed. New entries will appear upon transmission.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
            <AnimatePresence mode="popLayout">
              {filteredDesigners.map((designer, idx) => (
                <motion.div
                  key={designer._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.1, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="group bg-white border border-border/40 hover:border-accent-purple hover:shadow-2xl transition-all duration-1000 flex flex-col h-full relative overflow-hidden">
                    {/* Candidate Header */}
                    <div className="p-8 border-b border-border/40 bg-muted/10 relative z-10">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white border border-border/40 flex items-center justify-center text-xl font-bold text-foreground overflow-hidden font-serif italic group-hover:bg-accent-purple group-hover:text-white transition-all duration-1000 shadow-sm">
                          {designer.profileImage ? (
                            <img src={designer.profileImage} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                          ) : (
                            designer.firstName[0] + designer.lastName[0]
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-foreground uppercase tracking-tight truncate group-hover:text-accent-purple transition-colors duration-1000">
                            {designer.firstName} {designer.lastName}
                          </h3>
                          <div className="flex items-center gap-3 text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-2">
                            <Mail size={12} strokeWidth={1.5} />
                            <span className="truncate">{designer.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Candidate Details */}
                    <div className="p-10 flex-1 space-y-10 relative z-10">
                      <div className="flex justify-between items-end">
                        <div className="space-y-2">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] font-serif italic">Expertise</p>
                          <p className="text-foreground font-bold text-base uppercase tracking-wider">{designer.experienceLevel}</p>
                        </div>
                        <div className="text-right space-y-2">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] font-serif italic">Artifacts</p>
                          <p className="text-foreground font-bold text-base uppercase tracking-wider">{designer.portfolio.length} Pieces</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] font-serif italic">Specializations</p>
                        <div className="flex flex-wrap gap-x-6 gap-y-3">
                          {designer.skills.slice(0, 4).map(skill => (
                            <span key={skill} className="text-[9px] text-foreground uppercase tracking-[0.2em] font-bold border-b border-border/40 group-hover:border-accent-purple transition-all duration-1000">
                              {skill}
                            </span>
                          ))}
                          {designer.skills.length > 4 && (
                            <span className="text-[9px] text-accent-purple font-bold uppercase tracking-[0.2em] italic">
                              +{designer.skills.length - 4} MORE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-8 bg-muted/5 border-t border-border/40 grid grid-cols-2 gap-8 relative z-10">
                      <Button
                        variant="outline"
                        onClick={() => handleReject(designer._id)}
                        disabled={processingId === designer._id}
                        className="border-border/40 text-muted-foreground hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-1000 rounded-none h-14 text-[9px] font-bold uppercase tracking-[0.4em]"
                      >
                        <UserX size={16} className="mr-3" />
                        Reject
                      </Button>
                      <Button
                        variant="premium"
                        onClick={() => handleApprove(designer._id)}
                        isLoading={processingId === designer._id}
                        className="bg-accent-purple hover:bg-accent-purple-light text-white transition-all duration-1000 rounded-none h-14 text-[9px] font-bold uppercase tracking-[0.4em]"
                      >
                        <UserCheck size={16} className="mr-3" />
                        Approve
                      </Button>
                    </div>
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
