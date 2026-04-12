"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Star, Users, Zap, Crown, Sparkles, Globe, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { useRef } from "react";

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <div ref={containerRef} className="relative bg-background min-h-screen">
      <div className="noise-bg" />
      
      {/* Floating Orbs - 2026 Aesthetic */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-accent-purple/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px]" 
        />
      </div>

      {/* Hero Section - Minimalist & Impactful */}
      <section className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-12 overflow-hidden pt-16">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-[1px] bg-accent" />
                <span className="text-accent text-[11px] font-black uppercase tracking-[0.6em]">Est. 2026 Luxury Service</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-8xl lg:text-[140px] font-black text-white leading-[0.9] md:leading-[0.85] tracking-tighter uppercase mb-10 md:mb-12">
                THE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-accent/60 to-accent">ELITE</span> <br />
                MATRIX
              </h1>
              
              <p className="max-w-xl text-white/50 text-base sm:text-lg md:text-xl font-medium leading-relaxed mb-12 md:mb-16">
                Bridging the gap between avant-garde designers and global heritage maisons. A managed ecosystem of creative brilliance.
              </p>

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-8">
                <Link href="/signup">
                  <Button size="lg" variant="premium" className="group">
                    GET STARTED
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5">
                    CONTACT US
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
          
          <div className="hidden lg:block lg:col-span-4 relative">
             <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-square"
             >
                <div className="absolute inset-0 border-[1px] border-accent/20 rounded-full animate-spin-slow" />
                <div className="absolute inset-[10%] border-[1px] border-white/5 rounded-full animate-reverse-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Crown className="w-24 h-24 text-accent/20" strokeWidth={0.5} />
                </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Infinite Scroll - Industry Features */}
      <section className="py-24 border-y border-white/5 bg-muted/20 overflow-hidden">
         <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-12 mx-12">
                 <span className="text-white/20 text-4xl font-black uppercase tracking-tighter">Haute Couture</span>
                 <Sparkles className="text-accent/40 w-8 h-8" />
                 <span className="text-white/20 text-4xl font-black uppercase tracking-tighter">Visionary Art</span>
                 <div className="w-2 h-2 bg-accent/20 rounded-full" />
                 <span className="text-white/20 text-4xl font-black uppercase tracking-tighter">Strategic Design</span>
              </div>
            ))}
         </div>
      </section>

      {/* Values - Modern Grid */}
       <section className="py-24 md:py-40 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-32">
           <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.8]"
           >
              GLOBAL <br /> <span className="text-accent">MANDATE</span>
           </motion.h2>
           <p className="max-w-xs text-white/40 text-[11px] font-bold uppercase tracking-[0.4em] mb-4">
             Curating excellence across three continents with unmatched technical precision.
           </p>
        </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5 overflow-hidden">
           {[
             { title: "Curation", desc: "Rigorous vetting by industry veterans ensures only the top 1% enter our collective.", icon: Shield },
             { title: "Velocity", desc: "Our administrative matrix allows for rapid deployment within 72 hours of approval.", icon: Zap },
             { title: "Legacy", desc: "Building sustainable careers and long-term partnerships with world-class houses.", icon: Globe }
           ].map((val, idx) => (
              <div key={idx} className="bg-background p-8 sm:p-12 md:p-16 group hover:bg-accent/5 transition-colors duration-700">
                <val.icon className="w-12 h-12 text-accent/20 mb-12 group-hover:text-accent transition-colors duration-1000" strokeWidth={1} />
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8 group-hover:text-accent transition-colors">{val.title}</h3>
                <p className="text-white/50 text-base font-medium leading-relaxed">{val.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Dynamic CTA */}
       <section className="py-24 md:py-64 px-4 sm:px-6 relative overflow-hidden flex flex-col items-center">
         <motion.div 
          whileInView={{ scale: [0.9, 1], opacity: [0, 1] }}
          className="relative z-10 text-center"
         >
            <h2 className="text-6xl sm:text-7xl md:text-[200px] font-black text-white tracking-tighter leading-none mb-12 md:mb-24 uppercase">
               READY?
            </h2>
            <div className="flex flex-col md:flex-row gap-4 md:gap-12 justify-center w-full md:w-auto">
               <Link href="/signup">
                  <div className="px-8 sm:px-12 md:px-20 py-4 sm:py-6 md:py-10 bg-accent text-black font-black uppercase tracking-[0.35em] text-[10px] sm:text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_50px_rgba(212,175,55,0.3)] text-center">
                     APPLY NOW
                  </div>
               </Link>
               <Link href="/contact">
                  <div className="px-8 sm:px-12 md:px-20 py-4 sm:py-6 md:py-10 border border-white/20 text-white font-black uppercase tracking-[0.35em] text-[10px] sm:text-sm hover:bg-white/5 transition-all text-center">
                     CONTACT
                  </div>
               </Link>
            </div>
         </motion.div>
         
         <div className="absolute bottom-0 w-full h-[30%] bg-gradient-to-t from-accent/10 to-transparent blur-[100px]" />
      </section>

      <footer className="py-20 md:py-40 border-t border-white/5 px-4 sm:px-6 bg-[#080812]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-24 mb-16 md:mb-32">
            <div className="col-span-1 md:col-span-2">
              <div className="text-3xl md:text-4xl font-black tracking-[0.2em] text-white uppercase mb-8 md:mb-12">AURAX</div>
              <p className="max-w-sm text-white/40 text-sm font-black uppercase tracking-[0.2em] leading-relaxed mb-12">
                The global epicenter for luxury fashion talent and visionary maisons. 
                Managed excellence, industrial precision.
              </p>
              <div className="flex flex-wrap gap-4 md:gap-8">
                {["Instagram", "LinkedIn", "X", "Behance"].map(social => (
                  <a key={social} href="#" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-accent transition-all duration-700">
                    {social}
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-accent mb-10">Network</h4>
              <ul className="space-y-6">
                <li><Link href="/about" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors">About Mission</Link></li>
                <li><Link href="/designers" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors">Elite Talents</Link></li>
                <li><Link href="/signup" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors">Apply Matrix</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-accent mb-10">Support</h4>
              <ul className="space-y-6">
                <li><Link href="/contact" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors">Contact Hub</Link></li>
                <li><a href="#" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors">Privacy Protocol</a></li>
                <li><a href="#" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="text-[9px] font-black uppercase tracking-[0.6em] text-white/20">
              © 2026 AURAX GLOBAL AG. ALL RIGHTS RESERVED.
            </div>
            <div className="flex items-center gap-8">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Ecosystem Status: Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
