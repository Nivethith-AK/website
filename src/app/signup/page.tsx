"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { post } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const expertiseLevels = ["Student", "Graduate", "Intern", "Professional"] as const;
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function SignUp() {
  const router = useRouter();
  const [role, setRole] = useState<"designer" | "company" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    experienceLevel: "Student",
    companyName: "",
    contactPerson: "",
    phone: "",
    address: "",
    industry: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = role === "designer" ? "/auth/register/designer" : "/auth/register/company";

      const payload =
        role === "designer"
          ? {
              email: formData.email,
              password: formData.password,
              firstName: formData.firstName,
              lastName: formData.lastName,
              experienceLevel: formData.experienceLevel,
            }
          : {
              email: formData.email,
              password: formData.password,
              companyName: formData.companyName,
              contactPerson: formData.contactPerson,
              phone: formData.phone,
              address: formData.address,
              industry: formData.industry,
            };

      const response = await post(endpoint, payload);

      if (response.success && response.token) {
        localStorage.removeItem("token");
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 1200);
      } else {
        setError(response.message || "Sign up failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 pb-14 pt-32 text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ x: [0, 34, -18, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[-12%] top-[-8%] h-[36rem] w-[36rem] rounded-full bg-accent-purple/24 blur-[130px]"
        />
        <motion.div
          animate={{ x: [0, -24, 18, 0], y: [0, 24, -14, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-15%] right-[-8%] h-[32rem] w-[32rem] rounded-full bg-accent/10 blur-[120px]"
        />
      </div>

      <div className="mx-auto w-full max-w-6xl">
        {!role ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="text-center"
          >
            <Badge variant="accent" className="mb-6">Identity Path</Badge>
            <h1 className="mb-6 text-5xl font-black uppercase tracking-tight sm:text-6xl md:text-7xl">
              Join <span className="text-accent-purple">AURAX</span>
            </h1>
            <p className="mx-auto mb-12 max-w-xl text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              Select your role to initialize access.
            </p>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
              {[
                {
                  title: "Designer",
                  description: "Elite creatives for luxury design deployments.",
                  value: "designer" as const,
                },
                {
                  title: "Company",
                  description: "Luxury houses seeking premium design execution.",
                  value: "company" as const,
                },
              ].map((option, idx) => (
                <motion.button
                  key={option.value}
                  onClick={() => setRole(option.value)}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.5, ease }}
                  whileHover={{ y: -5 }}
                  className="lux-glass lux-glow-hover rounded-2xl p-8 text-left"
                >
                  <h2 className="mb-4 text-2xl font-black uppercase tracking-tight">{option.title}</h2>
                  <p className="mb-7 text-sm text-white/65">{option.description}</p>
                  <span className="text-[10px] font-black uppercase tracking-[0.28em] text-accent">Continue</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="mx-auto max-w-2xl"
          >
            <button
              onClick={() => setRole(null)}
              className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/65 hover:text-accent"
            >
              ← Back
            </button>

            <Card className="lux-glass rounded-3xl p-8 sm:p-10">
              <div className="mb-8">
                <Badge variant="purple" className="mb-4">{role === "designer" ? "Designer Access" : "Company Access"}</Badge>
                <h2 className="text-3xl font-black uppercase">Apply as {role === "designer" ? "Designer" : "Company"}</h2>
              </div>

              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  {role === "designer" ? (
                    <>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field>
                          <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                          <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Name" />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                          <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Surname" />
                        </Field>
                      </div>
                      <Field>
                        <FieldLabel>Expertise Level</FieldLabel>
                        <Combobox
                          items={expertiseLevels}
                          value={formData.experienceLevel}
                          onValueChange={(val) => setFormData({ ...formData, experienceLevel: val })}
                        >
                          <ComboboxInput placeholder="Select Level" />
                          <ComboboxContent>
                            <ComboboxEmpty>No results found.</ComboboxEmpty>
                            <ComboboxList>
                              {(item) => (
                                <ComboboxItem key={item} value={item}>
                                  {item}
                                </ComboboxItem>
                              )}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                      </Field>
                    </>
                  ) : (
                    <>
                      <Field>
                        <FieldLabel htmlFor="companyName">Luxury House Name</FieldLabel>
                        <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} required placeholder="Maison" />
                      </Field>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field>
                          <FieldLabel htmlFor="contactPerson">Lead Contact</FieldLabel>
                          <Input id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required placeholder="Full Name" />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="industry">Sector</FieldLabel>
                          <Input id="industry" name="industry" value={formData.industry} onChange={handleChange} required placeholder="Haute Couture" />
                        </Field>
                      </div>
                    </>
                  )}

                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="email@agency.com" />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Input id="password" type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} placeholder="********" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                      <Input id="confirmPassword" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength={6} placeholder="********" />
                    </Field>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-red-300"
                    >
                      {error}
                    </motion.div>
                  )}

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-emerald-200"
                    >
                      Registration successful. Verify email, then wait for admin approval.
                    </motion.div>
                  )}

                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.995 }}>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      variant="secondary"
                      size="lg"
                      className="gold-glow-hover w-full rounded-full"
                    >
                      {isLoading ? "Initiating..." : "Submit Application"}
                    </Button>
                  </motion.div>

                  <p className="pt-1 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    Already a member?{" "}
                    <Link href="/login" className="text-accent hover:text-white">
                      Sign In
                    </Link>
                  </p>
                </FieldGroup>
              </form>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
