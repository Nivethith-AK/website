"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { get, post } from "@/lib/api";
import { Card } from "@/components/Card";
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

const durations = ["1 week", "2 weeks", "1 month", "2 months", "3 months", "6 months", "1 year", "Custom"];

export default function ClientDashboardPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("list");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    projectTitle: "",
    description: "",
    requiredDesigners: 1,
    duration: "1 month",
    budget: "",
    isPublic: false,
  });

  useEffect(() => {
    const loadRequests = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await get<RequestItem[]>("/clients/requests");
      if (response.success && response.data) {
        setRequests(response.data);
      } else {
        router.push("/login");
      }
      setIsLoading(false);
    };

    loadRequests();
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
                          No requests found.
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
                      <FieldDescription>Public requests are shown as fashion opportunities to designers.</FieldDescription>
                    </Field>

                    <Button type="submit" variant="secondary" isLoading={isSubmitting}>
                      {isSubmitting ? "Submitting" : "Create Request"}
                    </Button>
                  </FieldGroup>
                </form>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
