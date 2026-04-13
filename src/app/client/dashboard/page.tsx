"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { get, post, put, upload } from "@/lib/api";
import { connectSocket, getSocket } from "@/lib/socket";
import { Card } from "@/components/Card";
import { InboxPanel } from "@/components/messaging/InboxPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface RequestItem {
  _id: string;
  projectTitle: string;
  description: string;
  requiredDesigners: number;
  duration: string;
  budget?: number;
  status: string;
  createdAt: string;
  assignedDesigners?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  isPublic?: boolean;
}

interface CompanyProfile {
  _id: string;
  companyName: string;
  industry: string;
  contactPerson: string;
  phone: string;
  website?: string;
  address: string;
  description?: string;
  companyImage?: string;
  portfolio?: Array<{
    image: string;
    title: string;
    description?: string;
  }>;
}

const durations = ["1 week", "2 weeks", "1 month", "2 months", "3 months", "6 months", "1 year", "Custom"];

export default function ClientDashboardPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("list");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [formData, setFormData] = useState({
    projectTitle: "",
    description: "",
    requiredDesigners: 1,
    duration: "1 month",
    budget: "",
    isPublic: false,
  });
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [profileForm, setProfileForm] = useState({
    companyName: "",
    industry: "",
    contactPerson: "",
    phone: "",
    website: "",
    address: "",
    description: "",
    companyImage: "",
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [inboxUnread, setInboxUnread] = useState(0);
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [portfolioDescription, setPortfolioDescription] = useState("");
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);
  const [showPublishPrompt, setShowPublishPrompt] = useState(false);

  useEffect(() => {
    const loadRequests = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const [requestResponse, profileResponse, unreadResponse] = await Promise.all([
        get<RequestItem[]>("/clients/requests"),
        get<CompanyProfile>("/clients/profile"),
        get<{ unread: number }>("/messages/unread-count"),
      ]);

      if (requestResponse.success && requestResponse.data) {
        setRequests(requestResponse.data);
      } else {
        router.push("/login");
      }

      if (profileResponse.success && profileResponse.data) {
        setCompanyProfile(profileResponse.data);
        setProfileForm({
          companyName: profileResponse.data.companyName || "",
          industry: profileResponse.data.industry || "",
          contactPerson: profileResponse.data.contactPerson || "",
          phone: profileResponse.data.phone || "",
          website: profileResponse.data.website || "",
          address: profileResponse.data.address || "",
          description: profileResponse.data.description || "",
          companyImage: profileResponse.data.companyImage || "",
        });
      }

      if (unreadResponse.success && unreadResponse.data) {
        setInboxUnread(unreadResponse.data.unread || 0);
      }

      setIsLoading(false);
    };

    loadRequests();

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

  const stats = useMemo(() => {
    const active = requests.filter((r) => r.status !== "Completed" && r.status !== "Rejected").length;
    const approved = requests.filter((r) => r.status === "Approved").length;
    return {
      active,
      approved,
      total: requests.length,
    };
  }, [requests]);

  const profileReadyToPublish = useMemo(() => {
    return Boolean(
      profileForm.companyName.trim() &&
        profileForm.industry.trim() &&
        profileForm.contactPerson.trim() &&
        profileForm.phone.trim() &&
        profileForm.address.trim()
    );
  }, [profileForm]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      projectTitle: formData.projectTitle,
      description: formData.description,
      requiredDesigners: Number(formData.requiredDesigners),
      duration: formData.duration,
      budget: formData.budget ? Number(formData.budget) : undefined,
      requiredSkills: [],
      preferredExperience: "Any",
      isPublic: formData.isPublic,
    };

    const response = await post<RequestItem>("/clients/requests", payload);
    if (response.success && response.data) {
      setRequests((prev) => [response.data!, ...prev]);
      setFormData({
        projectTitle: "",
        description: "",
        requiredDesigners: 1,
        duration: "1 month",
        budget: "",
        isPublic: false,
      });
      setTab("list");
    }

    setIsSubmitting(false);
  };

  const saveCompanyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage("");

    const payload = {
      companyName: profileForm.companyName.trim(),
      industry: profileForm.industry.trim(),
      contactPerson: profileForm.contactPerson.trim(),
      phone: profileForm.phone.trim(),
      website: profileForm.website.trim() || undefined,
      address: profileForm.address.trim(),
      description: profileForm.description.trim() || undefined,
      companyImage: profileForm.companyImage.trim() || undefined,
    };

    const response = await put<CompanyProfile>("/clients/profile", payload);
    if (response.success && response.data) {
      setCompanyProfile(response.data);
      setProfileMessage("Company profile updated. New public request board entries now show this information.");
      setShowPublishPrompt(true);
    } else {
      setProfileMessage(response.message || "Unable to update profile.");
    }

    setIsSavingProfile(false);
  };

  const uploadPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage("");

    if (!portfolioFile) {
      setProfileMessage("Please choose an image file for portfolio upload.");
      return;
    }

    if (!portfolioTitle.trim()) {
      setProfileMessage("Portfolio title is required.");
      return;
    }

    setIsUploadingPortfolio(true);

    const formData = new FormData();
    formData.append("portfolioImage", portfolioFile);
    formData.append("title", portfolioTitle.trim());
    formData.append("description", portfolioDescription.trim());

    const response = await upload<CompanyProfile>("/clients/upload/portfolio", formData);

    if (response.success && response.data) {
      setCompanyProfile(response.data);
      setPortfolioTitle("");
      setPortfolioDescription("");
      setPortfolioFile(null);
      setProfileMessage("Portfolio item uploaded successfully.");
    } else {
      setProfileMessage(response.message || "Portfolio upload failed.");
    }

    setIsUploadingPortfolio(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="lux-glass animate-pulse rounded-2xl px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/65">
          Loading Client Workspace
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12 pt-28 text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">Client Dashboard</h1>
            <p className="mt-2 text-sm text-white/60">Submit requests and track assignment status in real time.</p>
          </div>
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

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="lux-glass rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/60">Active Requests</p>
            <p className="mt-2 text-3xl font-black">{stats.active}</p>
          </Card>
          <Card className="lux-glass rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/60">Approved</p>
            <p className="mt-2 text-3xl font-black">{stats.approved}</p>
          </Card>
          <Card className="lux-glass rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/60">Total Requests</p>
            <p className="mt-2 text-3xl font-black">{stats.total}</p>
          </Card>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="list">Request List</TabsTrigger>
            <TabsTrigger value="new">New Request</TabsTrigger>
            <TabsTrigger value="company">Company Profile</TabsTrigger>
            <TabsTrigger value="inbox" className="gap-1.5">
              Inbox
              {inboxUnread > 0 ? (
                <span className="rounded-full border border-accent/35 bg-accent/15 px-1.5 py-0.5 text-[9px] leading-none text-accent">
                  {inboxUnread > 99 ? "99+" : inboxUnread}
                </span>
              ) : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <div className="lux-glass overflow-hidden rounded-2xl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Designers</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-white/60">
                        No requests found. Complete profile and publish your first request.
                      </TableCell>
                    </TableRow>
                  ) : (
                      requests.map((request) => (
                        <TableRow key={request._id}>
                          <TableCell>
                            <p className="font-semibold uppercase">{request.projectTitle}</p>
                            <p className="text-xs text-white/55">{request.description.slice(0, 70)}...</p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                request.status === "Approved"
                                  ? "success"
                                  : request.status === "Rejected"
                                  ? "purple"
                                  : "warning"
                              }
                            >
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{request.requiredDesigners}</TableCell>
                          <TableCell>{request.duration}</TableCell>
                          <TableCell>{request.budget ? `$${request.budget.toLocaleString()}` : "-"}</TableCell>
                          <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="new">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Card className="lux-glass rounded-2xl p-6">
                <form onSubmit={submit}>
                  <FieldGroup>
                    {!profileReadyToPublish ? (
                      <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs text-amber-100">
                        Complete your company profile first, then publish requests.
                      </div>
                    ) : null}

                    <Field>
                      <FieldLabel htmlFor="projectTitle">Project Title</FieldLabel>
                      <Input
                        id="projectTitle"
                        value={formData.projectTitle}
                        onChange={(e) => setFormData((prev) => ({ ...prev, projectTitle: e.target.value }))}
                        required
                        placeholder="Collection Revamp"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="description">Description</FieldLabel>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        required
                        placeholder="Describe project goals"
                      />
                      <FieldDescription>Include style direction, timeline, and expected outcomes.</FieldDescription>
                    </Field>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <Field>
                        <FieldLabel htmlFor="requiredDesigners">Designers Needed</FieldLabel>
                        <Input
                          id="requiredDesigners"
                          type="number"
                          min={1}
                          value={formData.requiredDesigners}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, requiredDesigners: Number(e.target.value) || 1 }))
                          }
                          required
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="duration">Duration</FieldLabel>
                        <Select
                          value={formData.duration}
                          onValueChange={(v) => setFormData((prev) => ({ ...prev, duration: v }))}
                        >
                          <SelectTrigger id="duration">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {durations.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="budget">Budget</FieldLabel>
                        <Input
                          id="budget"
                          type="number"
                          min={0}
                          value={formData.budget}
                          onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value }))}
                          placeholder="50000"
                        />
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="isPublic">Visibility</FieldLabel>
                      <Select
                        value={formData.isPublic ? "public" : "private"}
                        onValueChange={(v) => setFormData((prev) => ({ ...prev, isPublic: v === "public" }))}
                      >
                        <SelectTrigger id="isPublic">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">Private (Admin + Company)</SelectItem>
                          <SelectItem value="public">Public (Visible in Designers page)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldDescription>Public requests are shown on the designer request board.</FieldDescription>
                    </Field>

                    <Button type="submit" variant="secondary" isLoading={isSubmitting} disabled={!profileReadyToPublish}>
                      {isSubmitting ? "Submitting" : "Create Request"}
                    </Button>
                  </FieldGroup>
                </form>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="company">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Card className="lux-glass rounded-2xl p-6">
                <div className="mb-5">
                  <p className="text-2xl font-black uppercase tracking-tight">Company Profile</p>
                  <p className="mt-1 text-sm text-white/60">
                    Keep this information updated so designers can evaluate your requests faster.
                  </p>
                </div>

                <form onSubmit={saveCompanyProfile}>
                  <FieldGroup>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
                        <Input
                          id="companyName"
                          value={profileForm.companyName}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, companyName: e.target.value }))}
                          required
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="industry">Industry</FieldLabel>
                        <Input
                          id="industry"
                          value={profileForm.industry}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, industry: e.target.value }))}
                          required
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="contactPerson">Contact Person</FieldLabel>
                        <Input
                          id="contactPerson"
                          value={profileForm.contactPerson}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, contactPerson: e.target.value }))}
                          required
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="phone">Phone</FieldLabel>
                        <Input
                          id="phone"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                          required
                        />
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="address">Address</FieldLabel>
                      <Input
                        id="address"
                        value={profileForm.address}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))}
                        required
                      />
                    </Field>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="website">Website</FieldLabel>
                        <Input
                          id="website"
                          value={profileForm.website}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, website: e.target.value }))}
                          placeholder="https://yourcompany.com"
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="companyImage">Company Image URL</FieldLabel>
                        <Input
                          id="companyImage"
                          value={profileForm.companyImage}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, companyImage: e.target.value }))}
                          placeholder="https://.../logo.jpg"
                        />
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="companyDescription">Description</FieldLabel>
                      <Textarea
                        id="companyDescription"
                        value={profileForm.description}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Tell designers about your brand vision, customer base, and style direction"
                      />
                      <FieldDescription>
                        This description appears with your public requests on the Designers page.
                      </FieldDescription>
                    </Field>

                    <div className="flex flex-wrap gap-3">
                      <Button type="submit" variant="secondary" isLoading={isSavingProfile}>
                        {isSavingProfile ? "Saving" : "Save Company Profile"}
                      </Button>
                      <Badge variant="accent">
                        {companyProfile?.companyName ? `Live: ${companyProfile.companyName}` : "Profile not loaded yet"}
                      </Badge>
                    </div>
                  </FieldGroup>
                </form>

                <div className="my-8 h-px bg-white/10" />

                <div className="mb-4">
                  <p className="text-xl font-black uppercase tracking-tight">Company Portfolio</p>
                  <p className="mt-1 text-sm text-white/60">Upload brand visuals so designers can trust your request board presence quickly.</p>
                </div>

                <form onSubmit={uploadPortfolio}>
                  <FieldGroup>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="portfolioTitle">Portfolio Title</FieldLabel>
                        <Input
                          id="portfolioTitle"
                          value={portfolioTitle}
                          onChange={(e) => setPortfolioTitle(e.target.value)}
                          placeholder="Spring Editorial Campaign"
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="portfolioImageFile">Image File</FieldLabel>
                        <Input
                          id="portfolioImageFile"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setPortfolioFile(e.target.files?.[0] || null)}
                        />
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="portfolioDescription">Portfolio Description</FieldLabel>
                      <Textarea
                        id="portfolioDescription"
                        value={portfolioDescription}
                        onChange={(e) => setPortfolioDescription(e.target.value)}
                        placeholder="Short context for this visual and campaign direction"
                      />
                    </Field>

                    <Button type="submit" variant="secondary" isLoading={isUploadingPortfolio}>
                      {isUploadingPortfolio ? "Uploading" : "Upload Portfolio Item"}
                    </Button>
                  </FieldGroup>
                </form>

                {profileMessage ? <p className="mt-4 text-sm text-white/75">{profileMessage}</p> : null}

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {(companyProfile?.portfolio || []).length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/60 md:col-span-3">
                      No portfolio items uploaded yet.
                    </div>
                  ) : (
                    (companyProfile?.portfolio || []).map((item, idx) => (
                      <div key={`${item.image}-${idx}`} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                        <div className="mb-3 h-36 overflow-hidden rounded-lg border border-white/10 bg-black/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`http://localhost:5000${item.image}`} alt={item.title} className="h-full w-full object-cover" />
                        </div>
                        <p className="font-semibold uppercase">{item.title}</p>
                        <p className="text-xs text-white/60">{item.description || "No description"}</p>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="inbox">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <InboxPanel
                emptyTitle="No Conversations Yet"
                emptyDescription="When designers contact your requests, their threads appear here."
                composerPlaceholder="Reply with role details, requirements, and next steps..."
                onUnreadCountChange={setInboxUnread}
              />
            </motion.div>
          </TabsContent>
        </Tabs>

        <Dialog open={showPublishPrompt} onOpenChange={setShowPublishPrompt}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Profile Ready</DialogTitle>
              <DialogDescription>
                Your profile looks good. You can now publish a request from the <span className="font-semibold text-white">New Request</span> tab.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowPublishPrompt(false);
                  setTab("new");
                }}
              >
                Go to Publish Request
              </Button>
              <Button variant="outline" onClick={() => setShowPublishPrompt(false)}>
                Stay Here
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
