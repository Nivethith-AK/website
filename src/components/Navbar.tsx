"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Crown, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { title: "Home", href: "/" },
  { title: "Designers", href: "/designers" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

const networkComponents: { title: string; href: string; description: string }[] = [
  {
    title: "Elite Talents",
    href: "/designers",
    description: "Vetted professionals and AOD graduates ready for placement.",
  },
  {
    title: "About Mission",
    href: "/about",
    description: "The architectural vision behind the AURAX 2026 global ecosystem.",
  },
  {
    title: "Contact Hub",
    href: "/contact",
    description: "Direct line for partnerships, inquiries, and technical support.",
  },
];

const navEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setToken(localStorage.getItem("token"));
  }, []);

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.65, ease: navEase }}
      className="fixed w-full z-50 top-0 border-b border-white/10 bg-background/55 backdrop-blur-3xl"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ x: "-130%", opacity: 0 }}
          animate={{ x: "130%", opacity: [0, 1, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
          className="h-full w-48 bg-gradient-to-r from-transparent via-accent/35 to-transparent blur-sm"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-24">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.6, ease: navEase }}
              className="relative w-9 h-9 bg-accent flex items-center justify-center shadow-[0_0_18px_rgba(212,175,55,0.45)]"
            >
              <Crown size={16} className="text-black" />
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.15, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 border border-accent/50"
              />
            </motion.div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-[0.45em] text-white uppercase">
                AURA<span className="text-accent">X</span>
              </span>
              <Sparkles size={12} className="text-accent/60" />
            </div>
          </Link>

          <div className="hidden xl:flex items-center gap-7">
            {primaryLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-2 py-2 text-[10px] font-black uppercase tracking-[0.35em] transition-colors duration-300",
                    isActive ? "text-white" : "text-white/45 hover:text-white"
                  )}
                >
                  <span className="relative z-10">{link.title}</span>
                  <motion.span
                    className="absolute left-2 right-2 -bottom-[3px] h-[2px] bg-accent"
                    animate={{ opacity: isActive ? 1 : 0, scaleX: isActive ? 1 : 0.2 }}
                    transition={{ duration: 0.25, ease: navEase }}
                  />
                </Link>
              );
            })}

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Network</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <motion.ul
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.32, ease: navEase }}
                      className="grid w-[500px] gap-3 p-5 md:w-[620px] md:grid-cols-2 bg-[#0c0c18]"
                    >
                      {networkComponents.map((component, idx) => (
                        <ListItem key={component.title} title={component.title} href={component.href} delay={idx * 0.04}>
                          {component.description}
                        </ListItem>
                      ))}
                    </motion.ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {mounted && token ? (
              <>
                <Link
                  href="/designer/dashboard"
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 hover:text-white"
                >
                  Dashboard
                </Link>
                <motion.button
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/";
                  }}
                  className="px-6 py-3 rounded-full bg-accent text-black text-[9px] font-black uppercase tracking-[0.3em] shadow-[0_10px_24px_-14px_rgba(212,175,55,0.85)]"
                >
                  Sign Out
                </motion.button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45 hover:text-white"
                >
                  Sign In
                </Link>
                <motion.div whileHover={{ y: -1 }} whileTap={{ y: 0 }}>
                  <Link
                    href="/signup"
                    className="px-6 py-3 rounded-full border border-accent/35 text-accent hover:bg-accent/10 text-[9px] font-black uppercase tracking-[0.3em]"
                  >
                    Register
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen((prev) => !prev)}
              className="p-2 text-foreground"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.42, ease: navEase }}
            className="md:hidden bg-[#090914]/95 backdrop-blur-2xl border-t border-white/10 overflow-hidden"
          >
            <div className="px-6 py-8 space-y-4">
              {primaryLinks.map((link, idx) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.22 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-[0.4em] border",
                      pathname === link.href
                        ? "text-accent border-accent/45 bg-accent/10"
                        : "text-white/65 border-white/10"
                    )}
                  >
                    {link.title}
                  </Link>
                </motion.div>
              ))}

              <div className="pt-5 border-t border-white/10 space-y-3">
                {mounted && token ? (
                  <>
                    <Link
                      href="/designer/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block text-[10px] font-black uppercase tracking-[0.35em] text-white"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        setIsOpen(false);
                        window.location.href = "/";
                      }}
                      className="w-full py-4 rounded-xl bg-accent text-black text-[10px] font-black uppercase tracking-[0.35em]"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="block text-[10px] font-black uppercase tracking-[0.35em] text-white/65"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsOpen(false)}
                      className="block w-full py-4 rounded-xl border border-accent/35 text-center text-accent text-[10px] font-black uppercase tracking-[0.35em]"
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

function ListItem({
  title,
  children,
  href,
  delay,
}: {
  href: string;
  title: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.li initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.22 }}>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="block select-none space-y-1 rounded-xl p-4 leading-none no-underline outline-none border border-white/5 hover:border-accent/40 hover:bg-accent/10 transition-all duration-300"
        >
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-white">{title}</div>
          <p className="line-clamp-2 text-[9px] leading-snug text-white/45 uppercase tracking-[0.05em]">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </motion.li>
  );
}
