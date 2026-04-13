"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { get, put } from "@/lib/api";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Project {
  _id: string;
  projectTitle: string;
  budget?: number;
  status: string;
  company: {
    companyName: string;
  };
  designers: Array<{
    designer: {
      firstName: string;
      lastName: string;
    };
  }>;
}

interface RequestItem {
  _id: string;
  projectTitle: string;
  company?: {
    companyName?: string;
  };
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<RequestItem[]>([]);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    const fetchProjects = async () => {
      const [projectsResponse, requestsResponse] = await Promise.all([
        get<any>("/admin/projects?limit=300"),
        get<any>("/admin/requests?status=Approved&limit=300"),
      ]);

      if (projectsResponse.success) {
        const list = Array.isArray(projectsResponse.data) ? projectsResponse.data : projectsResponse.data?.data || [];
        setProjects(list);
      }

      if (requestsResponse.success) {
        const list = Array.isArray(requestsResponse.data) ? requestsResponse.data : requestsResponse.data?.data || [];
        const assignedTitles = new Set((Array.isArray(projectsResponse.data) ? projectsResponse.data : projectsResponse.data?.data || []).map((p: Project) => p.projectTitle));
        const pendingAssignment = list.filter((item: RequestItem) => !assignedTitles.has(item.projectTitle));
        setApprovedRequests(pendingAssignment);
      }
    };
    fetchProjects();
  }, []);

  const filtered = useMemo(() => {
    return projects.filter((p) => (tab === "all" ? true : p.status.toLowerCase() === tab));
  }, [projects, tab]);

  const completeProject = async (id: string) => {
    const response = await put(`/admin/projects/${id}/status`, { status: "Completed" });
    if (response.success) setProjects((prev) => prev.map((p) => (p._id === id ? { ...p, status: "Completed" } : p)));
  };

  return (
    <AdminShell title="Project Grid" subtitle="Monitor and update admin-managed delivery lanes.">
      <div className="mb-4 flex flex-wrap gap-2">
        {approvedRequests.length > 0 ? (
          approvedRequests.slice(0, 8).map((request) => (
            <Button
              key={request._id}
              size="sm"
              variant="outline"
              onClick={() => router.push(`/admin/projects/assign?requestId=${request._id}`)}
            >
              Assign: {request.projectTitle}
            </Button>
          ))
        ) : (
          <Badge variant="default">No approved requests waiting for assignment</Badge>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="lux-glass overflow-hidden rounded-2xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Designers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-white/60">
                        No projects available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((project) => (
                      <TableRow key={project._id}>
                        <TableCell className="font-semibold uppercase">{project.projectTitle}</TableCell>
                        <TableCell>{project.company.companyName}</TableCell>
                        <TableCell>
                          {(project.designers || []).map((entry) => `${entry.designer.firstName} ${entry.designer.lastName}`).join(", ") || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={project.status === "Active" ? "warning" : "success"}>{project.status}</Badge>
                        </TableCell>
                        <TableCell>{project.budget ? `$${project.budget.toLocaleString()}` : "-"}</TableCell>
                        <TableCell>
                          {project.status === "Active" ? (
                            <Button size="sm" variant="secondary" onClick={() => completeProject(project._id)}>
                              Mark Complete
                            </Button>
                          ) : (
                            <span className="text-xs text-white/45">Done</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}
