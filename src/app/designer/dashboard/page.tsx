"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { get, put } from "@/lib/api";
import { Card } from "@/components/Card";
import { InboxPanel } from "@/components/messaging/InboxPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PortfolioItem {
  _id?: string;
  image: string;
  title: string;
  description: string;
}

interface Project {
  _id: string;
  projectTitle: string;
  status: string;
  createdAt: string;
  company: {
    companyName: string;
  };
}

interface DesignerProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  experienceLevel: string;
  skills: string[];
  profileImage?: string;
  portfolio: PortfolioItem[];
  bio?: string;
  availability: string;
  isApproved: boolean;
  assignedProjects: Project[];
}

const allSkills = [
  "Fashion Design",
  "Textile Design",
  "Digital Design",
  "Pattern Making",
  "Garment Construction",
  "CAD",
  "Illustration",
  "Color Theory",
];

export default function DesignerDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<DesignerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inboxUnread, setInboxUnread] = useState(0);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    skills: [] as string[],
    experienceLevel: "Student",
    bio: "",
    availability: "Available",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const [response, unreadResponse] = await Promise.all([
        get<DesignerProfile>("/designers/profile/me"),
        get<{ unread: number }>("/messages/unread-count"),
      ]);

      if (response.success && response.data) {
        setProfile(response.data);
        setForm({
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          skills: response.data.skills || [],
          experienceLevel: response.data.experienceLevel || "Student",
          bio: response.data.bio || "",
          availability: response.data.availability || "Available",
        });
      } else {
        router.push("/login");
      }

      if (unreadResponse.success && unreadResponse.data) {
        setInboxUnread(unreadResponse.data.unread || 0);
      }

      setIsLoading(false);
    };

    fetchProfile();

    const interval = window.setInterval(async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      const unreadResponse = await get<{ unread: number }>("/messages/unread-count");
      if (unreadResponse.success && unreadResponse.data) {
        setInboxUnread(unreadResponse.data.unread || 0);
      }
    }, 10000);

    return () => window.clearInterval(interval);
  }, [router]);

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
    }));
  };

  const saveProfile = async () => {
    setIsSaving(true);
    const response = await put<DesignerProfile>("/designers/profile/me", form);
    if (response.success && response.data) {
      setProfile(response.data);
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const activeCount = useMemo(() => profile?.assignedProjects?.filter((p) => p.status !== "Completed").length || 0, [profile]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="lux-glass animate-pulse rounded-2xl px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/65">
          Loading Designer Workspace
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-white/60">
        Profile unavailable.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12 pt-28 text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">Designer Dashboard</h1>
            <p className="mt-2 text-sm text-white/60">Manage profile, showcase portfolio, and track active projects.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={profile.isApproved ? "success" : "warning"}>{profile.isApproved ? "Approved" : "Pending"}</Badge>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem("token");
                router.push("/");
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="lux-glass rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/60">Experience</p>
            <p className="mt-2 text-2xl font-black uppercase">{profile.experienceLevel}</p>
          </Card>
          <Card className="lux-glass rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/60">Availability</p>
            <p className="mt-2 text-2xl font-black uppercase">{profile.availability}</p>
          </Card>
          <Card className="lux-glass rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/60">Active Projects</p>
            <p className="mt-2 text-2xl font-black uppercase">{activeCount}</p>
          </Card>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="inbox" className="gap-1.5">
              Inbox
              {inboxUnread > 0 ? (
                <span className="rounded-full border border-accent/35 bg-accent/15 px-1.5 py-0.5 text-[9px] leading-none text-accent">
                  {inboxUnread > 99 ? "99+" : inboxUnread}
                </span>
              ) : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Card className="lux-glass rounded-2xl p-6">
                {isEditing ? (
                  <FieldGroup>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                        <Input
                          id="firstName"
                          value={form.firstName}
                          onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                        <Input
                          id="lastName"
                          value={form.lastName}
                          onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                        />
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="bio">Bio</FieldLabel>
                      <Textarea
                        id="bio"
                        value={form.bio}
                        onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                        placeholder="Describe your design direction"
                      />
                      <FieldDescription>Keep it concise and value-driven.</FieldDescription>
                    </Field>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="experienceLevel">Experience Level</FieldLabel>
                        <Select
                          value={form.experienceLevel}
                          onValueChange={(v) => setForm((prev) => ({ ...prev, experienceLevel: v }))}
                        >
                          <SelectTrigger id="experienceLevel">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Student">Student</SelectItem>
                            <SelectItem value="Intern">Intern</SelectItem>
                            <SelectItem value="Professional">Professional</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="availability">Availability</FieldLabel>
                        <Select value={form.availability} onValueChange={(v) => setForm((prev) => ({ ...prev, availability: v }))}>
                          <SelectTrigger id="availability">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="Busy">Busy</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel>Skills</FieldLabel>
                      <div className="flex flex-wrap gap-2">
                        {allSkills.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                              form.skills.includes(skill)
                                ? "border-accent/35 bg-accent/15 text-accent"
                                : "border-white/12 bg-white/[0.03] text-white/65"
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <div className="flex gap-3">
                      <Button variant="secondary" isLoading={isSaving} onClick={saveProfile}>
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </FieldGroup>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <p className="text-3xl font-black uppercase">
                        {profile.firstName} {profile.lastName}
                      </p>
                      <p className="text-sm text-white/60">{profile.email}</p>
                    </div>
                    <p className="text-sm text-white/70">{profile.bio || "No bio available."}</p>
                    <div className="flex flex-wrap gap-2">
                      {(profile.skills || []).map((skill) => (
                        <Badge key={skill}>{skill}</Badge>
                      ))}
                    </div>
                    <Button variant="primary" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="portfolio">
            <Card className="lux-glass rounded-2xl p-6">
              {profile.portfolio.length === 0 ? (
                <p className="text-white/60">No portfolio items uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {profile.portfolio.map((item, idx) => (
                    <motion.div key={idx} whileHover={{ y: -4 }} className="rounded-xl border border-white/12 bg-white/[0.03] p-3">
                      <div className="mb-3 h-40 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image.startsWith("http") ? item.image : `http://localhost:5000${item.image}`}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="font-semibold uppercase">{item.title}</p>
                      <p className="text-xs text-white/55">{item.description}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card className="lux-glass rounded-2xl p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(profile.assignedProjects || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-white/60">
                        No assigned projects.
                      </TableCell>
                    </TableRow>
                  ) : (
                    profile.assignedProjects.map((project) => (
                      <TableRow key={project._id}>
                        <TableCell className="font-semibold uppercase">{project.projectTitle}</TableCell>
                        <TableCell>{project.company.companyName}</TableCell>
                        <TableCell>
                          <Badge variant={project.status === "Completed" ? "success" : "warning"}>{project.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(project.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="inbox">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <InboxPanel
                emptyTitle="No Conversations Yet"
                emptyDescription="When you message a company from opportunities, the thread appears here."
                composerPlaceholder="Share your fit for the role, timeline, and portfolio links..."
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
