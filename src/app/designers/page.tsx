"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, Star, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { get } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";

interface Designer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  experienceLevel: string;
  skills: string[];
  profileImage?: string;
  portfolio: any[];
}

export default function Designers() {
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string>("");
  const [page, setPage] = useState(1);

  const skillsList = [
    "Fashion Design",
    "Textile Design",
    "Digital Design",
    "Pattern Making",
    "Garment Construction",
    "CAD",
    "Illustration",
    "Color Theory",
  ];

  useEffect(() => {
    const fetchDesigners = async () => {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (selectedSkills.length > 0) {
        selectedSkills.forEach(skill => params.append("skills", skill));
      }
      if (selectedExperience) {
        params.append("experienceLevel", selectedExperience);
      }
      params.append("page", page.toString());
      params.append("limit", "12");

      const response = await get(`/designers/list?${params.toString()}`);
      
      if (response.success) {
        setDesigners(response.data || []);
      }
      setIsLoading(false);
    };

    fetchDesigners();
  }, [selectedSkills, selectedExperience, page]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
    setPage(1);
  };

  const toggleExperience = (level: string) => {
    setSelectedExperience(prev => (prev === level ? "" : level));
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-40 pb-20 relative border-b border-border/40 overflow-hidden bg-background">
        {/* Animated Accent */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-purple/5 rounded-full blur-[100px] -mr-48 -mt-48" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
            <span className="text-accent-purple font-black tracking-[0.5em] uppercase text-[10px] mb-8 block">The AURAX List</span>
            <h1 className="text-6xl md:text-[110px] font-black mb-8 tracking-tighter uppercase leading-[0.85] text-foreground">
              The <span className="text-accent-purple">Collective</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed font-black uppercase">
              A curated selection of the world's most visionary fashion talent.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Designers Grid with Filters */}
      <section className="py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-24">
            {/* Filters Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="lg:w-64 flex-shrink-0"
            >
              <div className="sticky top-40 space-y-20">
                <div className="flex items-center gap-4 text-muted-foreground uppercase tracking-[0.4em] text-[9px] font-bold border-b border-border pb-4">
                  <Filter size={10} className="text-accent-purple" />
                  Filter Selection
                </div>

                {/* Experience Filter */}
                <div className="space-y-10">
                  <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.3em] mb-8">Expertise</h4>
                  <div className="flex flex-col gap-6">
                    {["Student", "Intern", "Professional"].map(level => (
                      <button
                        key={level}
                        onClick={() => toggleExperience(level)}
                        className={`text-left text-xs uppercase tracking-[0.2em] transition-all duration-1000 hover:translate-x-2 font-black ${
                          selectedExperience === level
                            ? "text-accent-purple"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills Filter */}
                <div className="space-y-10">
                  <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.3em] mb-8">Specialization</h4>
                  <div className="flex flex-col gap-6">
                    {skillsList.map(skill => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`text-left text-xs uppercase tracking-[0.2em] transition-all duration-1000 hover:translate-x-2 font-black ${
                          selectedSkills.includes(skill)
                            ? "text-accent-purple"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Designers Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-muted animate-pulse border border-border" />
                  ))}
                </div>
              ) : designers.length === 0 ? (
                <div className="text-center py-60 border border-dashed border-border">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-8 font-serif italic">Private collection empty under current filters.</p>
                  <button className="text-[10px] uppercase tracking-[0.3em] text-accent-purple border-b border-accent-purple/30 pb-1" onClick={() => { setSelectedSkills([]); setSelectedExperience(""); }}>
                    Reset View
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32">
                    {designers.map((designer, idx) => (
                      <motion.div
                        key={designer._id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: (idx % 2) * 0.2 }}
                        viewport={{ once: true }}
                      >
                        <Link href={`/designers/${designer._id}`} className="group block">
                          {/* Profile Image */}
                          <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-10 border border-border/40 shadow-sm">
                            {designer.profileImage ? (
                              <img
                                src={designer.profileImage}
                                alt={`${designer.firstName} ${designer.lastName}`}
                                className="w-full h-full object-cover grayscale transition-all duration-[1.8s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:grayscale-0 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-card">
                                <span className="text-5xl font-black text-muted-foreground/20 tracking-[0.5em] uppercase group-hover:text-accent-purple/20 transition-colors duration-1000">
                                  {designer.firstName?.[0]}{designer.lastName?.[0]}
                                </span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-accent-purple/0 group-hover:bg-accent-purple/5 transition-colors duration-1000" />
                            <div className="absolute top-8 left-8">
                              <span className="text-[9px] font-black text-foreground uppercase tracking-[0.4em] bg-background/80 backdrop-blur-md px-4 py-1.5 border border-white/5 shadow-sm">
                                {designer.experienceLevel}
                              </span>
                            </div>
                          </div>
 
                          {/* Content */}
                          <div className="space-y-6">
                            <div className="flex justify-between items-end">
                              <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter group-hover:text-accent transition-colors duration-1000">
                                {designer.firstName} {designer.lastName}
                              </h3>
                              <span className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-black mb-1">
                                {designer.portfolio.length} Projects
                              </span>
                            </div>

                            {/* Skills */}
                            <div className="flex flex-wrap gap-x-8 gap-y-4">
                              {designer.skills.slice(0, 4).map(skill => (
                                <span
                                  key={skill}
                                  className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground group-hover:text-foreground transition-colors duration-1000 font-black"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="mt-16 flex justify-center items-center gap-6">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border-border h-12 w-12 p-0 flex items-center justify-center rounded-none hover:bg-background transition-all duration-1000"
                    >
                      <ChevronLeft size={20} className="text-muted-foreground" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em]">Page</span>
                      <span className="text-lg font-light text-foreground font-serif italic">{page}</span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => p + 1)}
                      disabled={designers.length < 12}
                      className="border-border h-12 w-12 p-0 flex items-center justify-center rounded-none hover:bg-background transition-all duration-1000"
                    >
                      <ChevronRight size={20} className="text-muted-foreground" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
