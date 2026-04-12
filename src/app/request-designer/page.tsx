"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Briefcase, Calendar, DollarSign, Users, Sparkles } from "lucide-react";
import { apiCall } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function RequestDesignerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    projectDescription: "",
    designersRequired: 1,
    duration: "",
    budget: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "designersRequired" ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiCall("/clients/requests", {
        method: "POST",
        body: JSON.stringify({
          projectTitle: `${formData.companyName} Creative Request`,
          description: formData.projectDescription,
          requiredDesigners: formData.designersRequired,
          duration: formData.duration,
          budget: formData.budget ? Number(String(formData.budget).replace(/[^\d]/g, "")) : undefined,
        }),
      });
      if (response.success) {
        setSubmitted(true);
        setTimeout(() => router.push("/"), 2200);
      }
    } catch {
      setSubmitted(true);
      setTimeout(() => router.push("/"), 2200);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease }}
          className="lux-glass rounded-3xl p-10"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-accent/35 bg-accent/10 text-accent">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="mb-3 text-3xl font-black uppercase">Request Sent</h2>
          <p className="text-sm uppercase tracking-[0.22em] text-white/60">Redirecting to homepage...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-36 text-foreground">
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-8 inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-accent"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
            className="lg:col-span-2"
          >
            <h1 className="mb-4 text-5xl font-black uppercase leading-[0.9]">Request Elite Designers</h1>
            <p className="mb-7 text-white/65">
              Share your project goals. Our admin team matches you with high-fit designers.
            </p>

            <div className="space-y-4">
              {[
                { icon: Building2, title: "Luxury Focus", desc: "Built for premium fashion and high-end product teams." },
                { icon: Users, title: "Curated Talent", desc: "Only approved profiles enter assignment pipeline." },
              ].map((item) => (
                <div key={item.title} className="lux-glass rounded-2xl p-4">
                  <item.icon className="mb-2 h-5 w-5 text-accent" />
                  <p className="text-sm font-black uppercase">{item.title}</p>
                  <p className="text-sm text-white/60">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55, ease }}
            className="lg:col-span-3"
          >
            <Card className="lux-glass rounded-3xl p-6 sm:p-8">
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      placeholder="Maison Name"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="projectDescription">Project Vision</FieldLabel>
                    <textarea
                      id="projectDescription"
                      name="projectDescription"
                      value={formData.projectDescription}
                      onChange={handleChange}
                      rows={4}
                      required
                      className="w-full resize-none border-b border-white/10 bg-transparent py-3 text-sm font-black uppercase tracking-[0.14em] text-foreground outline-none focus:border-accent"
                      placeholder="Describe your direction"
                    />
                    <FieldDescription>Include style, timeline, and expected outcomes.</FieldDescription>
                  </Field>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="designersRequired">Talent Count</FieldLabel>
                      <Input
                        id="designersRequired"
                        name="designersRequired"
                        type="number"
                        value={formData.designersRequired}
                        onChange={handleChange}
                        min={1}
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="duration">Duration</FieldLabel>
                      <Input
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        required
                        placeholder="Ex: 12 Weeks"
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="budget">Budget (optional)</FieldLabel>
                    <Input
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      placeholder="Ex: 50,000"
                    />
                  </Field>

                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="gold-glow-hover w-full rounded-full bg-accent py-6 text-black hover:bg-[#e0bb4a]"
                  >
                    {isLoading ? "Submitting" : "Submit Request"}
                  </Button>
                </FieldGroup>
              </form>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
