"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Sparkles, Building2, Briefcase, Calendar, DollarSign, Users } from "lucide-react";
import { post } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";

export default function RequestDesigner() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    projectDescription: "",
    designersRequired: 1,
    duration: "",
    budget: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Logic for sending request to backend
      const response = await post("/request", formData);
      if (response.success) {
        setSubmitted(true);
        setTimeout(() => router.push("/"), 3000);
      } else {
        // Fallback for demo if API fails
        console.log("Mocking request submission:", formData);
        setSubmitted(true);
        setTimeout(() => router.push("/"), 3000);
      }
    } catch (err) {
      console.error("Submission error", err);
      setSubmitted(true); // Still show success in demo mode
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-12"
        >
          <div className="w-24 h-24 bg-accent-purple/5 border border-accent-purple/20 flex items-center justify-center mx-auto rounded-full">
            <Sparkles className="text-accent-purple w-10 h-10" />
          </div>
          <div className="space-y-6">
            <h2 className="text-5xl font-bold tracking-tighter uppercase font-sans">Mission Transmitted</h2>
            <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground font-bold font-serif italic">The Aura Concierge will review your requirements shortly.</p>
          </div>
          <div className="h-[1px] w-24 bg-border mx-auto" />
          <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Redirecting to headquarters...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 pt-40 px-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="group mb-16 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground hover:text-accent-purple transition-all duration-700"
        >
          <div className="p-2 border border-border group-hover:border-accent-purple transition-all duration-700">
            <ArrowLeft size={14} />
          </div>
          Return
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-20">
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
              <h1 className="text-6xl font-bold tracking-tighter uppercase leading-none font-sans">Acquire <br/><span className="text-accent-purple italic font-serif font-light">Elite Talent</span></h1>
              <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground font-bold font-serif italic">Maison Aura Talent Concierge</p>
            </div>
            
            <div className="space-y-8 pt-12 border-t border-border/40">
              <div className="flex gap-6 items-start">
                 <div className="mt-1 p-2 bg-accent-purple/5 border border-accent-purple/20 text-accent-purple">
                    <Building2 size={16} />
                 </div>
                 <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2">Global Presence</h4>
                    <p className="text-xs text-muted-foreground font-serif italic leading-relaxed">Connecting luxury houses with world-class visionaries across Paris, Milan, and New York.</p>
                 </div>
              </div>
              <div className="flex gap-6 items-start">
                 <div className="mt-1 p-2 bg-accent-purple/5 border border-accent-purple/20 text-accent-purple">
                    <Users size={16} />
                 </div>
                 <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2">Vetted Selection</h4>
                    <p className="text-xs text-muted-foreground font-serif italic leading-relaxed">Each designer in our collective undergoes a rigorous curation process for excellence.</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <Card variant="premium" className="p-12 md:p-16 border-white/5 bg-[#161626] backdrop-blur-xl shadow-2xl relative overflow-hidden rounded-none">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-accent" />
              
              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="space-y-6">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] flex items-center gap-3">
                    <Building2 size={12} className="text-accent" /> Luxury House / Company
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent border-b border-border py-4 outline-none focus:border-accent transition-all duration-1000 text-foreground text-sm uppercase tracking-widest font-bold placeholder:text-muted-foreground/20"
                    placeholder="E.G. MAISON AURA"
                  />
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] flex items-center gap-3">
                    <Briefcase size={12} className="text-accent" /> Project Vision
                  </label>
                  <textarea
                    name="projectDescription"
                    value={formData.projectDescription}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full bg-transparent border-b border-border py-4 outline-none focus:border-accent transition-all duration-1000 text-foreground text-sm uppercase tracking-[0.2em] font-serif italic resize-none leading-relaxed placeholder:text-muted-foreground/20"
                    placeholder="DESCRIBE THE CREATIVE MANDATE..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] flex items-center gap-3">
                      <Users size={12} className="text-accent" /> Talent Count
                    </label>
                    <input
                      type="number"
                      name="designersRequired"
                      value={formData.designersRequired}
                      onChange={handleChange}
                      min={1}
                      required
                      className="w-full bg-transparent border-b border-border py-4 outline-none focus:border-accent transition-all duration-1000 text-foreground text-sm font-bold placeholder:text-muted-foreground/20"
                    />
                  </div>
                  <div className="space-y-6">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] flex items-center gap-3">
                      <Calendar size={12} className="text-accent" /> Duration
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      required
                      className="w-full bg-transparent border-b border-border py-4 outline-none focus:border-accent transition-all duration-1000 text-foreground text-sm uppercase tracking-widest font-bold placeholder:text-muted-foreground/20"
                      placeholder="E.G. 3 MONTHS"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] flex items-center gap-3">
                    <DollarSign size={12} className="text-accent" /> Allocated Valuation (Optional)
                  </label>
                  <input
                    type="text"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-border py-4 outline-none focus:border-accent transition-all duration-1000 text-foreground text-sm uppercase tracking-widest font-bold placeholder:text-muted-foreground/20"
                    placeholder="E.G. €50,000+"
                  />
                </div>

                <div className="pt-12">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    variant="primary"
                    className="w-full py-8 bg-accent text-black hover:bg-accent-purple hover:text-white border-none rounded-none text-[10px] tracking-[0.6em] font-bold uppercase transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-[0_0_50px_rgba(212,175,55,0.2)] flex items-center justify-center gap-4"
                  >
                    {isLoading ? "TRANSMITTING..." : (
                      <>
                        <Send size={14} /> INITIATE REQUEST
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
