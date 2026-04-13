"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { get, post, resolveAssetUrl } from "@/lib/api";
import { connectSocket, getSocket } from "@/lib/socket";
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface MessageUser {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
}

interface ConversationItem {
  partner: MessageUser;
  lastMessage: string;
  lastMessageAt: string;
  isFromMe: boolean;
  unreadCount?: number;
}

interface ChatMessage {
  _id: string;
  senderId: MessageUser | string;
  receiverId: MessageUser | string;
  message: string;
  createdAt: string;
  isRead?: boolean;
  readAt?: string | null;
  attachments?: Array<{
    fileUrl: string;
    originalName: string;
    mimeType: string;
  }>;
}

interface InboxPanelProps {
  emptyTitle: string;
  emptyDescription: string;
  composerPlaceholder?: string;
  onUnreadCountChange?: (count: number) => void;
}

const getUserId = (user: MessageUser | string | undefined) => {
  if (!user) return "";
  if (typeof user === "string") return user;
  return user._id || "";
};

export function InboxPanel({
  emptyTitle,
  emptyDescription,
  composerPlaceholder = "Write your message...",
  onUnreadCountChange,
}: InboxPanelProps) {
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [feedback, setFeedback] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [liveUnread, setLiveUnread] = useState(0);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  const refreshUnreadCount = useCallback(async () => {
    const unreadResponse = await get<{ unread: number }>("/messages/unread-count");
    if (unreadResponse.success && unreadResponse.data) {
      const unread = unreadResponse.data.unread || 0;
      setLiveUnread(unread);
      if (onUnreadCountChange) {
        onUnreadCountChange(unread);
      }
    }
  }, [onUnreadCountChange]);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.partner._id === selectedPartnerId) || null,
    [conversations, selectedPartnerId]
  );

  const filteredConversations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return conversations;

    return conversations.filter((item) => {
      const partnerName = (item.partner.name || "").toLowerCase();
      const partnerEmail = (item.partner.email || "").toLowerCase();
      const snippet = (item.lastMessage || "").toLowerCase();
      return partnerName.includes(normalized) || partnerEmail.includes(normalized) || snippet.includes(normalized);
    });
  }, [conversations, query]);

  const fetchMessages = useCallback(async (partnerId: string) => {
    if (!partnerId) {
      setMessages([]);
      return;
    }

    setIsLoadingMessages(true);
    const response = await get<ChatMessage[]>(`/messages/${partnerId}?limit=300`);

    if (response.success) {
      setMessages(response.data || []);
      setFeedback("");
    } else {
      setMessages([]);
      setFeedback(response.message || "Unable to load messages.");
    }

    setIsLoadingMessages(false);
  }, []);

  const fetchConversations = useCallback(async (preferredPartnerId?: string) => {
    setIsLoadingConversations(true);

    const response = await get<ConversationItem[]>("/messages?limit=200");

    if (!response.success) {
      setConversations([]);
      setSelectedPartnerId("");
      setMessages([]);
      setFeedback(response.message || "Unable to load inbox.");
      setIsLoadingConversations(false);
      return;
    }

    const list = response.data || [];
    setConversations(list);

    const unreadTotal = list.reduce((acc, item) => acc + (item.unreadCount || 0), 0);
    setLiveUnread(unreadTotal);
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadTotal);
    }

    if (!list.length) {
      setSelectedPartnerId("");
      setMessages([]);
      setFeedback("");
      setIsLoadingConversations(false);
      return;
    }

    const preferredExists = preferredPartnerId && list.some((item) => item.partner._id === preferredPartnerId);
    const nextPartnerId = preferredExists ? preferredPartnerId! : list[0].partner._id;
    setSelectedPartnerId(nextPartnerId);
    await fetchMessages(nextPartnerId);
    setIsLoadingConversations(false);
  }, [fetchMessages, onUnreadCountChange]);

  const onSelectConversation = useCallback(async (partnerId: string) => {
    if (!partnerId || partnerId === selectedPartnerId) return;
    setSelectedPartnerId(partnerId);
    setDraft("");
    await fetchMessages(partnerId);
  }, [fetchMessages, selectedPartnerId]);

  const onSend = async () => {
    if (!selectedPartnerId || (!draft.trim() && attachmentFiles.length === 0)) return;

    setIsSending(true);
    setFeedback("");

    let response;

    if (attachmentFiles.length > 0) {
      const formData = new FormData();
      formData.append("receiverId", selectedPartnerId);
      formData.append("message", draft.trim());
      attachmentFiles.forEach((file) => formData.append("attachments", file));

      response = await fetch(`${resolveAssetUrl('/api/messages')}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: formData,
      }).then((r) => r.json());
    } else {
      response = await post<ChatMessage>("/messages", {
        receiverId: selectedPartnerId,
        message: draft.trim(),
      });
    }

    if (response.success && response.data) {
      setDraft("");
      setAttachmentFiles([]);
      setMessages((prev) => [...prev, response.data as ChatMessage]);
      await fetchConversations(selectedPartnerId);
    } else {
      setFeedback(response.message || "Unable to send message.");
    }

    setIsSending(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchConversations();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchConversations]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = connectSocket(token);
    if (!socket) return;

    const onNewMessage = async () => {
      await fetchConversations(selectedPartnerId || undefined);
    };

    const onUnread = (payload: { unread?: number }) => {
      const unread = payload?.unread || 0;
      setLiveUnread(unread);
      if (onUnreadCountChange) {
        onUnreadCountChange(unread);
      }
    };

    const onRead = (payload: { readerId?: string; messageIds?: string[] }) => {
      const ids = new Set(payload?.messageIds || []);
      if (!ids.size) return;

      setMessages((prev) =>
        prev.map((item) =>
          ids.has(item._id)
            ? {
                ...item,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : item
        )
      );
    };

    socket.on("message:new", onNewMessage);
    socket.on("message:unread", onUnread);
    socket.on("message:read", onRead);

    return () => {
      const activeSocket = getSocket();
      if (activeSocket) {
        activeSocket.off("message:new", onNewMessage);
        activeSocket.off("message:unread", onUnread);
        activeSocket.off("message:read", onRead);
      }
    };
  }, [fetchConversations, onUnreadCountChange, refreshUnreadCount, selectedPartnerId]);

  useEffect(() => {
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="lux-glass rounded-2xl p-4">
        <div className="mb-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Conversations</p>
            {liveUnread > 0 ? <Badge variant="warning">{liveUnread} Unread</Badge> : null}
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" placeholder="Search inbox" />
        </div>

        {isLoadingConversations ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-16 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/65">
            {emptyDescription}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((item) => {
              const active = item.partner._id === selectedPartnerId;
              const partnerName = item.partner.name || item.partner.email || "Unknown User";
              const unread = item.unreadCount || 0;

              return (
                <button
                  key={item.partner._id}
                  type="button"
                  onClick={() => onSelectConversation(item.partner._id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-accent/40 bg-accent/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-black uppercase tracking-[0.08em]">{partnerName}</p>
                    <div className="flex items-center gap-2">
                      {unread > 0 ? <Badge variant="warning">{unread} New</Badge> : null}
                      <Badge variant="default" className="shrink-0">
                        {item.partner.role || "user"}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-1 truncate text-xs text-white/60">{item.lastMessage}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/45">
                    {new Date(item.lastMessageAt).toLocaleString()}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="lux-glass rounded-2xl p-4">
        {selectedConversation ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <p className="text-lg font-black uppercase leading-tight">{selectedConversation.partner.name || selectedConversation.partner.email}</p>
                <p className="text-xs text-white/60">{selectedConversation.partner.email || "No email available"}</p>
              </div>
              <Badge variant="accent">{selectedConversation.partner.role || "user"}</Badge>
            </div>

            <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-black/10 p-3">
              {isLoadingMessages ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, idx) => (
                    <div key={idx} className="h-10 animate-pulse rounded-lg border border-white/10 bg-white/[0.03]" />
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="py-10 text-center text-sm text-white/60">No messages yet. Start the conversation below.</div>
              ) : (
                messages.map((item) => {
                  const isMine = getUserId(item.receiverId) === selectedPartnerId;

                  return (
                    <div key={item._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${
                          isMine
                            ? "border border-accent/35 bg-accent/15 text-white"
                            : "border border-white/12 bg-white/[0.04] text-white/85"
                        }`}
                      >
                        {item.message ? <p>{item.message}</p> : null}
                        {item.attachments && item.attachments.length > 0 ? (
                          <div className="mt-2 space-y-1">
                            {item.attachments.map((file, idx) => (
                              <a
                                key={`${item._id}-att-${idx}`}
                                href={resolveAssetUrl(file.fileUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-xs text-accent underline"
                              >
                                {file.originalName}
                              </a>
                            ))}
                          </div>
                        ) : null}
                        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/45">
                          {new Date(item.createdAt).toLocaleTimeString()}
                        </p>
                        {isMine ? (
                          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/45">
                            {item.isRead ? "Read" : "Sent"}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={threadEndRef} />
            </div>

            <div className="mt-4 space-y-3">
              <Input
                type="file"
                multiple
                accept="image/*,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx"
                onChange={(e) => setAttachmentFiles(Array.from(e.target.files || []))}
              />
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={composerPlaceholder}
                className="min-h-[95px]"
              />
              {feedback ? <p className="text-sm text-white/70">{feedback}</p> : null}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={onSend}
                  isLoading={isSending}
                  disabled={(!draft.trim() && attachmentFiles.length === 0) || isSending}
                >
                  Send Message
                </Button>
                <Button variant="outline" onClick={() => fetchConversations(selectedPartnerId)}>
                  Refresh
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full min-h-[420px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center">
            <div>
              <p className="text-xl font-black uppercase">{emptyTitle}</p>
              <p className="mt-2 text-sm text-white/60">{emptyDescription}</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
