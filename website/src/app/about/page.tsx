"use client";

import { motion } from "framer-motion";
import { Users, Target, Sparkles, ArrowRight, Award, Globe, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-48 pb-32 relative border-b border-border/40 overflow-hidden bg-background">
        {/* Ambient Aura */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-accent-purple/5 rounded-full blur-[150px] -ml-64 -mt-64 animate-pulse" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
            <span className="text-accent-purple font-black tracking-[0.5em] uppercase text-[10px] mb-8 block">Our Legacy</span>
            <h1 className="text-7xl md:text-[110px] font-black mb-12 tracking-tighter uppercase leading-[0.85] text-foreground">
              The <span className="text-accent-purple">AURAX</span> <br/>Standard
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed font-black max-w-2xl uppercase">
              A global bridge for the world's most visionary fashion talent.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-60 relative bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-start">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="text-5xl font-black mb-16 text-foreground tracking-tighter uppercase leading-tight">Our <span className="text-accent-purple underline decoration-accent/30 underline-offset-8">Mission</span></h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed font-black uppercase">
                At AURAX, we believe true artistry transcends boundaries. Our mission is to empower the next generation of fashion icons.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed font-black mb-20 uppercase tracking-[0.3em] text-[10px]">
                We don't just facilitate hiring; we cultivate careers and build the foundations for the future of luxury.
              </p>
              <div className="flex gap-12">
                <Link href="/designers">
                  <button className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground border-b border-accent-purple/30 pb-2 hover:text-accent-purple hover:border-accent-purple transition-all duration-1000">Talent Pool</button>
                </Link>
                <Link href="/contact">
                  <button className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground border-b border-white/10 pb-2 hover:text-foreground hover:border-foreground transition-all duration-1000">The Process</button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 shadow-2xl"
            >
              {[
                { label: "800+", desc: "Vetted Talent" },
                { label: "45+", desc: "Global Hubs" },
                { label: "300+", desc: "Luxury Brands" },
                { label: "99%", desc: "Success Rate" },
              ].map((item, idx) => (
                <div key={idx} className="bg-card p-16 text-center group hover:bg-background transition-colors duration-1000">
                  <p className="text-5xl font-black text-foreground mb-2 tracking-tighter group-hover:text-accent-purple transition-colors duration-1000">{item.label}</p>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] group-hover:text-accent transition-colors duration-1000">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-48 border-t border-white/5 relative bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-32">
            <h2 className="text-5xl font-black text-foreground tracking-tighter uppercase leading-[0.9]">The <br/><span className="text-accent-purple">Standards</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
            {[
              {
                title: "Excellence",
                description: "We maintain the industry's most rigorous standards for talent curation.",
              },
              {
                title: "Integrity",
                description: "Transparency and ethical professionalism are our foundation.",
              },
              {
                title: "Innovation",
                description: "We define the next era of fashion collaboration.",
              },
            ].map((value, idx) => (
              <div
                key={idx}
                className="space-y-8"
              >
                <div className="w-12 h-px bg-accent" />
                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-black uppercase text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-48 border-t border-white/5 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-8xl font-black mb-12 text-foreground uppercase tracking-tighter leading-[0.9]">
              Craft Your <br /><span className="text-accent-purple">Legacy</span>
            </h2>
            <p className="text-muted-foreground mb-16 max-w-xl mx-auto font-black uppercase leading-relaxed">
              Join AURAX to elevate your brand to the highest level.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-8">
              <Link href="/signup">
                <Button className="rounded-none px-16 uppercase tracking-[0.4em] text-[10px] bg-accent-purple hover:bg-accent-purple-light transition-all duration-1000">
                  Join the Network
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="rounded-none px-16 uppercase tracking-[0.4em] text-[10px] border-border hover:bg-background transition-all duration-1000">
                  Private Consultation
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
