"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Globe, Sparkles, Layers, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background pb-28 text-foreground">
      <div className="noise-bg" />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[-10%] top-[-8%] h-[38rem] w-[38rem] rounded-full bg-accent-purple/20 blur-[130px]"
        />
        <motion.div
          animate={{ x: [0, -35, 25, 0], y: [0, 30, -12, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-14%] h-[32rem] w-[32rem] rounded-full bg-[#2e0854]/30 blur-[130px]"
        />
        <motion.div
          animate={{ opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[42%] top-[38%] h-56 w-56 rounded-full bg-accent/10 blur-[80px]"
        />
      </div>

      <section className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 pb-24 pt-40 sm:px-6 lg:grid-cols-12 lg:px-8 lg:pt-44">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="lg:col-span-7"
        >
          <span className="mb-7 inline-flex items-center gap-3 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-accent">
            <Sparkles size={12} />
            Royal Luxury Tech
          </span>

          <h1 className="mb-8 text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl lg:text-[92px]">
            The Premium
            <span className="block bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent">Talent Matrix</span>
          </h1>

          <p className="mb-10 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            AURAX connects elite fashion designers, luxury companies, and admin operators in one animated,
            precision-managed marketplace with startup-grade UX.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="gold-glow-hover rounded-full bg-accent px-8 text-black hover:bg-[#e0bb4a]"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/designers">
              <Button size="lg" variant="outline" className="rounded-full border-accent/35 text-accent hover:bg-accent/10">
                Explore Designers
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.8, ease }}
          className="lg:col-span-5"
        >
          <div className="lux-glass rounded-3xl p-6 sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Live Signal</p>
              <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-accent">
                Operational
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { k: "Designers", v: "420+" },
                { k: "Luxury Brands", v: "120" },
                { k: "Avg Match Time", v: "32h" },
                { k: "Global Cities", v: "18" },
              ].map((item) => (
                <motion.div
                  key={item.k}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.32, ease }}
                  className="lux-glow-hover rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <p className="mb-2 text-[9px] font-black uppercase tracking-[0.24em] text-white/55">{item.k}</p>
                  <p className="text-2xl font-black text-white">{item.v}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: Shield,
              title: "Vetted Access",
              text: "Admin-first control keeps quality and security at premium-grade.",
            },
            {
              icon: Globe,
              title: "Global Pipeline",
              text: "Cross-border placements between designers and high-end companies.",
            },
            {
              icon: Layers,
              title: "Smart Assignment",
              text: "Intelligent flow from request to assignment with full transparency.",
            },
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: idx * 0.1, duration: 0.55, ease }}
              className="lux-glass lux-glow-hover rounded-2xl p-6"
            >
              <item.icon className="mb-4 h-6 w-6 text-accent" />
              <h3 className="mb-3 text-xl font-black uppercase">{item.title}</h3>
              <p className="text-sm leading-relaxed text-white/65">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease }}
          className="lux-glass gold-glow-hover rounded-3xl border border-accent/25 p-8 text-center sm:p-10"
        >
          <div className="mb-4 inline-flex rounded-full border border-accent/35 bg-accent/10 p-2 text-accent">
            <WandSparkles size={18} />
          </div>
          <h2 className="mb-4 text-4xl font-black uppercase sm:text-5xl">Ready to Scale Creative Output?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-white/65">
            Join a modern marketplace engineered for speed, trust, and luxury execution.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button className="rounded-full bg-accent px-8 text-black hover:bg-[#e0bb4a]">Apply Now</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="rounded-full border-accent/35 text-accent hover:bg-accent/10">
                Talk to Concierge
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
