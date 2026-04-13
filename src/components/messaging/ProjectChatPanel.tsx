"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { get, post } from "@/lib/api";
import { connectSocket, getSocket } from "@/lib/socket";
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ProjectChat {
  _id: string;
  projectTitle: string;
  status: string;
  chatEnabled: boolean;
}

interface ProjectMessage {
  _id: string;
  message: string;
  createdAt: string;
  senderId: {
    _id: string;
    name?: string;
    email?: string;
    role?: string;
  };
}

interface ProjectChatPanelProps {
  roleLabel: string;
}

export function ProjectChatPanel({ roleLabel }: ProjectChatPanelProps) {
  const [projects, setProjects] = useState<ProjectChat[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);

  const selectedProject = useMemo(() => projects.find((p) => p._id === selectedProjectId) || null, [projects, selectedProjectId]);

  const loadProjects = useCallback(async () => {
    const response = await get<ProjectChat[]>("/project-chats");
    if (response.success && response.data) {
      setProjects(response.data);
      if (!selectedProjectId && response.data.length > 0) {
        setSelectedProjectId(response.data[0]._id);
      }
    }
  }, [selectedProjectId]);

  const loadMessages = useCallback(async (projectId: string) => {
    if (!projectId) {
      setMessages([]);
      return;
    }

    const response = await get<ProjectMessage[]>(`/project-chats/${projectId}/messages?limit=400`);
    if (response.success) {
      setMessages(response.data || []);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProjects();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadProjects]);

  useEffect(() => {
    void loadMessages(selectedProjectId);
  }, [selectedProjectId, loadMessages]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = connectSocket(token);
    if (!socket) return;

    const onProjectMessage = async (payload: { projectId?: string }) => {
      if (!payload?.projectId) return;
      if (payload.projectId === selectedProjectId) {
        await loadMessages(payload.projectId);
      }
      await loadProjects();
    };

    socket.on("project:message:new", onProjectMessage);

    return () => {
      const activeSocket = getSocket();
      if (activeSocket) {
        activeSocket.off("project:message:new", onProjectMessage);
      }
    };
  }, [selectedProjectId, loadMessages, loadProjects]);

  const sendMessage = async () => {
    if (!selectedProjectId || !draft.trim()) {
      return;
    }

    setIsSending(true);
    const response = await post(`/project-chats/${selectedProjectId}/messages`, {
      message: draft.trim(),
    });
    setIsSending(false);

    if (response.success) {
      setDraft("");
      await loadMessages(selectedProjectId);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
      <Card className="lux-glass rounded-2xl p-4">
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-accent">{roleLabel} Project Chats</p>
        <div className="space-y-2 max-h-[480px] overflow-y-auto">
          {projects.length === 0 ? (
            <p className="text-sm text-white/60">No project chats yet.</p>
          ) : (
            projects.map((project) => (
              <button
                key={project._id}
                type="button"
                onClick={() => setSelectedProjectId(project._id)}
                className={`w-full rounded-xl border p-3 text-left ${
                  selectedProjectId === project._id
                    ? "border-accent/35 bg-accent/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <p className="font-black uppercase text-sm">{project.projectTitle}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant={project.status === "Active" ? "warning" : "default"}>{project.status}</Badge>
                  <Badge variant={project.chatEnabled ? "success" : "warning"}>{project.chatEnabled ? "Chat On" : "Chat Off"}</Badge>
                </div>
              </button>
            ))
          )}
        </div>
      </Card>

      <Card className="lux-glass rounded-2xl p-4">
        {!selectedProject ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center text-white/60">Select a project chat.</div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
              <p className="text-lg font-black uppercase">{selectedProject.projectTitle}</p>
              <Badge variant={selectedProject.chatEnabled ? "success" : "warning"}>
                {selectedProject.chatEnabled ? "Open" : "Disabled"}
              </Badge>
            </div>

            <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-black/10 p-3">
              {messages.length === 0 ? (
                <p className="text-sm text-white/60">No messages yet.</p>
              ) : (
                messages.map((item) => (
                  <div key={item._id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-sm">{item.message}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/45">
                      {item.senderId?.name || item.senderId?.email || "Unknown"} • {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 space-y-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Message all assigned members in this project..."
                className="min-h-[90px]"
                disabled={!selectedProject.chatEnabled}
              />
              <Button variant="secondary" onClick={sendMessage} isLoading={isSending} disabled={!draft.trim() || !selectedProject.chatEnabled}>
                Send Project Message
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
