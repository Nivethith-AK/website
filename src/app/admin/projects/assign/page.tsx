"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ArrowLeft, Users, Briefcase, Search, CheckCircle, UserPlus, Info, Trash2, Send, Clock, Award, Check } from "lucide-react";
import { get, post } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";

interface Designer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  experienceLevel: string;
  skills: string[];
}

interface Request {
  _id: string;
  projectTitle: string;
  description: string;
  requiredDesigners: number;
  duration: string;
  budget?: number;
  company: {
    companyName: string;
  };
}

function ProjectAssignmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestId = searchParams.get("requestId");

  const [request, setRequest] = useState<Request | null>(null);
  const [availableDesigners, setAvailableDesigners] = useState<Designer[]>([]);
  const [selectedDesigners, setSelectedDesigners] = useState<Designer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [reqRes, desRes] = await Promise.all([
          get(`/admin/requests`),
          get(`/designers/list?limit=100`)
        ]);

        if (reqRes.success && requestId) {
          const targetReq = reqRes.data.find((r: any) => r._id === requestId);
          setRequest(targetReq || null);
        }
        
        if (desRes.success) {
          setAvailableDesigners(desRes.data || []);
        }
      } catch (error) {
        console.error("Assignment initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (requestId) fetchData();
    else setIsLoading(false);
  }, [requestId]);

  const toggleDesigner = (designer: Designer) => {
    setSelectedDesigners(prev => 
      prev.find(d => d._id === designer._id)
        ? prev.filter(d => d._id !== designer._id)
        : [...prev, designer]
    );
  };

  const handleAssign = async () => {
    if (selectedDesigners.length === 0 || !requestId) return;
    
    setIsSubmitting(true);
    try {
      const response = await post("/admin/assign-designers", {
        requestId,
        designerIds: selectedDesigners.map(d => d._id)
      });

      if (response.success) {
        // Use a non-blocking notification if available, but for now:
        alert("Strategic deployment successful. Designers have been assigned.");
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        alert(response.message || "Deployment failed. Please verify credentials.");
      }
    } catch (error) {
      alert("A system error occurred during assignment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDesigners = availableDesigners.filter(d => 
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  ).filter(d => !selectedDesigners.find(sd => sd._id === d._id));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-60 gap-8 bg-background min-h-screen">
        <div className="w-16 h-[1px] bg-accent-purple animate-pulse" />
        <p className="text-muted-foreground animate-pulse tracking-[0.5em] text-[10px] uppercase font-bold font-serif italic">Synchronizing Global Talent...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-48">
      <div className="fixed top-20 left-0 right-0 bg-background/90 backdrop-blur-xl border-b border-border/40 z-40 transition-all duration-1000">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <button onClick={() => router.back()} className="p-2 hover:bg-muted transition-all duration-1000 rounded-none border border-transparent hover:border-border">
              <ArrowLeft size={18} className="text-foreground" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tighter uppercase leading-none">Talent Selection</h1>
              <p className="text-accent-purple text-[9px] font-bold uppercase tracking-[0.4em] mt-2 font-serif italic">Assignment Logic Module</p>
            </div>
          </div>
          <Button 
            variant="premium" 
            disabled={selectedDesigners.length === 0} 
            isLoading={isSubmitting}
            onClick={handleAssign}
            className="px-16 py-8 rounded-none bg-accent-purple hover:bg-accent-purple-light text-white transition-all duration-1000 shadow-xl"
          >
            Deploy Squad ({selectedDesigners.length})
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
          {/* Left: Project Details & Selected Squad */}
          <div className="lg:col-span-1 space-y-12">
            <div className="p-10 border border-border/40 bg-white shadow-sm transition-all duration-1000 group hover:shadow-md">
              <h3 className="text-[10px] font-bold text-accent-purple uppercase tracking-[0.4em] mb-10 flex items-center gap-3 font-serif italic">
                <Info size={14} /> Mission Intelligence
              </h3>
              <div className="space-y-8">
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-3">Codename</p>
                  <p className="text-2xl font-bold text-foreground leading-tight tracking-tight uppercase">{request?.projectTitle || "UNNAMED_OPERATION"}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-3">Collaborator</p>
                  <p className="text-foreground font-serif italic text-lg">{request?.company?.companyName || "PRIVATE_ENTITY"}</p>
                </div>
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-border/40">
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-2">Slots</p>
                    <p className="text-foreground font-bold text-xl">{selectedDesigners.length} / {request?.requiredDesigners || 0}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-2">Budget</p>
                    <p className="text-accent font-bold text-xl">${request?.budget?.toLocaleString() || "TBD"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.4em] px-2 font-serif italic border-l-2 border-accent-purple ml-2">Selected Squad</h3>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {selectedDesigners.length === 0 ? (
                    <motion.p initial={{opacity: 0}} animate={{opacity: 1}} className="text-[11px] text-muted-foreground italic px-4 font-serif">Awaiting talent selection...</motion.p>
                  ) : (
                    selectedDesigners.map(designer => (
                      <motion.div
                        key={designer._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center justify-between p-6 bg-white border border-border/40 group hover:border-accent-purple transition-all duration-1000 shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-muted text-foreground flex items-center justify-center font-bold text-[10px] uppercase font-serif italic border border-border/40 group-hover:bg-accent-purple group-hover:text-white transition-all duration-1000">
                            {designer.firstName[0]}{designer.lastName[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground uppercase tracking-wider">{designer.firstName} {designer.lastName}</p>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] mt-1">{designer.experienceLevel}</p>
                          </div>
                        </div>
                        <button onClick={() => toggleDesigner(designer)} className="p-2 text-muted-foreground/30 hover:text-accent-purple transition-colors duration-1000">
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right: Designer Selection */}
          <div className="lg:col-span-2 space-y-12">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-accent-purple transition-colors duration-1000" size={18} />
              <input
                type="text"
                placeholder="SEARCH CANDIDATES BY NAME OR SPECIALIZATION..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-8 bg-white border border-border/40 focus:border-accent-purple outline-none text-foreground transition-all duration-1000 shadow-sm text-[10px] tracking-[0.3em] font-bold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {filteredDesigners.map((designer, idx) => (
                <motion.div
                  key={designer._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => toggleDesigner(designer)}
                  className="group cursor-pointer"
                >
                  <div className="p-10 border border-border/40 bg-white group-hover:border-accent-purple group-hover:shadow-2xl transition-all duration-1000 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className="w-14 h-14 bg-muted border border-border/40 flex items-center justify-center text-sm font-bold text-foreground uppercase font-serif italic group-hover:bg-accent-purple group-hover:text-white transition-all duration-1000">
                        {designer.firstName[0]}{designer.lastName[0]}
                      </div>
                      <div className="px-3 py-1 bg-muted/30 border border-border/40 group-hover:border-accent-purple/20 transition-all duration-1000">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{designer.experienceLevel}</span>
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-foreground group-hover:text-accent-purple transition-colors duration-1000 mb-6 uppercase tracking-tight">{designer.firstName} {designer.lastName}</h4>
                    <div className="flex flex-wrap gap-x-6 gap-y-3 mb-10 relative z-10">
                      {designer.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground border-b border-border/40 pb-1 group-hover:text-foreground transition-all duration-1000">{skill}</span>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full border-border/40 group-hover:bg-accent-purple group-hover:text-white group-hover:border-accent-purple transition-all duration-1000 h-14 text-[9px] font-bold uppercase tracking-[0.4em]">
                      <UserPlus size={14} className="mr-3" /> Select Candidate
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectAssignment() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectAssignmentContent />
    </Suspense>
  );
}
