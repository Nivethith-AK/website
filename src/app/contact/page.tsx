"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, CheckCircle, AlertCircle, Send, Clock, Globe } from "lucide-react";
import { post } from "@/lib/api";
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Contact() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    accountType: "Designer", // Default to Designer
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const response = await post("/contact", formData);
      if (response.success) {
        setSuccess(true);
        setFormData({ name: "", email: "", accountType: "Designer", subject: "", message: "" });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        throw new Error(response.message || "Failed to send message");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-48 pb-32 relative border-b border-border/40 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <span className="text-accent-purple font-black tracking-[0.5em] uppercase text-[10px] mb-8 block">Concierge</span>
              <h1 className="text-7xl md:text-[100px] font-black mb-8 tracking-tighter text-foreground uppercase leading-[0.9]">
                Connect <br/>With <span className="text-accent-purple">AURAX</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-black uppercase leading-relaxed">
                Elite support for Designers, Universities, and Luxury Partners.
              </p>
            </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-32 relative bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/20 border border-border/40 mb-48 shadow-sm">
            {[
              {
                title: "Correspondence",
                value: "concierge@aura.com",
                desc: "Priority response within 12 hours",
              },
              {
                title: "Operating Hours",
                value: "09:00 — 18:00 EST",
                desc: "Monday through Friday",
              },
              {
                title: "Headquarters",
                value: "Fifth Avenue, NYC",
                desc: "Global Operations",
              },
            ].map((contact, idx) => (
              <div
                key={idx}
                className="bg-white p-12 text-center group hover:bg-background transition-colors duration-1000"
              >
                <h3 className="text-[10px] font-bold mb-6 text-muted-foreground uppercase tracking-[0.3em] group-hover:text-accent-purple transition-colors duration-1000">{contact.title}</h3>
                <p className="text-xl font-bold mb-2 text-foreground uppercase tracking-tight group-hover:text-accent transition-colors duration-1000">{contact.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors duration-1000">{contact.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-32 items-start">
            {/* Info Column */}
            <div className="lg:col-span-2 space-y-16">
              <div>
                <h2 className="text-5xl font-bold text-foreground mb-8 tracking-tighter uppercase leading-[0.9]">Begin the <br /><span className="text-accent-purple font-serif italic">Conversation</span></h2>
                <p className="text-muted-foreground leading-relaxed font-serif font-light italic">
                  Whether you are an established brand seeking elite talent or a visionary designer looking to elevate your career, our consultants are here to guide your transition into the collective.
                </p>
              </div>

              <div className="space-y-12">
                <div className="space-y-4">
                  <h4 className="text-foreground font-bold text-[10px] uppercase tracking-[0.3em]">Elite Curation</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-light">Access to pre-vetted, top-tier global fashion designers through a secure administrative bridge.</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-foreground font-bold text-[10px] uppercase tracking-[0.3em]">Secure Collaboration</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-light">Premium security standards for your projects and intellectual property, managed by Aura.</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 p-8 border border-accent/20 bg-accent/5"
                  >
                    <p className="text-accent font-bold text-xs uppercase tracking-[0.3em]">Transmission Received</p>
                    <p className="text-muted-foreground text-[10px] mt-2 uppercase tracking-widest">Our concierge will contact you shortly.</p>
                  </motion.div>
                )}

                {error && (
                  <div className="mb-12 p-8 border border-red-500/20 bg-red-500/5">
                    <p className="text-red-500 text-xs font-bold uppercase tracking-[0.3em]">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <FieldGroup>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <Field>
                        <FieldLabel htmlFor="contact-name">Full Name</FieldLabel>
                        <Input
                          id="contact-name"
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                          placeholder="NAME"
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="contact-email">Email Address</FieldLabel>
                        <Input
                          id="contact-email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                          placeholder="EMAIL@AURAX.COM"
                        />
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="contact-type">Account / Inquiry Type</FieldLabel>
                      <Select
                        value={formData.accountType}
                        onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="contact-type">
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Designer">Designer</SelectItem>
                          <SelectItem value="Luxury Company / Maison">Luxury Company / Maison</SelectItem>
                          <SelectItem value="AOD / University Partner">AOD / University Partner</SelectItem>
                          <SelectItem value="Other Inquiry">Other Inquiry</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldDescription>Choose the profile closest to your request.</FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="contact-subject">Inquiry Subject</FieldLabel>
                      <Input
                        id="contact-subject"
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        placeholder="SUBJECT"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="contact-message">Message</FieldLabel>
                      <textarea
                        id="contact-message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        rows={4}
                        className="w-full bg-transparent border-b border-white/10 py-4 outline-none focus:border-accent-purple transition-all duration-1000 text-foreground text-sm uppercase tracking-widest font-black resize-none leading-relaxed placeholder:text-muted-foreground/30"
                        placeholder="MESSAGE..."
                      />
                    </Field>

                    <Field orientation="horizontal" className="justify-end pt-2">
                      <Button type="button" variant="outline" onClick={() => setFormData({ name: "", email: "", accountType: "Designer", subject: "", message: "" })}>
                        Reset
                      </Button>
                      <Button type="submit" variant="primary" isLoading={isLoading}>
                        {isLoading ? "Transmitting..." : "Send Inquiry"}
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
