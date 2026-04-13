"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, ClipboardList, Briefcase, Building2, Mail, ClipboardPen } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  rightSlot?: React.ReactNode;
}

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Designers", href: "/admin/designers", icon: Users },
  { label: "Companies", href: "/admin/companies", icon: Building2 },
  { label: "Requests", href: "/admin/requests", icon: ClipboardList },
  { label: "Projects (Admin)", href: "/admin/projects", icon: Briefcase },
  { label: "Vacancies", href: "/admin/vacancies", icon: ClipboardPen },
  { label: "Messages", href: "/admin/messages", icon: Mail },
];

export function AdminShell({ title, subtitle, children, rightSlot }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background pb-12 pt-28 text-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-7 px-4 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <motion.aside
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="lux-glass h-fit rounded-2xl p-4"
        >
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-accent">Mission Control</p>
          <div className="space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-3 text-left text-[10px] font-black uppercase tracking-[0.24em] transition-all",
                    active
                      ? "border border-accent/30 bg-accent/15 text-accent"
                      : "text-white/65 hover:bg-white/[0.05] hover:text-white"
                  )}
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </motion.aside>

        <main>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">{title}</h1>
              {subtitle ? <p className="mt-2 text-sm text-white/60">{subtitle}</p> : null}
            </div>
            {rightSlot}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
