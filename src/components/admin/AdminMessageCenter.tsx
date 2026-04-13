"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { post } from "@/lib/api";
import { Card } from "@/components/Card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TargetUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  isVerified: boolean;
}

interface AdminMessageCenterProps {
  users: TargetUser[];
}

export function AdminMessageCenter({ users }: AdminMessageCenterProps) {
  const [query, setQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSending, setIsSending] = useState(false);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return users;

    return users.filter((user) => {
      const name = (user.name || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      const role = (user.role || "").toLowerCase();
      return name.includes(normalized) || email.includes(normalized) || role.includes(normalized);
    });
  }, [query, users]);

  const selectedUser = useMemo(() => users.find((u) => u._id === selectedUserId) || null, [selectedUserId, users]);

  const sendPrivateMessage = async () => {
    if (!selectedUser || !message.trim()) return;

    setIsSending(true);
    setFeedback("");

    const response = await post("/messages/admin/private", {
      receiverId: selectedUser._id,
      message: message.trim(),
    });

    if (response.success) {
      setMessage("");
      setFeedback("Private message sent.");
    } else {
      setFeedback(response.message || "Unable to send private message.");
    }

    setIsSending(false);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
      <Card className="lux-glass rounded-2xl p-4">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users" className="pl-10" />
        </div>

        <div className="space-y-2 max-h-[440px] overflow-y-auto">
          {filteredUsers.map((user) => (
            <button
              key={user._id}
              type="button"
              onClick={() => setSelectedUserId(user._id)}
              className={`w-full rounded-xl border p-3 text-left transition ${
                selectedUserId === user._id
                  ? "border-accent/40 bg-accent/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-black uppercase">{user.name || user.email}</p>
                <Badge variant="default">{user.role}</Badge>
              </div>
              <p className="mt-1 text-xs text-white/60 truncate">{user.email}</p>
              <div className="mt-2 flex gap-2">
                <Badge variant={user.isVerified ? "success" : "warning"}>{user.isVerified ? "Verified" : "Unverified"}</Badge>
                <Badge variant={user.isApproved ? "success" : "warning"}>{user.isApproved ? "Approved" : "Pending"}</Badge>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="lux-glass rounded-2xl p-5">
        {selectedUser ? (
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-3">
              <p className="text-lg font-black uppercase">Private Message</p>
              <p className="text-sm text-white/65">To: {selectedUser.name} ({selectedUser.email})</p>
            </div>

            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Send a private admin message to this user"
              className="min-h-[140px]"
            />

            {feedback ? <p className="text-sm text-white/70">{feedback}</p> : null}

            <Button variant="secondary" onClick={sendPrivateMessage} isLoading={isSending} disabled={!message.trim()}>
              Send Private Message
            </Button>
          </div>
        ) : (
          <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center text-white/60">
            Select a user from the left list to message privately.
          </div>
        )}
      </Card>
    </div>
  );
}
