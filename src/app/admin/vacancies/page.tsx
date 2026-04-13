"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { del, get, post, put } from "@/lib/api";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Vacancy {
  _id: string;
  title: string;
  description: string;
  location: string;
  employmentType: string;
  compensation?: string;
  skills?: string[];
  status: "Draft" | "Published" | "Closed";
}

const statuses = ["Draft", "Published", "Closed"] as const;
const types = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"] as const;

export default function AdminVacanciesPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "Remote",
    employmentType: "Contract",
    compensation: "",
    skills: "",
    status: "Draft",
  });

  const fetchVacancies = async () => {
    const response = await get<Vacancy[]>("/jobs/admin");
    if (response.success && response.data) {
      setVacancies(response.data);
    }
  };

  useEffect(() => {
    fetchVacancies();
  }, []);

  const publishedCount = useMemo(() => vacancies.filter((item) => item.status === "Published").length, [vacancies]);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      location: "Remote",
      employmentType: "Contract",
      compensation: "",
      skills: "",
      status: "Draft",
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...form,
      skills: form.skills,
    };

    const response = editingId ? await put(`/jobs/admin/${editingId}`, payload) : await post("/jobs/admin", payload);

    if (response.success) {
      await fetchVacancies();
      resetForm();
    }

    setIsSubmitting(false);
  };

  const editVacancy = (vacancy: Vacancy) => {
    setEditingId(vacancy._id);
    setForm({
      title: vacancy.title,
      description: vacancy.description,
      location: vacancy.location || "Remote",
      employmentType: vacancy.employmentType || "Contract",
      compensation: vacancy.compensation || "",
      skills: (vacancy.skills || []).join(", "),
      status: vacancy.status,
    });
  };

  const removeVacancy = async (id: string) => {
    const confirmed = window.confirm("Delete this vacancy?");
    if (!confirmed) {
      return;
    }

    const response = await del(`/jobs/admin/${id}`);
    if (response.success) {
      await fetchVacancies();
      if (editingId === id) {
        resetForm();
      }
    }
  };

  return (
    <AdminShell
      title="Vacancy Control"
      subtitle="Create and manage public vacancies. The site does not show any default examples."
      rightSlot={<Badge variant="accent">{publishedCount} Published</Badge>}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Card className="lux-glass rounded-2xl p-6">
            <p className="mb-4 text-2xl font-black uppercase tracking-tight">{editingId ? "Edit Vacancy" : "Create Vacancy"}</p>

            <form onSubmit={submit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="vacancyTitle">Title</FieldLabel>
                  <Input
                    id="vacancyTitle"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="vacancyDescription">Description</FieldLabel>
                  <Textarea
                    id="vacancyDescription"
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="min-h-[120px]"
                    required
                  />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="vacancyLocation">Location</FieldLabel>
                    <Input
                      id="vacancyLocation"
                      value={form.location}
                      onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="vacancyCompensation">Compensation</FieldLabel>
                    <Input
                      id="vacancyCompensation"
                      value={form.compensation}
                      onChange={(e) => setForm((prev) => ({ ...prev, compensation: e.target.value }))}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Employment Type</FieldLabel>
                    <Select
                      value={form.employmentType}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, employmentType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {types.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel>Status</FieldLabel>
                    <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="vacancySkills">Skills (comma-separated)</FieldLabel>
                  <Input
                    id="vacancySkills"
                    value={form.skills}
                    onChange={(e) => setForm((prev) => ({ ...prev, skills: e.target.value }))}
                    placeholder="Fashion Design, CAD, Textile"
                  />
                </Field>

                <div className="flex gap-2">
                  <Button variant="secondary" type="submit" isLoading={isSubmitting}>
                    {editingId ? "Update Vacancy" : "Create Vacancy"}
                  </Button>
                  {editingId ? (
                    <Button variant="outline" type="button" onClick={resetForm}>
                      Cancel Edit
                    </Button>
                  ) : null}
                </div>
              </FieldGroup>
            </form>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
          <Card className="lux-glass rounded-2xl p-6">
            <p className="mb-4 text-2xl font-black uppercase tracking-tight">Published Queue</p>
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {vacancies.length === 0 ? (
                <p className="text-sm text-white/60">No vacancies created yet.</p>
              ) : (
                vacancies.map((vacancy) => (
                  <div key={vacancy._id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="font-black uppercase">{vacancy.title}</p>
                      <Badge variant={vacancy.status === "Published" ? "success" : vacancy.status === "Draft" ? "warning" : "default"}>
                        {vacancy.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-white/65">{vacancy.description.slice(0, 120)}...</p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => editVacancy(vacancy)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => removeVacancy(vacancy._id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </AdminShell>
  );
}
