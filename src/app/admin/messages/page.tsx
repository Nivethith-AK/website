"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { AdminMessageCenter } from "@/components/admin/AdminMessageCenter";
import { connectSocket, getSocket } from "@/lib/socket";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  isVerified: boolean;
}

export default function AdminMessagesPage() {
  const [users, setUsers] = useState<UserItem[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await get<any>("/admin/users?limit=300");
      if (response.success) {
        const list = Array.isArray(response.data) ? response.data : response.data?.data || [];
        const nonAdmin = list.filter((user: UserItem) => user.role !== "admin");
        setUsers(nonAdmin);
      }
    };

    fetchUsers();

    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    const socket = connectSocket(token);
    if (!socket) {
      return;
    }

    const onUserRefresh = () => {
      void fetchUsers();
    };

    socket.on("message:new", onUserRefresh);

    return () => {
      const activeSocket = getSocket();
      if (activeSocket) {
        activeSocket.off("message:new", onUserRefresh);
      }
    };
  }, []);

  return (
    <AdminShell
      title="Private Admin Messages"
      subtitle="Contact any designer or company directly from admin control."
      rightSlot={<Badge variant="accent">{users.length} Users</Badge>}
    >
      <AdminMessageCenter users={users} />
    </AdminShell>
  );
}
