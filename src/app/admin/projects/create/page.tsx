"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { get, post } from "@/lib/api";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/Card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

interface CompanyItem {
  _id: string;
  companyName?: string;
  name?: string;
  email: string;
}

interface DesignerItem {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
}

export default function AdminCreateProjectPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [designers, setDesigners] = useState<DesignerItem[]>([]);
  const [selectedDesigners, setSelectedDesigners] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    companyId: "",
    projectTitle: "",
    description: "",
    budget: "",
    autoCreateChat: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      const [companiesRes, designersRes] = await Promise.all([
        get<any>("/admin/users?role=company&approval=approved&limit=400"),
        get<any>("/admin/users?role=designer&approval=approved&limit=400"),
      ]);

      if (companiesRes.success) {
        const list = Array.isArray(companiesRes.data) ? companiesRes.data : companiesRes.data?.data || [];
        setCompanies(list);
      }

      if (designersRes.success) {
        const list = Array.isArray(designersRes.data) ? designersRes.data : designersRes.data?.data || [];
        setDesigners(list);
      }
    };

    fetchData();
  }, []);

  const selectedCompany = useMemo(
    () => companies.find((company) => company._id === form.companyId) || null,
    [companies, form.companyId]
  );

  const toggleDesigner = (id: string) => {
    setSelectedDesigners((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.companyId || !form.projectTitle.trim() || selectedDesigners.length === 0) {
      return;
    }

    setIsSubmitting(true);
    const response = await post("/admin/projects/assign", {
      companyId: form.companyId,
      projectTitle: form.projectTitle.trim(),
      description: form.description.trim(),
      budget: form.budget ? Number(form.budget) : undefined,
      designerIds: selectedDesigners,
      autoCreateChat: form.autoCreateChat,
    });
    setIsSubmitting(false);

    if (response.success) {
      router.push("/admin/projects");
    }
  };

  return (
    <AdminShell title="Create Project" subtitle="Admin can directly create and assign projects with controlled team chat.">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Card className="lux-glass rounded-2xl p-6">
            <form onSubmit={createProject}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="projectTitle">Project Title</FieldLabel>
                  <Input
                    id="projectTitle"
                    value={form.projectTitle}
                    onChange={(e) => setForm((prev) => ({ ...prev, projectTitle: e.target.value }))}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="projectDescription">Description</FieldLabel>
                  <Textarea
                    id="projectDescription"
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="min-h-[120px]"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="projectBudget">Budget</FieldLabel>
                  <Input
                    id="projectBudget"
                    type="number"
                    value={form.budget}
                    onChange={(e) => setForm((prev) => ({ ...prev, budget: e.target.value }))}
                  />
                </Field>

                <Field>
                  <FieldLabel>Company</FieldLabel>
                  <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    {companies.map((company) => {
                      const label = company.companyName || company.name || company.email;
                      return (
                        <button
                          key={company._id}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, companyId: company._id }))}
                          className={`rounded-lg border px-3 py-2 text-left text-sm ${
                            form.companyId === company._id
                              ? "border-accent/35 bg-accent/10"
                              : "border-white/10 bg-white/[0.03] hover:border-white/20"
                          }`}
                        >
                          <p className="font-semibold uppercase">{label}</p>
                          <p className="text-xs text-white/60">{company.email}</p>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <label className="flex items-center gap-2 text-sm text-white/75">
                  <input
                    type="checkbox"
                    checked={form.autoCreateChat}
                    onChange={(e) => setForm((prev) => ({ ...prev, autoCreateChat: e.target.checked }))}
                  />
                  Auto-create project team chat
                </label>

                <Button type="submit" variant="secondary" isLoading={isSubmitting} disabled={!form.companyId || selectedDesigners.length === 0}>
                  Create and Assign
                </Button>
              </FieldGroup>
            </form>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.06 }}>
          <Card className="lux-glass rounded-2xl p-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xl font-black uppercase">Assign Designers</p>
              <Badge variant="accent">{selectedDesigners.length} Selected</Badge>
            </div>

            <div className="space-y-2 max-h-[560px] overflow-y-auto">
              {designers.map((designer) => {
                const fullName = `${designer.firstName || ""} ${designer.lastName || ""}`.trim() || designer.name || designer.email;
                return (
                  <button
                    key={designer._id}
                    type="button"
                    onClick={() => toggleDesigner(designer._id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left ${
                      selectedDesigners.includes(designer._id)
                        ? "border-accent/35 bg-accent/10"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20"
                    }`}
                  >
                    <p className="font-semibold uppercase">{fullName}</p>
                    <p className="text-xs text-white/60">{designer.email}</p>
                  </button>
                );
              })}
            </div>

            {selectedCompany ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-white/70">
                Company selected: <span className="font-semibold text-white">{selectedCompany.companyName || selectedCompany.name || selectedCompany.email}</span>
              </div>
            ) : null}
          </Card>
        </motion.div>
      </div>
    </AdminShell>
  );
}
