"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Crown, Sparkles } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { title: "Home", href: "/" },
  { title: "Designers", href: "/designers" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const token = useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") return () => {};
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    () => (typeof window === "undefined" ? null : localStorage.getItem("token")),
    () => null
  );

  useEffect(() => {
    navLinks.forEach((link) => router.prefetch(link.href));
    router.prefetch("/login");
    router.prefetch("/signup");
    router.prefetch("/designer/dashboard");
    router.prefetch("/client/dashboard");
    router.prefetch("/admin/dashboard");
  }, [router]);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease }}
      className="fixed left-1/2 top-4 z-50 w-[min(1280px,calc(100%-1.5rem))] -translate-x-1/2 rounded-2xl border border-white/15 bg-background/80 backdrop-blur-2xl shadow-[0_20px_48px_-28px_rgba(0,0,0,0.9)]"
    >
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.3, ease }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-accent shadow-[0_0_22px_rgba(212,175,55,0.45)]"
          >
            <Crown size={16} className="text-black" />
          </motion.div>
          <span className="text-lg font-black uppercase tracking-[0.34em] text-white sm:text-xl">
            AURA<span className="text-accent">X</span>
          </span>
          <Sparkles size={12} className="hidden text-accent/70 sm:block" />
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-2 py-2 text-[10px] font-black uppercase tracking-[0.28em] transition-colors duration-300",
                  active ? "text-white" : "text-white/45 hover:text-white"
                )}
              >
                <motion.span whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }} className="block">
                  {link.title}
                </motion.span>
                <motion.span
                  className="absolute -bottom-[3px] left-2 right-2 h-[2px] bg-accent"
                  animate={{ opacity: active ? 1 : 0, scaleX: active ? 1 : 0.2 }}
                  transition={{ duration: 0.25, ease }}
                />
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {token ? (
            <>
              <Link href="/designer/dashboard" className="text-[10px] font-black uppercase tracking-[0.28em] text-white/70 hover:text-white transition-colors">
                Dashboard
              </Link>
              <motion.button
                whileHover={{ y: -1, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/";
                }}
                className="rounded-full bg-accent px-5 py-2.5 text-[9px] font-black uppercase tracking-[0.28em] text-black"
              >
                Sign Out
              </motion.button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.28em] text-white/45 hover:text-white transition-colors">
                Sign In
              </Link>
              <motion.div whileHover={{ y: -1 }} whileTap={{ y: 0 }}>
                <Link
                  href="/signup"
                  className="rounded-full border border-accent/35 px-5 py-2.5 text-[9px] font-black uppercase tracking-[0.28em] text-accent hover:bg-accent/10"
                >
                  Register
                </Link>
              </motion.div>
            </>
          )}
        </div>

        <div className="md:hidden">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsOpen((v) => !v)} className="p-2 text-foreground">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease }}
            className="border-t border-white/10 bg-[#141128]/95 md:hidden"
          >
            <div className="space-y-3 px-5 py-6">
              {navLinks.map((link, idx) => (
                <motion.div key={link.href} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block rounded-xl border px-4 py-3 text-[10px] font-black uppercase tracking-[0.34em] transition-all",
                      pathname === link.href ? "border-accent/45 bg-accent/10 text-accent" : "border-white/10 text-white/65"
                    )}
                  >
                    {link.title}
                  </Link>
                </motion.div>
              ))}

              <div className="space-y-3 border-t border-white/10 pt-4">
                {token ? (
                  <>
                    <Link href="/designer/dashboard" onClick={() => setIsOpen(false)} className="block text-[10px] font-black uppercase tracking-[0.3em] text-white">
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        setIsOpen(false);
                        window.location.href = "/";
                      }}
                      className="w-full rounded-xl bg-accent py-3 text-[10px] font-black uppercase tracking-[0.3em] text-black"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsOpen(false)} className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/65">
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsOpen(false)}
                      className="block w-full rounded-xl border border-accent/35 py-3 text-center text-[10px] font-black uppercase tracking-[0.3em] text-accent"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
