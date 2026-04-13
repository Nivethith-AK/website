"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { get, put, upload } from "@/lib/api";
import { connectSocket, getSocket } from "@/lib/socket";
import { Card } from "@/components/Card";
import { InboxPanel } from "@/components/messaging/InboxPanel";
import { ProjectChatPanel } from "@/components/messaging/ProjectChatPanel";
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
  cvFile?: string;
  experiences?: Array<{
    company?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  fashionProjects?: Array<{
    title?: string;
    client?: string;
    year?: string;
    role?: string;
    description?: string;
    link?: string;
  }>;
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
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [cvMessage, setCvMessage] = useState("");
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const [profileImageMessage, setProfileImageMessage] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    skills: [] as string[],
    experienceLevel: "Student",
    bio: "",
    availability: "Available",
    experiences: [{ company: "", role: "", startDate: "", endDate: "", description: "" }],
    fashionProjects: [{ title: "", client: "", year: "", role: "", description: "", link: "" }],
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
          experiences:
            response.data.experiences && response.data.experiences.length > 0
              ? response.data.experiences.map((exp) => ({
                  company: exp.company || "",
                  role: exp.role || "",
                  startDate: exp.startDate || "",
                  endDate: exp.endDate || "",
                  description: exp.description || "",
                }))
              : [{ company: "", role: "", startDate: "", endDate: "", description: "" }],
          fashionProjects:
            response.data.fashionProjects && response.data.fashionProjects.length > 0
              ? response.data.fashionProjects.map((project) => ({
                  title: project.title || "",
                  client: project.client || "",
                  year: project.year || "",
                  role: project.role || "",
                  description: project.description || "",
                  link: project.link || "",
                }))
              : [{ title: "", client: "", year: "", role: "", description: "", link: "" }],
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

    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    const socket = connectSocket(token);
    if (!socket) {
      return;
    }

    const onUnread = (payload: { unread?: number }) => {
      setInboxUnread(payload?.unread || 0);
    };

    socket.on("message:unread", onUnread);

    return () => {
      const activeSocket = getSocket();
      if (activeSocket) {
        activeSocket.off("message:unread", onUnread);
      }
    };

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

  const addExperience = () => {
    setForm((prev) => ({
      ...prev,
      experiences: [...prev.experiences, { company: "", role: "", startDate: "", endDate: "", description: "" }],
    }));
  };

  const updateExperience = (index: number, key: string, value: string) => {
    setForm((prev) => {
      const updated = [...prev.experiences];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, experiences: updated };
    });
  };

  const addFashionProject = () => {
    setForm((prev) => ({
      ...prev,
      fashionProjects: [...prev.fashionProjects, { title: "", client: "", year: "", role: "", description: "", link: "" }],
    }));
  };

  const updateFashionProject = (index: number, key: string, value: string) => {
    setForm((prev) => {
      const updated = [...prev.fashionProjects];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, fashionProjects: updated };
    });
  };

  const uploadCv = async (file: File | null) => {
    if (!file) return;
    setIsUploadingCv(true);
    setCvMessage("");

    const formData = new FormData();
    formData.append("cvFile", file);

    const response = await upload<DesignerProfile>("/designers/upload/cv", formData);
    if (response.success && response.data) {
      setProfile(response.data);
      setCvMessage("CV uploaded successfully.");
    } else {
      setCvMessage(response.message || "Unable to upload CV.");
    }

    setIsUploadingCv(false);
  };

  const uploadProfileImage = async (file: File | null) => {
    if (!file) return;
    setIsUploadingProfileImage(true);
    setProfileImageMessage("");

    const formData = new FormData();
    formData.append("profileImage", file);

    const response = await upload<DesignerProfile>("/designers/upload/profile-image", formData);
    if (response.success && response.data) {
      setProfile(response.data);
      setProfileImageMessage("Profile image updated.");
    } else {
      setProfileImageMessage(response.message || "Unable to update profile image.");
    }

    setIsUploadingProfileImage(false);
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
            <TabsTrigger value="projects">Projects (Admin Managed)</TabsTrigger>
            <TabsTrigger value="project-chat">Project Chat</TabsTrigger>
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

                    <Field>
                      <FieldLabel>Experience</FieldLabel>
                      <div className="space-y-3">
                        {form.experiences.map((exp, index) => (
                          <div key={`exp-${index}`} className="rounded-xl border border-white/12 bg-white/[0.03] p-3">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              <Input
                                value={exp.company || ""}
                                onChange={(e) => updateExperience(index, "company", e.target.value)}
                                placeholder="Company"
                              />
                              <Input
                                value={exp.role || ""}
                                onChange={(e) => updateExperience(index, "role", e.target.value)}
                                placeholder="Role"
                              />
                              <Input
                                value={exp.startDate || ""}
                                onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                                placeholder="Start Date"
                              />
                              <Input
                                value={exp.endDate || ""}
                                onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                                placeholder="End Date / Present"
                              />
                            </div>
                            <Textarea
                              value={exp.description || ""}
                              onChange={(e) => updateExperience(index, "description", e.target.value)}
                              placeholder="Fashion experience highlights"
                              className="mt-3"
                            />
                          </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addExperience}>
                          Add Experience
                        </Button>
                      </div>
                    </Field>

                    <Field>
                      <FieldLabel>Fashion Projects</FieldLabel>
                      <div className="space-y-3">
                        {form.fashionProjects.map((proj, index) => (
                          <div key={`proj-${index}`} className="rounded-xl border border-white/12 bg-white/[0.03] p-3">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              <Input
                                value={proj.title || ""}
                                onChange={(e) => updateFashionProject(index, "title", e.target.value)}
                                placeholder="Project Title"
                              />
                              <Input
                                value={proj.client || ""}
                                onChange={(e) => updateFashionProject(index, "client", e.target.value)}
                                placeholder="Client / Brand"
                              />
                              <Input
                                value={proj.year || ""}
                                onChange={(e) => updateFashionProject(index, "year", e.target.value)}
                                placeholder="Year"
                              />
                              <Input
                                value={proj.role || ""}
                                onChange={(e) => updateFashionProject(index, "role", e.target.value)}
                                placeholder="Your Role"
                              />
                            </div>
                            <Textarea
                              value={proj.description || ""}
                              onChange={(e) => updateFashionProject(index, "description", e.target.value)}
                              placeholder="Project details"
                              className="mt-3"
                            />
                            <Input
                              value={proj.link || ""}
                              onChange={(e) => updateFashionProject(index, "link", e.target.value)}
                              placeholder="Project link (optional)"
                              className="mt-3"
                            />
                          </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addFashionProject}>
                          Add Fashion Project
                        </Button>
                      </div>
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
                      <div className="mb-3 flex items-center gap-3">
                        <div className="h-14 w-14 overflow-hidden rounded-xl border border-white/15 bg-white/5">
                          {profile.profileImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={profile.profileImage.startsWith("http") ? profile.profileImage : `http://localhost:5000${profile.profileImage}`}
                              alt={`${profile.firstName} ${profile.lastName}`}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => uploadProfileImage(e.target.files?.[0] || null)}
                            disabled={isUploadingProfileImage}
                          />
                          {profileImageMessage ? <p className="mt-1 text-xs text-white/70">{profileImageMessage}</p> : null}
                        </div>
                      </div>

                      <p className="text-3xl font-black uppercase">
                        {profile.firstName} {profile.lastName}
                      </p>
                      <p className="text-sm text-white/60">{profile.email}</p>
                    </div>
                    <p className="text-sm text-white/70">{profile.bio || "No bio available."}</p>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-white/12 bg-white/[0.03] p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-accent">Experience Entries</p>
                        <p className="mt-2 text-xl font-black">{profile.experiences?.length || 0}</p>
                      </div>
                      <div className="rounded-xl border border-white/12 bg-white/[0.03] p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-accent">Fashion Projects</p>
                        <p className="mt-2 text-xl font-black">{profile.fashionProjects?.length || 0}</p>
                      </div>
                    </div>
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
              <div className="mb-5 rounded-xl border border-white/12 bg-white/[0.03] p-4">
                <p className="text-sm font-black uppercase">Curriculum Vitae</p>
                <p className="mt-1 text-xs text-white/60">Upload or replace your CV for companies and admin review.</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => uploadCv(e.target.files?.[0] || null)}
                    disabled={isUploadingCv}
                    className="max-w-sm"
                  />
                  {profile.cvFile ? (
                    <a
                      href={profile.cvFile.startsWith("http") ? profile.cvFile : `http://localhost:5000${profile.cvFile}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent"
                    >
                      View Current CV
                    </a>
                  ) : null}
                </div>
                {cvMessage ? <p className="mt-2 text-xs text-white/70">{cvMessage}</p> : null}
              </div>

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
                        No admin-assigned projects yet.
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
                emptyDescription="When you message a company from the request board, the thread appears here."
                composerPlaceholder="Share your fit for the request, timeline, and portfolio links..."
                onUnreadCountChange={setInboxUnread}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="project-chat">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <ProjectChatPanel roleLabel="Designer" />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
