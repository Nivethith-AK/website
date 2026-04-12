"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Mail, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-background/85">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2 text-white">
            <Sparkles size={14} className="text-accent" />
            <span className="text-lg font-black uppercase tracking-[0.3em]">
              AURA<span className="text-accent">X</span>
            </span>
          </div>
          <p className="max-w-md text-sm text-white/60">
            Royal luxury talent platform connecting designers, companies, and admin operations in one premium ecosystem.
          </p>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-accent">Platform</p>
          <div className="space-y-2 text-sm text-white/65">
            <Link href="/" className="block hover:text-white">Home</Link>
            <Link href="/designers" className="block hover:text-white">Designers</Link>
            <Link href="/about" className="block hover:text-white">About</Link>
            <Link href="/contact" className="block hover:text-white">Contact</Link>
          </div>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-accent">Connect</p>
          <div className="space-y-2 text-sm text-white/65">
            <a href="mailto:concierge@aura.com" className="flex items-center gap-2 hover:text-white">
              <Mail size={13} /> concierge@aura.com
            </a>
            <div className="flex items-center gap-2">
              <Globe size={13} /> Global Luxury Network
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-[10px] uppercase tracking-[0.22em] text-white/45 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} AURAX. All rights reserved.
      </div>
    </footer>
  );
}
