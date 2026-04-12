"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Search, Filter, ArrowUpRight, Plus, ExternalLink } from "lucide-react";
import { get } from "@/lib/api";
import { useRouter } from "next/navigation";

interface UniversityProfile {
  _id: string;
  universityName: string;
  email: string;
  department: string;
  isApproved: boolean;
}

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  experienceLevel: string;
  skills: string[];
}

export default function UniversityDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UniversityProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"talent" | "collaborations" | "settings">("talent");

  // Mock data for initial prototype
  const mockStudents: Student[] = [
    { _id: "1", firstName: "Elena", lastName: "Rossi", experienceLevel: "AOD Graduate", skills: ["Fashion Design", "CAD"] },
    { _id: "2", firstName: "Marco", lastName: "Bianchi", experienceLevel: "Student", skills: ["Textile Innovation", "3D Modeling"] },
    { _id: "3", firstName: "Sofia", lastName: "Verdi", experienceLevel: "AOD Graduate", skills: ["Haute Couture", "Embroidery"] },
  ];

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // In a real scenario, we would have a specific endpoint for university profile
      const response = await get("/university/profile");
      if (response.success) {
        setProfile(response.data);
      } else {
        // Fallback or error handling
        console.error("Failed to load university profile");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-20 gap-8">
        <div className="w-16 h-[1px] bg-accent-purple animate-pulse" />
        <p className="text-muted-foreground animate-pulse tracking-[0.5em] text-[10px] uppercase font-black">Initializing Institution Hub...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 text-foreground">
      {/* Header */}
      <div className="fixed top-20 left-0 right-0 bg-background/80 backdrop-blur-2xl border-b border-white/5 z-40 transition-all duration-1000">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex justify-between items-end">
          <div className="flex flex-col gap-6">
            <div className={`w-fit flex items-center gap-3 px-4 py-1.5 border border-accent-purple/30 text-accent-purple bg-accent-purple/5`}>
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">
                Academic Partner
              </span>
            </div>
            <h1 className="text-6xl font-black text-foreground uppercase tracking-tighter leading-none">Institute Console</h1>
          </div>
          
          <button 
            onClick={handleLogout}
            className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground hover:text-accent-purple transition-all duration-1000 pb-2 border-b border-transparent hover:border-accent-purple font-black"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="pt-80 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* University Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-32"
        >
          <div className="flex flex-col md:flex-row gap-20 items-start">
            <div className="relative aspect-square w-56 bg-card border border-white/5 flex items-center justify-center overflow-hidden group">
               <GraduationCap size={64} strokeWidth={1} className="text-accent-purple/40 group-hover:scale-110 transition-transform duration-1000" />
               <div className="absolute inset-0 bg-accent-purple/0 group-hover:bg-accent-purple/5 transition-colors duration-1000" />
            </div>
            
            <div className="flex-1 space-y-10">
              <div>
                <h2 className="text-7xl font-black text-foreground uppercase tracking-tighter leading-none mb-6">
                  {profile?.universityName || "Accademia Del Lusso"}
                </h2>
                <p className="text-muted-foreground uppercase tracking-[0.4em] text-[10px] font-black">{profile?.department || "Fashion & Design Department"}</p>
              </div>
              
              <div className="flex flex-wrap gap-16">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Enrolled Talent</p>
                  <p className="text-2xl font-black text-foreground uppercase tracking-tight">42 Designers</p>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Placement Rate</p>
                  <p className="text-2xl font-black text-accent-purple uppercase tracking-tight">88%</p>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Active Collabs</p>
                  <p className="text-2xl font-black text-foreground uppercase tracking-tight">12 Maison</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-16 mb-20 border-b border-white/5">
          {[
            { id: "talent", label: "Talent Pool" },
            { id: "collaborations", label: "Collaborations" },
            { id: "settings", label: "Registry" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-6 text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-1000 relative group ${
                activeTab === tab.id
                  ? "text-accent-purple"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className={`absolute bottom-0 left-0 h-[1px] bg-accent-purple transition-all duration-1000 ${activeTab === tab.id ? "w-full" : "w-0 group-hover:w-full"}`} />
            </button>
          ))}
        </div>

        {/* Content */}
        <div key={activeTab}>
          {activeTab === "talent" && (
            <div className="space-y-20">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-7xl font-black text-foreground tracking-tighter uppercase leading-none">Talent Pool</h3>
                  <p className="text-accent-purple text-[10px] font-black uppercase tracking-[0.5em] mt-6">AURAX Network Graduates</p>
                </div>
                <div className="flex gap-8">
                   <button className="p-4 border border-white/5 hover:border-accent-purple transition-all duration-1000 text-muted-foreground hover:text-foreground">
                      <Search size={18} strokeWidth={1.5} />
                   </button>
                   <button className="p-4 border border-white/5 hover:border-accent-purple transition-all duration-1000 text-muted-foreground hover:text-foreground">
                      <Filter size={18} strokeWidth={1.5} />
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                {mockStudents.map((student, idx) => (
                  <motion.div
                    key={student._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="p-12 border border-white/5 bg-card hover:border-accent-purple hover:shadow-2xl transition-all duration-1000 group relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <span className="text-[9px] font-black text-accent-purple uppercase tracking-[0.4em] bg-accent-purple/5 px-3 py-1 border border-accent-purple/10">
                        {student.experienceLevel}
                      </span>
                      <ArrowUpRight size={16} className="text-muted-foreground/30 group-hover:text-accent-purple transition-colors duration-1000" />
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-tight mb-6">
                        {student.firstName} {student.lastName}
                      </h4>
                      <div className="flex flex-wrap gap-4 mb-8">
                        {student.skills.map(skill => (
                          <span key={skill} className="text-[8px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1 border border-white/5">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <button className="w-full py-4 border border-white/5 text-[9px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all duration-1000">
                        View Portfolio
                      </button>
                    </div>
                  </motion.div>
                ))}
                
                {/* Add Student Card */}
                <button className="p-12 border border-dashed border-white/10 flex flex-col items-center justify-center gap-6 group hover:border-accent-purple/30 hover:bg-accent-purple/5 transition-all duration-1000">
                   <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center group-hover:border-accent-purple transition-all duration-1000">
                      <Plus size={20} className="text-muted-foreground group-hover:text-accent-purple" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground group-hover:text-foreground">Onboard Talent</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "collaborations" && (
            <div className="space-y-20">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-7xl font-black text-foreground tracking-tighter uppercase leading-none">Collaborations</h3>
                  <p className="text-accent-purple text-[10px] font-black uppercase tracking-[0.5em] mt-6">Industry Partnerships</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                 {[
                   { name: "LVMH Group", type: "Placement Program", status: "Active" },
                   { name: "Prada Maison", type: "Research Lab", status: "Negotiating" }
                 ].map((collab, idx) => (
                   <div key={idx} className="p-12 border border-white/5 bg-card flex justify-between items-center group hover:border-white/20 transition-all duration-1000">
                      <div className="space-y-4">
                         <h4 className="text-3xl font-black text-foreground uppercase tracking-tight">{collab.name}</h4>
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{collab.type}</p>
                      </div>
                      <div className="text-right space-y-4">
                         <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 border ${collab.status === 'Active' ? 'border-accent-purple text-accent-purple' : 'border-muted-foreground text-muted-foreground'}`}>
                           {collab.status}
                         </span>
                         <div className="flex justify-end">
                            <ExternalLink size={14} className="text-muted-foreground/20 group-hover:text-foreground transition-all duration-1000" />
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-2xl space-y-20">
               <h3 className="text-7xl font-black text-foreground tracking-tighter uppercase leading-none">Registry</h3>
               <p className="text-accent-purple text-[10px] font-black uppercase tracking-[0.5em] mt-6">Academic Configuration</p>
               
               <div className="space-y-12 pt-12">
                  <div className="group">
                    <label className="block text-[9px] uppercase tracking-[0.3em] font-black mb-4 text-muted-foreground">Department Lead</label>
                    <input type="text" defaultValue="Prof. Julian Vane" className="w-full py-4 bg-transparent border-b border-white/5 text-foreground outline-none font-black uppercase tracking-widest text-sm" />
                  </div>
                  <div className="group">
                    <label className="block text-[9px] uppercase tracking-[0.3em] font-black mb-4 text-muted-foreground">Accreditation ID</label>
                    <input type="text" defaultValue="AURAX-AC-2026-99" readOnly className="w-full py-4 bg-transparent border-b border-white/5 text-muted-foreground outline-none font-black uppercase tracking-widest text-sm opacity-50" />
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-[0.5em] text-accent border border-accent/20 px-12 py-5 hover:bg-accent hover:text-black transition-all duration-1000">
                    Update Registry
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
