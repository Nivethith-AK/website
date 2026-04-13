"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { get } from "@/lib/api";
import { Search, Sparkles, CircleCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/Card";

interface Designer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  experienceLevel: string;
  skills: string[];
  profileImage?: string;
  availability?: "Available" | "Busy";
}

interface Opportunity {
  _id: string;
  projectTitle: string;
  projectDescription?: string;
  description?: string;
  designersNeeded?: number;
  requiredDesigners?: number;
  duration: string;
  budget?: number;
  companyId?: {
    companyName?: string;
    contactPerson?: string;
    industry?: string;
  };
  company?: {
    companyName?: string;
    contactPerson?: string;
    industry?: string;
  };
}

const experienceOptions = ["Student", "Intern", "Professional"];

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function DesignersPage() {
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedExperience, setSelectedExperience] = useState<string>("");

  useEffect(() => {
    const fetchDesigners = async () => {
      setIsLoading(true);
      const [designersResponse, opportunitiesResponse] = await Promise.all([
        get<Designer[]>("/designers?limit=24"),
        get<any>("/designers/opportunities?limit=12"),
      ]);

      setDesigners(designersResponse.success && designersResponse.data ? designersResponse.data : []);

      if (opportunitiesResponse.success) {
        const list = Array.isArray(opportunitiesResponse.data)
          ? opportunitiesResponse.data
          : opportunitiesResponse.data?.data || [];
        setOpportunities(list);
      }

      setIsLoading(false);
    };

    fetchDesigners();
  }, []);

  const filteredDesigners = useMemo(() => {
    return designers.filter((designer) => {
      const fullName = `${designer.firstName} ${designer.lastName}`.toLowerCase();
      const skillMatch = designer.skills?.some((skill) => skill.toLowerCase().includes(query.toLowerCase()));
      const nameMatch = fullName.includes(query.toLowerCase());
      const experienceMatch = selectedExperience ? designer.experienceLevel === selectedExperience : true;
      return (nameMatch || skillMatch) && experienceMatch;
    });
  }, [designers, query, selectedExperience]);

  return (
    <div className="min-h-screen bg-background pt-36 text-foreground">
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease }}
          className="mb-10"
        >
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.26em] text-accent">
            <Sparkles size={11} />
            Designer Network
          </span>
          <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl">
            Curated
            <span className="block text-accent">Global Talent</span>
          </h1>
          <p className="mt-4 max-w-2xl text-white/65">
            Explore modern portfolios and assign top fashion specialists with live availability signals.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.55, ease }}
          className="lux-glass mb-10 rounded-2xl p-4 sm:p-5"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or skill"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setSelectedExperience("")}
                className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${
                  selectedExperience === "" ? "border-accent/45 bg-accent/10 text-accent" : "border-white/10 text-white/65"
                }`}
              >
                All
              </button>
              {experienceOptions.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedExperience(level)}
                  className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${
                    selectedExperience === level ? "border-accent/45 bg-accent/10 text-accent" : "border-white/10 text-white/65"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="lux-glass animate-pulse rounded-2xl p-6 h-72" />
            ))}
          </div>
        ) : (
          <>
            {opportunities.length > 0 && (
              <div className="mb-10">
                <h2 className="mb-4 text-2xl font-black uppercase tracking-tight">Fashion Opportunities</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {opportunities.map((job) => {
                    const summary = (job.projectDescription || job.description || "").trim();
                    const companyName = job.companyId?.companyName || job.company?.companyName || "Fashion Company";

                    return (
                      <Card key={job._id} className="lux-glass rounded-2xl p-5">
                        <p className="text-lg font-black uppercase leading-tight">{job.projectTitle}</p>
                        <p className="mt-2 text-sm text-white/60">{summary ? `${summary.slice(0, 120)}...` : "No description provided."}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.14em] text-white/70">
                          <span className="rounded-full border border-white/12 px-2 py-1">{job.duration}</span>
                          <span className="rounded-full border border-white/12 px-2 py-1">
                            Need: {job.designersNeeded || job.requiredDesigners || 1}
                          </span>
                          <span className="rounded-full border border-white/12 px-2 py-1">{companyName}</span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredDesigners.length === 0 ? (
              <div className="lux-glass rounded-2xl p-14 text-center">
                <p className="mb-2 text-lg font-black uppercase">No Designers Found</p>
                <p className="text-white/55">Try adjusting filters or searching with a different keyword.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDesigners.map((designer) => (
                  <motion.div
                    key={designer._id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, ease }}
                  >
                    <Card className="lux-glass lux-glow-hover rounded-2xl p-5 h-full">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-xl border border-white/15 bg-white/5">
                            {designer.profileImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={designer.profileImage} alt={designer.firstName} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm font-black uppercase text-white/55">
                                {designer.firstName?.[0]}
                                {designer.lastName?.[0]}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-lg font-black uppercase leading-tight">
                              {designer.firstName} {designer.lastName}
                            </p>
                            <p className="text-[10px] uppercase tracking-[0.24em] text-white/50">{designer.experienceLevel}</p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] ${
                            (designer.availability || "Available") === "Available"
                              ? "border border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                              : "border border-amber-300/30 bg-amber-400/10 text-amber-200"
                          }`}
                        >
                          <CircleCheck size={11} />
                          {designer.availability || "Available"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(designer.skills || []).slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/70"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
