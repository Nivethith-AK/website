"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { post } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    if (password.length < 5) {
      setError("Password must be at least 5 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await post("/auth/login", { email, password });

      if (response.success && response.token && response.user) {
        localStorage.setItem("token", response.token);
        const role = response.user.role;
        if (role === "admin") router.push("/admin/dashboard");
        else if (role === "designer") router.push("/designer/dashboard");
        else if (role === "company") router.push("/client/dashboard");
        else router.push("/");
      } else {
        setError(response.message || "Invalid email or password");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 pt-28 text-foreground">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[55vw] h-[55vw] bg-accent-purple/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[45vw] h-[45vw] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl"
      >
        <Card
          variant="premium"
          className="p-7 sm:p-10 md:p-14 border-white/5 bg-[#161626] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-none relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[3px] bg-accent" />

          <div className="text-center mb-10 sm:mb-12">
            <Link href="/" className="inline-block mb-8">
              <div className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[0.35em] text-foreground uppercase">
                AURA<span className="text-accent">X</span>
              </div>
            </Link>
            <h1 className="text-[10px] uppercase tracking-[0.55em] text-muted-foreground">Sign In</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="login-email">Email</FieldLabel>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.com"
                  disabled={isLoading}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="login-password">Password</FieldLabel>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  disabled={isLoading}
                  required
                />
                <FieldDescription>Minimum 5 characters</FieldDescription>
              </Field>

              {error && (
                <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-red-300">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                variant="primary"
                size="lg"
                className="w-full bg-accent text-black hover:bg-accent-purple hover:text-white border-none rounded-none text-[9px] tracking-[0.45em] font-bold uppercase py-5"
              >
                {isLoading ? "Validating..." : "Enter Portal"}
              </Button>

              <p className="text-center text-[10px] uppercase tracking-[0.35em] text-muted-foreground pt-2">
                No account? <Link href="/signup" className="text-accent hover:text-white">Register</Link>
              </p>
            </FieldGroup>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
