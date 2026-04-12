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
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const expertiseLevels = ["Student", "AOD Graduate", "Intern", "Professional"] as const;

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
      let endpoint = role === "designer" ? "/auth/register/designer" : "/auth/register/company";
      
      const payload = role === "designer" 
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
        localStorage.setItem("token", response.token);
        setSuccess(true);
        setTimeout(() => {
          router.push(role === "designer" ? "/designer/dashboard" : "/client/dashboard");
        }, 1500);
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16 pt-24 text-foreground">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-6xl">
        {!role ? (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter text-foreground uppercase">
              JOIN <span className="text-accent-purple">AURAX</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.6em] text-muted-foreground mb-20 max-w-xl mx-auto font-black">
              Select your path within the ecosystem
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-5xl mx-auto">
              {[
                { title: "DESIGNER", description: "Elite creative talent seeking global luxury placements and AOD graduates.", value: "designer" as const },
                { title: "COMPANY", description: "Luxury houses and brands seeking world-class designers for high-impact projects.", value: "company" as const },
              ].map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => setRole(option.value)}
                  whileHover={{ y: -15 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="p-16 border border-white/5 bg-card shadow-2xl transition-all duration-1000 group relative overflow-hidden text-left"
                >
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-accent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                  <h2 className="text-3xl font-black tracking-[0.2em] mb-6 text-foreground">{option.title}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-12 group-hover:text-foreground transition-colors duration-1000 uppercase font-black">{option.description}</p>
                  <div className="inline-flex items-center text-[10px] tracking-[0.5em] font-black text-accent uppercase">Register Now →</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl mx-auto"
          >
            <button
              onClick={() => setRole(null)}
              className="mb-12 text-[10px] uppercase tracking-[0.4em] text-muted-foreground hover:text-accent transition-all duration-700 flex items-center gap-3 font-bold"
            >
              ← Back to Selection
            </button>

            <Card variant="premium" className="p-12 md:p-16 border-white/5 bg-[#161626] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] rounded-none relative">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-accent" />
              
              <h2 className="text-4xl font-black tracking-tight mb-4 text-foreground uppercase">
                Apply as <span className="text-accent-purple">{role === "designer" ? "Designer" : "Company"}</span>
              </h2>
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-16 font-black">Registration Portfolio</p>

              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  {role === "designer" ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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
                        <Combobox items={expertiseLevels} value={formData.experienceLevel} onValueChange={(val) => setFormData({ ...formData, experienceLevel: val })}>
                          <ComboboxInput placeholder="Select Level" />
                          <ComboboxContent>
                            <ComboboxEmpty>No results found.</ComboboxEmpty>
                            <ComboboxList>{(item) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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
                    <FieldLabel htmlFor="email">Digital Interface</FieldLabel>
                    <Input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="email@agency.com" />
                  </Field>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <Field>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Input id="password" type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} placeholder="••••••••" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="confirmPassword">Verification</FieldLabel>
                      <Input id="confirmPassword" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required minLength={6} placeholder="••••••••" />
                    </Field>
                  </div>

                  <div className="pt-8">
                    <Button type="submit" disabled={isLoading} variant="primary" size="lg" className="w-full bg-accent text-black hover:bg-accent-purple hover:text-white border-none rounded-none text-[9px] tracking-[0.5em] font-bold uppercase py-6 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-[0_0_50px_rgba(212,175,55,0.2)]">
                      {isLoading ? "INITIATING..." : "SUBMIT APPLICATION"}
                    </Button>
                  </div>

                  <p className="text-center text-[10px] uppercase tracking-[0.4em] text-muted-foreground pt-6 font-bold">
                    Already a member?{" "}
                    <Link href="/login" className="text-foreground hover:text-accent transition-all duration-700">Sign In</Link>
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
