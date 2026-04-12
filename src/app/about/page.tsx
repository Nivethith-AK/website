"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, Orbit, Sparkles, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/ui/badge";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pb-16 pt-28 text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ x: [0, 34, -18, 0], y: [0, -28, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[-10%] top-[-8%] h-[38rem] w-[38rem] rounded-full bg-accent-purple/18 blur-[130px]"
        />
        <motion.div
          animate={{ x: [0, -28, 16, 0], y: [0, 24, -14, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-18%] right-[-8%] h-[34rem] w-[34rem] rounded-full bg-[#2e0854]/28 blur-[140px]"
        />
      </div>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 pb-14 pt-8 sm:px-6 lg:grid-cols-12 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease }}
          className="lg:col-span-7"
        >
          <Badge variant="accent" className="mb-6">AURAX Identity</Badge>
          <h1 className="mb-6 text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl">
            Built for
            <span className="block text-accent">Luxury Execution</span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            AURAX is a high-end talent marketplace connecting fashion designers and luxury companies through a controlled,
            admin-managed operating model.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease }}
          className="lg:col-span-5"
        >
          <Card className="lux-glass rounded-3xl p-6">
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-accent">Live Standards</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { k: "Vetted Talent", v: "High" },
                { k: "Security", v: "Strict" },
                { k: "Assignment Speed", v: "Fast" },
                { k: "Global Reach", v: "Expanding" },
              ].map((item) => (
                <div key={item.k} className="rounded-xl border border-white/12 bg-white/[0.03] p-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/55">{item.k}</p>
                  <p className="mt-1 text-lg font-black uppercase">{item.v}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Operational Trust",
              text: "Every assignment is reviewed and approved through admin control.",
            },
            {
              icon: Orbit,
              title: "Scalable System",
              text: "Designed for future expansion into messaging, payments, and AI matching.",
            },
            {
              icon: Crown,
              title: "Luxury Positioning",
              text: "Built to serve premium fashion houses and elite design careers.",
            },
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: idx * 0.08, duration: 0.5, ease }}
            >
              <Card className="lux-glass lux-glow-hover rounded-2xl p-6 h-full">
                <item.icon className="mb-4 h-6 w-6 text-accent" />
                <h3 className="mb-3 text-xl font-black uppercase">{item.title}</h3>
                <p className="text-sm leading-relaxed text-white/65">{item.text}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="lux-glass gold-glow-hover rounded-3xl border border-accent/25 p-8 text-center sm:p-10"
        >
          <div className="mb-4 inline-flex rounded-full border border-accent/35 bg-accent/10 p-2 text-accent">
            <Sparkles size={18} />
          </div>
          <h2 className="mb-4 text-4xl font-black uppercase sm:text-5xl">Start Your Next Chapter</h2>
          <p className="mx-auto mb-8 max-w-2xl text-white/65">
            Join a premium platform engineered for modern fashion talent and high-performance hiring.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button className="rounded-full bg-accent px-8 text-black hover:bg-[#e0bb4a]">
                Join AURAX
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="rounded-full border-accent/35 text-accent hover:bg-accent/10">
                Contact Concierge
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
