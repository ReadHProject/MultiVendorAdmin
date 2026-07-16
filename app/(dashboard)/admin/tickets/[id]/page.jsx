"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

const STATUS_VARIANT = {
  OPEN: "info",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  CLOSED: "default",
};
const PRIORITY_VARIANT = {
  LOW: "default",
  MEDIUM: "info",
  HIGH: "warning",
  URGENT: "error",
};

function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get(`/tickets/${params.id}`);
      setTicket(data);
      setStatus(data?.status || "");
      setPriority(data?.priority || "");
    } catch {
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (params.id) load();
  }, [params.id]);

  async function handleUpdateStatus() {
    try {
      await api.patch(`/tickets/${params.id}`, { status });
      load();
    } catch {
    }
  }

  async function handleUpdatePriority() {
    try {
      await api.patch(`/tickets/${params.id}`, { priority });
      load();
    } catch {
    }
  }

  async function handleReply(e) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/tickets/${params.id}/replies`, { message: replyText });
      setReplyText("");
      load();
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Ticket not found</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            &larr; Back
          </Button>
          <div>
            <h1 className="text-lg font-bold">{ticket.subject}</h1>
            <p className="text-xs text-muted-foreground">
              Created {formatDate(ticket.createdAt)} by {ticket.user?.name || ticket.createdBy || "Unknown"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[ticket.status] || "default"}>{ticket.status}</Badge>
          <Badge variant={PRIORITY_VARIANT[ticket.priority] || "default"}>{ticket.priority}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Status</label>
          <div className="flex gap-2">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleUpdateStatus}>Update</Button>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Priority</label>
          <div className="flex gap-2">
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleUpdatePriority}>Update</Button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-bold">Messages</h3>
        </div>
        <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
          {(ticket.messages || ticket.replies || []).length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">No messages yet</div>
          ) : (
            (ticket.messages || ticket.replies || []).map((msg, idx) => (
              <div key={msg.id || idx} className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold">{msg.user?.name || msg.author || "User"}</span>
                  <span className="text-[10px] text-muted-foreground">{formatDate(msg.createdAt)}</span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{msg.message || msg.body || msg.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-bold mb-3">Reply</h3>
        <form onSubmit={handleReply} className="space-y-3">
          <Textarea
            placeholder="Type your reply..."
            rows={4}
            required
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting || !replyText.trim()}>
              {submitting ? "Sending..." : "Send Reply"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TicketDetailPage;
