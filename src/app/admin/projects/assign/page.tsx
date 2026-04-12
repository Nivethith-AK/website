"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { get, post } from "@/lib/api";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Designer {
  _id: string;
  firstName: string;
  lastName: string;
  experienceLevel: string;
  skills: string[];
}

interface RequestItem {
  _id: string;
  projectTitle: string;
  requiredDesigners: number;
  company: { companyName: string };
}

function AssignContent() {
  const params = useSearchParams();
  const router = useRouter();
  const requestId = params.get("requestId");

  const [request, setRequest] = useState<RequestItem | null>(null);
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [selected, setSelected] = useState<Designer[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [reqRes, desRes] = await Promise.all([get<any>("/admin/requests"), get<Designer[]>("/designers/list?limit=100")]);

      if (reqRes.success && reqRes.data && requestId) {
        const target = reqRes.data.find((r: any) => r._id === requestId) || null;
        setRequest(target);
      }
      if (desRes.success && desRes.data) setDesigners(desRes.data);
    };
    fetchData();
  }, [requestId]);

  const available = useMemo(() => {
    return designers.filter((d) => {
      if (selected.find((s) => s._id === d._id)) return false;
      const q = query.toLowerCase();
      return `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) || d.skills.some((s) => s.toLowerCase().includes(q));
    });
  }, [designers, selected, query]);

  const toggle = (designer: Designer) => {
    setSelected((prev) => (prev.find((d) => d._id === designer._id) ? prev.filter((d) => d._id !== designer._id) : [...prev, designer]));
  };

  const submit = async () => {
    if (!requestId || selected.length === 0) return;
    setIsSubmitting(true);
    const response = await post("/admin/projects/assign", {
      requestId,
      designerIds: selected.map((d) => d._id),
    });
    setIsSubmitting(false);
    if (response.success) {
      setOpen(false);
      router.push("/admin/projects");
    }
  };

  return (
    <AdminShell
      title="Assign Designers"
      subtitle={request ? `${request.projectTitle} - ${request.company.companyName}` : "Create project assignment"}
      rightSlot={<Badge variant="accent">{selected.length} Selected</Badge>}
    >
      <div className="mb-5 max-w-md">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search designers" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lux-glass rounded-2xl p-5 lg:col-span-2">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-accent">Available Designers</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {available.map((d) => (
              <motion.button
                key={d._id}
                whileHover={{ y: -3 }}
                onClick={() => toggle(d)}
                className="rounded-xl border border-white/12 bg-white/[0.03] p-4 text-left hover:border-accent/35"
              >
                <p className="font-black uppercase">
                  {d.firstName} {d.lastName}
                </p>
                <p className="text-xs text-white/55">{d.experienceLevel}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {d.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </Card>

        <Card className="lux-glass rounded-2xl p-5">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-accent">Selected Squad</p>
          <div className="space-y-2">
            {selected.length === 0 ? (
              <p className="text-sm text-white/55">No designers selected.</p>
            ) : (
              selected.map((d) => (
                <div key={d._id} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                  <span className="text-sm font-semibold">
                    {d.firstName} {d.lastName}
                  </span>
                  <button className="text-xs text-accent" onClick={() => toggle(d)}>
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>

          <Button className="mt-5 w-full" variant="secondary" onClick={() => setOpen(true)} disabled={!selected.length}>
            Confirm Assignment
          </Button>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Designers</DialogTitle>
            <DialogDescription>
              Confirm assignment for {selected.length} designer(s) to this request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button variant="secondary" className="w-full" isLoading={isSubmitting} onClick={submit}>
              Confirm
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

export default function AssignDesignersPage() {
  return (
    <Suspense fallback={<div className="p-10 text-white/60">Loading assignment...</div>}>
      <AssignContent />
    </Suspense>
  );
}
